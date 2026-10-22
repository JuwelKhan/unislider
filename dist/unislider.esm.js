/*! UniSlider v1.0.0 | MIT License | https://github.com/JuwelKhan/unislider */
var __defProp = Object.defineProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);

// src/core/Emitter.js
var _handlers;
var Emitter = class {
  constructor() {
    __privateAdd(this, _handlers, /* @__PURE__ */ new Map());
  }
  on(name, handler) {
    for (const event of String(name).split(/\s+/)) {
      if (!__privateGet(this, _handlers).has(event)) __privateGet(this, _handlers).set(event, /* @__PURE__ */ new Set());
      __privateGet(this, _handlers).get(event).add(handler);
    }
    return this;
  }
  once(name, handler) {
    const wrapper = (...args) => {
      this.off(name, wrapper);
      handler.apply(this, args);
    };
    return this.on(name, wrapper);
  }
  off(name, handler) {
    for (const event of String(name).split(/\s+/)) {
      if (!handler) __privateGet(this, _handlers).delete(event);
      else __privateGet(this, _handlers).get(event)?.delete(handler);
    }
    return this;
  }
  emit(name, detail) {
    for (const handler of [...__privateGet(this, _handlers).get(name) ?? []]) handler.call(this, detail);
    for (const handler of [...__privateGet(this, _handlers).get("*") ?? []]) handler.call(this, name, detail);
    return this;
  }
  clearListeners() {
    __privateGet(this, _handlers).clear();
  }
};
_handlers = new WeakMap();

// src/core/registry.js
function createRegistry(kind, validate = () => true) {
  const items = /* @__PURE__ */ new Map();
  return {
    kind,
    register(name, item) {
      if (typeof name !== "string" || !name) throw new TypeError(`${kind}: name must be a non-empty string`);
      if (!validate(item)) throw new TypeError(`${kind} "${name}" is invalid`);
      items.set(name, item);
      return item;
    },
    get: (name) => items.get(name) ?? null,
    has: (name) => items.has(name),
    list: () => [...items.keys()],
    remove: (name) => items.delete(name)
  };
}

