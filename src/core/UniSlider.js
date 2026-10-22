import { Emitter } from './Emitter.js';
import { createRegistry } from './registry.js';
import { applyBreakpoints, breakpointKey, normalize, readDataOptions, resolveOptions } from './options.js';
import { clamp, data, el, isBrowser, isObject, merge, mod, prefersReducedMotion, removeClass, resolveElement } from './utils.js';
import { SliderEngine } from '../engines/slider.js';
import { CarouselEngine } from '../engines/carousel.js';

const instances = new WeakMap();

/** Engines render slides; modules add behaviour (autoplay, navigation, …). */
export const engines = createRegistry('engine', (Engine) => typeof Engine === 'function');
engines.register('slider', SliderEngine);
engines.register('carousel', CarouselEngine);

export const modules = createRegistry('module', (m) => m && typeof m.setup === 'function');
export const presets = createRegistry('preset', isObject);
export const templates = createRegistry('template', (t) => t && typeof t.render === 'function');

export class UniSlider extends Emitter {
  static version = typeof __UNISLIDER_VERSION__ === 'undefined' ? 'dev' : __UNISLIDER_VERSION__;

  constructor(target, options = {}) {
    super();
    const root = resolveElement(target);
    if (!root) throw new Error(`[UniSlider] Element not found: ${target}`);
    instances.get(root)?.destroy();
    instances.set(root, this);

    this.root = root;
    this.userOptions = merge({}, readDataOptions(root), normalize(options));
    this.hooks = new Map();
    this.modules = new Map();
    this.index = 0;
    this.previousIndex = null;
    this._token = 0;
    this._busy = false;
    this._created = [];
    this._rootClasses = [];

    this._resolveOptions();
    if (isObject(this.options.on)) {
      for (const [name, handler] of Object.entries(this.options.on)) this.on(name, handler);
    }
    this._build();
    this._setup(this._startIndex());
    this._observe();
    this.emit('init', { index: this.index });
  }

  // ------------------------------------------------------------------ getters

  /** Number of positions you can navigate to (slides, or snaps in a carousel). */
  get length() {
    return this.engine?.snapCount?.() ?? this.slides.length;
  }

  get activeSlide() {
    return this.slides[this.index];
  }

  get isPlaying() {
    return Boolean(this.modules.get('autoplay')?.running);
  }

  get autoplay() {
    return this.modules.get('autoplay') ?? null;
  }

  /** Weather controller (`set()`, `strike()`) when rain is enabled. */
  get rain() {
    return this.modules.get('rain') ?? null;
  }

  // -------------------------------------------------------------- navigation

  next(options = {}) {
    return this._step(1, options);
  }

  prev(options = {}) {
    return this._step(-1, options);
  }

  _step(sign, { rewind = false, ...options } = {}) {
    const per = this.options.type === 'carousel' ? Math.max(1, Number(this.options.perMove) || 1) : 1;
    const count = this.length;
    const from = this._busy ? this._pending : this.index;
    let to = from + sign * per;
    let dir = sign;
    if (to < 0 || to >= count) {
      if (this.options.loop && this._canLoop()) to = mod(to, count);
      else if (rewind) {
        to = sign > 0 ? 0 : count - 1;
        dir = -sign;
      } else if (from !== clamp(to, 0, count - 1)) to = clamp(to, 0, count - 1);
      else return Promise.resolve(false);
    }
    return this.goTo(to, { dir, ...options });
  }

  _canLoop() {
    return this.engine?.loop ?? true;
  }

  /**
   * Go to a slide. Resolves `true` when the transition completes, `false` when
   * nothing happened or it was superseded by another call.
   */
  async goTo(target, { source = 'api', dir, immediate = false } = {}) {
    const count = this.length;
    let to = Number(target);
    if (!Number.isFinite(to) || !count) return false;
    to = this.options.loop && this._canLoop() ? mod(Math.round(to), count) : clamp(Math.round(to), 0, count - 1);
    if (to === (this._busy ? this._pending : this.index)) return false;

    const token = ++this._token;
    if (this._busy) this.engine.finish();
    const from = this.index;
    if (to === from) {
      // going back to where a not-yet-started move came from: just cancel it
      this._busy = false;
      return false;
    }
    dir ??= to > from ? 1 : -1;
    const detail = { index: to, previous: from, dir, source, slide: this.slides[to], previousSlide: this.slides[from] };

    this._busy = true;
    this._pending = to;
    this.emit('beforeChange', detail);
    if (!immediate) await this._runHooks('leave', { from, to, dir, source });
    if (token !== this._token || this.destroyed) return false;

    this.previousIndex = from;
    this.index = to;
    this._syncState();
    this.emit('change', detail);
    await this.engine.go({ from, to, dir, immediate, source });
    if (token !== this._token || this.destroyed) return false;

    this._busy = false;
    this._syncState();
    this.emit('afterChange', detail);
    return true;
  }

