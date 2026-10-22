import { templates } from '../core/UniSlider.js';

/**
 * Templates turn plain data into complete, styled slides:
 *
 *   UniSlider.create('#hero', {
 *     template: 'hero-fullscreen',
 *     slides: [{ title: 'Hello', text: '…', image: 'a.jpg', button: { label: 'Go', href: '#' } }],
 *   });
 *
 * Each template = { options (defaults), render(slides, options) → HTML }.
 * Styles live in dist/unislider-templates.css.
 */
export const esc = (value = '') =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const attr = (name, value) => (value === undefined || value === null || value === '' ? '' : ` ${name}="${esc(value)}"`);

const buttons = (s, layer = 'fade-up', delay = 700) => {
  const list = s.buttons ?? (s.button ? [s.button] : []);
  if (!list.length) return '';
  return `<div class="us-tpl-actions" data-us-layer="${layer}" data-us-delay="${delay}">${list
    .map((b, i) => `<a class="us-btn${i ? ' us-btn--ghost' : ''}" href="${esc(b.href ?? '#')}">${esc(b.label)}</a>`)
    .join('')}</div>`;
};

const slideAttrs = (s) =>
  attr('data-us-title', s.title ?? s.name) +
  attr('data-us-thumb', s.thumb) +
  attr('data-us-transition', s.transition) +
  attr('data-us-autoplay', s.duration) +
  attr('id', s.id);

export function registerTemplate(name, template) {
  return templates.register(name, template);
}

registerTemplate('hero-fullscreen', {
  description: 'Full-screen hero with background image, Ken Burns and staggered headline.',
  options: { preset: 'fullscreen', kenburns: true, parallax: { mouse: 16 }, transition: ['fade', 'curtain', 'zoom-out'] },
  render: (slides) =>
    slides
      .map(
        (s) => `<div class="us-tpl-hero"${slideAttrs(s)}${attr('data-us-bg', s.image)} data-us-overlay="${s.overlay ?? 0.45}">
  <div class="us-tpl-hero__inner us-align-${esc(s.align ?? 'center')}">
    ${s.kicker ? `<p class="us-tpl-kicker" data-us-layer="mask-up" data-us-delay="100">${esc(s.kicker)}</p>` : ''}
    <h2 class="us-tpl-title" data-us-layer="mask-up" data-us-split="words" data-us-delay="250" data-us-out="fade-up">${esc(s.title)}</h2>
    ${s.text ? `<p class="us-tpl-text" data-us-layer="fade-up" data-us-delay="550">${esc(s.text)}</p>` : ''}
    ${buttons(s, 'fade-up', 750)}
  </div>
</div>`,
      )
      .join(''),
});

registerTemplate('rain-hero', {
  description: 'Moody hero with live rain, raindrop headline letters and ripple clicks.',
  options: { preset: 'rainy', layout: 'fullwidth', aspectRatio: '21 / 9', minHeight: 480 },
  render: (slides) =>
    slides
      .map(
        (s) => `<div class="us-tpl-hero us-tpl-rain"${slideAttrs(s)}${attr('data-us-bg', s.image)}${attr('data-us-rain', s.weather)} data-us-overlay="${s.overlay ?? 0.4}">
  <div class="us-tpl-hero__inner us-align-${esc(s.align ?? 'center')}">
    ${s.kicker ? `<p class="us-tpl-kicker" data-us-layer="mist-in" data-us-delay="100">${esc(s.kicker)}</p>` : ''}
    <h2 class="us-tpl-title" data-us-layer="rainfall" data-us-split="chars" data-us-stagger="random" data-us-delay="200" data-us-out="fade-up">${esc(s.title)}</h2>
    ${s.text ? `<p class="us-tpl-text" data-us-layer="mist-in" data-us-delay="900">${esc(s.text)}</p>` : ''}
    ${buttons(s, 'splash-in', 1200)}
  </div>
</div>`,
      )
      .join(''),
});