// src/core/utils.js
var isBrowser = typeof window !== "undefined" && typeof document !== "undefined";
var clamp = (value, min, max) => Math.min(max, Math.max(min, value));
var mod = (value, length) => (value % length + length) % length;
var lerp = (a, b, t) => a + (b - a) * t;
var isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
function merge(target, ...sources) {
  for (const source of sources) {
    if (!isObject(source)) continue;
    for (const [key, value] of Object.entries(source)) {
      if (value === void 0) continue;
      target[key] = isObject(value) ? merge(isObject(target[key]) ? target[key] : {}, value) : value;
    }
  }
  return target;
}
function resolveElement(target, root = isBrowser ? document : null) {
  if (typeof target === "string") return root?.querySelector(target) ?? null;
  return target ?? null;
}
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === void 0 || value === null || value === false) continue;
    if (key === "class") node.className = value;
    else if (key === "html") node.innerHTML = value;
    else if (key === "text") node.textContent = value;
    else if (key === "style" && isObject(value)) Object.assign(node.style, value);
    else node.setAttribute(key, value === true ? "" : value);
  }
  for (const child of [].concat(children)) if (child) node.append(child);
  return node;
}
function removeClass(node, ...names) {
  node.classList.remove(...names);
  if (!node.classList.length) node.removeAttribute("class");
}
function parseValue(raw) {
  if (raw === void 0 || raw === null) return void 0;
  const value = String(raw).trim();
  if (value === "") return true;
  if (value === "true") return true;
  if (value === "false") return false;
  if (value !== "" && !Number.isNaN(Number(value))) return Number(value);
  if (/^[[{]/.test(value)) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}
var data = (node, name) => parseValue(node?.getAttribute?.(`data-us-${name}`) ?? void 0);
var prefersReducedMotion = () => isBrowser && typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
var settled = (animations) => Promise.all(animations.filter(Boolean).map((a) => a.finished.catch(() => null)));
var pick = (list) => list[Math.floor(Math.random() * list.length)];
var pad = (n, size = 2) => String(n).padStart(size, "0");

// src/core/options.js
var DEFAULTS = {
  /** 'slider' (stacked slides, full transitions + layers) or 'carousel' (moving track). */
  type: "slider",
  /** 'auto' (plays by itself), 'manual' (user-driven) or 'hybrid' (both). */
  mode: "hybrid",
  preset: null,
  template: null,
  /** Slide data used by templates (array of objects). */
  slides: null,
  theme: "dark",
  /** Extra classes for the root element. */
  className: "",
  /** 'auto' (aspect ratio / height), 'fullwidth', 'fullscreen'. */
  layout: "auto",
  height: null,
  aspectRatio: "16 / 9",
  minHeight: 320,
  /** Pixels (or a selector whose height is used) subtracted in fullscreen layout. */
  offset: 0,
  /** Stage height follows the active slide (stacked slider). */
  autoHeight: false,
  direction: "horizontal",
  start: 0,
  loop: true,
  speed: 900,
  easing: "smooth",
  /** Name, array of names, 'random', or an inline transition object. */
  transition: "fade",
  // Carousel
  perView: 1,
  gap: 0,
  center: false,
  effect: "slide",
  perMove: 1,
  freeMode: false,
  /** Continuous marquee speed in px/s (0 = off). */
  ticker: 0,
  /** Aspect ratio of each carousel slide, e.g. '4 / 5'. */
  slideRatio: null,
  slideToClicked: false,
  carouselEasing: "out",
  autoplay: {
    enabled: true,
    delay: 5e3,
    pauseOnHover: true,
    pauseOnFocus: true,
    pauseHidden: true,
    stopOnInteraction: false,
    reverse: false
  },
  navigation: {
    arrows: true,
    bullets: true,
    thumbnails: false,
    fraction: false,
    progress: true,
    playPause: true,
    bulletStyle: "dots",
    arrowStyle: "circle"
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
  a11y: { label: "Slider", announce: true },
  hash: false,
  /** 'auto' follows prefers-reduced-motion; true/false forces it. */
  reducedMotion: "auto",
  breakpoints: null,
  on: null
};
var MODES = {
  auto: {
    autoplay: { enabled: true, pauseOnHover: false, stopOnInteraction: false },
    navigation: { arrows: false, thumbnails: false, playPause: true }
  },
  manual: {
    autoplay: { enabled: false },
    navigation: { arrows: true, bullets: true, progress: false, playPause: false }
  },
  hybrid: {}
};
var NAV_KEYS = ["arrows", "bullets", "thumbnails", "fraction", "progress", "playPause"];
function normalize(source) {
  if (!isObject(source)) return {};
  const out = { ...source };
  const bool = (key, objectKey = "enabled") => {
    if (typeof out[key] === "boolean") out[key] = { [objectKey]: out[key] };
  };
  if (typeof out.autoplay === "number") out.autoplay = { enabled: out.autoplay > 0, delay: out.autoplay };
  bool("autoplay");
  if (typeof out.navigation === "boolean") {
    out.navigation = Object.fromEntries(NAV_KEYS.map((key) => [key, out.navigation]));
  }
  bool("layers");
  bool("lazy");
  if (out.kenburns === true) out.kenburns = { preset: "random" };
  else if (typeof out.kenburns === "string") out.kenburns = { preset: out.kenburns };
  if (out.parallax === true) out.parallax = { mouse: 24, scroll: 0 };
  else if (typeof out.parallax === "number") out.parallax = { mouse: out.parallax, scroll: 0 };
  if (typeof out.a11y === "string") out.a11y = { label: out.a11y };
  return out;
}
function resolveOptions(user = {}, { presets: presets2, templates: templates2 } = {}) {
  const input = normalize(user);
  const template = input.template ? normalize(templates2?.get(input.template)?.options ?? {}) : {};
  const templatePreset = template.preset ? resolveNamed(presets2, template.preset, "preset") : {};
  const userPreset = input.preset ? resolveNamed(presets2, input.preset, "preset") : {};
  const mode = input.mode ?? userPreset.mode ?? template.mode ?? templatePreset.mode ?? DEFAULTS.mode;
  const options = merge({}, DEFAULTS, normalize(MODES[mode] ?? {}), templatePreset, template, userPreset, input);
  options.mode = mode;
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
function applyBreakpoints(options, width) {
  if (!isObject(options.breakpoints)) return options;
  const result = merge({}, options);
  const sizes = Object.keys(options.breakpoints).map(Number).filter((size) => !Number.isNaN(size) && width >= size).sort((a, b) => a - b);
  for (const size of sizes) merge(result, normalize(options.breakpoints[size]));
  return result;
}
var breakpointKey = (options, width) => isObject(options.breakpoints) ? Object.keys(options.breakpoints).map(Number).filter((size) => width >= size).join(",") : "";
function readDataOptions(node) {
  const raw = node.getAttribute("data-unislider");
  if (raw === null) return {};
  const value = parseValue(raw);
  if (isObject(value)) return value;
  if (typeof value === "string") return { preset: value };
  return {};
}

// src/core/easing.js
var EASINGS = {
  linear: "linear",
  ease: "ease",
  in: "cubic-bezier(0.55, 0, 1, 0.45)",
  out: "cubic-bezier(0.16, 1, 0.3, 1)",
  "in-out": "cubic-bezier(0.65, 0, 0.35, 1)",
  smooth: "cubic-bezier(0.77, 0, 0.175, 1)",
  expo: "cubic-bezier(0.87, 0, 0.13, 1)",
  "expo-out": "cubic-bezier(0.19, 1, 0.22, 1)",
  back: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  "back-in": "cubic-bezier(0.36, 0, 0.66, -0.56)",
  snappy: "cubic-bezier(0.2, 0.9, 0.1, 1)",
  power2: "cubic-bezier(0.45, 0, 0.55, 1)",
  circ: "cubic-bezier(0.85, 0, 0.15, 1)"
};
var easing = (name, fallback = EASINGS.out) => name ? EASINGS[name] ?? name : fallback;
var EASE_FN = {
  linear: (t) => t,
  out: (t) => 1 - Math.pow(1 - t, 4),
  "in-out": (t) => t < 0.5 ? 8 * t ** 4 : 1 - Math.pow(-2 * t + 2, 4) / 2,
  "expo-out": (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  back: (t) => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2)
};
var easeFn = (name) => typeof name === "function" ? name : EASE_FN[name] ?? EASE_FN.out;

// src/transitions/registry.js
var transitions = createRegistry(
  "transition",
  (def) => def && (typeof def.keyframes === "function" || typeof def.run === "function")
);
function registerTransition(name, def, category = "custom") {
  const item = typeof def === "function" ? { keyframes: def } : def;
  return transitions.register(name, { name, category, ...item });
}
function transitionsByCategory() {
  var _a;
  const groups = {};
  for (const name of transitions.list()) (groups[_a = transitions.get(name).category] ?? (groups[_a] = [])).push(name);
  return groups;
}
var getTransition = (name) => name && typeof name === "object" ? name : transitions.get(name);

// src/transitions/basic.js
var registerTransition2 = (name, def) => registerTransition(name, def, "classic");
var move = (ctx, pct) => ctx.vertical ? `translate3d(0, ${pct}%, 0)` : `translate3d(${pct}%, 0, 0)`;
var still = [{ opacity: 1 }, { opacity: 1 }];
registerTransition2("fade", () => ({ in: [{ opacity: 0 }, { opacity: 1 }], out: still }));
registerTransition2("fade-through", () => ({
  in: [{ opacity: 0 }, { opacity: 0, offset: 0.45 }, { opacity: 1 }],
  out: [{ opacity: 1 }, { opacity: 0, offset: 0.45 }, { opacity: 0 }]
}));
registerTransition2("slide", (ctx) => ({
  in: [{ transform: move(ctx, 100 * ctx.dir) }, { transform: move(ctx, 0) }],
  out: [{ transform: move(ctx, 0) }, { transform: move(ctx, -100 * ctx.dir) }]
}));
registerTransition2("slide-vertical", (ctx) => {
  const c = { ...ctx, vertical: !ctx.vertical };
  return {
    in: [{ transform: move(c, 100 * ctx.dir) }, { transform: move(c, 0) }],
    out: [{ transform: move(c, 0) }, { transform: move(c, -100 * ctx.dir) }]
  };
});
registerTransition2("slide-over", (ctx) => ({
  in: [{ transform: move(ctx, 100 * ctx.dir) }, { transform: move(ctx, 0) }],
  out: [
    { transform: move(ctx, 0), filter: "brightness(1)" },
    { transform: move(ctx, -30 * ctx.dir), filter: "brightness(0.5)" }
  ]
}));
registerTransition2("reveal", (ctx) => ({
  top: "out",
  in: [{ transform: "scale(1.1)" }, { transform: "scale(1)" }],
  out: [{ transform: move(ctx, 0) }, { transform: move(ctx, -100 * ctx.dir) }]
}));
registerTransition2("parallax", (ctx) => ({
  in: [{ transform: move(ctx, 100 * ctx.dir) }, { transform: move(ctx, 0) }],
  out: [{ transform: move(ctx, 0) }, { transform: move(ctx, -45 * ctx.dir) }]
}));
registerTransition2("stack", (ctx) => ({
  in: [{ transform: move({ ...ctx, vertical: true }, 100) }, { transform: move({ ...ctx, vertical: true }, 0) }],
  out: [
    { transform: "scale(1)", filter: "brightness(1)" },
    { transform: "scale(0.88)", filter: "brightness(0.4)" }
  ]
}));
registerTransition2("zoom-in", () => ({
  in: [
    { opacity: 0, transform: "scale(0.6)" },
    { opacity: 1, transform: "scale(1)" }
  ],
  out: [{ transform: "scale(1)" }, { transform: "scale(1.2)" }]
}));
registerTransition2("zoom-out", () => ({
  top: "out",
  in: [{ transform: "scale(0.85)" }, { transform: "scale(1)" }],
  out: [
    { opacity: 1, transform: "scale(1)" },
    { opacity: 0, transform: "scale(1.5)" }
  ]
}));
registerTransition2("blur", () => ({
  in: [
    { opacity: 0, filter: "blur(24px)", transform: "scale(1.06)" },
    { opacity: 1, filter: "blur(0px)", transform: "scale(1)" }
  ],
  out: [{ filter: "blur(0px)" }, { filter: "blur(24px)" }]
}));
registerTransition2("skew", (ctx) => {
  const axis2 = ctx.vertical ? "skewY" : "skewX";
  return {
    in: [
      { transform: `${move(ctx, 100 * ctx.dir)} ${axis2}(${-18 * ctx.dir}deg)` },
      { transform: `${move(ctx, 0)} ${axis2}(0deg)` }
    ],
    out: [
      { transform: `${move(ctx, 0)} ${axis2}(0deg)` },
      { transform: `${move(ctx, -100 * ctx.dir)} ${axis2}(${18 * ctx.dir}deg)` }
    ]
  };
});
registerTransition2("rotate", (ctx) => ({
  in: [
    { opacity: 0, transform: `rotate(${10 * ctx.dir}deg) scale(1.35)` },
    { opacity: 1, transform: "rotate(0deg) scale(1)" }
  ],
  out: [{ transform: "scale(1)" }, { transform: "scale(0.9)" }]
}));
registerTransition2("glitch", (ctx) => {
  const x = (pct) => move(ctx, pct * ctx.dir);
  return {
    in: [
      { opacity: 0, transform: x(6), filter: "hue-rotate(90deg) saturate(3)" },
      { opacity: 1, transform: x(-4), filter: "hue-rotate(-60deg) saturate(2)", offset: 0.2 },
      { opacity: 0.6, transform: x(3), filter: "hue-rotate(40deg) saturate(2.5)", offset: 0.4 },
      { opacity: 1, transform: x(-2), filter: "hue-rotate(-20deg) saturate(1.5)", offset: 0.6 },
      { opacity: 1, transform: x(0), filter: "hue-rotate(0deg) saturate(1)" }
    ],
    out: still
  };
});

// src/transitions/3d.js
var registerTransition3 = (name, def) => registerTransition(name, def, "3d");
var axis = (ctx) => ctx.vertical ? "X" : "Y";
var shift = (ctx, pct) => ctx.vertical ? `translateY(${pct}%)` : `translateX(${pct}%)`;
var sign = (ctx) => ctx.vertical ? -1 : 1;
registerTransition3("cube", {
  perspective: "1600px",
  keyframes(ctx) {
    const d = ctx.dir;
    const a = axis(ctx);
    const s = sign(ctx);
    const near = ctx.vertical ? d > 0 ? "center top" : "center bottom" : d > 0 ? "left center" : "right center";
    const far = ctx.vertical ? d > 0 ? "center bottom" : "center top" : d > 0 ? "right center" : "left center";
    return {
      in: [
        { transformOrigin: near, transform: `${shift(ctx, 100 * d)} rotate${a}(${90 * d * s}deg)` },
        { transformOrigin: near, transform: `${shift(ctx, 0)} rotate${a}(0deg)` }
      ],
      out: [
        { transformOrigin: far, transform: `${shift(ctx, 0)} rotate${a}(0deg)` },
        { transformOrigin: far, transform: `${shift(ctx, -100 * d)} rotate${a}(${-90 * d * s}deg)` }
      ]
    };
  }
});
registerTransition3("flip", {
  perspective: "2000px",
  backface: true,
  keyframes(ctx) {
    const a = axis(ctx);
    const deg = 180 * ctx.dir * sign(ctx);
    return {
      in: [{ transform: `rotate${a}(${-deg}deg)` }, { transform: `rotate${a}(0deg)` }],
      out: [{ transform: `rotate${a}(0deg)` }, { transform: `rotate${a}(${deg}deg)` }]
    };
  }
});
registerTransition3("cards", {
  perspective: "1400px",
  keyframes(ctx) {
    const a = axis(ctx);
    return {
      in: [
        { transform: `${shift(ctx, 110 * ctx.dir)} rotate${a}(${-25 * ctx.dir * sign(ctx)}deg)` },
        { transform: `${shift(ctx, 0)} rotate${a}(0deg)` }
      ],
      out: [
        { transform: "translateZ(0) scale(1)", opacity: 1, filter: "brightness(1)" },
        { transform: "translateZ(-200px) scale(0.8)", opacity: 0.5, filter: "brightness(0.5)" }
      ]
    };
  }
});
registerTransition3("fold", {
  perspective: "1800px",
  keyframes(ctx) {
    const a = axis(ctx);
    const origin = ctx.vertical ? ctx.dir > 0 ? "center top" : "center bottom" : ctx.dir > 0 ? "left center" : "right center";
    return {
      top: "out",
      in: [{ filter: "brightness(0.3)" }, { filter: "brightness(1)" }],
      out: [
        { transformOrigin: origin, transform: `rotate${a}(0deg)`, opacity: 1 },
        { transformOrigin: origin, transform: `rotate${a}(${-100 * ctx.dir * sign(ctx)}deg)`, opacity: 0.4 }
      ]
    };
  }
});

// src/transitions/clip.js
var registerTransition4 = (name, def) => registerTransition(name, def, "mask");
var still2 = [{ opacity: 1 }, { opacity: 1 }];
var drift = (ctx, pct) => ctx.vertical ? `translateY(${pct}%)` : `translateX(${pct}%)`;
registerTransition4("wipe", (ctx) => {
  const sides = ctx.vertical ? ["0 0 0 0", ctx.dir > 0 ? "100% 0 0 0" : "0 0 100% 0"] : ["0 0 0 0", ctx.dir > 0 ? "0 0 0 100%" : "0 100% 0 0"];
  return {
    in: [{ clipPath: `inset(${sides[1]})` }, { clipPath: `inset(${sides[0]})` }],
    out: [{ transform: drift(ctx, 0) }, { transform: drift(ctx, -20 * ctx.dir) }]
  };
});
registerTransition4("circle", () => ({
  in: [{ clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(75% at 50% 50%)" }],
  out: [{ transform: "scale(1)" }, { transform: "scale(1.1)" }]
}));
registerTransition4("diamond", () => ({
  in: [
    { clipPath: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)" },
    { clipPath: "polygon(50% -50%, 150% 50%, 50% 150%, -50% 50%)" }
  ],
  out: still2
}));
registerTransition4("curtain", (ctx) => ({
  in: [
    { clipPath: ctx.vertical ? "inset(50% 0 50% 0)" : "inset(0 50% 0 50%)" },
    { clipPath: "inset(0 0 0 0)" }
  ],
  out: [{ transform: "scale(1)" }, { transform: "scale(0.92)" }]
}));
registerTransition4("diagonal", (ctx) => {
  const start = ctx.dir > 0 ? "polygon(100% 0, 100% 0, 100% 0, 100% 0)" : "polygon(0 100%, 0 100%, 0 100%, 0 100%)";
  const end = ctx.dir > 0 ? "polygon(100% 0, -100% 0, 100% 200%, 100% 0)" : "polygon(0 100%, 0 -100%, 200% 100%, 0 100%)";
  return { in: [{ clipPath: start }, { clipPath: end }], out: still2 };
});

// src/transitions/tiles.js
var registerTransition5 = (name, def) => registerTransition(name, def, "tiles");
function buildTiles(ctx, { source = "to", cols = 1, rows = 1 } = {}) {
  const slide = source === "to" ? ctx.to : ctx.from;
  const { width, height } = ctx;
  const overlay = document.createElement("div");
  overlay.className = "us-tiles";
  const tiles = [];
  const tileW = width / cols;
  const tileH = height / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tile = document.createElement("div");
      tile.className = "us-tile";
      const x = Math.round(c * tileW);
      const y = Math.round(r * tileH);
      const w = Math.round((c + 1) * tileW) - x;
      const h = Math.round((r + 1) * tileH) - y;
      Object.assign(tile.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` });
      const snap = snapshot(slide);
      Object.assign(snap.style, { left: `${-x}px`, top: `${-y}px`, width: `${width}px`, height: `${height}px` });
      tile.append(snap);
      overlay.append(tile);
      tiles.push({ tile, row: r, col: c, index: tiles.length });
    }
  }
  ctx.stage.append(overlay);
  return { overlay, tiles, remove: () => overlay.remove() };
}
function snapshot(slide) {
  const clone = slide.cloneNode(true);
  clone.classList.add("us-snapshot");
  clone.classList.remove("is-active", "is-entering", "is-leaving");
  clone.removeAttribute("id");
  clone.removeAttribute("style");
  clone.querySelectorAll("[data-us-layer], .us-layer, .us-rain, video, iframe, script, canvas").forEach((node) => node.remove());
  clone.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
  clone.setAttribute("aria-hidden", "true");
  clone.inert = true;
  return clone;
}
function tileIn(ctx, grid, animateTile) {
  const { tiles, remove } = buildTiles(ctx, { source: "to", ...grid });
  const total = ctx.speed;
  const hold = ctx.to.animate([{ opacity: 0 }, { opacity: 0 }], { duration: total });
  const animations = tiles.map((t) => animateTile(t, tiles.length));
  return { animations: [hold, ...animations], cleanup: remove };
}
function tileOut(ctx, grid, animateTile) {
  const { tiles, remove } = buildTiles(ctx, { source: "from", ...grid });
  const hold = ctx.from.animate([{ opacity: 0 }, { opacity: 0 }], { duration: ctx.speed });
  const animations = tiles.map((t) => animateTile(t, tiles.length));
  return { animations: [hold, ...animations], cleanup: remove };
}
var order = (ctx, index, count) => ctx.dir > 0 ? index : count - 1 - index;
registerTransition5("slices", {
  run(ctx) {
    const cols = ctx.width < 600 ? 6 : 10;
    const step = ctx.speed * 0.45 / cols;
    const duration = ctx.speed - step * (cols - 1);
    return tileIn(
      ctx,
      { cols },
      ({ tile, col }) => tile.animate(
        [
          { transform: `translateY(${col % 2 ? 100 : -100}%)`, opacity: 0 },
          { transform: "translateY(0)", opacity: 1 }
        ],
        { duration, delay: order(ctx, col, cols) * step, easing: ctx.easing, fill: "both" }
      )
    );
  }
});
registerTransition5("blinds", {
  run(ctx) {
    const cols = ctx.vertical ? 1 : ctx.width < 600 ? 5 : 8;
    const rows = ctx.vertical ? 6 : 1;
    const count = cols * rows;
    const step = ctx.speed * 0.35 / count;
    const duration = ctx.speed - step * (count - 1);
    const from = ctx.vertical ? "inset(0 0 100% 0)" : ctx.dir > 0 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)";
    return tileIn(
      ctx,
      { cols, rows },
      ({ tile, index }) => tile.animate([{ clipPath: from }, { clipPath: "inset(0 0 0 0)" }], {
        duration,
        delay: order(ctx, index, count) * step,
        easing: ctx.easing,
        fill: "both"
      })
    );
  }
});
registerTransition5("boxes", {
  run(ctx) {
    const cols = ctx.width < 600 ? 4 : 8;
    const rows = Math.max(2, Math.round(cols * ctx.height / ctx.width));
    const step = ctx.speed * 0.5 / (cols + rows);
    const duration = ctx.speed - step * (cols + rows - 2);
    return tileIn(ctx, { cols, rows }, ({ tile, row, col }) => {
      const wave = ctx.dir > 0 ? row + col : rows - 1 - row + (cols - 1 - col);
      return tile.animate(
        [
          { transform: "scale(0) rotate(-45deg)", opacity: 0 },
          { transform: "scale(1) rotate(0deg)", opacity: 1 }
        ],
        { duration, delay: wave * step, easing: ctx.easing, fill: "both" }
      );
    });
  }
});
registerTransition5("mosaic", {
  run(ctx) {
    const cols = ctx.width < 600 ? 4 : 7;
    const rows = Math.max(2, Math.round(cols * ctx.height / ctx.width));
    const count = cols * rows;
    const delays = Array.from({ length: count }, () => Math.random());
    return tileIn(
      ctx,
      { cols, rows },
      ({ tile, index }) => tile.animate([{ opacity: 0, transform: "scale(1.3)" }, { opacity: 1, transform: "scale(1)" }], {
        duration: ctx.speed * 0.5,
        delay: delays[index] * ctx.speed * 0.5,
        easing: ctx.easing,
        fill: "both"
      })
    );
  }
});
registerTransition5("split", {
  run(ctx) {
    const vertical = !ctx.vertical;
    return tileOut(ctx, vertical ? { rows: 2 } : { cols: 2 }, ({ tile, index }) => {
      const sign2 = index === 0 ? -1 : 1;
      const to = vertical ? `translateY(${sign2 * 100}%)` : `translateX(${sign2 * 100}%)`;
      return tile.animate([{ transform: "translate(0, 0)" }, { transform: to }], {
        duration: ctx.speed,
        easing: ctx.easing,
        fill: "both"
      });
    });
  }
});
registerTransition5("shutter", {
  run(ctx) {
    const rows = ctx.vertical ? 1 : 6;
    const cols = ctx.vertical ? 6 : 1;
    const count = rows * cols;
    const step = ctx.speed * 0.4 / count;
    const duration = ctx.speed - step * (count - 1);
    return tileOut(
      ctx,
      { rows, cols },
      ({ tile, index }) => tile.animate(
        [{ transform: "scale(1, 1)" }, { transform: ctx.vertical ? "scale(0, 1)" : "scale(1, 0)" }],
        { duration, delay: order(ctx, index, count) * step, easing: ctx.easing, fill: "both" }
      )
    );
  }
});

// src/transitions/rain.js
var GRAVITY = "cubic-bezier(0.55, 0, 0.85, 0.35)";
var rand = (min, max) => min + Math.random() * (max - min);
var strips = (ctx, desktop, mobile) => ctx.width < 600 ? mobile : desktop;
function flash(ctx, at = 0.05, strength = 0.9) {
  const node = document.createElement("div");
  node.className = "us-flash";
  ctx.stage.append(node);
  const animation = node.animate(
    [
      { opacity: 0 },
      { opacity: strength, offset: at },
      { opacity: 0.05, offset: at + 0.04 },
      { opacity: strength * 0.75, offset: at + 0.08 },
      { opacity: 0, offset: Math.min(1, at + 0.3) },
      { opacity: 0 }
    ],
    { duration: ctx.speed, easing: "linear" }
  );
  return { animation, remove: () => node.remove() };
}
var combine = (...parts) => ({
  animations: parts.flatMap((p) => p.animations ?? [p.animation]),
  cleanup: () => parts.forEach((p) => (p.cleanup ?? p.remove)?.())
});
registerTransition("rain", {
  category: "rain",
  run(ctx) {
    const cols = strips(ctx, 28, 14);
    return tileIn(ctx, { cols }, ({ tile }) => {
      const duration = ctx.speed * rand(0.35, 0.5);
      return tile.animate(
        [
          { transform: "translateY(-110%) scaleY(1.5)", opacity: 0.4 },
          { transform: "translateY(0) scaleY(1)", opacity: 1 }
        ],
        { duration, delay: rand(0, ctx.speed - duration), easing: GRAVITY, fill: "both" }
      );
    });
  }
});
registerTransition("drizzle", {
  category: "rain",
  run(ctx) {
    const cols = strips(ctx, 16, 8);
    const rows = Math.max(4, Math.round(cols * ctx.height / ctx.width));
    const duration = ctx.speed * 0.35;
    return tileIn(
      ctx,
      { cols, rows },
      ({ tile, row }) => tile.animate(
        [
          { transform: "translateY(-40%)", opacity: 0 },
          { transform: "translateY(0)", opacity: 1 }
        ],
        {
          duration,
          delay: row / rows * ctx.speed * 0.35 + rand(0, ctx.speed * 0.3),
          easing: "ease-out",
          fill: "both"
        }
      )
    );
  }
});
registerTransition("downpour", {
  category: "rain",
  run(ctx) {
    const cols = strips(ctx, 20, 10);
    return tileIn(ctx, { cols }, ({ tile }) => {
      const duration = ctx.speed * rand(0.45, 0.6);
      return tile.animate(
        [
          { transform: "translateY(-105%) scaleY(1.7)", transformOrigin: "bottom" },
          { transform: "translateY(0) scaleY(0.9)", transformOrigin: "bottom", offset: 0.7 },
          { transform: "translateY(0) scaleY(1.04)", transformOrigin: "bottom", offset: 0.85 },
          { transform: "translateY(0) scaleY(1)", transformOrigin: "bottom" }
        ],
        { duration, delay: rand(0, ctx.speed * 0.35), easing: "linear", fill: "both" }
      );
    });
  }
});
registerTransition("storm", {
  category: "rain",
  run(ctx) {
    const cols = strips(ctx, 18, 9);
    const wind = ctx.dir > 0 ? -1 : 1;
    const rain = tileIn(ctx, { cols }, ({ tile }) => {
      const duration = ctx.speed * rand(0.35, 0.5);
      return tile.animate(
        [
          { transform: `translate(${wind * 35}%, -110%) skewX(${wind * -14}deg)`, opacity: 0.3 },
          { transform: "translate(0, 0) skewX(0deg)", opacity: 1 }
        ],
        { duration, delay: rand(ctx.speed * 0.1, ctx.speed - duration), easing: GRAVITY, fill: "both" }
      );
    });
    return combine(rain, flash(ctx, 0.04));
  }
});
registerTransition("thunder", {
  category: "rain",
  keyframes: () => ({
    easing: "linear",
    in: [
      { opacity: 0, filter: "brightness(1)" },
      { opacity: 0, filter: "brightness(1)", offset: 0.18 },
      { opacity: 1, filter: "brightness(3.2)", offset: 0.2 },
      { opacity: 1, filter: "brightness(0.7)", offset: 0.3 },
      { opacity: 1, filter: "brightness(2.2)", offset: 0.34 },
      { opacity: 1, filter: "brightness(1)" }
    ],
    out: [
      { opacity: 1, filter: "brightness(1)" },
      { opacity: 1, filter: "brightness(2.6)", offset: 0.06 },
      { opacity: 1, filter: "brightness(0.6)", offset: 0.1 },
      { opacity: 1, filter: "brightness(0.6)", offset: 0.18 },
      { opacity: 1, filter: "brightness(0.6)", offset: 0.3 },
      { opacity: 1, filter: "brightness(0.6)" }
    ]
  })
});
registerTransition("ripple", {
  category: "rain",
  run(ctx) {
    const overlay = document.createElement("div");
    overlay.className = "us-tiles";
    ctx.stage.append(overlay);
    const count = ctx.width < 600 ? 4 : 6;
    const animations = [ctx.to.animate([{ opacity: 0 }, { opacity: 0 }], { duration: ctx.speed })];
    for (let i = 0; i < count; i++) {
      const x = i === 0 ? 50 : rand(10, 90);
      const y = i === 0 ? 55 : rand(15, 85);
      const delay = i === 0 ? 0 : rand(0, ctx.speed * 0.45);
      const duration = ctx.speed - delay;
      const layer = snapshot(ctx.to);
      layer.classList.add("us-ripple-layer");
      overlay.append(layer);
      animations.push(
        layer.animate([{ clipPath: `circle(0% at ${x}% ${y}%)` }, { clipPath: `circle(150% at ${x}% ${y}%)` }], {
          duration,
          delay,
          easing: "cubic-bezier(0.3, 0.1, 0.4, 1)",
          fill: "both"
        })
      );
      for (let r = 0; r < 2; r++) {
        const ring = document.createElement("span");
        ring.className = "us-ripple-ring";
        Object.assign(ring.style, { left: `${x}%`, top: `${y}%` });
        overlay.append(ring);
        animations.push(
          ring.animate(
            [
              { transform: "translate(-50%, -50%) scale(0)", opacity: 0.9 },
              { transform: `translate(-50%, -50%) scale(${18 - r * 6})`, opacity: 0 }
            ],
            { duration: duration * 0.8, delay: delay + r * 120, easing: "cubic-bezier(0.2, 0.6, 0.3, 1)", fill: "both" }
          )
        );
      }
    }
    return { animations, cleanup: () => overlay.remove() };
  }
});
registerTransition("drip", {
  category: "rain",
  run(ctx) {
    const cols = strips(ctx, 14, 7);
    return tileIn(ctx, { cols }, ({ tile }) => {
      const duration = ctx.speed * rand(0.55, 0.8);
      return tile.animate(
        [
          { clipPath: "inset(0 0 100% 0 round 0 0 50% 50%)" },
          { clipPath: "inset(0 0 0% 0 round 0 0 0% 0%)" }
        ],
        { duration, delay: rand(0, ctx.speed - duration), easing: "cubic-bezier(0.45, 0, 0.3, 1)", fill: "both" }
      );
    });
  }
});
registerTransition("melt", {
  category: "rain",
  run(ctx) {
    const cols = strips(ctx, 16, 8);
    return tileOut(ctx, { cols }, ({ tile }) => {
      const duration = ctx.speed * rand(0.5, 0.75);
      return tile.animate(
        [
          { transform: "translateY(0) scaleY(1)", opacity: 1, transformOrigin: "top" },
          { transform: "translateY(110%) scaleY(1.4)", opacity: 0.2, transformOrigin: "top" }
        ],
        { duration, delay: rand(0, ctx.speed - duration), easing: GRAVITY, fill: "both" }
      );
    });
  }
});
registerTransition("mist", {
  category: "rain",
  keyframes: () => ({
    in: [
      { opacity: 0, filter: "blur(28px) brightness(1.5) saturate(0.3)", transform: "scale(1.08)" },
      { opacity: 1, filter: "blur(0px) brightness(1) saturate(1)", transform: "scale(1)" }
    ],
    out: [
      { opacity: 1, filter: "blur(0px) brightness(1) saturate(1)", transform: "scale(1)" },
      { opacity: 1, filter: "blur(28px) brightness(1.5) saturate(0.3)", transform: "scale(1.04)" }
    ]
  })
});
registerTransition("splash", {
  category: "rain",
  keyframes: () => ({
    easing: "cubic-bezier(0.25, 0.8, 0.35, 1)",
    in: [
      { clipPath: "circle(0% at 50% 55%)", transform: "scale(1.35)" },
      { clipPath: "circle(48% at 50% 55%)", transform: "scale(1.08)", offset: 0.45 },
      { clipPath: "circle(40% at 50% 55%)", transform: "scale(1.1)", offset: 0.55 },
      { clipPath: "circle(80% at 50% 55%)", transform: "scale(1)" }
    ],
    out: [
      { transform: "scale(1)", filter: "brightness(1)" },
      { transform: "scale(0.9)", filter: "brightness(0.6)" }
    ]
  })
});
var filterId = 0;
registerTransition("liquid", {
  category: "rain",
  run(ctx) {
    const id = `us-liquid-${++filterId}`;
    const ns = "http://www.w3.org/2000/svg";
    const svg2 = document.createElementNS(ns, "svg");
    svg2.setAttribute("class", "us-svg-filter");
    svg2.setAttribute("aria-hidden", "true");
    svg2.innerHTML = `<filter id="${id}" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.006 0.03" numOctaves="2" seed="${Math.round(rand(1, 99))}" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G"/>
    </filter>`;
    ctx.stage.append(svg2);
    const map = svg2.querySelector("feDisplacementMap");
    const turbulence = svg2.querySelector("feTurbulence");
    ctx.from.style.filter = `url(#${id})`;
    ctx.to.style.filter = `url(#${id})`;
    const fade = ctx.to.animate([{ opacity: 0 }, { opacity: 1 }], { duration: ctx.speed, easing: "ease-in-out", fill: "both" });
    let frame = 0;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / ctx.speed);
      map.setAttribute("scale", String(Math.sin(t * Math.PI) * 90));
      turbulence.setAttribute("baseFrequency", `${6e-3 + t * 4e-3} ${0.03 - t * 0.01}`);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return {
      animations: [fade],
      cleanup() {
        cancelAnimationFrame(frame);
        ctx.from.style.filter = "";
        ctx.to.style.filter = "";
        svg2.remove();
      }
    };
  }
});

// src/engines/slider.js
var SliderEngine = class {
  constructor(slider) {
    this.slider = slider;
    this.animations = [];
    this.cleanup = null;
  }
  mount() {
    const { slider } = this;
    slider.root.classList.add("us-type-slider");
    slider.root.classList.toggle("us-auto-height", Boolean(slider.options.autoHeight));
    slider.slides[slider.index]?.classList.add("is-active");
    this.syncHeight(slider.index);
  }
  /** autoHeight: the stage follows the height of the active slide. */
  syncHeight(index) {
    const slide = this.slider.slides[index];
    if (this.slider.options.autoHeight && slide) this.slider.stage.style.height = `${slide.offsetHeight}px`;
  }
  snapCount() {
    return this.slider.slides.length;
  }
  visibleIndexes() {
    return [this.slider.index];
  }
  /** Transition name for a move — slide attribute, then option (array / 'random'). */
  pickTransition(slide) {
    const { slider } = this;
    if (slider.reducedMotion) return "fade";
    let value = data(slide, "transition") ?? slider.options.transition;
    if (typeof value === "string" && value.includes(",")) value = value.split(",").map((v) => v.trim());
    if (Array.isArray(value)) value = pick(value);
    if (value === "random") value = pick(transitions.list());
    return value;
  }
  async go({ from, to, dir, immediate }) {
    const { slider } = this;
    const fromEl = slider.slides[from];
    const toEl = slider.slides[to];
    this.finish();
    fromEl.classList.remove("is-active");
    toEl.classList.add("is-active");
    this.syncHeight(to);
    const speed = slider.reducedMotion ? Math.min(slider.options.speed, 300) : Number(data(toEl, "speed") ?? slider.options.speed);
    if (immediate || speed <= 0 || from === to) return;
    const def = getTransition(this.pickTransition(toEl)) ?? getTransition("fade");
    this.lastTransition = def.name;
    const stage = slider.stage;
    const ctx = {
      from: fromEl,
      to: toEl,
      dir,
      vertical: slider.options.direction === "vertical",
      width: stage.clientWidth,
      height: stage.clientHeight,
      speed,
      easing: easing(data(toEl, "easing") ?? slider.options.easing),
      stage,
      slider
    };
    fromEl.classList.add("is-leaving");
    toEl.classList.add("is-entering");
    if (def.perspective) slider.track.style.perspective = def.perspective;
    let animations = [];
    let extraCleanup = null;
    if (def.run) {
      const result = def.run(ctx);
      animations = Array.isArray(result) ? result : result?.animations ?? [];
      extraCleanup = result?.cleanup ?? null;
    } else {
      const frames = def.keyframes(ctx);
      const timing = { duration: speed, easing: frames.easing ?? ctx.easing, fill: "both" };
      if (frames.top === "out") fromEl.style.zIndex = "3";
      if (def.backface) {
        fromEl.style.backfaceVisibility = "hidden";
        toEl.style.backfaceVisibility = "hidden";
      }
      animations = [frames.in && toEl.animate(frames.in, timing), frames.out && fromEl.animate(frames.out, timing)];
    }
    animations = animations.filter(Boolean);
    slider.emit("transition:start", { from, to, dir, name: def.name, speed });
    const cleanup = () => {
      for (const animation of animations) animation.cancel();
      extraCleanup?.();
      fromEl.classList.remove("is-leaving");
      toEl.classList.remove("is-entering");
      for (const node of [fromEl, toEl]) {
        node.style.zIndex = "";
        node.style.backfaceVisibility = "";
      }
      slider.track.style.perspective = "";
    };
    this.animations = animations;
    this.cleanup = cleanup;
    await settled(animations);
    if (this.cleanup === cleanup) {
      this.cleanup = null;
      this.animations = [];
      cleanup();
    }
  }
  /** Jump a running transition to its end state. */
  finish() {
    const cleanup = this.cleanup;
    if (!cleanup) return;
    this.cleanup = null;
    for (const animation of this.animations) {
      try {
        animation.finish();
      } catch {
        animation.cancel();
      }
    }
    this.animations = [];
    cleanup();
  }
  resize() {
    this.syncHeight(this.slider.index);
  }
  destroy() {
    this.finish();
    this.slider.root.classList.remove("us-type-slider", "us-auto-height");
    this.slider.stage.style.height = "";
  }
};

// src/engines/effects.js
var carouselEffects = createRegistry("carousel effect", (fx) => fx && typeof fx.apply === "function");
function registerCarouselEffect(name, fx) {
  return carouselEffects.register(name, typeof fx === "function" ? { apply: fx } : fx);
}
var rot = (ctx) => ctx.vertical ? "rotateX" : "rotateY";
var flip = (ctx) => ctx.vertical ? -1 : 1;
registerCarouselEffect("slide", () => ({}));
registerCarouselEffect("fade", ({ offset, origin }) => {
  const a = Math.abs(offset);
  return { x: origin, opacity: clamp(1 - a, 0, 1), zIndex: Math.round(100 - a * 10) };
});
registerCarouselEffect("scale", ({ offset }) => {
  const a = Math.min(Math.abs(offset), 1);
  return { transform: `scale(${1 - a * 0.18})`, opacity: 1 - a * 0.45 };
});
registerCarouselEffect("coverflow", {
  perspective: "1200px",
  apply(ctx) {
    const { offset, size } = ctx;
    const a = Math.abs(offset);
    const c = clamp(offset, -1, 1);
    return {
      transform: `translateZ(${-Math.min(a, 3) * size * 0.3}px) ${rot(ctx)}(${-c * 50 * flip(ctx)}deg)`,
      zIndex: Math.round(100 - a * 10),
      opacity: clamp(ctx.perView / 2 + 1.5 - a, 0, 1)
    };
  }
});
registerCarouselEffect("cards", ({ offset, origin, size }) => {
  if (offset <= 0) return { zIndex: 100 };
  const a = Math.min(offset, 4);
  return {
    x: origin + a * size * 0.06,
    transform: `scale(${1 - a * 0.07})`,
    zIndex: Math.round(100 - offset * 10),
    opacity: clamp(4 - offset, 0, 1),
    filter: `brightness(${1 - a * 0.12})`
  };
});
registerCarouselEffect("ring", {
  perspective: "1600px",
  apply(ctx) {
    const { offset, origin, count, size } = ctx;
    const angle = 360 / Math.max(count, 6);
    const radius = Math.round(size / 2 / Math.tan(Math.PI / Math.max(count, 6))) + 20;
    const deg = offset * angle * flip(ctx);
    const facing = Math.cos(offset * angle * Math.PI / 180);
    return {
      x: origin,
      transform: `translateZ(${-radius}px) ${rot(ctx)}(${deg}deg) translateZ(${radius}px)`,
      zIndex: Math.round(facing * 100),
      opacity: clamp(0.25 + facing, 0, 1)
    };
  }
});
registerCarouselEffect("wave", ({ offset, size, vertical }) => {
  const lift = Math.sin(offset * 1.1) * size * 0.12;
  const tilt = Math.max(-12, Math.min(12, offset * 5));
  return {
    transform: vertical ? `translateX(${lift}px) rotate(${-tilt}deg)` : `translateY(${lift}px) rotate(${tilt}deg)`,
    zIndex: Math.round(100 - Math.abs(offset) * 10)
  };
});
registerCarouselEffect("cascade", ({ offset, size, vertical }) => {
  const a = Math.min(Math.abs(offset), 4);
  const drop = a * size * 0.16;
  return {
    transform: `${vertical ? `translateX(${drop}px)` : `translateY(${drop}px)`} scale(${1 - a * 0.1})`,
    opacity: clamp(1.2 - a * 0.3, 0, 1),
    zIndex: Math.round(100 - a * 10),
    filter: a > 0.01 ? `brightness(${1 - a * 0.15})` : "none"
  };
});
registerCarouselEffect("depth", ({ offset }) => {
  const a = Math.min(Math.abs(offset), 3);
  return {
    transform: `scale(${1 - a * 0.12})`,
    filter: a > 0.01 ? `blur(${a * 2.5}px)` : "none",
    opacity: 1 - a * 0.2,
    zIndex: Math.round(100 - a * 10)
  };
});

// src/engines/carousel.js
var DRAG_THRESHOLD = 6;
var CarouselEngine = class {
  constructor(slider) {
    this.slider = slider;
    this.pos = slider.index;
    this.tween = null;
    this.pendingPos = null;
    this.listeners = [];
    this.tickerFrame = 0;
    this.paused = /* @__PURE__ */ new Set();
  }
  get count() {
    return this.slider.slides.length;
  }
  mount() {
    const { slider } = this;
    const o = slider.options;
    slider.root.classList.add("us-type-carousel");
    this.vertical = o.direction === "vertical";
    this.effect = carouselEffects.get(o.effect) ?? carouselEffects.get("slide");
    slider.root.classList.add(`us-effect-${o.effect}`);
    if (this.effect.perspective) slider.track.style.perspective = this.effect.perspective;
    this.measure();
    this.pos = this.posForIndex(slider.index);
    this.render();
    if (o.drag) this.bindDrag();
    if (o.slideToClicked) this.listen(slider.track, "click", (e) => this.onSlideClick(e));
    if (o.ticker > 0) this.startTicker();
  }
  listen(target, type, handler, options) {
    target.addEventListener(type, handler, options);
    this.listeners.push(() => target.removeEventListener(type, handler, options));
  }
  measure() {
    const { slider } = this;
    const o = slider.options;
    const stage = slider.stage;
    this.viewport = this.vertical ? stage.clientHeight : stage.clientWidth;
    this.perView = Math.max(1, Number(o.perView) || 1);
    this.gap = Math.max(0, Number(o.gap) || 0);
    this.size = Math.max(1, (this.viewport - this.gap * (this.perView - 1)) / this.perView);
    this.step = this.size + this.gap;
    this.center = Boolean(o.center);
    this.loop = Boolean(o.loop || o.ticker > 0) && this.count >= Math.ceil(this.perView) + 2;
    this.maxPos = this.loop ? Infinity : this.center ? this.count - 1 : Math.max(0, this.count - this.perView);
    this.origin = this.center ? (this.viewport - this.size) / 2 : 0;
    for (const slide of slider.slides) {
      slide.style[this.vertical ? "height" : "width"] = `${this.size}px`;
    }
  }
  snapCount() {
    return this.loop || this.center ? this.count : Math.ceil(this.maxPos) + 1;
  }
  posForIndex(index) {
    return this.loop ? index : Math.min(index, this.maxPos);
  }
  indexForPos(pos) {
    if (this.loop) return mod(Math.round(pos), this.count);
    return clamp(Math.round(pos >= this.maxPos - 0.01 ? Math.ceil(this.maxPos) : pos), 0, this.snapCount() - 1);
  }
  visibleIndexes() {
    return this.visible ?? [this.slider.index];
  }
  render() {
    const { slider, effect } = this;
    const n = this.count;
    const activeSlide = this.loop ? mod(Math.round(this.pos), n) : clamp(Math.round(this.pos), 0, n - 1);
    const visible = [];
    slider.slides.forEach((slide, i) => {
      let offset = i - this.pos;
      if (this.loop) offset = mod(offset + n / 2, n) - n / 2;
      const base = this.origin + offset * this.step;
      const fx = effect.apply({
        offset,
        base,
        origin: this.origin,
        step: this.step,
        size: this.size,
        viewport: this.viewport,
        perView: this.perView,
        vertical: this.vertical,
        count: n,
        index: i
      });
      const x = fx.x ?? base;
      const move2 = this.vertical ? `translate3d(0, ${x}px, 0)` : `translate3d(${x}px, 0, 0)`;
      slide.style.transform = fx.transform ? `${move2} ${fx.transform}` : move2;
      slide.style.opacity = fx.opacity === void 0 ? "" : String(fx.opacity);
      slide.style.zIndex = fx.zIndex === void 0 ? "" : String(fx.zIndex);
      slide.style.filter = fx.filter ?? "";
      const inView = x + this.size > 1 && x < this.viewport - 1 && fx.opacity !== 0;
      slide.classList.toggle("is-visible", inView);
      slide.classList.toggle("is-active", i === activeSlide);
      if (inView) visible.push(i);
    });
    this.visible = visible;
    slider.emit("progress", { position: this.pos, progress: this.progress() });
  }
  progress() {
    if (this.loop) return mod(this.pos, this.count) / Math.max(1, this.count - 1);
    return this.maxPos ? clamp(this.pos / this.maxPos, 0, 1) : 0;
  }
  /** Animate `pos` to a target. Resolves when it arrives (or is interrupted). */
  animateTo(target, duration = this.slider.options.speed) {
    this.stopTween();
    const from = this.pos;
    if (Math.abs(target - from) < 1e-4 || duration <= 0) {
      this.pos = target;
      this.render();
      return Promise.resolve();
    }
    const ease = easeFn(this.slider.options.carouselEasing);
    return new Promise((resolve) => {
      const start = performance.now();
      const tween = { target, resolve, frame: 0 };
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        this.pos = from + (target - from) * ease(t);
        this.render();
        if (t < 1) tween.frame = requestAnimationFrame(tick);
        else this.endTween(tween);
      };
      this.tween = tween;
      tween.frame = requestAnimationFrame(tick);
    });
  }
  endTween(tween) {
    if (this.tween !== tween) return;
    this.tween = null;
    tween.resolve();
  }
  stopTween() {
    const tween = this.tween;
    if (!tween) return;
    cancelAnimationFrame(tween.frame);
    this.tween = null;
    tween.resolve();
  }
  go({ to, dir, immediate }) {
    let target;
    const pending = this.pendingPos;
    this.pendingPos = null;
    if (pending?.index === to) {
      target = pending.pos;
    } else if (this.loop) {
      let delta = to - mod(this.pos, this.count);
      if (delta > this.count / 2) delta -= this.count;
      if (delta < -this.count / 2) delta += this.count;
      if (dir > 0 && delta < 0) delta += this.count;
      if (dir < 0 && delta > 0) delta -= this.count;
      target = this.pos + delta;
    } else {
      target = this.posForIndex(to);
    }
    const speed = this.slider.reducedMotion ? Math.min(this.slider.options.speed, 250) : this.slider.options.speed;
    return this.animateTo(target, immediate ? 0 : speed);
  }
  finish() {
    const tween = this.tween;
    if (!tween) return;
    cancelAnimationFrame(tween.frame);
    this.pos = tween.target;
    this.render();
    this.tween = null;
    tween.resolve();
  }
  resize() {
    const index = this.slider.index;
    this.measure();
    if (!this.tween && !this.dragging) this.pos = this.loop ? this.pos : this.posForIndex(index);
    this.render();
  }
  // ---------------------------------------------------------------- dragging
  bindDrag() {
    const stage = this.slider.stage;
    stage.classList.add("us-draggable");
    let state = null;
    const axis2 = (e) => this.vertical ? e.clientY : e.clientX;
    const cross = (e) => this.vertical ? e.clientX : e.clientY;
    this.listen(stage, "pointerdown", (e) => {
      if (e.button !== 0 || e.target.closest(".us-ui, input, textarea, select, [data-us-nodrag]")) return;
      state = {
        id: e.pointerId,
        start: axis2(e),
        startCross: cross(e),
        startPos: this.pos,
        moved: false,
        locked: e.pointerType === "mouse",
        samples: [{ t: e.timeStamp, v: axis2(e) }]
      };
    });
    this.listen(stage, "pointermove", (e) => {
      if (!state || e.pointerId !== state.id) return;
      const delta = axis2(e) - state.start;
      if (!state.locked) {
        const crossDelta = Math.abs(cross(e) - state.startCross);
        if (Math.abs(delta) < DRAG_THRESHOLD && crossDelta < DRAG_THRESHOLD) return;
        if (crossDelta > Math.abs(delta)) {
          state = null;
          return;
        }
        state.locked = true;
      }
      if (!state.moved && Math.abs(delta) < DRAG_THRESHOLD) return;
      if (!state.moved) {
        state.moved = true;
        this.dragging = true;
        this.finish();
        stage.setPointerCapture?.(e.pointerId);
        stage.classList.add("is-dragging");
        this.slider.emit("dragStart");
      }
      let pos = state.startPos - delta / this.step;
      if (!this.loop) {
        if (pos < 0) pos /= 3;
        else if (pos > this.maxPos) pos = this.maxPos + (pos - this.maxPos) / 3;
      }
      this.pos = pos;
      this.render();
      state.samples.push({ t: e.timeStamp, v: axis2(e) });
      if (state.samples.length > 6) state.samples.shift();
      e.preventDefault();
    });
    const release = (e) => {
      if (!state || e.pointerId !== state.id) return;
      const finished = state;
      state = null;
      if (!finished.moved) return;
      this.dragging = false;
      stage.classList.remove("is-dragging");
      stage.releasePointerCapture?.(e.pointerId);
      this.listenOnce(stage, "click", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
      });
      const last = finished.samples[finished.samples.length - 1];
      const first = finished.samples.find((sample) => last.t - sample.t <= 100) ?? last;
      const velocity = (last.v - first.v) / Math.max(1, last.t - first.t);
      this.release(finished.startPos, axis2(e) - finished.start, velocity);
    };
    this.listen(stage, "pointerup", release);
    this.listen(stage, "pointercancel", release);
  }
  listenOnce(target, type, handler) {
    const wrapped = (e) => {
      target.removeEventListener(type, wrapped, true);
      handler(e);
    };
    target.addEventListener(type, wrapped, true);
    setTimeout(() => target.removeEventListener(type, wrapped, true), 50);
  }
  release(startPos, deltaPx, velocity) {
    const { slider } = this;
    let target;
    if (slider.options.freeMode) {
      const glide = clamp(-velocity * 300 / this.step, -this.perView * 2, this.perView * 2);
      target = this.pos + glide;
    } else if (Math.abs(velocity) > 0.3) {
      target = velocity < 0 ? Math.ceil(this.pos - 0.05) : Math.floor(this.pos + 0.05);
    } else {
      target = Math.round(this.pos);
      if (target === Math.round(startPos) && Math.abs(deltaPx) > 30) target += deltaPx < 0 ? 1 : -1;
    }
    if (!slider.options.freeMode) {
      const perMove = Math.max(1, Number(slider.options.perMove) || 1);
      const start = Math.round(startPos);
      if (perMove > 1) target = start + Math.round((target - start) / perMove) * perMove;
    }
    if (!this.loop) target = clamp(target, 0, this.maxPos);
    const index = this.indexForPos(target);
    slider.emit("dragEnd", { velocity });
    if (index !== slider.index) {
      this.pendingPos = { index, pos: target };
      slider.goTo(index, { source: "drag", dir: Math.sign(target - startPos) || 1 }).then((moved) => {
        if (!moved && !this.tween && !this.dragging) this.settle();
      });
    } else {
      this.animateTo(target);
    }
  }
  /** Snap back to the current index (after a cancelled move). */
  settle() {
    this.pendingPos = null;
    this.go({ to: this.slider.index, dir: 0 });
  }
  onSlideClick(e) {
    const slide = e.target.closest(".us-slide");
    if (!slide || e.defaultPrevented) return;
    const i = this.slider.slides.indexOf(slide);
    if (i < 0 || slide.classList.contains("is-active")) return;
    e.preventDefault();
    this.slider.goTo(this.loop || this.center ? i : this.indexForPos(Math.min(i, this.maxPos)), { source: "click" });
  }
  // ------------------------------------------------------------------ ticker
  startTicker() {
    const { slider } = this;
    const speed = Number(slider.options.ticker);
    let last = performance.now();
    const hover = () => this.paused.add("hover");
    const leave = () => this.paused.delete("hover");
    if (slider.options.autoplay.pauseOnHover) {
      this.listen(slider.root, "pointerenter", hover);
      this.listen(slider.root, "pointerleave", leave);
    }
    const tick = (now) => {
      const dt = Math.min(64, now - last);
      last = now;
      if (!this.paused.size && !this.dragging && !this.tween) {
        const dir = slider.options.autoplay.reverse ? -1 : 1;
        this.pos += dir * (speed * dt) / 1e3 / this.step;
        this.render();
        const index = this.indexForPos(this.pos);
        if (index !== slider.index) slider.setIndex(index);
      }
      this.tickerFrame = requestAnimationFrame(tick);
    };
    this.tickerFrame = requestAnimationFrame(tick);
  }
  destroy() {
    this.stopTween();
    cancelAnimationFrame(this.tickerFrame);
    for (const off of this.listeners) off();
    this.listeners = [];
    const { slider } = this;
    slider.root.classList.remove("us-type-carousel", `us-effect-${slider.options.effect}`);
    slider.stage.classList.remove("us-draggable", "is-dragging");
    slider.track.style.perspective = "";
    for (const slide of slider.slides) {
      for (const prop of ["transform", "opacity", "zIndex", "filter", "width", "height"]) slide.style[prop] = "";
      slide.classList.remove("is-visible", "is-active");
    }
  }
};

// src/core/UniSlider.js
var instances = /* @__PURE__ */ new WeakMap();
var engines = createRegistry("engine", (Engine) => typeof Engine === "function");
engines.register("slider", SliderEngine);
engines.register("carousel", CarouselEngine);
var modules = createRegistry("module", (m) => m && typeof m.setup === "function");
var presets = createRegistry("preset", isObject);
var templates = createRegistry("template", (t) => t && typeof t.render === "function");
var _UniSlider = class _UniSlider extends Emitter {
  constructor(target, options = {}) {
    super();
    const root = resolveElement(target);
    if (!root) throw new Error(`[UniSlider] Element not found: ${target}`);
    instances.get(root)?.destroy();
    instances.set(root, this);
    this.root = root;
    this.userOptions = merge({}, readDataOptions(root), normalize(options));
    this.hooks = /* @__PURE__ */ new Map();
    this.modules = /* @__PURE__ */ new Map();
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
    this.emit("init", { index: this.index });
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
    return Boolean(this.modules.get("autoplay")?.running);
  }
  get autoplay() {
    return this.modules.get("autoplay") ?? null;
  }
  /** Weather controller (`set()`, `strike()`) when rain is enabled. */
  get rain() {
    return this.modules.get("rain") ?? null;
  }
  // -------------------------------------------------------------- navigation
  next(options = {}) {
    return this._step(1, options);
  }
  prev(options = {}) {
    return this._step(-1, options);
  }
  _step(sign2, { rewind = false, ...options } = {}) {
    const per = this.options.type === "carousel" ? Math.max(1, Number(this.options.perMove) || 1) : 1;
    const count = this.length;
    const from = this._busy ? this._pending : this.index;
    let to = from + sign2 * per;
    let dir = sign2;
    if (to < 0 || to >= count) {
      if (this.options.loop && this._canLoop()) to = mod(to, count);
      else if (rewind) {
        to = sign2 > 0 ? 0 : count - 1;
        dir = -sign2;
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
  async goTo(target, { source = "api", dir, immediate = false } = {}) {
    const count = this.length;
    let to = Number(target);
    if (!Number.isFinite(to) || !count) return false;
    to = this.options.loop && this._canLoop() ? mod(Math.round(to), count) : clamp(Math.round(to), 0, count - 1);
    if (to === (this._busy ? this._pending : this.index)) return false;
    const token = ++this._token;
    if (this._busy) this.engine.finish();
    const from = this.index;
    if (to === from) {
      this._busy = false;
      return false;
    }
    dir ?? (dir = to > from ? 1 : -1);
    const detail = { index: to, previous: from, dir, source, slide: this.slides[to], previousSlide: this.slides[from] };
    this._busy = true;
    this._pending = to;
    this.emit("beforeChange", detail);
    if (!immediate) await this._runHooks("leave", { from, to, dir, source });
    if (token !== this._token || this.destroyed) return false;
    this.previousIndex = from;
    this.index = to;
    this._syncState();
    this.emit("change", detail);
    await this.engine.go({ from, to, dir, immediate, source });
    if (token !== this._token || this.destroyed) return false;
    this._busy = false;
    this._syncState();
    this.emit("afterChange", detail);
    return true;
  }
  /** Update the index without a transition (ticker mode, external sync). */
  setIndex(index, source = "ticker") {
    const previous = this.index;
    if (index === previous) return;
    this.previousIndex = previous;
    this.index = index;
    this._syncState();
    const detail = { index, previous, dir: 1, source, slide: this.slides[index], previousSlide: this.slides[previous] };
    this.emit("change", detail);
    this.emit("afterChange", detail);
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
    if (!this.hooks.has(name)) this.hooks.set(name, /* @__PURE__ */ new Set());
    this.hooks.get(name).add(fn);
    return () => this.hooks.get(name)?.delete(fn);
  }
  async _runHooks(name, ctx) {
    const fns = [...this.hooks.get(name) ?? []];
    if (fns.length) await Promise.all(fns.map((fn) => fn(ctx)));
  }
  // --------------------------------------------------------------- options
  _resolveOptions() {
    this.baseOptions = resolveOptions(this.userOptions, { presets, templates });
    const width = isBrowser ? window.innerWidth : 1024;
    this.options = applyBreakpoints(this.baseOptions, width);
    this._bpKey = breakpointKey(this.baseOptions, width);
    const rm = this.options.reducedMotion;
    this.reducedMotion = rm === "auto" ? prefersReducedMotion() : Boolean(rm);
  }
  _startIndex() {
    const fromHash = this.options.hash && isBrowser ? this._hashIndex() : -1;
    return fromHash >= 0 ? fromHash : Number(this.options.start) || 0;
  }
  _hashIndex() {
    const hash = decodeURIComponent(location.hash.slice(1));
    if (!hash) return -1;
    return this.slides.findIndex((slide) => (data(slide, "hash") ?? slide.id) === hash);
  }
  /** Change options at runtime (re-initialises engine + modules, keeps the slide). */
  update(options = {}) {
    merge(this.userOptions, normalize(options));
    this._rebuild();
    this.emit("update", { options: this.options });
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
      attributes: ["class", "style", "role", "tabindex", "aria-roledescription", "aria-label"].map((name) => [
        name,
        root.getAttribute(name)
      ]),
      html: null
    };
    const template = options.template ? templates.get(options.template) : null;
    if (options.template && !template) console.warn(`[UniSlider] Unknown template "${options.template}"`);
    if (template && Array.isArray(options.slides)) {
      this._original.html = root.innerHTML;
      root.innerHTML = template.render(options.slides, options);
    }
    this._original.children = [...root.childNodes];
    const holder = root.querySelector(":scope > .us-slides") ?? root;
    this._slideParent = holder;
    let slides = [...holder.children].filter((node) => node.matches(".us-slide, [data-us-slide]"));
    if (!slides.length) slides = [...holder.children].filter((node) => !node.matches("script, template, style, .us-ui"));
    this.slides = slides;
    this.stage = el("div", { class: "us-stage" });
    this.track = el("div", { class: "us-slides" });
    this.ui = el("div", { class: "us-ui" });
    this.stage.append(this.track, this.ui);
    this.track.append(...slides);
    root.append(this.stage);
    slides.forEach((slide, i) => this._prepareSlide(slide, i));
  }
  _prepareSlide(slide, i) {
    slide.classList.add("us-slide");
    slide.dataset.usIndex = String(i);
    const bg = data(slide, "bg");
    let bgNode = slide.querySelector(":scope > .us-bg, :scope > img[data-us-bg], :scope > video[data-us-bg]");
    if (bgNode) bgNode.classList.add("us-bg");
    else if (typeof bg === "string") {
      bgNode = el("div", { class: "us-bg", "data-us-src": bg, "aria-hidden": "true" });
      const position = data(slide, "bg-position");
      if (position) bgNode.style.backgroundPosition = position;
      slide.prepend(bgNode);
      this._created.push(bgNode);
    }
    const overlay = data(slide, "overlay");
    if (overlay !== void 0 && overlay !== false) {
      const color = typeof overlay === "number" ? `rgba(0, 0, 0, ${overlay})` : overlay === true ? "rgba(0, 0, 0, 0.45)" : overlay;
      const node = el("div", { class: "us-overlay", "aria-hidden": "true", style: { background: color } });
      bgNode ? bgNode.after(node) : slide.prepend(node);
      this._created.push(node);
    }
  }
  /** Load lazy images / backgrounds of a slide. */
  loadSlide(index) {
    const slide = this.slides[index];
    if (!slide || slide.dataset.usLoaded) return;
    slide.dataset.usLoaded = "true";
    for (const node of slide.querySelectorAll("[data-us-src], [data-us-srcset]")) {
      const src = node.getAttribute("data-us-src");
      const srcset = node.getAttribute("data-us-srcset");
      if (node.tagName === "IMG" || node.tagName === "SOURCE" || node.tagName === "VIDEO" || node.tagName === "IFRAME") {
        if (srcset) node.setAttribute("srcset", srcset);
        if (src) node.setAttribute("src", src);
      } else if (src) {
        node.style.backgroundImage = `url("${src}")`;
      }
      node.removeAttribute("data-us-src");
      node.removeAttribute("data-us-srcset");
      node.classList.add("is-loaded");
    }
    this.emit("load", { index, slide });
  }
  // ------------------------------------------------------------------ setup
  _setup(index) {
    const { root, options } = this;
    const classes = [
      "unislider",
      `us-theme-${options.theme || "none"}`,
      `us-layout-${options.layout}`,
      `us-dir-${options.direction}`,
      `us-mode-${options.mode}`
    ];
    if (options.height) classes.push("us-has-height");
    if (this.reducedMotion) classes.push("us-reduced-motion");
    if (options.className) classes.push(...String(options.className).split(/\s+/));
    root.classList.add(...classes);
    this._rootClasses = classes;
    const vars = {
      "--us-ratio": ratio(options.aspectRatio),
      "--us-height": cssLength(options.height),
      "--us-min-height": cssLength(options.minHeight),
      "--us-offset": `${this._offset()}px`,
      "--us-speed": `${options.speed}ms`,
      "--us-slide-ratio": options.slideRatio ? ratio(options.slideRatio) : null
    };
    for (const [name, value] of Object.entries(vars)) {
      if (value) root.style.setProperty(name, value);
      else root.style.removeProperty(name);
    }
    const Engine = engines.get(options.type) ?? SliderEngine;
    this.engine = new Engine(this);
    this.index = clamp(Number(index) || 0, 0, Math.max(0, this.slides.length - 1));
    this.engine.mount();
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
    for (const slide of this.slides) removeClass(slide, "is-active", "is-entering", "is-leaving", "is-prev", "is-next");
  }
  /** Accessibility + state classes for the current index. */
  _syncState() {
    const visible = new Set(this.engine?.visibleIndexes?.() ?? [this.index]);
    const count = this.slides.length;
    this.slides.forEach((slide, i) => {
      const shown = visible.has(i) || slide.classList.contains("is-active");
      slide.toggleAttribute("inert", !shown);
      slide.setAttribute("aria-hidden", String(!shown));
      if (this.options.type === "slider") {
        slide.classList.toggle("is-prev", i === mod(this.index - 1, count) && count > 2);
        slide.classList.toggle("is-next", i === mod(this.index + 1, count) && count > 2);
      }
    });
    this.root.style.setProperty("--us-index", String(this.index));
  }
  _offset() {
    const { offset } = this.options;
    if (typeof offset === "number") return offset;
    if (typeof offset === "string" && isBrowser) {
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
          this.emit("breakpoint", { options: this.options });
        } else {
          if (typeof this.options.offset === "string") this.root.style.setProperty("--us-offset", `${this._offset()}px`);
          this.engine.resize();
          this._syncState();
        }
        this.emit("resize");
      });
    };
    if (typeof ResizeObserver === "function") {
      this._resizeObserver = new ResizeObserver(onResize);
      this._resizeObserver.observe(this.root);
    }
    window.addEventListener("resize", onResize);
    this._offResize = () => window.removeEventListener("resize", onResize);
  }
  // ------------------------------------------------------------ slide CRUD
  /** Add a slide (element or HTML string) at an index (default: end). */
  addSlide(content, at = this.slides.length) {
    const node = typeof content === "string" ? htmlToElement(content) : content;
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
      if (!slide.classList.contains("us-slide")) this._prepareSlide(slide, i);
      slide.dataset.usIndex = String(i);
    });
    const index = Math.max(0, slides.indexOf(current));
    this._resolveOptions();
    this._setup(index);
    this.emit("slidesChange", { length: slides.length });
  }
  // ---------------------------------------------------------------- destroy
  destroy() {
    if (this.destroyed) return;
    this.emit("destroy");
    this._teardown();
    this.destroyed = true;
    this._resizeObserver?.disconnect();
    this._offResize?.();
    for (const node of this._created) node.remove();
    for (const slide of this.slides) {
      removeClass(slide, "us-slide");
      slide.removeAttribute("inert");
      slide.removeAttribute("aria-hidden");
      delete slide.dataset.usIndex;
      delete slide.dataset.usLoaded;
    }
    this._slideParent.append(...this.slides);
    const { attributes, children, html } = this._original;
    this.root.replaceChildren(...children);
    if (html !== null) this.root.innerHTML = html;
    this.root.getAttribute("style");
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
    return [...scope.querySelectorAll("[data-unislider]")].filter((node) => !instances.has(node)).map((node) => new _UniSlider(node));
  }
  static create(target, options) {
    return new _UniSlider(target, options);
  }
};
__publicField(_UniSlider, "version", false ? "dev" : "1.0.0");
var UniSlider = _UniSlider;
var ratio = (value) => {
  if (value === null || value === void 0 || value === false) return null;
  if (typeof value === "number") return String(value);
  return String(value).replace(":", " / ");
};
var cssLength = (value) => {
  if (value === null || value === void 0 || value === false || value === "") return null;
  return typeof value === "number" ? `${value}px` : String(value);
};
function htmlToElement(html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}

