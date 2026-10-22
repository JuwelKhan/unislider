import { createRegistry } from '../core/registry.js';
import { clamp, data, isObject, lerp, pick } from '../core/utils.js';

export const kenburnsPresets = createRegistry('ken burns preset', Array.isArray);

const KB = {
  'zoom-in': [{ transform: 'scale(1)' }, { transform: 'scale(1.2)' }],
  'zoom-out': [{ transform: 'scale(1.2)' }, { transform: 'scale(1)' }],
  'pan-left': [{ transform: 'scale(1.15) translateX(4%)' }, { transform: 'scale(1.15) translateX(-4%)' }],
  'pan-right': [{ transform: 'scale(1.15) translateX(-4%)' }, { transform: 'scale(1.15) translateX(4%)' }],
  'pan-up': [{ transform: 'scale(1.15) translateY(4%)' }, { transform: 'scale(1.15) translateY(-4%)' }],
  'pan-down': [{ transform: 'scale(1.15) translateY(-4%)' }, { transform: 'scale(1.15) translateY(4%)' }],
  'zoom-in-left': [{ transform: 'scale(1) translate(0, 0)' }, { transform: 'scale(1.25) translate(-5%, 2%)' }],
  'drift-down': [{ transform: 'scale(1.18) translateY(-4%)' }, { transform: 'scale(1.18) translateY(4%)' }],
  'rain-zoom': [{ transform: 'scale(1.02) translate(0, -2%)' }, { transform: 'scale(1.22) translate(-2%, 3%)' }],
  'zoom-in-right': [{ transform: 'scale(1) translate(0, 0)' }, { transform: 'scale(1.25) translate(5%, -2%)' }],
};
for (const [name, frames] of Object.entries(KB)) kenburnsPresets.register(name, frames);

/** Ken Burns — slow zoom/pan of a slide's `.us-bg` while it is shown. */
export const kenburnsModule = {
  name: 'kenburns',
  setup(slider) {
    if (slider.reducedMotion) return null;
    const global = isObject(slider.options.kenburns) ? slider.options.kenburns : null;
    const settings = (slide) => {
      const own = data(slide, 'kenburns');
      if (own === false) return null;
      if (own === undefined && !global) return null;
      return { ...global, ...(typeof own === 'string' ? { preset: own } : isObject(own) ? own : {}) };
    };
    if (!slider.slides.some(settings)) return null;
    const running = new Map();

    const start = (slide) => {
      const kb = settings(slide);
      const bg = slide.querySelector(':scope > .us-bg');
      if (!kb || !bg) return;
      running.get(slide)?.cancel();
      let name = kb.preset ?? 'random';
      if (name === 'random') name = pick(kenburnsPresets.list());
      const frames = kenburnsPresets.get(name) ?? kenburnsPresets.get('zoom-in');
      const delay = Number(data(slide, 'autoplay') ?? slider.options.autoplay.delay) || 5000;
      const duration = Number(kb.duration) || delay + slider.options.speed * 2;
      running.set(slide, bg.animate(frames, { duration, easing: kb.easing ?? 'linear', fill: 'both' }));
    };
    const stopOthers = () => {
      for (const [slide, animation] of running) {
        if (slide !== slider.activeSlide) {
          animation.cancel();
          running.delete(slide);
        }
      }
    };

    start(slider.activeSlide);
    const onChange = ({ slide }) => start(slide);
    slider.on('change', onChange);
    slider.on('afterChange', stopOthers);
    return {
      destroy() {
        slider.off('change', onChange);
        slider.off('afterChange', stopOthers);
        for (const animation of running.values()) animation.cancel();
      },
    };
  },
};

/**
 * Parallax — mouse-driven depth for `[data-us-parallax]` elements (value =
 * travel in px) and scroll-driven background drift (`parallax.scroll`).
 * Uses the CSS `translate` property so it composes with layer animations.
 */
