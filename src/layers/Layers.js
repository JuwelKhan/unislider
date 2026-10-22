import { easing } from '../core/easing.js';
import { data, removeClass, settled } from '../core/utils.js';
import { loopPresets, presetKeyframes } from './presets.js';
import { splitText } from './split.js';

const SPLIT_STAGGER = { chars: 35, words: 90 };

/**
 * Layers module — every `[data-us-layer]` element inside a slide animates in
 * when its slide becomes active, optionally loops while idle and animates out
 * before the slide leaves.
 *
 *   <h2 data-us-layer="mask-up" data-us-delay="200" data-us-duration="900"
 *       data-us-split="words" data-us-stagger="80" data-us-loop="float"
 *       data-us-out="fade-up">Title</h2>
 */
export const layersModule = {
  name: 'layers',
  setup(slider) {
    const options = slider.options.layers;
    if (!options.enabled) return null;
    const reduced = slider.reducedMotion;
    const bySlide = new Map();
    const running = new Map();

    slider.slides.forEach((slide) => {
      const layers = [...slide.querySelectorAll('[data-us-layer]')].map((element) => parseLayer(element));
      bySlide.set(slide, layers);
    });

    function parseLayer(element) {
      element.classList.add('us-layer');
      const split = data(element, 'split');
      const layer = {
        element,
        preset: valueOr(data(element, 'layer'), 'fade'),
        delay: Number(data(element, 'delay') ?? 0),
        duration: data(element, 'duration'),
        easing: data(element, 'easing'),
        out: data(element, 'out'),
        loop: data(element, 'loop'),
        distance: data(element, 'distance'),
        stagger: data(element, 'stagger'),
        units: null,
        restore: null,
      };
      if (split === 'chars' || split === 'words') {
        const result = splitText(element, split);
        layer.units = result.units;
        layer.restore = result.restore;
        layer.stagger ??= SPLIT_STAGGER[split];
      }
      return layer;
    }

    const presetFor = (name) => presetKeyframes(reduced ? 'fade' : name, {});

    function animateIn(slide, offset) {
      stop(slide);
      const animations = [];
      for (const layer of bySlide.get(slide) ?? []) {
        const preset = presetKeyframes(reduced ? 'fade' : layer.preset, layer.distance ? { distance: layer.distance } : {});
        const timing = {
          duration: Number(layer.duration ?? preset.duration ?? 900),
          easing: easing(layer.easing ?? preset.easing),
          fill: 'both',
        };
        const targets = layer.units ?? [layer.element];
        const delays = staggerDelays(targets.length, layer.stagger);
        const anims = targets.map((target, i) =>
          target.animate(preset.keyframes, { ...timing, delay: offset + layer.delay + delays[i] }),
        );
        animations.push(...anims);
        if (layer.loop && !reduced) {
          Promise.all(anims.map((a) => a.finished))
            .then(() => startLoop(slide, layer))
            .catch(() => {});
        }
      }
      running.set(slide, animations);
      if (animations.length) slider.emit('layers:in', { slide, index: slider.slides.indexOf(slide) });
    }

    function startLoop(slide, layer) {
      if (!running.has(slide)) return;
      const preset = loopPresets.get(layer.loop);
      if (!preset) return;
      const loop = layer.element.animate(preset.keyframes, {
        duration: preset.duration ?? 2000,
        easing: easing(preset.easing ?? 'ease-in-out'),
        direction: preset.direction ?? 'alternate',
        iterations: Infinity,
        composite: 'add',
      });
      running.get(slide)?.push(loop);
    }

    function stop(slide) {
      for (const animation of running.get(slide) ?? []) animation.cancel();
      running.delete(slide);
    }

    async function animateOut(slide) {
      const outAll = options.outPreset;
      const animations = [];
      for (const layer of bySlide.get(slide) ?? []) {
        const name = layer.out === true ? layer.preset : layer.out ?? outAll;
        if (!name) continue;
        const preset = presetFor(name);
        const targets = layer.units ?? [layer.element];
        // stop idle loops so the out animation starts from a clean state
        for (const a of running.get(slide) ?? []) if (a.effect?.target === layer.element && a.effect.getTiming().iterations === Infinity) a.cancel();
        targets.forEach((target, i) => {
          animations.push(
            target.animate(preset.keyframes, {
              duration: options.outDuration,
              delay: i * Math.min(Number(layer.stagger) || 0, 20),
              easing: easing('in'),
              direction: 'reverse',
              fill: 'forwards',
            }),
          );
        });
      }
      if (!animations.length) return;
      if (running.has(slide)) running.get(slide).push(...animations);
      else running.set(slide, animations);
      await settled(animations);
    }

    // initial slide
    const first = slider.slides[slider.index];
    if (first) animateIn(first, 150);

    const onChange = ({ slide, source }) => {
      if (source !== 'ticker') animateIn(slide, Math.round(slider.options.speed * options.start));
    };
    const onAfter = ({ index }) => {
      slider.slides.forEach((slide, i) => {
        if (i !== index && running.has(slide)) stop(slide);
      });
    };
    const offLeave = options.out ? slider.hook('leave', ({ from }) => animateOut(slider.slides[from])) : null;

    slider.on('change', onChange);
    slider.on('afterChange', onAfter);

    return {
      replay(index = slider.index) {
        animateIn(slider.slides[index], 0);
      },
      destroy() {
        slider.off('change', onChange);
        slider.off('afterChange', onAfter);
        offLeave?.();
        for (const slide of slider.slides) stop(slide);
        for (const layers of bySlide.values()) {
          for (const layer of layers) {
            layer.restore?.();
            removeClass(layer.element, 'us-layer');
          }
        }
      },
    };
  },
};

/**
 * Delay per split unit. `data-us-stagger="80"` → 0, 80, 160…;
 * `"random"` (or `"random:60"`) scatters them like raindrops.
 */
export function staggerDelays(count, stagger) {
  const value = String(stagger ?? 0);
  if (value.startsWith('random')) {
    const step = Number(value.split(':')[1]) || 45;
    return Array.from({ length: count }, () => Math.round(Math.random() * step * count));
  }
  return Array.from({ length: count }, (_, i) => i * (Number(value) || 0));
}

const valueOr = (value, fallback) => (value === true || value === undefined || value === '' ? fallback : value);