// src/layers/presets.js
var layerPresets = createRegistry(
  "layer animation",
  (p) => p && (Array.isArray(p.keyframes) || typeof p.keyframes === "function")
);
var loopPresets = createRegistry("loop animation", (p) => p && Array.isArray(p.keyframes));
function registerLayerAnimation(name, preset) {
  return layerPresets.register(name, Array.isArray(preset) ? { keyframes: preset } : preset);
}
function registerLoopAnimation(name, preset) {
  return loopPresets.register(name, Array.isArray(preset) ? { keyframes: preset } : preset);
}
function presetKeyframes(name, options = {}) {
  const preset = layerPresets.get(name) ?? layerPresets.get("fade");
  const keyframes = typeof preset.keyframes === "function" ? preset.keyframes(options) : preset.keyframes;
  return { ...preset, keyframes };
}
var fadeMove = (x, y) => ({ distance = 40 } = {}) => [
  { opacity: 0, transform: `translate3d(${x * distance}px, ${y * distance}px, 0)` },
  { opacity: 1, transform: "translate3d(0, 0, 0)" }
];
var mask = (from) => [
  { transform: from, clipPath: maskClip[from] },
  { transform: "translate(0, 0)", clipPath: "inset(0 0 0 0)" }
];
var maskClip = {
  "translate(0, 100%)": "inset(0 0 100% 0)",
  "translate(0, -100%)": "inset(100% 0 0 0)",
  "translate(100%, 0)": "inset(0 100% 0 0)",
  "translate(-100%, 0)": "inset(0 0 0 100%)"
};
var IN = {
  fade: { keyframes: [{ opacity: 0 }, { opacity: 1 }] },
  "fade-up": { keyframes: fadeMove(0, 1) },
  "fade-down": { keyframes: fadeMove(0, -1) },
  "fade-left": { keyframes: fadeMove(1, 0) },
  "fade-right": { keyframes: fadeMove(-1, 0) },
  "slide-up": { keyframes: ({ distance = 120 } = {}) => fadeMove(0, 1)({ distance }), easing: "expo-out" },
  "slide-left": { keyframes: ({ distance = 160 } = {}) => fadeMove(1, 0)({ distance }), easing: "expo-out" },
  "mask-up": { keyframes: mask("translate(0, 100%)"), easing: "expo-out" },
  "mask-down": { keyframes: mask("translate(0, -100%)"), easing: "expo-out" },
  "mask-left": { keyframes: mask("translate(100%, 0)"), easing: "expo-out" },
  "mask-right": { keyframes: mask("translate(-100%, 0)"), easing: "expo-out" },
  "zoom-in": {
    keyframes: [
      { opacity: 0, transform: "scale(0.5)" },
      { opacity: 1, transform: "scale(1)" }
    ]
  },
  "zoom-out": {
    keyframes: [
      { opacity: 0, transform: "scale(1.6)" },
      { opacity: 1, transform: "scale(1)" }
    ]
  },
  pop: {
    keyframes: [
      { opacity: 0, transform: "scale(0.3)" },
      { opacity: 1, transform: "scale(1)" }
    ],
    easing: "back"
  },
  "blur-in": {
    keyframes: [
      { opacity: 0, filter: "blur(16px)", transform: "scale(1.15)" },
      { opacity: 1, filter: "blur(0px)", transform: "scale(1)" }
    ]
  },
  "rotate-in": {
    keyframes: [
      { opacity: 0, transform: "rotate(-120deg) scale(0.6)" },
      { opacity: 1, transform: "rotate(0deg) scale(1)" }
    ]
  },
  "flip-x": {
    keyframes: [
      { opacity: 0, transform: "perspective(800px) rotateX(90deg)" },
      { opacity: 1, transform: "perspective(800px) rotateX(0deg)" }
    ],
    easing: "back"
  },
  "flip-y": {
    keyframes: [
      { opacity: 0, transform: "perspective(800px) rotateY(90deg)" },
      { opacity: 1, transform: "perspective(800px) rotateY(0deg)" }
    ],
    easing: "back"
  },
  "skew-in": {
    keyframes: [
      { opacity: 0, transform: "translateX(-80px) skewX(30deg)" },
      { opacity: 1, transform: "translateX(0) skewX(0deg)" }
    ],
    easing: "expo-out"
  },
  "light-speed": {
    keyframes: [
      { opacity: 0, transform: "translateX(60%) skewX(-30deg)" },
      { opacity: 1, transform: "translateX(-4%) skewX(12deg)", offset: 0.6 },
      { opacity: 1, transform: "translateX(0) skewX(0deg)" }
    ]
  },
  drop: {
    keyframes: [
      { opacity: 0, transform: "translateY(-120%)" },
      { opacity: 1, transform: "translateY(0)", offset: 0.6 },
      { opacity: 1, transform: "translateY(-12%)", offset: 0.8 },
      { opacity: 1, transform: "translateY(0)" }
    ],
    easing: "ease-out"
  },
  "bounce-in": {
    keyframes: [
      { opacity: 0, transform: "scale(0.3)" },
      { opacity: 1, transform: "scale(1.08)", offset: 0.5 },
      { opacity: 1, transform: "scale(0.95)", offset: 0.75 },
      { opacity: 1, transform: "scale(1)" }
    ],
    easing: "ease-out"
  },
  swing: {
    keyframes: [
      { opacity: 0, transformOrigin: "top center", transform: "rotate(-30deg)" },
      { opacity: 1, transformOrigin: "top center", transform: "rotate(12deg)", offset: 0.5 },
      { opacity: 1, transformOrigin: "top center", transform: "rotate(-6deg)", offset: 0.75 },
      { opacity: 1, transformOrigin: "top center", transform: "rotate(0deg)" }
    ],
    easing: "ease-out"
  },
  "roll-in": {
    keyframes: [
      { opacity: 0, transform: "translateX(-100%) rotate(-120deg)" },
      { opacity: 1, transform: "translateX(0) rotate(0deg)" }
    ]
  },
  tracking: {
    keyframes: [
      { opacity: 0, letterSpacing: "0.6em", filter: "blur(8px)" },
      { opacity: 1, letterSpacing: "normal", filter: "blur(0px)" }
    ]
  },
  typewriter: {
    keyframes: [
      { opacity: 0, offset: 0 },
      { opacity: 0, offset: 0.99 },
      { opacity: 1, offset: 1 }
    ],
    duration: 60,
    easing: "linear"
  }
};
Object.assign(IN, {
  raindrop: {
    keyframes: [
      { opacity: 0, transform: "translateY(-140px) scale(0.85, 1.35)" },
      { opacity: 1, transform: "translateY(0) scale(0.9, 1.2)", offset: 0.55 },
      { opacity: 1, transform: "translateY(0) scale(1.15, 0.8)", offset: 0.7 },
      { opacity: 1, transform: "translateY(0) scale(0.97, 1.05)", offset: 0.85 },
      { opacity: 1, transform: "translateY(0) scale(1, 1)" }
    ],
    easing: "ease-in",
    duration: 1e3
  },
  "splash-in": {
    keyframes: [
      { opacity: 0, transform: "scale(0, 0)" },
      { opacity: 1, transform: "scale(1.25, 0.7)", offset: 0.45 },
      { opacity: 1, transform: "scale(0.9, 1.12)", offset: 0.65 },
      { opacity: 1, transform: "scale(1.04, 0.97)", offset: 0.82 },
      { opacity: 1, transform: "scale(1, 1)" }
    ],
    easing: "ease-out"
  },
  "drip-in": {
    keyframes: [
      { clipPath: "inset(0 0 100% 0 round 0 0 40% 40%)", transform: "translateY(-14px) scaleY(1.12)", transformOrigin: "top" },
      { clipPath: "inset(0 0 0% 0 round 0 0 0% 0%)", transform: "translateY(0) scaleY(1)", transformOrigin: "top" }
    ],
    easing: "in-out",
    duration: 1100
  },
  "ripple-in": {
    keyframes: [
      { opacity: 0, clipPath: "circle(0% at 50% 50%)", transform: "scale(0.9)" },
      { opacity: 1, clipPath: "circle(75% at 50% 50%)", transform: "scale(1)" }
    ]
  },
  "mist-in": {
    keyframes: [
      { opacity: 0, filter: "blur(14px) brightness(1.6)", transform: "translateY(12px) scale(1.06)" },
      { opacity: 1, filter: "blur(0px) brightness(1)", transform: "translateY(0) scale(1)" }
    ],
    duration: 1300
  },
  rainfall: {
    keyframes: [
      { opacity: 0, transform: "translateY(-1.4em) scaleY(1.6)" },
      { opacity: 1, transform: "translateY(0.06em) scaleY(0.88)", offset: 0.8 },
      { opacity: 1, transform: "translateY(0) scaleY(1)" }
    ],
    easing: "cubic-bezier(0.55, 0, 0.85, 0.35)",
    duration: 650
  },
  "wave-in": {
    keyframes: [
      { opacity: 0, transform: "translateY(0.7em) rotate(10deg)" },
      { opacity: 1, transform: "translateY(-0.12em) rotate(-3deg)", offset: 0.65 },
      { opacity: 1, transform: "translateY(0) rotate(0deg)" }
    ],
    duration: 800
  },
  "wash-in": {
    keyframes: [
      { opacity: 0, transform: "translateX(-50px) skewX(20deg)", filter: "blur(6px)" },
      { opacity: 1, transform: "translateX(0) skewX(0deg)", filter: "blur(0px)" }
    ],
    easing: "expo-out"
  }
});
var LOOP = {
  float: { keyframes: [{ transform: "translateY(0)" }, { transform: "translateY(-14px)" }], duration: 2600 },
  pulse: { keyframes: [{ transform: "scale(1)" }, { transform: "scale(1.06)" }], duration: 1400 },
  spin: { keyframes: [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }], duration: 8e3, direction: "normal", easing: "linear" },
  wiggle: { keyframes: [{ transform: "rotate(-3deg)" }, { transform: "rotate(3deg)" }], duration: 600 },
  sway: { keyframes: [{ transform: "translateX(-10px)" }, { transform: "translateX(10px)" }], duration: 3e3 },
  bounce: {
    keyframes: [
      { transform: "translateY(0)" },
      { transform: "translateY(-18px)", offset: 0.4 },
      { transform: "translateY(0)", offset: 0.8 },
      { transform: "translateY(0)" }
    ],
    duration: 1600,
    direction: "normal"
  },
  heartbeat: {
    keyframes: [
      { transform: "scale(1)" },
      { transform: "scale(1.12)", offset: 0.14 },
      { transform: "scale(1)", offset: 0.28 },
      { transform: "scale(1.12)", offset: 0.42 },
      { transform: "scale(1)", offset: 0.7 },
      { transform: "scale(1)" }
    ],
    duration: 1600,
    direction: "normal"
  },
  blink: { keyframes: [{ opacity: 1 }, { opacity: 0.25 }], duration: 900 },
  drip: {
    keyframes: [
      { transform: "translateY(0) scaleY(1)", transformOrigin: "top" },
      { transform: "translateY(2px) scaleY(1.06)", transformOrigin: "top" }
    ],
    duration: 1800
  },
  bob: {
    keyframes: [{ transform: "translateY(0) rotate(-2deg)" }, { transform: "translateY(-8px) rotate(2deg)" }],
    duration: 2400
  },
  jelly: {
    keyframes: [{ transform: "scale(1.04, 0.96)" }, { transform: "scale(0.96, 1.04)" }],
    duration: 900
  },
  shimmer: {
    keyframes: [{ filter: "brightness(1) saturate(1)" }, { filter: "brightness(1.25) saturate(1.2)" }],
    duration: 1600
  },
  ripple: {
    keyframes: [
      { boxShadow: "0 0 0 0 rgba(255, 255, 255, 0.55)" },
      { boxShadow: "0 0 0 22px rgba(255, 255, 255, 0)" }
    ],
    duration: 1800,
    direction: "normal",
    easing: "ease-out"
  },
  glow: {
    keyframes: [
      { filter: "drop-shadow(0 0 0 rgba(255,255,255,0))" },
      { filter: "drop-shadow(0 0 18px rgba(255,255,255,0.65))" }
    ],
    duration: 1800
  }
};
for (const [name, preset] of Object.entries(IN)) registerLayerAnimation(name, preset);
for (const [name, preset] of Object.entries(LOOP)) registerLoopAnimation(name, preset);