  /** Update the index without a transition (ticker mode, external sync). */
  setIndex(index, source = 'ticker') {
    const previous = this.index;
    if (index === previous) return;
    this.previousIndex = previous;
    this.index = index;
    this._syncState();
    const detail = { index, previous, dir: 1, source, slide: this.slides[index], previousSlide: this.slides[previous] };
    this.emit('change', detail);
    this.emit('afterChange', detail);
  }

  play() {
    this.autoplay?.start();
    return this;
  }

  pause() {
    this.autoplay?.stop();
    return this;
  }

  toggle() {
    return this.isPlaying ? this.pause() : this.play();
  }

  // ----------------------------------------------------------------- hooks

  /** Register an async hook (e.g. 'leave' — awaited before a transition). */
  hook(name, fn) {
    if (!this.hooks.has(name)) this.hooks.set(name, new Set());
    this.hooks.get(name).add(fn);
    return () => this.hooks.get(name)?.delete(fn);
  }

  async _runHooks(name, ctx) {
    const fns = [...(this.hooks.get(name) ?? [])];
    if (fns.length) await Promise.all(fns.map((fn) => fn(ctx)));
  }

  // --------------------------------------------------------------- options

  _resolveOptions() {
    this.baseOptions = resolveOptions(this.userOptions, { presets, templates });
    const width = isBrowser ? window.innerWidth : 1024;
    this.options = applyBreakpoints(this.baseOptions, width);
    this._bpKey = breakpointKey(this.baseOptions, width);
    const rm = this.options.reducedMotion;
    this.reducedMotion = rm === 'auto' ? prefersReducedMotion() : Boolean(rm);
  }

  _startIndex() {
    const fromHash = this.options.hash && isBrowser ? this._hashIndex() : -1;
    return fromHash >= 0 ? fromHash : Number(this.options.start) || 0;
  }

  _hashIndex() {
    const hash = decodeURIComponent(location.hash.slice(1));
    if (!hash) return -1;
    return this.slides.findIndex((slide) => (data(slide, 'hash') ?? slide.id) === hash);
  }

  /** Change options at runtime (re-initialises engine + modules, keeps the slide). */
  update(options = {}) {
    merge(this.userOptions, normalize(options));
    this._rebuild();
    this.emit('update', { options: this.options });
    return this;
  }

  _rebuild() {
    const index = this.index;
    this._teardown();
    this._resolveOptions();
    this._setup(index);
  }

  // ------------------------------------------------------------------ build

  _build() {
    const { root, options } = this;
    this._original = {
      attributes: ['class', 'style', 'role', 'tabindex', 'aria-roledescription', 'aria-label'].map((name) => [
        name,
        root.getAttribute(name),
      ]),
      html: null,
    };

    const template = options.template ? templates.get(options.template) : null;
    if (options.template && !template) console.warn(`[UniSlider] Unknown template "${options.template}"`);
    if (template && Array.isArray(options.slides)) {
      this._original.html = root.innerHTML;
      root.innerHTML = template.render(options.slides, options);
    }
    this._original.children = [...root.childNodes];

    const holder = root.querySelector(':scope > .us-slides') ?? root;
    this._slideParent = holder;
    let slides = [...holder.children].filter((node) => node.matches('.us-slide, [data-us-slide]'));
    if (!slides.length) slides = [...holder.children].filter((node) => !node.matches('script, template, style, .us-ui'));
    this.slides = slides;

    this.stage = el('div', { class: 'us-stage' });
    this.track = el('div', { class: 'us-slides' });
    this.ui = el('div', { class: 'us-ui' });
    this.stage.append(this.track, this.ui);
    this.track.append(...slides);
    root.append(this.stage);

    slides.forEach((slide, i) => this._prepareSlide(slide, i));
  }

