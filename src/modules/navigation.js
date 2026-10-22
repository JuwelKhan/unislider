import { data, el, pad } from '../core/utils.js';
import { ICONS } from './icons.js';

/** Arrows, bullets, fraction counter, autoplay progress bar and play/pause. */
export const navigationModule = {
  name: 'navigation',
  setup(slider) {
    const nav = slider.options.navigation;
    const count = slider.length;
    const ui = slider.ui;
    const nodes = [];
    const vertical = slider.options.direction === 'vertical';
    const labels = slider.options.a11y ?? {};
    const add = (node) => {
      ui.append(node);
      nodes.push(node);
      return node;
    };
    let prevBtn;
    let nextBtn;
    let bullets = [];
    let fraction;
    let playBtn;

    if (nav.arrows && count > 1) {
      const wrap = add(el('div', { class: `us-arrows us-arrows--${nav.arrowStyle}` }));
      prevBtn = el('button', {
        type: 'button',
        class: 'us-arrow us-arrow--prev',
        'aria-label': labels.prev ?? 'Previous slide',
        html: vertical ? ICONS.up : ICONS.prev,
      });
      nextBtn = el('button', {
        type: 'button',
        class: 'us-arrow us-arrow--next',
        'aria-label': labels.next ?? 'Next slide',
        html: vertical ? ICONS.down : ICONS.next,
      });
      prevBtn.addEventListener('click', () => slider.prev({ source: 'nav' }));
      nextBtn.addEventListener('click', () => slider.next({ source: 'nav' }));
      wrap.append(prevBtn, nextBtn);
    }

    if (nav.bullets && count > 1) {
      const wrap = add(el('div', { class: `us-bullets us-bullets--${nav.bulletStyle}`, role: 'group', 'aria-label': 'Choose slide' }));
      bullets = Array.from({ length: count }, (_, i) => {
        const title = data(slider.slides[i], 'title');
        const button = el('button', {
          type: 'button',
          class: 'us-bullet',
          'aria-label': `${labels.goTo ?? 'Go to slide'} ${i + 1}${typeof title === 'string' ? `: ${title}` : ''}`,
        });
        if (nav.bulletStyle === 'numbers') button.textContent = pad(i + 1);
        else if (nav.bulletStyle === 'titles') button.textContent = typeof title === 'string' ? title : pad(i + 1);
        else button.append(el('span', { class: 'us-bullet__fill' }));
        button.addEventListener('click', () => slider.goTo(i, { source: 'bullet' }));
        wrap.append(button);
        return button;
      });
    }

    if (nav.fraction && count > 1) {
      fraction = add(el('div', { class: 'us-fraction', 'aria-hidden': 'true' }));
    }

    if (nav.progress && slider.autoplay) {
      add(el('div', { class: 'us-progress', 'aria-hidden': 'true' }, el('div', { class: 'us-progress__bar' })));
    }

    if (nav.playPause && slider.autoplay) {
      playBtn = add(el('button', { type: 'button', class: 'us-playpause' }));
      playBtn.addEventListener('click', () => slider.toggle());
    }

    const update = () => {
      const index = slider.index;
      bullets.forEach((button, i) => {
        const active = i === index;
        button.classList.toggle('is-active', active);
        if (active) button.setAttribute('aria-current', 'true');
        else button.removeAttribute('aria-current');
      });
      if (fraction) {
        fraction.innerHTML = `<span class="us-fraction__current">${pad(index + 1)}</span><span class="us-fraction__sep">/</span><span class="us-fraction__total">${pad(count)}</span>`;
      }
      if (prevBtn && !slider.options.loop) {
        prevBtn.disabled = index <= 0;
        nextBtn.disabled = index >= count - 1;
      }
      if (playBtn) {
        const playing = slider.isPlaying;
        playBtn.innerHTML = playing ? ICONS.pause : ICONS.play;
        playBtn.setAttribute('aria-label', playing ? labels.pause ?? 'Pause autoplay' : labels.play ?? 'Start autoplay');
        playBtn.classList.toggle('is-playing', playing);
      }
    };

    const events = 'change autoplay:start autoplay:stop';
    update();
    slider.on(events, update);

    return {
      update,
      destroy() {
        slider.off(events, update);
        for (const node of nodes) node.remove();
      },
    };
  },
};

/** Thumbnail strip below the stage (navigation.thumbnails). */
export const thumbnailsModule = {
  name: 'thumbnails',
  setup(slider) {
    if (!slider.options.navigation.thumbnails || slider.slides.length < 2) return null;
    const strip = el('div', { class: 'us-thumbs', role: 'group', 'aria-label': 'Slide thumbnails' });
    const buttons = slider.slides.map((slide, i) => {
      const thumb = data(slide, 'thumb') ?? data(slide, 'bg');
      const title = data(slide, 'title');
      const button = el('button', {
        type: 'button',
        class: 'us-thumb',
        'aria-label': `Go to slide ${i + 1}${typeof title === 'string' ? `: ${title}` : ''}`,
      });
      if (typeof thumb === 'string') button.append(el('img', { src: thumb, alt: '', loading: 'lazy', draggable: 'false' }));
      if (typeof title === 'string') button.append(el('span', { class: 'us-thumb__title', text: title }));
      else if (typeof thumb !== 'string') button.append(el('span', { class: 'us-thumb__title', text: pad(i + 1) }));
      button.addEventListener('click', () => slider.goTo(Math.min(i, slider.length - 1), { source: 'thumb' }));
      strip.append(button);
      return button;
    });
    slider.root.append(strip);

    const update = () => {
      const active = slider.activeSlide;
      buttons.forEach((button, i) => {
        const on = slider.slides[i] === active;
        button.classList.toggle('is-active', on);
        if (on) {
          button.setAttribute('aria-current', 'true');
          const left = button.offsetLeft - (strip.clientWidth - button.offsetWidth) / 2;
          strip.scrollTo?.({ left, behavior: slider.reducedMotion ? 'auto' : 'smooth' });
        } else button.removeAttribute('aria-current');
      });
    };
    update();
    slider.on('change', update);
    return {
      destroy() {
        slider.off('change', update);
        strip.remove();
      },
    };
  },
};