// src/modules/motion.js
var kenburnsPresets = createRegistry("ken burns preset", Array.isArray);
var KB = {
  "zoom-in": [{ transform: "scale(1)" }, { transform: "scale(1.2)" }],
  "zoom-out": [{ transform: "scale(1.2)" }, { transform: "scale(1)" }],
  "pan-left": [{ transform: "scale(1.15) translateX(4%)" }, { transform: "scale(1.15) translateX(-4%)" }],
  "pan-right": [{ transform: "scale(1.15) translateX(-4%)" }, { transform: "scale(1.15) translateX(4%)" }],
  "pan-up": [{ transform: "scale(1.15) translateY(4%)" }, { transform: "scale(1.15) translateY(-4%)" }],
  "pan-down": [{ transform: "scale(1.15) translateY(-4%)" }, { transform: "scale(1.15) translateY(4%)" }],
  "zoom-in-left": [{ transform: "scale(1) translate(0, 0)" }, { transform: "scale(1.25) translate(-5%, 2%)" }],
  "drift-down": [{ transform: "scale(1.18) translateY(-4%)" }, { transform: "scale(1.18) translateY(4%)" }],
  "rain-zoom": [{ transform: "scale(1.02) translate(0, -2%)" }, { transform: "scale(1.22) translate(-2%, 3%)" }],
  "zoom-in-right": [{ transform: "scale(1) translate(0, 0)" }, { transform: "scale(1.25) translate(5%, -2%)" }]
};
for (const [name, frames] of Object.entries(KB)) kenburnsPresets.register(name, frames);
var kenburnsModule = {
  name: "kenburns",
  setup(slider) {
    if (slider.reducedMotion) return null;
    const global = isObject(slider.options.kenburns) ? slider.options.kenburns : null;
    const settings = (slide) => {
      const own = data(slide, "kenburns");
      if (own === false) return null;
      if (own === void 0 && !global) return null;
      return { ...global, ...typeof own === "string" ? { preset: own } : isObject(own) ? own : {} };
    };
    if (!slider.slides.some(settings)) return null;
    const running = /* @__PURE__ */ new Map();
    const start = (slide) => {
      const kb = settings(slide);
      const bg = slide.querySelector(":scope > .us-bg");
      if (!kb || !bg) return;
      running.get(slide)?.cancel();
      let name = kb.preset ?? "random";
      if (name === "random") name = pick(kenburnsPresets.list());
      const frames = kenburnsPresets.get(name) ?? kenburnsPresets.get("zoom-in");
      const delay = Number(data(slide, "autoplay") ?? slider.options.autoplay.delay) || 5e3;
      const duration = Number(kb.duration) || delay + slider.options.speed * 2;
      running.set(slide, bg.animate(frames, { duration, easing: kb.easing ?? "linear", fill: "both" }));
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
    slider.on("change", onChange);
    slider.on("afterChange", stopOthers);
    return {
      destroy() {
        slider.off("change", onChange);
        slider.off("afterChange", stopOthers);
        for (const animation of running.values()) animation.cancel();
      }
    };
  }
};
var parallaxModule = {
  name: "parallax",
  setup(slider) {
    const o = slider.options.parallax;
    if (!isObject(o) || slider.reducedMotion) return null;
    const root = slider.root;
    const cleanups = [];
    const listen = (target2, type, handler, opts) => {
      target2.addEventListener(type, handler, opts);
      cleanups.push(() => target2.removeEventListener(type, handler, opts));
    };
    const mouseDepth = Number(o.mouse) || 0;
    const bgDepth = Number(o.bg ?? 0);
    let target = { x: 0, y: 0 };
    let current = { x: 0, y: 0 };
    let frame = 0;
    const elements = () => {
      const slide = slider.activeSlide;
      if (!slide) return [];
      const items = [...slide.querySelectorAll("[data-us-parallax]")].map((node) => {
        const depth = data(node, "parallax");
        return [node, typeof depth === "number" ? depth : mouseDepth];
      });
      const bg = slide.querySelector(":scope > .us-bg");
      if (bg && bgDepth) items.push([bg, -bgDepth]);
      return items;
    };
    const render = () => {
      current = { x: lerp(current.x, target.x, 0.08), y: lerp(current.y, target.y, 0.08) };
      for (const [node, depth] of elements()) {
        node.style.translate = `${(-current.x * depth).toFixed(2)}px ${(-current.y * depth).toFixed(2)}px`;
      }
      const still3 = Math.abs(current.x - target.x) < 1e-3 && Math.abs(current.y - target.y) < 1e-3;
      frame = still3 ? 0 : requestAnimationFrame(render);
    };
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };
    if (mouseDepth || bgDepth) {
      listen(root, "pointermove", (e) => {
        if (e.pointerType !== "mouse") return;
        const rect = root.getBoundingClientRect();
        target = {
          x: clamp((e.clientX - rect.left) / rect.width * 2 - 1, -1, 1),
          y: clamp((e.clientY - rect.top) / rect.height * 2 - 1, -1, 1)
        };
        kick();
      });
      listen(root, "pointerleave", () => {
        target = { x: 0, y: 0 };
        kick();
      });
    }
    const scroll = Number(o.scroll) || 0;
    if (scroll) {
      root.classList.add("us-parallax-scroll");
      root.style.setProperty("--us-parallax", `${(scroll * 50).toFixed(2)}%`);
      const onScroll = () => {
        const rect = root.getBoundingClientRect();
        const vh = window.innerHeight;
        if (rect.bottom < 0 || rect.top > vh) return;
        const progress = clamp((rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2), -1, 1);
        root.style.setProperty("--us-parallax-y", `${(progress * scroll * rect.height * 0.5).toFixed(1)}px`);
      };
      onScroll();
      listen(window, "scroll", onScroll, { passive: true });
    }
    const reset = () => {
      for (const slide of slider.slides) {
        if (slide === slider.activeSlide) continue;
        for (const node of slide.querySelectorAll("[data-us-parallax], :scope > .us-bg")) node.style.translate = "";
      }
    };
    slider.on("afterChange", reset);
    return {
      destroy() {
        cancelAnimationFrame(frame);
        slider.off("afterChange", reset);
        for (const off of cleanups) off();
        root.classList.remove("us-parallax-scroll");
        root.style.removeProperty("--us-parallax");
        root.style.removeProperty("--us-parallax-y");
        for (const slide of slider.slides) {
          for (const node of slide.querySelectorAll("[data-us-parallax], :scope > .us-bg")) node.style.translate = "";
        }
      }
    };
  }
};
var hashModule = {
  name: "hash",
  setup(slider) {
    if (!slider.options.hash) return null;
    const idOf = (slide) => data(slide, "hash") ?? slide.id ?? "";
    const onAfter = () => {
      const id = idOf(slider.activeSlide);
      if (id && decodeURIComponent(location.hash.slice(1)) !== id) history.replaceState(null, "", `#${id}`);
    };
    const onHash = () => {
      const index = slider._hashIndex();
      if (index >= 0) slider.goTo(index, { source: "hash" });
    };
    slider.on("afterChange", onAfter);
    window.addEventListener("hashchange", onHash);
    return {
      destroy() {
        slider.off("afterChange", onAfter);
        window.removeEventListener("hashchange", onHash);
      }
    };
  }
};