  _prepareSlide(slide, i) {
    slide.classList.add('us-slide');
    slide.dataset.usIndex = String(i);
    const bg = data(slide, 'bg');
    let bgNode = slide.querySelector(':scope > .us-bg, :scope > img[data-us-bg], :scope > video[data-us-bg]');
    if (bgNode) bgNode.classList.add('us-bg');
    else if (typeof bg === 'string') {
      bgNode = el('div', { class: 'us-bg', 'data-us-src': bg, 'aria-hidden': 'true' });
      const position = data(slide, 'bg-position');
      if (position) bgNode.style.backgroundPosition = position;
      slide.prepend(bgNode);
      this._created.push(bgNode);
    }
    const overlay = data(slide, 'overlay');
    if (overlay !== undefined && overlay !== false) {
      const color = typeof overlay === 'number' ? `rgba(0, 0, 0, ${overlay})` : overlay === true ? 'rgba(0, 0, 0, 0.45)' : overlay;
      const node = el('div', { class: 'us-overlay', 'aria-hidden': 'true', style: { background: color } });
      bgNode ? bgNode.after(node) : slide.prepend(node);
      this._created.push(node);
    }
  }

  /** Load lazy images / backgrounds of a slide. */
  loadSlide(index) {
    const slide = this.slides[index];
    if (!slide || slide.dataset.usLoaded) return;
    slide.dataset.usLoaded = 'true';
    for (const node of slide.querySelectorAll('[data-us-src], [data-us-srcset]')) {
      const src = node.getAttribute('data-us-src');
      const srcset = node.getAttribute('data-us-srcset');
      if (node.tagName === 'IMG' || node.tagName === 'SOURCE' || node.tagName === 'VIDEO' || node.tagName === 'IFRAME') {
        if (srcset) node.setAttribute('srcset', srcset);
        if (src) node.setAttribute('src', src);
      } else if (src) {
        node.style.backgroundImage = `url("${src}")`;
      }
      node.removeAttribute('data-us-src');
      node.removeAttribute('data-us-srcset');
      node.classList.add('is-loaded');
    }
    this.emit('load', { index, slide });
  }

  // ------------------------------------------------------------------ setup

  _setup(index) {
    const { root, options } = this;
    const classes = [
      'unislider',
      `us-theme-${options.theme || 'none'}`,
      `us-layout-${options.layout}`,
      `us-dir-${options.direction}`,
      `us-mode-${options.mode}`,
    ];
    if (options.height) classes.push('us-has-height');
    if (this.reducedMotion) classes.push('us-reduced-motion');
    if (options.className) classes.push(...String(options.className).split(/\s+/));
    root.classList.add(...classes);
    this._rootClasses = classes;

    const vars = {
      '--us-ratio': ratio(options.aspectRatio),
      '--us-height': cssLength(options.height),
      '--us-min-height': cssLength(options.minHeight),
      '--us-offset': `${this._offset()}px`,
      '--us-speed': `${options.speed}ms`,
      '--us-slide-ratio': options.slideRatio ? ratio(options.slideRatio) : null,
    };
    for (const [name, value] of Object.entries(vars)) {
      if (value) root.style.setProperty(name, value);
      else root.style.removeProperty(name);
    }

    const Engine = engines.get(options.type) ?? SliderEngine;
    this.engine = new Engine(this);
    this.index = clamp(Number(index) || 0, 0, Math.max(0, this.slides.length - 1));
    this.engine.mount();
    // a carousel may have fewer snap positions than slides
    this.index = clamp(this.index, 0, Math.max(0, this.length - 1));

    for (const name of modules.list()) {
      const module = modules.get(name);
      try {
        const instance = module.setup(this);
        if (instance) this.modules.set(name, instance);
      } catch (error) {
        console.error(`[UniSlider] Module "${name}" failed:`, error);
      }
    }
    for (const plugin of [].concat(options.modules ?? [])) {
      const instance = plugin?.setup?.(this);
      if (instance) this.modules.set(plugin.name ?? `custom-${this.modules.size}`, instance);
    }
    this._syncState();
  }

  _teardown() {
    for (const instance of [...this.modules.values()].reverse()) instance.destroy?.();
    this.modules.clear();
    this.engine?.finish?.();
    this.engine?.destroy();
    this._busy = false;
    this._token++;
    this.root.classList.remove(...this._rootClasses);
    for (const slide of this.slides) removeClass(slide, 'is-active', 'is-entering', 'is-leaving', 'is-prev', 'is-next');
  }

  /** Accessibility + state classes for the current index. */
  _syncState() {
    const visible = new Set(this.engine?.visibleIndexes?.() ?? [this.index]);
    const count = this.slides.length;
    this.slides.forEach((slide, i) => {
      const shown = visible.has(i) || slide.classList.contains('is-active');
      slide.toggleAttribute('inert', !shown);
      slide.setAttribute('aria-hidden', String(!shown));
      if (this.options.type === 'slider') {
        slide.classList.toggle('is-prev', i === mod(this.index - 1, count) && count > 2);
        slide.classList.toggle('is-next', i === mod(this.index + 1, count) && count > 2);
      }
    });
    this.root.style.setProperty('--us-index', String(this.index));
  }