registerTemplate('hero-split', {
  description: 'Two-column hero: copy on one side, floating product/visual on the other.',
  options: { aspectRatio: '16 / 8', minHeight: 520, transition: 'slide-over', theme: 'light', parallax: { mouse: 0 } },
  render: (slides) =>
    slides
      .map(
        (s) => `<div class="us-tpl-split"${slideAttrs(s)}${attr('style', s.background ? `background:${s.background}` : '')}>
  <div class="us-tpl-split__copy">
    ${s.kicker ? `<p class="us-tpl-kicker" data-us-layer="fade-right">${esc(s.kicker)}</p>` : ''}
    <h2 class="us-tpl-title" data-us-layer="fade-up" data-us-split="chars" data-us-delay="150">${esc(s.title)}</h2>
    ${s.text ? `<p class="us-tpl-text" data-us-layer="fade-up" data-us-delay="500">${esc(s.text)}</p>` : ''}
    ${buttons(s, 'fade-up', 700)}
  </div>
  <div class="us-tpl-split__media" data-us-layer="zoom-in" data-us-delay="300" data-us-loop="float" data-us-parallax="25">
    ${s.image ? `<img src="${esc(s.image)}" alt="${esc(s.alt ?? '')}">` : ''}
  </div>
</div>`,
      )
      .join(''),
});

registerTemplate('agency', {
  description: 'Bold typographic agency slider with character animations and slice transitions.',
  options: { preset: 'cinematic', aspectRatio: '16 / 8', navigation: { fraction: true, bullets: false } },
  render: (slides) =>
    slides
      .map(
        (s, i) => `<div class="us-tpl-agency"${slideAttrs(s)}${attr('data-us-bg', s.image)} data-us-overlay="${s.overlay ?? 0.35}">
  <span class="us-tpl-agency__index" data-us-layer="fade" data-us-delay="200">${String(i + 1).padStart(2, '0')}</span>
  <h2 class="us-tpl-agency__title" data-us-layer="mask-up" data-us-split="chars" data-us-stagger="30" data-us-delay="200" data-us-out="fade-up">${esc(s.title)}</h2>
  ${s.text ? `<p class="us-tpl-text" data-us-layer="fade-left" data-us-delay="700">${esc(s.text)}</p>` : ''}
  ${buttons(s, 'fade-up', 900)}
</div>`,
      )
      .join(''),
});

registerTemplate('product-showcase', {
  description: 'E-commerce product slider with floating product, price and thumbnails.',
  options: {
    theme: 'light',
    aspectRatio: '16 / 8',
    minHeight: 480,
    transition: 'parallax',
    parallax: { mouse: 0 },
    navigation: { thumbnails: true, bullets: false, arrows: true },
  },
  render: (slides) =>
    slides
      .map(
        (s) => `<div class="us-tpl-product"${slideAttrs(s)}${attr('data-us-thumb', s.thumb ?? s.image)}${attr('style', s.background ? `--us-tpl-accent:${s.background}` : '')}>
  <div class="us-tpl-product__copy">
    ${s.kicker ? `<p class="us-tpl-kicker" data-us-layer="fade-down">${esc(s.kicker)}</p>` : ''}
    <h2 class="us-tpl-title" data-us-layer="slide-left" data-us-delay="100">${esc(s.title)}</h2>
    ${s.text ? `<p class="us-tpl-text" data-us-layer="fade-up" data-us-delay="350">${esc(s.text)}</p>` : ''}
    ${s.price ? `<p class="us-tpl-price" data-us-layer="pop" data-us-delay="550">${esc(s.price)}</p>` : ''}
    ${buttons(s, 'fade-up', 700)}
  </div>
  <div class="us-tpl-product__media">
    <span class="us-tpl-product__blob" data-us-layer="zoom-in" data-us-delay="100"></span>
    ${s.image ? `<img src="${esc(s.image)}" alt="${esc(s.alt ?? s.title ?? '')}" data-us-layer="rotate-in" data-us-delay="250" data-us-duration="1100" data-us-loop="float">` : ''}
  </div>
</div>`,
      )
      .join(''),
});

registerTemplate('testimonials', {
  description: 'Quotes with avatar, name and role; height adapts to the quote.',
  options: { preset: 'testimonial' },
  render: (slides) =>
    slides
      .map(
        (s) => `<figure class="us-tpl-quote"${slideAttrs({ ...s, title: s.name })}>
  <blockquote data-us-layer="fade-up" data-us-split="words" data-us-stagger="25">${esc(s.quote ?? s.text)}</blockquote>
  <figcaption data-us-layer="fade-up" data-us-delay="400">
    ${s.avatar ? `<img src="${esc(s.avatar)}" alt="" width="56" height="56">` : ''}
    <span><strong>${esc(s.name)}</strong>${s.role ? `<small>${esc(s.role)}</small>` : ''}</span>
  </figcaption>
</figure>`,
      )
      .join(''),
});