// src/templates/index.js
var esc = (value = "") => String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
var attr = (name, value) => value === void 0 || value === null || value === "" ? "" : ` ${name}="${esc(value)}"`;
var buttons = (s, layer = "fade-up", delay = 700) => {
  const list = s.buttons ?? (s.button ? [s.button] : []);
  if (!list.length) return "";
  return `<div class="us-tpl-actions" data-us-layer="${layer}" data-us-delay="${delay}">${list.map((b, i) => `<a class="us-btn${i ? " us-btn--ghost" : ""}" href="${esc(b.href ?? "#")}">${esc(b.label)}</a>`).join("")}</div>`;
};
var slideAttrs = (s) => attr("data-us-title", s.title ?? s.name) + attr("data-us-thumb", s.thumb) + attr("data-us-transition", s.transition) + attr("data-us-autoplay", s.duration) + attr("id", s.id);
function registerTemplate(name, template) {
  return templates.register(name, template);
}
registerTemplate("hero-fullscreen", {
  description: "Full-screen hero with background image, Ken Burns and staggered headline.",
  options: { preset: "fullscreen", kenburns: true, parallax: { mouse: 16 }, transition: ["fade", "curtain", "zoom-out"] },
  render: (slides) => slides.map(
    (s) => `<div class="us-tpl-hero"${slideAttrs(s)}${attr("data-us-bg", s.image)} data-us-overlay="${s.overlay ?? 0.45}">
  <div class="us-tpl-hero__inner us-align-${esc(s.align ?? "center")}">
    ${s.kicker ? `<p class="us-tpl-kicker" data-us-layer="mask-up" data-us-delay="100">${esc(s.kicker)}</p>` : ""}
    <h2 class="us-tpl-title" data-us-layer="mask-up" data-us-split="words" data-us-delay="250" data-us-out="fade-up">${esc(s.title)}</h2>
    ${s.text ? `<p class="us-tpl-text" data-us-layer="fade-up" data-us-delay="550">${esc(s.text)}</p>` : ""}
    ${buttons(s, "fade-up", 750)}
  </div>
</div>`
  ).join("")
});
registerTemplate("rain-hero", {
  description: "Moody hero with live rain, raindrop headline letters and ripple clicks.",
  options: { preset: "rainy", layout: "fullwidth", aspectRatio: "21 / 9", minHeight: 480 },
  render: (slides) => slides.map(
    (s) => `<div class="us-tpl-hero us-tpl-rain"${slideAttrs(s)}${attr("data-us-bg", s.image)}${attr("data-us-rain", s.weather)} data-us-overlay="${s.overlay ?? 0.4}">
  <div class="us-tpl-hero__inner us-align-${esc(s.align ?? "center")}">
    ${s.kicker ? `<p class="us-tpl-kicker" data-us-layer="mist-in" data-us-delay="100">${esc(s.kicker)}</p>` : ""}
    <h2 class="us-tpl-title" data-us-layer="rainfall" data-us-split="chars" data-us-stagger="random" data-us-delay="200" data-us-out="fade-up">${esc(s.title)}</h2>
    ${s.text ? `<p class="us-tpl-text" data-us-layer="mist-in" data-us-delay="900">${esc(s.text)}</p>` : ""}
    ${buttons(s, "splash-in", 1200)}
  </div>
</div>`
  ).join("")
});
registerTemplate("hero-split", {
  description: "Two-column hero: copy on one side, floating product/visual on the other.",
  options: { aspectRatio: "16 / 8", minHeight: 520, transition: "slide-over", theme: "light", parallax: { mouse: 0 } },
  render: (slides) => slides.map(
    (s) => `<div class="us-tpl-split"${slideAttrs(s)}${attr("style", s.background ? `background:${s.background}` : "")}>
  <div class="us-tpl-split__copy">
    ${s.kicker ? `<p class="us-tpl-kicker" data-us-layer="fade-right">${esc(s.kicker)}</p>` : ""}
    <h2 class="us-tpl-title" data-us-layer="fade-up" data-us-split="chars" data-us-delay="150">${esc(s.title)}</h2>
    ${s.text ? `<p class="us-tpl-text" data-us-layer="fade-up" data-us-delay="500">${esc(s.text)}</p>` : ""}
    ${buttons(s, "fade-up", 700)}
  </div>
  <div class="us-tpl-split__media" data-us-layer="zoom-in" data-us-delay="300" data-us-loop="float" data-us-parallax="25">
    ${s.image ? `<img src="${esc(s.image)}" alt="${esc(s.alt ?? "")}">` : ""}
  </div>
</div>`
  ).join("")
});
registerTemplate("agency", {
  description: "Bold typographic agency slider with character animations and slice transitions.",
  options: { preset: "cinematic", aspectRatio: "16 / 8", navigation: { fraction: true, bullets: false } },
  render: (slides) => slides.map(
    (s, i) => `<div class="us-tpl-agency"${slideAttrs(s)}${attr("data-us-bg", s.image)} data-us-overlay="${s.overlay ?? 0.35}">
  <span class="us-tpl-agency__index" data-us-layer="fade" data-us-delay="200">${String(i + 1).padStart(2, "0")}</span>
  <h2 class="us-tpl-agency__title" data-us-layer="mask-up" data-us-split="chars" data-us-stagger="30" data-us-delay="200" data-us-out="fade-up">${esc(s.title)}</h2>
  ${s.text ? `<p class="us-tpl-text" data-us-layer="fade-left" data-us-delay="700">${esc(s.text)}</p>` : ""}
  ${buttons(s, "fade-up", 900)}
</div>`
  ).join("")
});
registerTemplate("product-showcase", {
  description: "E-commerce product slider with floating product, price and thumbnails.",
  options: {
    theme: "light",
    aspectRatio: "16 / 8",
    minHeight: 480,
    transition: "parallax",
    parallax: { mouse: 0 },
    navigation: { thumbnails: true, bullets: false, arrows: true }
  },
  render: (slides) => slides.map(
    (s) => `<div class="us-tpl-product"${slideAttrs(s)}${attr("data-us-thumb", s.thumb ?? s.image)}${attr("style", s.background ? `--us-tpl-accent:${s.background}` : "")}>
  <div class="us-tpl-product__copy">
    ${s.kicker ? `<p class="us-tpl-kicker" data-us-layer="fade-down">${esc(s.kicker)}</p>` : ""}
    <h2 class="us-tpl-title" data-us-layer="slide-left" data-us-delay="100">${esc(s.title)}</h2>
    ${s.text ? `<p class="us-tpl-text" data-us-layer="fade-up" data-us-delay="350">${esc(s.text)}</p>` : ""}
    ${s.price ? `<p class="us-tpl-price" data-us-layer="pop" data-us-delay="550">${esc(s.price)}</p>` : ""}
    ${buttons(s, "fade-up", 700)}
  </div>
  <div class="us-tpl-product__media">
    <span class="us-tpl-product__blob" data-us-layer="zoom-in" data-us-delay="100"></span>
    ${s.image ? `<img src="${esc(s.image)}" alt="${esc(s.alt ?? s.title ?? "")}" data-us-layer="rotate-in" data-us-delay="250" data-us-duration="1100" data-us-loop="float">` : ""}
  </div>
</div>`
  ).join("")
});
registerTemplate("testimonials", {
  description: "Quotes with avatar, name and role; height adapts to the quote.",
  options: { preset: "testimonial" },
  render: (slides) => slides.map(
    (s) => `<figure class="us-tpl-quote"${slideAttrs({ ...s, title: s.name })}>
  <blockquote data-us-layer="fade-up" data-us-split="words" data-us-stagger="25">${esc(s.quote ?? s.text)}</blockquote>
  <figcaption data-us-layer="fade-up" data-us-delay="400">
    ${s.avatar ? `<img src="${esc(s.avatar)}" alt="" width="56" height="56">` : ""}
    <span><strong>${esc(s.name)}</strong>${s.role ? `<small>${esc(s.role)}</small>` : ""}</span>
  </figcaption>
</figure>`
  ).join("")
});
registerTemplate("cards-carousel", {
  description: "Responsive card carousel for posts, services or team members.",
  options: { preset: "carousel" },
  render: (slides) => slides.map(
    (s) => `<article class="us-tpl-card"${slideAttrs(s)}>
  ${s.image ? `<div class="us-tpl-card__media"><img src="${esc(s.image)}" alt="${esc(s.alt ?? "")}" loading="lazy" draggable="false"></div>` : ""}
  <div class="us-tpl-card__body">
    ${s.tag ? `<span class="us-tpl-tag">${esc(s.tag)}</span>` : ""}
    <h3>${esc(s.title)}</h3>
    ${s.text ? `<p>${esc(s.text)}</p>` : ""}
    ${s.href ? `<a class="us-tpl-link" href="${esc(s.href)}">${esc(s.link ?? "Read more")} \u2192</a>` : ""}
  </div>
</article>`
  ).join("")
});
registerTemplate("coverflow-gallery", {
  description: "3D coverflow image gallery; click a side image to bring it forward.",
  options: { preset: "coverflow" },
  render: (slides) => slides.map(
    (s) => `<figure class="us-tpl-cover"${slideAttrs(s)}>
  <img src="${esc(s.image)}" alt="${esc(s.alt ?? s.title ?? "")}" draggable="false">
  ${s.title ? `<figcaption>${esc(s.title)}</figcaption>` : ""}
</figure>`
  ).join("")
});
registerTemplate("logo-ticker", {
  description: "Endless logo / partner marquee (pauses on hover).",
  options: { preset: "ticker", theme: "none" },
  render: (slides) => slides.map(
    (s) => `<div class="us-tpl-logo"${slideAttrs(s)}>${s.image ? `<img src="${esc(s.image)}" alt="${esc(s.title ?? "")}" draggable="false">` : `<span>${esc(s.title)}</span>`}</div>`
  ).join("")
});
registerTemplate("vertical-showcase", {
  description: "Full-screen vertical sections with wheel and keyboard navigation.",
  options: { preset: "vertical fullscreen", transition: "parallax", navigation: { fraction: true } },
  render: (slides) => slides.map(
    (s) => `<section class="us-tpl-vertical"${slideAttrs(s)}${attr("data-us-bg", s.image)} data-us-overlay="${s.overlay ?? 0.4}">
  <div class="us-tpl-vertical__inner">
    ${s.kicker ? `<p class="us-tpl-kicker" data-us-layer="fade-right">${esc(s.kicker)}</p>` : ""}
    <h2 class="us-tpl-title" data-us-layer="mask-up" data-us-split="words" data-us-delay="150">${esc(s.title)}</h2>
    ${s.text ? `<p class="us-tpl-text" data-us-layer="fade-up" data-us-delay="450">${esc(s.text)}</p>` : ""}
    ${buttons(s, "fade-up", 650)}
  </div>
</section>`
  ).join("")
});
registerTemplate("news-headlines", {
  description: "Compact headline bar that flips through news or announcements.",
  options: {
    direction: "vertical",
    transition: "slide",
    height: 64,
    minHeight: 0,
    speed: 600,
    theme: "light",
    autoplay: { delay: 3500 },
    navigation: { bullets: false, progress: false, playPause: true, arrows: true },
    layers: { enabled: false }
  },
  render: (slides) => slides.map(
    (s) => `<a class="us-tpl-news"${slideAttrs(s)} href="${esc(s.href ?? "#")}">
  ${s.tag ? `<span class="us-tpl-tag">${esc(s.tag)}</span>` : ""}
  <span class="us-tpl-news__title">${esc(s.title)}</span>
  ${s.date ? `<time>${esc(s.date)}</time>` : ""}
</a>`
  ).join("")
});

