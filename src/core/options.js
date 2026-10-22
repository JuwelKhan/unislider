import { isObject, merge, parseValue } from './utils.js';

export const DEFAULTS = {
  /** 'slider' (stacked slides, full transitions + layers) or 'carousel' (moving track). */
  type: 'slider',
  /** 'auto' (plays by itself), 'manual' (user-driven) or 'hybrid' (both). */
  mode: 'hybrid',
  preset: null,
  template: null,
  /** Slide data used by templates (array of objects). */
  slides: null,
  theme: 'dark',
  /** Extra classes for the root element. */
  className: '',
  /** 'auto' (aspect ratio / height), 'fullwidth', 'fullscreen'. */
  layout: 'auto',
  height: null,
  aspectRatio: '16 / 9',
  minHeight: 320,
  /** Pixels (or a selector whose height is used) subtracted in fullscreen layout. */
  offset: 0,
  /** Stage height follows the active slide (stacked slider). */
  autoHeight: false,
  direction: 'horizontal',
  start: 0,
  loop: true,
  speed: 900,
  easing: 'smooth',
  /** Name, array of names, 'random', or an inline transition object. */
  transition: 'fade',

  // Carousel
  perView: 1,
  gap: 0,
  center: false,
  effect: 'slide',
  perMove: 1,
  freeMode: false,
  /** Continuous marquee speed in px/s (0 = off). */
  ticker: 0,
  /** Aspect ratio of each carousel slide, e.g. '4 / 5'. */
  slideRatio: null,
  slideToClicked: false,
  carouselEasing: 'out',

  autoplay: {
    enabled: true,
    delay: 5000,
    pauseOnHover: true,
    pauseOnFocus: true,
    pauseHidden: true,
    stopOnInteraction: false,
    reverse: false,
  },
  navigation: {
    arrows: true,
    bullets: true,
    thumbnails: false,
    fraction: false,
    progress: true,
    playPause: true,
    bulletStyle: 'dots',
    arrowStyle: 'circle',
  },
  keyboard: true,
  drag: true,
  wheel: false,
  layers: { enabled: true, start: 0.45, out: true, outDuration: 450, outPreset: null },
  kenburns: false,
  parallax: false,
  /** Live rain on a canvas: true, a preset ('drizzle', 'rain', 'downpour', 'storm', 'monsoon', 'glass', 'mist') or options. */
  rain: false,
  /** Water ripples where the visitor clicks / taps (or hovers with `{ hover: true }`). */
  ripple: false,
  lazy: { enabled: true, preload: 1 },
  video: true,
  a11y: { label: 'Slider', announce: true },
  hash: false,
  /** 'auto' follows prefers-reduced-motion; true/false forces it. */
  reducedMotion: 'auto',
  breakpoints: null,
  on: null,
};

/** Each mode is a set of defaults the user's own options still override. */
export const MODES = {
  auto: {
    autoplay: { enabled: true, pauseOnHover: false, stopOnInteraction: false },
    navigation: { arrows: false, thumbnails: false, playPause: true },
  },
  manual: {
    autoplay: { enabled: false },
    navigation: { arrows: true, bullets: true, progress: false, playPause: false },
  },
  hybrid: {},
};

const NAV_KEYS = ['arrows', 'bullets', 'thumbnails', 'fraction', 'progress', 'playPause'];

/** Expand boolean / number / string shorthands into option objects. */
export function normalize(source) {
  if (!isObject(source)) return {};
  const out = { ...source };
  const bool = (key, objectKey = 'enabled') => {
    if (typeof out[key] === 'boolean') out[key] = { [objectKey]: out[key] };
  };

  if (typeof out.autoplay === 'number') out.autoplay = { enabled: out.autoplay > 0, delay: out.autoplay };
  bool('autoplay');

  if (typeof out.navigation === 'boolean') {
    out.navigation = Object.fromEntries(NAV_KEYS.map((key) => [key, out.navigation]));
  }

  bool('layers');
  bool('lazy');

  if (out.kenburns === true) out.kenburns = { preset: 'random' };
  else if (typeof out.kenburns === 'string') out.kenburns = { preset: out.kenburns };

  if (out.parallax === true) out.parallax = { mouse: 24, scroll: 0 };
  else if (typeof out.parallax === 'number') out.parallax = { mouse: out.parallax, scroll: 0 };

  if (typeof out.a11y === 'string') out.a11y = { label: out.a11y };
  return out;
}

/**
 * Resolve the final option object:
 * defaults → mode → template preset → template defaults → preset → user options.
 */
export function resolveOptions(user = {}, { presets, templates } = {}) {
  const input = normalize(user);
  const template = input.template ? normalize(templates?.get(input.template)?.options ?? {}) : {};
  const templatePreset = template.preset ? resolveNamed(presets, template.preset, 'preset') : {};
  const userPreset = input.preset ? resolveNamed(presets, input.preset, 'preset') : {};
  const mode = input.mode ?? userPreset.mode ?? template.mode ?? templatePreset.mode ?? DEFAULTS.mode;
  const options = merge({}, DEFAULTS, normalize(MODES[mode] ?? {}), templatePreset, template, userPreset, input);
  options.mode = mode;
  // breakpoints are replaced, not merged: the most specific source wins, and a
  // preset you pick yourself replaces the template's responsive behaviour too
  const sources = input.preset ? [input, userPreset] : [input, template, templatePreset];
  options.breakpoints = sources.find((s) => s.breakpoints)?.breakpoints ?? null;
  return options;
}

function resolveNamed(registry, names, kind) {
  const list = Array.isArray(names) ? names : String(names).split(/[\s,]+/);
  const out = {};
  for (const name of list) {
    const item = registry?.get(name);
    if (!item) console.warn(`[UniSlider] Unknown ${kind} "${name}"`);
    else merge(out, normalize(item));
  }
  return out;
}

/** Apply `breakpoints` (min-width keys) on top of the base options for a width. */
export function applyBreakpoints(options, width) {
  if (!isObject(options.breakpoints)) return options;
  const result = merge({}, options);
  const sizes = Object.keys(options.breakpoints)
    .map(Number)
    .filter((size) => !Number.isNaN(size) && width >= size)
    .sort((a, b) => a - b);
  for (const size of sizes) merge(result, normalize(options.breakpoints[size]));
  return result;
}

/** Key describing which breakpoint set is active (used to detect changes). */
export const breakpointKey = (options, width) =>
  isObject(options.breakpoints)
    ? Object.keys(options.breakpoints)
        .map(Number)
        .filter((size) => width >= size)
        .join(',')
    : '';

/** Options from `data-unislider` (JSON, or a preset name). */
export function readDataOptions(node) {
  const raw = node.getAttribute('data-unislider');
  if (raw === null) return {};
  const value = parseValue(raw);
  if (isObject(value)) return value;
  if (typeof value === 'string') return { preset: value };
  return {};
}