registerTemplate('cards-carousel', {
  description: 'Responsive card carousel for posts, services or team members.',
  options: { preset: 'carousel' },
  render: (slides) =>
    slides
      .map(
        (s) => `<article class="us-tpl-card"${slideAttrs(s)}>
  ${s.image ? `<div class="us-tpl-card__media"><img src="${esc(s.image)}" alt="${esc(s.alt ?? '')}" loading="lazy" draggable="false"></div>` : ''}
  <div class="us-tpl-card__body">
    ${s.tag ? `<span class="us-tpl-tag">${esc(s.tag)}</span>` : ''}
    <h3>${esc(s.title)}</h3>
    ${s.text ? `<p>${esc(s.text)}</p>` : ''}
    ${s.href ? `<a class="us-tpl-link" href="${esc(s.href)}">${esc(s.link ?? 'Read more')} →</a>` : ''}
  </div>
</article>`,
      )
      .join(''),
});

registerTemplate('coverflow-gallery', {
  description: '3D coverflow image gallery; click a side image to bring it forward.',
  options: { preset: 'coverflow' },
  render: (slides) =>
    slides
      .map(
        (s) => `<figure class="us-tpl-cover"${slideAttrs(s)}>
  <img src="${esc(s.image)}" alt="${esc(s.alt ?? s.title ?? '')}" draggable="false">
  ${s.title ? `<figcaption>${esc(s.title)}</figcaption>` : ''}
</figure>`,
      )
      .join(''),
});

registerTemplate('logo-ticker', {
  description: 'Endless logo / partner marquee (pauses on hover).',
  options: { preset: 'ticker', theme: 'none' },
  render: (slides) =>
    slides
      .map(
        (s) => `<div class="us-tpl-logo"${slideAttrs(s)}>${
          s.image ? `<img src="${esc(s.image)}" alt="${esc(s.title ?? '')}" draggable="false">` : `<span>${esc(s.title)}</span>`
        }</div>`,
      )
      .join(''),
});

registerTemplate('vertical-showcase', {
  description: 'Full-screen vertical sections with wheel and keyboard navigation.',
  options: { preset: 'vertical fullscreen', transition: 'parallax', navigation: { fraction: true } },
  render: (slides) =>
    slides
      .map(
        (s) => `<section class="us-tpl-vertical"${slideAttrs(s)}${attr('data-us-bg', s.image)} data-us-overlay="${s.overlay ?? 0.4}">
  <div class="us-tpl-vertical__inner">
    ${s.kicker ? `<p class="us-tpl-kicker" data-us-layer="fade-right">${esc(s.kicker)}</p>` : ''}
    <h2 class="us-tpl-title" data-us-layer="mask-up" data-us-split="words" data-us-delay="150">${esc(s.title)}</h2>
    ${s.text ? `<p class="us-tpl-text" data-us-layer="fade-up" data-us-delay="450">${esc(s.text)}</p>` : ''}
    ${buttons(s, 'fade-up', 650)}
  </div>
</section>`,
      )
      .join(''),
});

registerTemplate('news-headlines', {
  description: 'Compact headline bar that flips through news or announcements.',
  options: {
    direction: 'vertical',
    transition: 'slide',
    height: 64,
    minHeight: 0,
    speed: 600,
    theme: 'light',
    autoplay: { delay: 3500 },
    navigation: { bullets: false, progress: false, playPause: true, arrows: true },
    layers: { enabled: false },
  },
  render: (slides) =>
    slides
      .map(
        (s) => `<a class="us-tpl-news"${slideAttrs(s)} href="${esc(s.href ?? '#')}">
  ${s.tag ? `<span class="us-tpl-tag">${esc(s.tag)}</span>` : ''}
  <span class="us-tpl-news__title">${esc(s.title)}</span>
  ${s.date ? `<time>${esc(s.date)}</time>` : ''}
</a>`,
      )
      .join(''),
});