// src/presets/index.js
var PRESETS = {
  hero: {
    layout: "fullwidth",
    aspectRatio: "21 / 9",
    minHeight: 460,
    transition: "fade",
    speed: 1200,
    kenburns: true,
    parallax: { mouse: 18 },
    navigation: { bulletStyle: "lines" }
  },
  fullscreen: {
    layout: "fullscreen",
    transition: "slide-over",
    speed: 1100,
    navigation: { fraction: true, bulletStyle: "lines" }
  },
  cinematic: {
    layout: "fullwidth",
    aspectRatio: "2.39 / 1",
    minHeight: 420,
    transition: ["slices", "blinds", "curtain", "boxes"],
    speed: 1400,
    kenburns: { preset: "random" },
    navigation: { bullets: false, fraction: true }
  },
  creative: { transition: "random", speed: 1100 },
  "3d": { transition: ["cube", "flip", "fold", "cards"], speed: 1100 },
  minimal: {
    theme: "minimal",
    transition: "fade-through",
    navigation: { bullets: false, fraction: true, playPause: false }
  },
  gallery: {
    aspectRatio: "16 / 10",
    transition: "fade",
    navigation: { thumbnails: true, bullets: false, fraction: true }
  },
  vertical: {
    direction: "vertical",
    transition: "slide",
    wheel: true,
    navigation: { arrows: false }
  },
  testimonial: {
    autoHeight: true,
    transition: "fade-through",
    speed: 700,
    theme: "light",
    navigation: { arrows: false, progress: false },
    autoplay: { delay: 6e3 }
  },
  carousel: {
    type: "carousel",
    perView: 1.15,
    gap: 16,
    speed: 650,
    autoplay: { delay: 3500 },
    navigation: { progress: false, arrowStyle: "bottom" },
    breakpoints: { 640: { perView: 2, gap: 20 }, 1024: { perView: 3, gap: 24 } }
  },
  cards: {
    type: "carousel",
    effect: "cards",
    center: true,
    perView: 1,
    speed: 600,
    className: "us-narrow",
    navigation: { progress: false }
  },
  coverflow: {
    type: "carousel",
    effect: "coverflow",
    center: true,
    perView: 1.6,
    slideRatio: "4 / 5",
    slideToClicked: true,
    speed: 700,
    navigation: { progress: false },
    breakpoints: { 768: { perView: 3 } }
  },
  ring: {
    type: "carousel",
    effect: "ring",
    center: true,
    perView: 2,
    slideRatio: "3 / 4",
    slideToClicked: true,
    speed: 800,
    navigation: { progress: false },
    breakpoints: { 900: { perView: 3 } }
  },
  depth: {
    type: "carousel",
    effect: "depth",
    center: true,
    perView: 1.4,
    gap: 0,
    slideRatio: "16 / 10",
    slideToClicked: true,
    navigation: { progress: false },
    breakpoints: { 900: { perView: 2.2 } }
  },
  // ---- rain presets
  rainy: {
    theme: "rain",
    rain: "rain",
    ripple: true,
    transition: ["rain", "ripple", "drip", "mist"],
    speed: 1300,
    kenburns: "drift-down",
    navigation: { bulletStyle: "drops" }
  },
  drizzle: {
    theme: "rain",
    rain: "drizzle",
    transition: ["drizzle", "mist", "fade"],
    speed: 1400,
    kenburns: "rain-zoom",
    navigation: { bulletStyle: "drops" }
  },
  storm: {
    theme: "rain",
    rain: "storm",
    transition: ["storm", "thunder", "downpour"],
    speed: 1200,
    kenburns: "rain-zoom",
    navigation: { bulletStyle: "drops", fraction: true }
  },
  monsoon: {
    theme: "rain",
    layout: "fullwidth",
    aspectRatio: "21 / 9",
    minHeight: 460,
    rain: "monsoon",
    ripple: true,
    transition: ["downpour", "melt", "liquid", "ripple"],
    speed: 1400,
    kenburns: "drift-down",
    navigation: { bulletStyle: "drops", fraction: true }
  },
  window: {
    theme: "rain",
    rain: "glass",
    transition: ["mist", "drip"],
    speed: 1500,
    navigation: { bulletStyle: "drops" }
  },
  waves: {
    type: "carousel",
    effect: "wave",
    center: true,
    perView: 1.4,
    gap: 16,
    slideRatio: "4 / 5",
    slideToClicked: true,
    navigation: { progress: false, bulletStyle: "drops" },
    breakpoints: { 768: { perView: 3.2 } }
  },
  waterfall: {
    type: "carousel",
    effect: "cascade",
    center: true,
    perView: 1.5,
    gap: 0,
    slideRatio: "3 / 4",
    slideToClicked: true,
    navigation: { progress: false, bulletStyle: "drops" },
    breakpoints: { 768: { perView: 3 } }
  },
  ticker: {
    type: "carousel",
    ticker: 60,
    perView: 2.5,
    gap: 32,
    navigation: false,
    breakpoints: { 640: { perView: 4 }, 1024: { perView: 6 } }
  }
};
for (const [name, options] of Object.entries(PRESETS)) presets.register(name, options);

// src/modules/a11y.js
var a11yModule = {
  name: "a11y",
  setup(slider) {
    const o = slider.options.a11y ?? {};
    const root = slider.root;
    const count = slider.slides.length;
    const saved = slider.slides.map((slide) => ["role", "aria-roledescription", "aria-label"].map((n) => [n, slide.getAttribute(n)]));
    root.setAttribute("role", "region");
    root.setAttribute("aria-roledescription", o.roledescription ?? "carousel");
    if (!root.hasAttribute("aria-label") && !root.hasAttribute("aria-labelledby")) root.setAttribute("aria-label", o.label ?? "Slider");
    if (slider.options.keyboard && !root.hasAttribute("tabindex")) root.setAttribute("tabindex", "0");
    slider.track.setAttribute("aria-atomic", "false");
    slider.slides.forEach((slide, i) => {
      slide.setAttribute("role", "group");
      slide.setAttribute("aria-roledescription", "slide");
      const title = data(slide, "title");
      if (!saved[i][2][1]) slide.setAttribute("aria-label", `${i + 1} of ${count}${typeof title === "string" ? `: ${title}` : ""}`);
    });
    const live = o.announce ? el("div", { class: "us-us-only", "aria-live": "polite", "aria-atomic": "true" }) : null;
    if (live) slider.ui.append(live);
    const onChange = ({ index, source }) => {
      if (!live || source === "autoplay" || source === "ticker") return;
      const title = data(slider.slides[index], "title");
      live.textContent = `Slide ${index + 1} of ${slider.length}${typeof title === "string" ? `: ${title}` : ""}`;
    };
    slider.on("change", onChange);
    return {
      destroy() {
        slider.off("change", onChange);
        live?.remove();
        slider.track.removeAttribute("aria-atomic");
        slider.slides.forEach((slide, i) => {
          for (const [name, value] of saved[i] ?? []) {
            if (value === null) slide.removeAttribute(name);
            else slide.setAttribute(name, value);
          }
        });
      }
    };
  }
};

// src/modules/media.js
var lazyModule = {
  name: "lazy",
  setup(slider) {
    const o = slider.options.lazy;
    const n = slider.slides.length;
    if (!o.enabled) {
      for (let i = 0; i < n; i++) slider.loadSlide(i);
      return null;
    }
    const preload = Math.max(0, Number(o.preload) || 0);
    const load = () => {
      const visible = slider.engine.visibleIndexes?.() ?? [slider.index];
      for (const i of /* @__PURE__ */ new Set([...visible, slider.index])) {
        for (let d = -preload; d <= preload; d++) slider.loadSlide(mod(i + d, n));
      }
    };
    load();
    slider.on("change afterChange", load);
    return { destroy: () => slider.off("change afterChange", load) };
  }
};
var PAUSE_MESSAGES = ['{"event":"command","func":"pauseVideo","args":""}', '{"method":"pause"}'];
var PLAY_MESSAGES = ['{"event":"command","func":"playVideo","args":""}', '{"method":"play"}'];
var videoModule = {
  name: "video",
  setup(slider) {
    if (slider.options.video === false) return null;
    const videos = slider.slides.map((slide) => [...slide.querySelectorAll("video")]);
    const frames = slider.slides.map((slide) => [...slide.querySelectorAll("iframe[data-us-video]")]);
    if (!videos.flat().length && !frames.flat().length) return null;
    for (const video of videos.flat()) {
      if (video.hasAttribute("autoplay")) {
        video.removeAttribute("autoplay");
        video.dataset.usAutoplayVideo = "true";
        video.muted = true;
        video.playsInline = true;
      }
    }
    let waiting = null;
    const post = (frame, messages) => messages.forEach((m) => frame.contentWindow?.postMessage(m, "*"));
    const sync = () => {
      const active = slider.activeSlide;
      slider.slides.forEach((slide, i) => {
        const on = slide === active;
        for (const video of videos[i]) {
          if (on && video.dataset.usAutoplayVideo) video.play?.().catch(() => {
          });
          else if (!on && !video.paused) {
            video.pause();
            if (data(video, "restart") !== false) video.currentTime = 0;
          }
        }
        for (const frame of frames[i]) post(frame, on && data(frame, "video") === "autoplay" ? PLAY_MESSAGES : PAUSE_MESSAGES);
      });
      hold(videos[slider.index]?.find((v) => v.hasAttribute("data-us-wait")));
    };
    function hold(video) {
      if (waiting) {
        waiting.video.removeEventListener("ended", waiting.onEnded);
        slider.autoplay?.resume("video");
        waiting = null;
      }
      if (!video || !slider.autoplay) return;
      const onEnded = () => {
        slider.autoplay.resume("video");
        if (slider.isPlaying) slider.next({ source: "autoplay", rewind: true });
      };
      video.addEventListener("ended", onEnded);
      slider.autoplay.pause("video");
      waiting = { video, onEnded };
    }
    queueMicrotask(sync);
    slider.on("change", sync);
    return {
      destroy() {
        slider.off("change", sync);
        hold(null);
        for (const video of videos.flat()) {
          video.pause();
          if (video.dataset.usAutoplayVideo) {
            video.setAttribute("autoplay", "");
            delete video.dataset.usAutoplayVideo;
          }
        }
      }
    };
  }
};

