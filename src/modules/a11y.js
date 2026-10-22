import { data, el } from '../core/utils.js';

/** ARIA carousel pattern + a polite live region announcing manual changes. */
export const a11yModule = {
  name: 'a11y',
  setup(slider) {
    const o = slider.options.a11y ?? {};
    const root = slider.root;
    const count = slider.slides.length;
    const saved = slider.slides.map((slide) => ['role', 'aria-roledescription', 'aria-label'].map((n) => [n, slide.getAttribute(n)]));

    root.setAttribute('role', 'region');
    root.setAttribute('aria-roledescription', o.roledescription ?? 'carousel');
    if (!root.hasAttribute('aria-label') && !root.hasAttribute('aria-labelledby')) root.setAttribute('aria-label', o.label ?? 'Slider');
    if (slider.options.keyboard && !root.hasAttribute('tabindex')) root.setAttribute('tabindex', '0');
    slider.track.setAttribute('aria-atomic', 'false');

    slider.slides.forEach((slide, i) => {
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'slide');
      const title = data(slide, 'title');
      if (!saved[i][2][1]) slide.setAttribute('aria-label', `${i + 1} of ${count}${typeof title === 'string' ? `: ${title}` : ''}`);
    });

    const live = o.announce ? el('div', { class: 'us-us-only', 'aria-live': 'polite', 'aria-atomic': 'true' }) : null;
    if (live) slider.ui.append(live);

    const onChange = ({ index, source }) => {
      if (!live || source === 'autoplay' || source === 'ticker') return;
      const title = data(slider.slides[index], 'title');
      live.textContent = `Slide ${index + 1} of ${slider.length}${typeof title === 'string' ? `: ${title}` : ''}`;
    };
    slider.on('change', onChange);

    return {
      destroy() {
        slider.off('change', onChange);
        live?.remove();
        slider.track.removeAttribute('aria-atomic');
        slider.slides.forEach((slide, i) => {
          for (const [name, value] of saved[i] ?? []) {
            if (value === null) slide.removeAttribute(name);
            else slide.setAttribute(name, value);
          }
        });
      },
    };
  },
};