export const parallaxModule = {
  name: 'parallax',
  setup(slider) {
    const o = slider.options.parallax;
    if (!isObject(o) || slider.reducedMotion) return null;
    const root = slider.root;
    const cleanups = [];
    const listen = (target, type, handler, opts) => {
      target.addEventListener(type, handler, opts);
      cleanups.push(() => target.removeEventListener(type, handler, opts));
    };

    const mouseDepth = Number(o.mouse) || 0;
    const bgDepth = Number(o.bg ?? 0);
    let target = { x: 0, y: 0 };
    let current = { x: 0, y: 0 };
    let frame = 0;

    const elements = () => {
      const slide = slider.activeSlide;
      if (!slide) return [];
      const items = [...slide.querySelectorAll('[data-us-parallax]')].map((node) => {
        const depth = data(node, 'parallax');
        return [node, typeof depth === 'number' ? depth : mouseDepth];
      });
      const bg = slide.querySelector(':scope > .us-bg');
      if (bg && bgDepth) items.push([bg, -bgDepth]);
      return items;
    };

    const render = () => {
      current = { x: lerp(current.x, target.x, 0.08), y: lerp(current.y, target.y, 0.08) };
      for (const [node, depth] of elements()) {
        node.style.translate = `${(-current.x * depth).toFixed(2)}px ${(-current.y * depth).toFixed(2)}px`;
      }
      const still = Math.abs(current.x - target.x) < 0.001 && Math.abs(current.y - target.y) < 0.001;
      frame = still ? 0 : requestAnimationFrame(render);
    };
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };

    if (mouseDepth || bgDepth) {
      listen(root, 'pointermove', (e) => {
        if (e.pointerType !== 'mouse') return;
        const rect = root.getBoundingClientRect();
        target = {
          x: clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -1, 1),
          y: clamp(((e.clientY - rect.top) / rect.height) * 2 - 1, -1, 1),
        };
        kick();
      });
      listen(root, 'pointerleave', () => {
        target = { x: 0, y: 0 };
        kick();
      });
    }

    const scroll = Number(o.scroll) || 0;
    if (scroll) {
      root.classList.add('us-parallax-scroll');
      root.style.setProperty('--us-parallax', `${(scroll * 50).toFixed(2)}%`);
      const onScroll = () => {
        const rect = root.getBoundingClientRect();
        const vh = window.innerHeight;
        if (rect.bottom < 0 || rect.top > vh) return;
        const progress = clamp((rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2), -1, 1);
        root.style.setProperty('--us-parallax-y', `${(progress * scroll * rect.height * 0.5).toFixed(1)}px`);
      };
      onScroll();
      listen(window, 'scroll', onScroll, { passive: true });
    }

    const reset = () => {
      for (const slide of slider.slides) {
        if (slide === slider.activeSlide) continue;
        for (const node of slide.querySelectorAll('[data-us-parallax], :scope > .us-bg')) node.style.translate = '';
      }
    };
    slider.on('afterChange', reset);

    return {
      destroy() {
        cancelAnimationFrame(frame);
        slider.off('afterChange', reset);
        for (const off of cleanups) off();
        root.classList.remove('us-parallax-scroll');
        root.style.removeProperty('--us-parallax');
        root.style.removeProperty('--us-parallax-y');
        for (const slide of slider.slides) {
          for (const node of slide.querySelectorAll('[data-us-parallax], :scope > .us-bg')) node.style.translate = '';
        }
      },
    };
  },
};

/** Deep links: `#slide-id` ↔ current slide (`hash: true`). */
export const hashModule = {
  name: 'hash',
  setup(slider) {
    if (!slider.options.hash) return null;
    const idOf = (slide) => data(slide, 'hash') ?? slide.id ?? '';
    const onAfter = () => {
      const id = idOf(slider.activeSlide);
      if (id && decodeURIComponent(location.hash.slice(1)) !== id) history.replaceState(null, '', `#${id}`);
    };
    const onHash = () => {
      const index = slider._hashIndex();
      if (index >= 0) slider.goTo(index, { source: 'hash' });
    };
    slider.on('afterChange', onAfter);
    window.addEventListener('hashchange', onHash);
    return {
      destroy() {
        slider.off('afterChange', onAfter);
        window.removeEventListener('hashchange', onHash);
      },
    };
  },
};