// src/layers/split.js
function splitText(element, by = "words") {
  const original = element.innerHTML;
  const units = [];
  const walk = (node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === 3) replaceText(child);
      else if (child.nodeType === 1 && !child.matches("br, svg, img")) walk(child);
    }
  };
  const replaceText = (textNode) => {
    const fragment = document.createDocumentFragment();
    for (const part of textNode.textContent.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        fragment.append(document.createTextNode(part));
        continue;
      }
      const word = document.createElement("span");
      word.className = "us-word";
      if (by === "chars") {
        for (const char of Array.from(part)) {
          const span = document.createElement("span");
          span.className = "us-char";
          span.textContent = char;
          word.append(span);
          units.push(span);
        }
      } else {
        word.textContent = part;
        units.push(word);
      }
      fragment.append(word);
    }
    textNode.replaceWith(fragment);
  };
  walk(element);
  element.setAttribute("aria-label", element.textContent.replace(/\s+/g, " ").trim());
  for (const unit of element.querySelectorAll(".us-word")) unit.setAttribute("aria-hidden", "true");
  return {
    units,
    restore() {
      element.innerHTML = original;
      element.removeAttribute("aria-label");
    }
  };
}

// src/layers/Layers.js
var SPLIT_STAGGER = { chars: 35, words: 90 };
var layersModule = {
  name: "layers",
  setup(slider) {
    const options = slider.options.layers;
    if (!options.enabled) return null;
    const reduced = slider.reducedMotion;
    const bySlide = /* @__PURE__ */ new Map();
    const running = /* @__PURE__ */ new Map();
    slider.slides.forEach((slide) => {
      const layers = [...slide.querySelectorAll("[data-us-layer]")].map((element) => parseLayer(element));
      bySlide.set(slide, layers);
    });
    function parseLayer(element) {
      element.classList.add("us-layer");
      const split = data(element, "split");
      const layer = {
        element,
        preset: valueOr(data(element, "layer"), "fade"),
        delay: Number(data(element, "delay") ?? 0),
        duration: data(element, "duration"),
        easing: data(element, "easing"),
        out: data(element, "out"),
        loop: data(element, "loop"),
        distance: data(element, "distance"),
        stagger: data(element, "stagger"),
        units: null,
        restore: null
      };
      if (split === "chars" || split === "words") {
        const result = splitText(element, split);
        layer.units = result.units;
        layer.restore = result.restore;
        layer.stagger ?? (layer.stagger = SPLIT_STAGGER[split]);
      }
      return layer;
    }
    const presetFor = (name) => presetKeyframes(reduced ? "fade" : name, {});
    function animateIn(slide, offset) {
      stop(slide);
      const animations = [];
      for (const layer of bySlide.get(slide) ?? []) {
        const preset = presetKeyframes(reduced ? "fade" : layer.preset, layer.distance ? { distance: layer.distance } : {});
        const timing = {
          duration: Number(layer.duration ?? preset.duration ?? 900),
          easing: easing(layer.easing ?? preset.easing),
          fill: "both"
        };
        const targets = layer.units ?? [layer.element];
        const delays = staggerDelays(targets.length, layer.stagger);
        const anims = targets.map(
          (target, i) => target.animate(preset.keyframes, { ...timing, delay: offset + layer.delay + delays[i] })
        );
        animations.push(...anims);
        if (layer.loop && !reduced) {
          Promise.all(anims.map((a) => a.finished)).then(() => startLoop(slide, layer)).catch(() => {
          });
        }
      }
      running.set(slide, animations);
      if (animations.length) slider.emit("layers:in", { slide, index: slider.slides.indexOf(slide) });
    }
    function startLoop(slide, layer) {
      if (!running.has(slide)) return;
      const preset = loopPresets.get(layer.loop);
      if (!preset) return;
      const loop = layer.element.animate(preset.keyframes, {
        duration: preset.duration ?? 2e3,
        easing: easing(preset.easing ?? "ease-in-out"),
        direction: preset.direction ?? "alternate",
        iterations: Infinity,
        composite: "add"
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
        for (const a of running.get(slide) ?? []) if (a.effect?.target === layer.element && a.effect.getTiming().iterations === Infinity) a.cancel();
        targets.forEach((target, i) => {
          animations.push(
            target.animate(preset.keyframes, {
              duration: options.outDuration,
              delay: i * Math.min(Number(layer.stagger) || 0, 20),
              easing: easing("in"),
              direction: "reverse",
              fill: "forwards"
            })
          );
        });
      }
      if (!animations.length) return;
      if (running.has(slide)) running.get(slide).push(...animations);
      else running.set(slide, animations);
      await settled(animations);
    }
    const first = slider.slides[slider.index];
    if (first) animateIn(first, 150);
    const onChange = ({ slide, source }) => {
      if (source !== "ticker") animateIn(slide, Math.round(slider.options.speed * options.start));
    };
    const onAfter = ({ index }) => {
      slider.slides.forEach((slide, i) => {
        if (i !== index && running.has(slide)) stop(slide);
      });
    };
    const offLeave = options.out ? slider.hook("leave", ({ from }) => animateOut(slider.slides[from])) : null;
    slider.on("change", onChange);
    slider.on("afterChange", onAfter);
    return {
      replay(index = slider.index) {
        animateIn(slider.slides[index], 0);
      },
      destroy() {
        slider.off("change", onChange);
        slider.off("afterChange", onAfter);
        offLeave?.();
        for (const slide of slider.slides) stop(slide);
        for (const layers of bySlide.values()) {
          for (const layer of layers) {
            layer.restore?.();
            removeClass(layer.element, "us-layer");
          }
        }
      }
    };
  }
};
function staggerDelays(count, stagger) {
  const value = String(stagger ?? 0);
  if (value.startsWith("random")) {
    const step = Number(value.split(":")[1]) || 45;
    return Array.from({ length: count }, () => Math.round(Math.random() * step * count));
  }
  return Array.from({ length: count }, (_, i) => i * (Number(value) || 0));
}
var valueOr = (value, fallback) => value === true || value === void 0 || value === "" ? fallback : value;

// src/modules/rain.js
var NUMERIC = ["drops", "speed", "length", "width", "angle", "opacity", "splash", "puddle", "glass", "mist", "lightning"];
var rainPresets = createRegistry("rain preset", isObject);
var OFF = { drops: 0, speed: 12, length: 16, width: 1, angle: 6, opacity: 0, splash: 0, puddle: 0, glass: 0, mist: 0, lightning: 0 };
var PRESETS2 = {
  off: OFF,
  drizzle: { ...OFF, drops: 110, speed: 9, length: 10, angle: 4, opacity: 0.35 },
  rain: { ...OFF, drops: 280, speed: 17, length: 22, width: 1.2, angle: 8, opacity: 0.45, splash: 0.5 },
  downpour: { ...OFF, drops: 620, speed: 25, length: 34, width: 1.4, angle: 12, opacity: 0.5, splash: 1, puddle: 0.7 },
  storm: { ...OFF, drops: 540, speed: 28, length: 40, width: 1.4, angle: 24, opacity: 0.55, splash: 1, lightning: 1 },
  monsoon: { ...OFF, drops: 760, speed: 23, length: 30, width: 1.3, angle: 6, opacity: 0.5, splash: 1, puddle: 1, mist: 0.6 },
  glass: { ...OFF, drops: 80, speed: 14, length: 16, opacity: 0.25, glass: 1 },
  mist: { ...OFF, drops: 40, speed: 8, length: 8, opacity: 0.2, mist: 1 }
};
for (const [name, preset] of Object.entries(PRESETS2)) rainPresets.register(name, preset);
var rand2 = (min, max) => min + Math.random() * (max - min);
function resolveRain(value, fallback = null) {
  if (value === void 0 || value === null) return fallback;
  if (value === false || value === "off") return { ...OFF };
  if (value === true) return { ...PRESETS2.rain };
  if (typeof value === "string") return { ...rainPresets.get(value) ?? PRESETS2.rain };
  if (isObject(value)) {
    const base = rainPresets.get(value.preset ?? "rain") ?? PRESETS2.rain;
    return { ...OFF, ...base, ...value };
  }
  return fallback;
}
var rainModule = {
  name: "rain",
  setup(slider) {
    const options = slider.options.rain;
    const global = options ? resolveRain(options) : null;
    const own = slider.slides.map((slide) => data(slide, "rain"));
    if (!global && own.every((v) => v === void 0 || v === false || v === "off")) return null;
    if (slider.reducedMotion || typeof HTMLCanvasElement === "undefined") return null;
    const settings = isObject(options) ? options : {};
    const color = settings.color ?? "rgba(210, 225, 255, 1)";
    const back = settings.layer === "back" && slider.options.type === "slider";
    const canvas = el("canvas", { class: `us-rain${back ? " us-rain--back" : ""}`, "aria-hidden": "true" });
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const targetFor = (index) => resolveRain(own[index], global) ?? { ...OFF };
    let target = targetFor(slider.index);
    const p = { ...OFF, ...target };
    let override = null;
    let width = 0;
    let height = 0;
    let area = 1;
    let frame = 0;
    let last = 0;
    let visible = true;
    let flash2 = 0;
    let bolt = null;
    let nextStrike = performance.now() + rand2(1500, 4e3);
    const drops = [];
    const particles = [];
    const ripples = [];
    const beads = [];
    let specks = null;
    const fog = Array.from({ length: 5 }, () => ({ x: Math.random(), y: rand2(0.3, 1), r: rand2(0.3, 0.6), v: rand2(-4e-4, 4e-4) || 2e-4 }));
    const place = () => {
      const host = back ? slider.activeSlide : slider.stage;
      if (canvas.parentNode !== host) {
        if (back) {
          const anchor = host.querySelector(":scope > .us-overlay") ?? host.querySelector(":scope > .us-bg");
          anchor ? anchor.after(canvas) : host.prepend(canvas);
        } else host.insertBefore(canvas, slider.ui);
      }
    };
    const measure = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      width = slider.stage.clientWidth;
      height = slider.stage.clientHeight;
      area = Math.max(0.2, width * height / (1280 * 720));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      specks = null;
    };
    const newDrop = (anywhere = false) => {
      const z = rand2(0.35, 1);
      const drift2 = Math.tan(p.angle * Math.PI / 180) * height;
      return {
        x: rand2(-Math.max(0, drift2), width - Math.min(0, drift2)),
        y: anywhere ? rand2(-height * 0.2, height) : rand2(-height * 0.3, -10),
        z,
        f: rand2(0.8, 1.2),
        ground: z > 0.75 ? height * rand2(0.78, 1) : height + 60
      };
    };
    const newBead = (anywhere = false) => ({
      x: rand2(0, width),
      y: anywhere ? rand2(0, height) : rand2(-20, height * 0.6),
      r: rand2(1.5, 7),
      vy: 0,
      trail: []
    });
    function strike() {
      flash2 = 1;
      const segments = [];
      let x = rand2(width * 0.15, width * 0.85);
      let y = 0;
      const end = rand2(height * 0.45, height * 0.9);
      const path = [[x, y]];
      while (y < end) {
        x += rand2(-28, 28);
        y += rand2(18, 42);
        path.push([x, y]);
        if (Math.random() < 0.22) {
          const branch = [[x, y]];
          let bx = x;
          let by = y;
          for (let i = 0; i < 4; i++) {
            bx += rand2(-30, 30) + (bx > x ? 8 : -8);
            by += rand2(14, 30);
            branch.push([bx, by]);
          }
          segments.push(branch);
        }
      }
      segments.unshift(path);
      bolt = { segments, life: 1 };
      setTimeout(() => flash2 = Math.max(flash2, 0.7), 110);
      slider.emit("lightning");
    }
    function update(dt, now) {
      const goal = override ?? target;
      const k = Math.min(1, dt * 0.03);
      for (const key of NUMERIC) p[key] += ((goal[key] ?? 0) - p[key]) * k;
      const wanted = Math.round(p.drops * area);
      for (let i = 0; i < 25 && drops.length < wanted; i++) drops.push(newDrop(drops.length < wanted * 0.5));
      if (drops.length > wanted) drops.length = Math.max(wanted, drops.length - 25);
      const slant = Math.tan(p.angle * Math.PI / 180);
      for (const d of drops) {
        const vy = p.speed * d.z * d.f * dt;
        d.y += vy;
        d.x += vy * slant;
        if (d.y > d.ground) {
          if (d.ground < height + 50) {
            if (Math.random() < p.splash) {
              for (let i = 0; i < 3; i++) {
                particles.push({ x: d.x, y: d.ground, vx: rand2(-1.6, 1.6), vy: rand2(-3.2, -1.2), life: 1 });
              }
            }
            if (Math.random() < p.puddle * 0.35) ripples.push({ x: d.x, y: d.ground, r: 1, max: rand2(8, 24), life: 1 });
          }
          Object.assign(d, newDrop());
        }
      }
      for (const s of particles) {
        s.vy += 0.25 * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.life -= 0.045 * dt;
      }
      for (let i = particles.length - 1; i >= 0; i--) if (particles[i].life <= 0) particles.splice(i, 1);
      for (const r of ripples) {
        r.r += (r.max - r.r) * 0.08 * dt;
        r.life -= 0.025 * dt;
      }
      for (let i = ripples.length - 1; i >= 0; i--) if (ripples[i].life <= 0) ripples.splice(i, 1);
      const wantedBeads = Math.round(70 * p.glass * area);
      if (beads.length < wantedBeads && Math.random() < 0.3) beads.push(newBead(beads.length < wantedBeads * 0.6));
      if (beads.length > wantedBeads && Math.random() < 0.2) beads.shift();
      for (const b of beads) {
        if (b.vy === 0 && b.r > 5 && Math.random() < 4e-3 * dt) b.vy = rand2(0.4, 1.2);
        if (b.vy > 0) {
          b.trail.push([b.x, b.y]);
          if (b.trail.length > 40) b.trail.shift();
          b.y += b.vy * dt;
          b.x += rand2(-0.3, 0.3);
          b.vy = Math.min(4, b.vy * (1 + 0.01 * dt));
        }
      }
      for (let i = beads.length - 1; i >= 0; i--) if (beads[i].y - beads[i].r > height) beads.splice(i, 1);
      for (const f of fog) {
        f.x += f.v * dt;
        if (f.x > 1.4) f.x = -0.4;
        if (f.x < -0.4) f.x = 1.4;
      }
      if (p.lightning > 0.5 && now > nextStrike) {
        strike();
        nextStrike = now + rand2(3500, 9e3) / p.lightning;
      }
      flash2 = Math.max(0, flash2 - 0.05 * dt);
      if (bolt) bolt.life -= 0.04 * dt;
      if (bolt && bolt.life <= 0) bolt = null;
    }
    function draw() {
      ctx.clearRect(0, 0, width, height);
      if (p.mist > 0.01) {
        for (const f of fog) {
          const x = f.x * width;
          const y = f.y * height;
          const r = f.r * Math.max(width, height);
          const g = ctx.createRadialGradient(x, y, 0, x, y, r);
          g.addColorStop(0, `rgba(235, 240, 248, ${0.22 * p.mist})`);
          g.addColorStop(1, "rgba(235, 240, 248, 0)");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, width, height);
        }
      }
      if (drops.length && p.opacity > 0.01) {
        const slant = Math.tan(p.angle * Math.PI / 180);
        ctx.strokeStyle = color;
        ctx.lineCap = "round";
        for (const [min, max] of [[0, 0.55], [0.55, 0.8], [0.8, 1.01]]) {
          const depth = (min + max) / 2;
          ctx.globalAlpha = p.opacity * (0.35 + 0.65 * depth);
          ctx.lineWidth = p.width * (0.5 + depth);
          ctx.beginPath();
          for (const d of drops) {
            if (d.z < min || d.z >= max) continue;
            const len = p.length * d.z;
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(d.x - slant * len, d.y - len);
          }
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
      if (particles.length) {
        ctx.fillStyle = color;
        for (const s of particles) {
          ctx.globalAlpha = Math.max(0, s.life) * p.opacity * 1.4;
          ctx.fillRect(s.x, s.y, 1.6, 1.6);
        }
        ctx.globalAlpha = 1;
      }
      if (ripples.length) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        for (const r of ripples) {
          ctx.globalAlpha = Math.max(0, r.life) * 0.5;
          ctx.beginPath();
          ctx.ellipse(r.x, r.y, r.r, r.r * 0.32, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
      if (p.glass > 0.01) drawGlass();
      if (bolt) {
        ctx.save();
        ctx.strokeStyle = "#fff";
        ctx.shadowColor = "rgba(170, 200, 255, 0.95)";
        ctx.shadowBlur = 24;
        ctx.globalAlpha = Math.max(0, bolt.life);
        bolt.segments.forEach((segment, i) => {
          ctx.lineWidth = i === 0 ? 2.6 : 1.2;
          ctx.beginPath();
          segment.forEach(([x, y], j) => j ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
          ctx.stroke();
        });
        ctx.restore();
      }
      if (flash2 > 0.01) {
        ctx.fillStyle = `rgba(225, 235, 255, ${flash2 * 0.45})`;
        ctx.fillRect(0, 0, width, height);
      }
    }
    function drawGlass() {
      const alpha = Math.min(1, p.glass);
      if (!specks) {
        specks = Array.from({ length: Math.round(260 * area) }, () => [rand2(0, width), rand2(0, height), rand2(0.5, 1.8)]);
      }
      ctx.fillStyle = `rgba(255, 255, 255, ${0.22 * alpha})`;
      for (const [x, y, r] of specks) ctx.fillRect(x, y, r, r);
      for (const b of beads) {
        if (b.trail.length > 1) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * alpha})`;
          ctx.lineWidth = b.r * 0.7;
          ctx.lineCap = "round";
          ctx.beginPath();
          b.trail.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
          ctx.stroke();
        }
        const g = ctx.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.1, b.x, b.y, b.r);
        g.addColorStop(0, `rgba(255, 255, 255, ${0.35 * alpha})`);
        g.addColorStop(0.6, `rgba(255, 255, 255, ${0.06 * alpha})`);
        g.addColorStop(1, `rgba(255, 255, 255, ${0.3 * alpha})`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(b.x, b.y, b.r * 0.9, b.r, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(0, 0, 0, ${0.18 * alpha})`;
        ctx.beginPath();
        ctx.ellipse(b.x + b.r * 0.15, b.y + b.r * 0.55, b.r * 0.6, b.r * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    const idle = () => {
      const goal = override ?? target;
      return !goal.drops && !goal.glass && !goal.mist && p.opacity < 0.02 && !particles.length && !ripples.length && !beads.length && !bolt && flash2 <= 0;
    };
    function loop(now) {
      const dt = Math.min(3, (now - last) / 16.67);
      last = now;
      update(dt, now);
      draw();
      if (idle()) {
        drops.length = 0;
        ctx.clearRect(0, 0, width, height);
        frame = 0;
        return;
      }
      frame = visible && !document.hidden ? requestAnimationFrame(loop) : 0;
    }
    const kick = () => {
      if (frame || !visible || document.hidden) return;
      last = performance.now();
      frame = requestAnimationFrame(loop);
    };
    const onChange = ({ index }) => {
      target = targetFor(index);
      if (back) place();
      kick();
    };
    const onResize = () => {
      measure();
      kick();
    };
    const onVisibility = () => document.hidden ? cancel() : kick();
    const cancel = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
    place();
    measure();
    slider.on("change", onChange);
    slider.on("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    let observer = null;
    if (typeof IntersectionObserver === "function") {
      observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) kick();
        else cancel();
      });
      observer.observe(slider.root);
    }
    kick();
    return {
      /** Change the weather now: a preset name, options object, or null to follow the slides again. */
      set(value) {
        override = value === null ? null : resolveRain(value, { ...OFF });
        kick();
      },
      strike() {
        strike();
        kick();
      },
      get params() {
        return { ...p };
      },
      destroy() {
        cancel();
        observer?.disconnect();
        slider.off("change", onChange);
        slider.off("resize", onResize);
        document.removeEventListener("visibilitychange", onVisibility);
        canvas.remove();
      }
    };
  }
};
var rippleModule = {
  name: "ripple",
  setup(slider) {
    const o = slider.options.ripple;
    if (!o || slider.reducedMotion) return null;
    const settings = isObject(o) ? o : {};
    const stage = slider.stage;
    const layer = el("div", { class: "us-touch-ripples", "aria-hidden": "true" });
    stage.insertBefore(layer, slider.ui);
    if (settings.color) layer.style.setProperty("--us-ripple-color", settings.color);
    let lastHover = 0;
    const spawn = (x, y, rings, size) => {
      for (let i = 0; i < rings; i++) {
        const ring = el("span", { class: "us-touch-ripple", style: { left: `${x}px`, top: `${y}px` } });
        layer.append(ring);
        ring.animate(
          [
            { transform: "translate(-50%, -50%) scale(0)", opacity: 0.8 },
            { transform: `translate(-50%, -50%) scale(${size - i * size * 0.25})`, opacity: 0 }
          ],
          { duration: 1100 + i * 150, delay: i * 140, easing: "cubic-bezier(0.2, 0.6, 0.3, 1)", fill: "both" }
        ).finished.then(() => ring.remove(), () => ring.remove());
      }
    };
    const point = (e) => {
      const rect = stage.getBoundingClientRect();
      return [e.clientX - rect.left, e.clientY - rect.top];
    };
    const onDown = (e) => {
      if (e.target.closest(".us-ui > *")) return;
      spawn(...point(e), settings.rings ?? 3, 14);
    };
    const onMove = (e) => {
      if (e.pointerType !== "mouse" || e.timeStamp - lastHover < 90) return;
      lastHover = e.timeStamp;
      spawn(...point(e), 1, 5);
    };
    if (settings.click !== false) stage.addEventListener("pointerdown", onDown);
    if (settings.hover) stage.addEventListener("pointermove", onMove);
    return {
      spawn,
      destroy() {
        stage.removeEventListener("pointerdown", onDown);
        stage.removeEventListener("pointermove", onMove);
        layer.remove();
      }
    };
  }
};

// src/modules/autoplay.js
var PASSIVE_SOURCES = /* @__PURE__ */ new Set(["autoplay", "api", "ticker", "hash"]);
var autoplayModule = {
  name: "autoplay",
  setup(slider) {
    const o = slider.options.autoplay;
    if (slider.length < 2 || slider.options.type === "carousel" && slider.options.ticker > 0) return null;
    const root = slider.root;
    const reasons = /* @__PURE__ */ new Set();
    const cleanups = [];
    let frame = 0;
    let last = 0;
    let elapsed = 0;
    let duration = 0;
    const listen = (target, type, handler, opts) => {
      target.addEventListener(type, handler, opts);
      cleanups.push(() => target.removeEventListener(type, handler, opts));
    };
    const setProgress = (value) => {
      root.style.setProperty("--us-progress", value.toFixed(4));
      slider.emit("autoplay:progress", { progress: value, remaining: Math.max(0, duration - elapsed) });
    };
    const api = {
      running: false,
      reasons,
      start() {
        if (api.running) return;
        api.running = true;
        api.reset();
        last = performance.now();
        frame = requestAnimationFrame(tick);
        root.classList.add("is-playing");
        slider.emit("autoplay:start");
      },
      stop() {
        if (!api.running) return;
        api.running = false;
        cancelAnimationFrame(frame);
        root.classList.remove("is-playing");
        setProgress(0);
        slider.emit("autoplay:stop");
      },
      reset() {
        elapsed = 0;
        duration = Number(data(slider.activeSlide, "autoplay") ?? o.delay) || 5e3;
        setProgress(0);
      },
      pause(reason = "api") {
        const was = reasons.size;
        reasons.add(reason);
        if (!was && api.running) {
          root.classList.add("is-paused");
          slider.emit("autoplay:pause", { reason });
        }
      },
      resume(reason = "api") {
        if (!reasons.delete(reason) || reasons.size) return;
        root.classList.remove("is-paused");
        if (api.running) slider.emit("autoplay:resume", { reason });
      },
      destroy() {
        api.stop();
        for (const off of cleanups) off();
        observer?.disconnect();
        slider.off("change", onChange);
        root.classList.remove("is-playing", "is-paused");
        root.style.removeProperty("--us-progress");
      }
    };
    function tick(now) {
      const dt = Math.min(100, now - last);
      last = now;
      if (!reasons.size && !slider._busy) {
        elapsed += dt;
        setProgress(clamp(elapsed / duration, 0, 1));
        if (elapsed >= duration) {
          elapsed = 0;
          const options = { source: "autoplay", rewind: true };
          if (o.reverse) slider.prev(options);
          else slider.next(options);
        }
      }
      if (api.running) frame = requestAnimationFrame(tick);
    }
    const onChange = ({ source }) => {
      api.reset();
      if (!PASSIVE_SOURCES.has(source) && o.stopOnInteraction) api.stop();
    };
    slider.on("change", onChange);
    if (o.pauseOnHover) {
      listen(root, "pointerenter", (e) => e.pointerType === "mouse" && api.pause("hover"));
      listen(root, "pointerleave", () => api.resume("hover"));
    }
    if (o.pauseOnFocus) {
      listen(root, "focusin", (e) => e.target.matches(":focus-visible") && api.pause("focus"));
      listen(root, "focusout", (e) => !root.contains(e.relatedTarget) && api.resume("focus"));
    }
    if (o.pauseHidden) {
      listen(document, "visibilitychange", () => document.hidden ? api.pause("hidden") : api.resume("hidden"));
    }
    let observer = null;
    if (o.pauseHidden && typeof IntersectionObserver === "function") {
      observer = new IntersectionObserver(
        ([entry]) => entry.isIntersecting ? api.resume("offscreen") : api.pause("offscreen")
      );
      observer.observe(root);
    }
    if (o.enabled) api.start();
    return api;
  }
};

// src/modules/icons.js
var svg = (path) => `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="${path}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
var ICONS = {
  prev: svg("M15 18l-6-6 6-6"),
  next: svg("M9 18l6-6-6-6"),
  up: svg("M18 15l-6-6-6 6"),
  down: svg("M6 9l6 6 6-6"),
  play: '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>',
  pause: '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/></svg>'
};

// src/modules/navigation.js
var navigationModule = {
  name: "navigation",
  setup(slider) {
    const nav = slider.options.navigation;
    const count = slider.length;
    const ui = slider.ui;
    const nodes = [];
    const vertical = slider.options.direction === "vertical";
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
      const wrap = add(el("div", { class: `us-arrows us-arrows--${nav.arrowStyle}` }));
      prevBtn = el("button", {
        type: "button",
        class: "us-arrow us-arrow--prev",
        "aria-label": labels.prev ?? "Previous slide",
        html: vertical ? ICONS.up : ICONS.prev
      });
      nextBtn = el("button", {
        type: "button",
        class: "us-arrow us-arrow--next",
        "aria-label": labels.next ?? "Next slide",
        html: vertical ? ICONS.down : ICONS.next
      });
      prevBtn.addEventListener("click", () => slider.prev({ source: "nav" }));
      nextBtn.addEventListener("click", () => slider.next({ source: "nav" }));
      wrap.append(prevBtn, nextBtn);
    }
    if (nav.bullets && count > 1) {
      const wrap = add(el("div", { class: `us-bullets us-bullets--${nav.bulletStyle}`, role: "group", "aria-label": "Choose slide" }));
      bullets = Array.from({ length: count }, (_, i) => {
        const title = data(slider.slides[i], "title");
        const button = el("button", {
          type: "button",
          class: "us-bullet",
          "aria-label": `${labels.goTo ?? "Go to slide"} ${i + 1}${typeof title === "string" ? `: ${title}` : ""}`
        });
        if (nav.bulletStyle === "numbers") button.textContent = pad(i + 1);
        else if (nav.bulletStyle === "titles") button.textContent = typeof title === "string" ? title : pad(i + 1);
        else button.append(el("span", { class: "us-bullet__fill" }));
        button.addEventListener("click", () => slider.goTo(i, { source: "bullet" }));
        wrap.append(button);
        return button;
      });
    }
    if (nav.fraction && count > 1) {
      fraction = add(el("div", { class: "us-fraction", "aria-hidden": "true" }));
    }
    if (nav.progress && slider.autoplay) {
      add(el("div", { class: "us-progress", "aria-hidden": "true" }, el("div", { class: "us-progress__bar" })));
    }
    if (nav.playPause && slider.autoplay) {
      playBtn = add(el("button", { type: "button", class: "us-playpause" }));
      playBtn.addEventListener("click", () => slider.toggle());
    }
    const update = () => {
      const index = slider.index;
      bullets.forEach((button, i) => {
        const active = i === index;
        button.classList.toggle("is-active", active);
        if (active) button.setAttribute("aria-current", "true");
        else button.removeAttribute("aria-current");
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
        playBtn.setAttribute("aria-label", playing ? labels.pause ?? "Pause autoplay" : labels.play ?? "Start autoplay");
        playBtn.classList.toggle("is-playing", playing);
      }
    };
    const events = "change autoplay:start autoplay:stop";
    update();
    slider.on(events, update);
    return {
      update,
      destroy() {
        slider.off(events, update);
        for (const node of nodes) node.remove();
      }
    };
  }
};
var thumbnailsModule = {
  name: "thumbnails",
  setup(slider) {
    if (!slider.options.navigation.thumbnails || slider.slides.length < 2) return null;
    const strip = el("div", { class: "us-thumbs", role: "group", "aria-label": "Slide thumbnails" });
    const buttons2 = slider.slides.map((slide, i) => {
      const thumb = data(slide, "thumb") ?? data(slide, "bg");
      const title = data(slide, "title");
      const button = el("button", {
        type: "button",
        class: "us-thumb",
        "aria-label": `Go to slide ${i + 1}${typeof title === "string" ? `: ${title}` : ""}`
      });
      if (typeof thumb === "string") button.append(el("img", { src: thumb, alt: "", loading: "lazy", draggable: "false" }));
      if (typeof title === "string") button.append(el("span", { class: "us-thumb__title", text: title }));
      else if (typeof thumb !== "string") button.append(el("span", { class: "us-thumb__title", text: pad(i + 1) }));
      button.addEventListener("click", () => slider.goTo(Math.min(i, slider.length - 1), { source: "thumb" }));
      strip.append(button);
      return button;
    });
    slider.root.append(strip);
    const update = () => {
      const active = slider.activeSlide;
      buttons2.forEach((button, i) => {
        const on = slider.slides[i] === active;
        button.classList.toggle("is-active", on);
        if (on) {
          button.setAttribute("aria-current", "true");
          const left = button.offsetLeft - (strip.clientWidth - button.offsetWidth) / 2;
          strip.scrollTo?.({ left, behavior: slider.reducedMotion ? "auto" : "smooth" });
        } else button.removeAttribute("aria-current");
      });
    };
    update();
    slider.on("change", update);
    return {
      destroy() {
        slider.off("change", update);
        strip.remove();
      }
    };
  }
};

// src/modules/input.js
var EDITABLE = 'input, textarea, select, [contenteditable=""], [contenteditable="true"]';
var keyboardModule = {
  name: "keyboard",
  setup(slider) {
    const mode = slider.options.keyboard;
    if (!mode) return null;
    const vertical = slider.options.direction === "vertical";
    let onScreen = false;
    let observer = null;
    const onKey = (e) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.target.closest?.(EDITABLE)) return;
      const inside = slider.root.contains(e.target);
      if (!inside && !(mode === "global" && onScreen)) return;
      const key = e.key;
      const back = key === "ArrowLeft" || vertical && key === "ArrowUp";
      const forward = key === "ArrowRight" || vertical && key === "ArrowDown";
      if (back) slider.prev({ source: "keyboard" });
      else if (forward) slider.next({ source: "keyboard" });
      else if (key === "Home") slider.goTo(0, { source: "keyboard" });
      else if (key === "End") slider.goTo(slider.length - 1, { source: "keyboard" });
      else return;
      e.preventDefault();
    };
    const target = mode === "global" ? document : slider.root;
    target.addEventListener("keydown", onKey);
    if (mode === "global" && typeof IntersectionObserver === "function") {
      observer = new IntersectionObserver(([entry]) => onScreen = entry.intersectionRatio >= 0.5, { threshold: [0, 0.5, 1] });
      observer.observe(slider.root);
    }
    return {
      destroy() {
        target.removeEventListener("keydown", onKey);
        observer?.disconnect();
      }
    };
  }
};
var swipeModule = {
  name: "swipe",
  setup(slider) {
    if (!slider.options.drag || slider.options.type !== "slider" || slider.length < 2) return null;
    const stage = slider.stage;
    const vertical = slider.options.direction === "vertical";
    const axis2 = (e) => vertical ? e.clientY : e.clientX;
    const cross = (e) => vertical ? e.clientX : e.clientY;
    let state = null;
    stage.classList.add("us-draggable");
    const down = (e) => {
      if (e.button !== 0 || e.target.closest(".us-ui, input, textarea, select, video, [data-us-nodrag]")) return;
      state = { id: e.pointerId, x: axis2(e), y: cross(e), t: e.timeStamp, moved: false, slide: slider.activeSlide };
    };
    const move2 = (e) => {
      if (!state || e.pointerId !== state.id) return;
      const dx = axis2(e) - state.x;
      const dy = cross(e) - state.y;
      if (!state.moved) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        if (Math.abs(dy) > Math.abs(dx)) {
          state = null;
          return;
        }
        state.moved = true;
        stage.setPointerCapture?.(e.pointerId);
        stage.classList.add("is-dragging");
      }
      state.dx = dx;
      state.slide.style.translate = vertical ? `0 ${dx * 0.15}px` : `${dx * 0.15}px 0`;
      e.preventDefault();
    };
    const up = (e) => {
      if (!state || e.pointerId !== state.id) return;
      const { moved, dx = 0, t, slide } = state;
      state = null;
      if (!moved) return;
      stage.classList.remove("is-dragging");
      const offset = slide.style.translate;
      slide.style.translate = "";
      if (offset) slide.animate([{ translate: offset }, { translate: "0 0" }], { duration: 350, easing: "ease-out" });
      stage.addEventListener("click", swallow, { capture: true, once: true });
      setTimeout(() => stage.removeEventListener("click", swallow, true), 50);
      const velocity = Math.abs(dx) / Math.max(1, e.timeStamp - t);
      if (Math.abs(dx) > 50 || Math.abs(dx) > 15 && velocity > 0.4) {
        if (dx < 0) slider.next({ source: "swipe" });
        else slider.prev({ source: "swipe" });
      }
    };
    const swallow = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    stage.addEventListener("pointerdown", down);
    stage.addEventListener("pointermove", move2);
    stage.addEventListener("pointerup", up);
    stage.addEventListener("pointercancel", up);
    return {
      destroy() {
        stage.classList.remove("us-draggable", "is-dragging");
        stage.removeEventListener("pointerdown", down);
        stage.removeEventListener("pointermove", move2);
        stage.removeEventListener("pointerup", up);
        stage.removeEventListener("pointercancel", up);
      }
    };
  }
};
var wheelModule = {
  name: "wheel",
  setup(slider) {
    if (!slider.options.wheel) return null;
    let total = 0;
    let locked = false;
    let resetTimer = 0;
    const onWheel = (e) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const forward = delta > 0;
      const atEdge = !slider.options.loop && (forward ? slider.index >= slider.length - 1 : slider.index <= 0);
      if (atEdge) return;
      e.preventDefault();
      if (locked) return;
      total += delta;
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => total = 0, 200);
      if (Math.abs(total) < 40) return;
      locked = true;
      total = 0;
      (forward ? slider.next({ source: "wheel" }) : slider.prev({ source: "wheel" })).finally(() => {
        setTimeout(() => locked = false, 350);
      });
    };
    slider.stage.addEventListener("wheel", onWheel, { passive: false });
    return {
      destroy() {
        clearTimeout(resetTimer);
        slider.stage.removeEventListener("wheel", onWheel);
      }
    };
  }
};

// src/index.js
for (const module of [
  a11yModule,
  lazyModule,
  videoModule,
  layersModule,
  kenburnsModule,
  parallaxModule,
  rainModule,
  rippleModule,
  autoplayModule,
  navigationModule,
  thumbnailsModule,
  keyboardModule,
  swipeModule,
  wheelModule,
  hashModule
]) {
  modules.register(module.name, module);
}
Object.assign(UniSlider, {
  defaults: DEFAULTS,
  easings: EASINGS,
  transitions,
  layerAnimations: layerPresets,
  loopAnimations: loopPresets,
  carouselEffects,
  kenburns: kenburnsPresets,
  rainPresets,
  transitionsByCategory,
  presets,
  templates,
  modules,
  engines,
  registerTransition,
  registerLayerAnimation,
  registerLoopAnimation,
  registerCarouselEffect,
  registerTemplate,
  registerPreset: (name, options) => presets.register(name, options),
  registerRainPreset: (name, params) => rainPresets.register(name, params),
  registerModule: (module) => modules.register(module.name, module),
  buildTiles,
  /**
   * Install a plugin: a function `(UniSlider) => void` or an object with
   * `install(UniSlider)`. Plugins typically register transitions, layer
   * animations, presets, templates or modules.
   */
  use(plugin, options) {
    var _a;
    const installed = (_a = UniSlider)._plugins ?? (_a._plugins = /* @__PURE__ */ new Set());
    if (installed.has(plugin)) return UniSlider;
    installed.add(plugin);
    if (typeof plugin === "function") plugin(UniSlider, options);
    else plugin?.install?.(UniSlider, options);
    return UniSlider;
  }
});
var index_default = UniSlider;
export {
  DEFAULTS,
  UniSlider,
  carouselEffects,
  index_default as default,
  layerPresets,
  loopPresets,
  modules,
  presets,
  rainPresets,
  registerCarouselEffect,
  registerLayerAnimation,
  registerLoopAnimation,
  registerTemplate,
  registerTransition,
  templates,
  transitions
};