  _offset() {
    const { offset } = this.options;
    if (typeof offset === 'number') return offset;
    if (typeof offset === 'string' && isBrowser) {
      return [...document.querySelectorAll(offset)].reduce((sum, node) => sum + node.offsetHeight, 0);
    }
    return 0;
  }

  _observe() {
    if (!isBrowser) return;
    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (this.destroyed) return;
        const key = breakpointKey(this.baseOptions, window.innerWidth);
        if (key !== this._bpKey) {
          this._rebuild();
          this.emit('breakpoint', { options: this.options });
        } else {
          if (typeof this.options.offset === 'string') this.root.style.setProperty('--us-offset', `${this._offset()}px`);
          this.engine.resize();
          this._syncState();
        }
        this.emit('resize');
      });
    };
    if (typeof ResizeObserver === 'function') {
      this._resizeObserver = new ResizeObserver(onResize);
      this._resizeObserver.observe(this.root);
    }
    window.addEventListener('resize', onResize);
    this._offResize = () => window.removeEventListener('resize', onResize);
  }

  // ------------------------------------------------------------ slide CRUD

  /** Add a slide (element or HTML string) at an index (default: end). */
  addSlide(content, at = this.slides.length) {
    const node = typeof content === 'string' ? htmlToElement(content) : content;
    const slides = [...this.slides];
    slides.splice(clamp(at, 0, slides.length), 0, node);
    this._replaceSlides(slides);
    return node;
  }

  removeSlide(index) {
    const slides = [...this.slides];
    const [removed] = slides.splice(index, 1);
    if (!removed) return null;
    this._replaceSlides(slides);
    removed.remove();
    return removed;
  }

  _replaceSlides(slides) {
    const current = this.activeSlide;
    this._teardown();
    this.slides = slides;
    this.track.replaceChildren(...slides);
    slides.forEach((slide, i) => {
      delete slide.dataset.usLoaded;
      if (!slide.classList.contains('us-slide')) this._prepareSlide(slide, i);
      slide.dataset.usIndex = String(i);
    });
    const index = Math.max(0, slides.indexOf(current));
    this._resolveOptions();
    this._setup(index);
    this.emit('slidesChange', { length: slides.length });
  }

  // ---------------------------------------------------------------- destroy

  destroy() {
    if (this.destroyed) return;
    this.emit('destroy');
    this._teardown();
    this.destroyed = true;
    this._resizeObserver?.disconnect();
    this._offResize?.();
    for (const node of this._created) node.remove();
    for (const slide of this.slides) {
      removeClass(slide, 'us-slide');
      slide.removeAttribute('inert');
      slide.removeAttribute('aria-hidden');
      delete slide.dataset.usIndex;
      delete slide.dataset.usLoaded;
    }
    this._slideParent.append(...this.slides);
    const { attributes, children, html } = this._original;
    this.root.replaceChildren(...children);
    if (html !== null) this.root.innerHTML = html;
    // reading the attribute flushes pending CSSOM edits; otherwise Chrome
    // re-serialises them as style="" after the attribute is removed
    this.root.getAttribute('style');
    for (const [name, value] of attributes) {
      if (value === null) this.root.removeAttribute(name);
      else this.root.setAttribute(name, value);
    }
    instances.delete(this.root);
    this.clearListeners();
  }

  // ----------------------------------------------------------------- static

  static get(element) {
    return instances.get(resolveElement(element)) ?? null;
  }

  /** Initialise every `[data-unislider]` element that is not running yet. */
  static init(scope = isBrowser ? document : null) {
    if (!scope) return [];
    return [...scope.querySelectorAll('[data-unislider]')]
      .filter((node) => !instances.has(node))
      .map((node) => new UniSlider(node));
  }

  static create(target, options) {
    return new UniSlider(target, options);
  }
}

const ratio = (value) => {
  if (value === null || value === undefined || value === false) return null;
  if (typeof value === 'number') return String(value);
  return String(value).replace(':', ' / ');
};

const cssLength = (value) => {
  if (value === null || value === undefined || value === false || value === '') return null;
  return typeof value === 'number' ? `${value}px` : String(value);
};

function htmlToElement(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}
