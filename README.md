# UniSlider

[![CI](https://github.com/JuwelKhan/unislider/actions/workflows/ci.yml/badge.svg)](https://github.com/JuwelKhan/unislider/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Live demo](https://img.shields.io/badge/demo-live-4fc3f7.svg)](https://juwelkhan.github.io/unislider/)

**The universal slider & carousel for any website — lightweight, dependency-free, and with real rain.**
Live weather drawn on a canvas (rain, storms with lightning, drops on glass, mist), 40 slide transitions
(11 of them rain-themed), layer animations, Ken Burns, parallax, 3D carousels, 22 presets and 11
ready-made templates, in about **28 KB gzipped** (JS) + **3 KB** (CSS).

Think "Slider Revolution features", but as one small script you drop into any site: plain HTML,
WordPress, Laravel, React/Vue (via the ES module), static site generators…

```html
<link rel="stylesheet" href="dist/unislider.min.css">
<script src="dist/unislider.min.js" defer></script>

<div data-unislider="rainy">
  <div data-us-bg="slide-1.jpg" data-us-rain="storm">
    <h2 data-us-layer="rainfall" data-us-split="chars" data-us-stagger="random">Hello world</h2>
    <p data-us-layer="mist-in" data-us-delay="400">No JavaScript needed.</p>
  </div>
  <div data-us-bg="slide-2.jpg" data-us-transition="ripple">…</div>
</div>
```

**[Live demo →](https://juwelkhan.github.io/unislider/)** — showcase, rain studio and a transition playground
(or open [`demo/index.html`](demo/index.html) locally).

---

## Contents

- [Features](#features)
- [Installation](#installation)
- [Three ways to use it](#three-ways-to-use-it)
- [Auto, manual and hybrid mode](#auto-manual-and-hybrid-mode)
- [Markup reference](#markup-reference)
- [Options](#options)
- [Rain effects](#rain-effects)
- [Transitions, layer animations & effects](#transitions-layer-animations--effects)
- [Presets](#presets)
- [Templates](#templates)
- [Themes & styling](#themes--styling)
- [API](#api)
- [Events](#events)
- [Extending UniSlider (plugins)](#extending-unislider-plugins)
- [Accessibility](#accessibility)
- [Browser support](#browser-support)
- [Development & updates](#development--updates)
- [বাংলায় দ্রুত শুরু (Bangla quick start)](#বাংলায়-দ্রুত-শুরু)

## Features

| | |
| --- | --- |
| **Two engines** | `slider` (stacked slides with transitions + layers) and `carousel` (moving track: multi-slide, seamless loop, momentum drag, 3D effects, ticker) |
| **Live rain** | canvas weather with wind, depth, splashes, puddle ripples, drops sliding down glass, drifting mist and lightning — 8 presets, per-slide weather that blends smoothly, click ripples |
| **40 transitions** | rain, drizzle, downpour, storm, thunder, ripple, drip, melt, mist, splash, liquid · fade, slide, parallax, cube, flip, fold, cards, wipe, circle, diamond, curtain, slices, blinds, boxes, mosaic, split, shutter, glitch… plus `random` and per-slide overrides |
| **Layer animations** | 34 entrance presets (raindrop, splash-in, drip-in, rainfall…), 14 idle loops, split text by words/characters, fixed or random ("raindrop") staggering, out-animations before a slide leaves |
| **Motion** | Ken Burns (10 presets), mouse parallax per layer, scroll parallax for backgrounds |
| **Navigation** | arrows (5 styles), bullets (dots / raindrops / lines with progress / numbers / titles), thumbnails, fraction counter, progress bar, play/pause |
| **Input** | touch & mouse swipe, keyboard (local or global), mouse wheel / trackpad, deep links (`#hash`) |
| **Modes** | `auto`, `manual`, `hybrid` — plus autoplay that pauses on hover, focus, hidden tab and off-screen |
| **Layouts** | aspect ratio, fixed height, full-width, full-screen (minus a header), auto height, responsive breakpoints |
| **Media** | lazy-loaded images/backgrounds, HTML5 video that plays only on its slide (and can hold autoplay until it ends), YouTube/Vimeo pause |
| **Presets & templates** | 22 option presets, 11 data-driven templates, 7 themes |
| **Extensible** | every transition, layer animation, carousel effect, preset, template and feature module is registered by name — add your own with `UniSlider.use(plugin)` |
| **Accessible** | ARIA carousel pattern, `inert` hidden slides, live-region announcements, reduced-motion support |
| **Small** | no dependencies, ~28 KB gzip JS, ~3 KB gzip CSS, built on the Web Animations API and Canvas 2D |

## Installation

**CDN** — no download needed (served from this repository by jsDelivr):

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/JuwelKhan/unislider@1.0.0/dist/unislider.min.css">
<script src="https://cdn.jsdelivr.net/gh/JuwelKhan/unislider@1.0.0/dist/unislider.min.js" defer></script>
<!-- only when you use templates: -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/JuwelKhan/unislider@1.0.0/dist/unislider-templates.min.css">
```

**Download** — grab the files from the [latest release](https://github.com/JuwelKhan/unislider/releases) or
copy the `dist/` folder into your project:

| File | Use |
| --- | --- |
| `dist/unislider.min.js` | `<script>` tag; exposes `window.UniSlider` and auto-initialises `[data-unislider]` |
| `dist/unislider.esm.js` | ES module (`import UniSlider from …`) |
| `dist/unislider.min.css` | core styles + themes (required) |
| `dist/unislider-templates.min.css` | styles for the built-in templates (only if you use `template:`) |

**npm** (coming soon):

```bash
npm install unislider
```

```js
import UniSlider from 'unislider';
import 'unislider/css';
```

## Three ways to use it

### 1. Markup only

Add `data-unislider` to a container. Its value can be a preset name or JSON options:

```html
<div data-unislider='{"preset": "carousel", "autoplay": false}'>
  <div>Card 1</div>
  <div>Card 2</div>
  <div>Card 3</div>
</div>
```

Elements added later can be initialised with `UniSlider.init(container)`.

### 2. JavaScript

```js
const slider = new UniSlider('#hero', {
  preset: 'hero',
  transition: ['cube', 'slices', 'curtain'],
  speed: 1200,
  autoplay: { delay: 6000 },
  navigation: { bulletStyle: 'lines', fraction: true },
  breakpoints: { 768: { layout: 'fullscreen' } },
});

slider.on('change', ({ index }) => console.log('now on slide', index));
```

### 3. Templates (data in, finished slider out)

```js
UniSlider.create('#reviews', {
  template: 'testimonials',
  slides: [
    { quote: 'Fantastic plugin!', name: 'Ana', role: 'CEO', avatar: 'ana.jpg' },
    { quote: 'So easy to use.', name: 'Rui', role: 'Developer' },
  ],
});
```

## Auto, manual and hybrid mode

| `mode` | What happens |
| --- | --- |
| `hybrid` (default) | autoplay **and** every control (arrows, bullets, swipe, keyboard) |
| `auto` | plays by itself; arrows hidden, keeps bullets and a pause button; does not pause on hover |
| `manual` | no autoplay; the visitor drives it with arrows, bullets, swipe, keyboard |

A mode only sets defaults — anything you pass yourself still wins (`mode: 'auto', navigation: { arrows: true }`).
You can switch at runtime: `slider.update({ mode: 'manual' })`, and `slider.play()` / `slider.pause()` work in every mode.

## Markup reference

Slides are the container's children (or the children of a `.us-slides` element inside it).

### Slide attributes

| Attribute | Description |
| --- | --- |
| `data-us-bg="url"` | background image (lazy-loaded, gets Ken Burns / parallax). An `<img data-us-bg>` or `<video data-us-bg>` child works too |
| `data-us-bg-position="center top"` | background position |
| `data-us-overlay="0.4"` | dark overlay (number) or any CSS colour/gradient |
| `data-us-transition="cube"` | transition used when this slide comes in |
| `data-us-speed="1500"` / `data-us-easing="expo"` | per-slide transition speed / easing |
| `data-us-autoplay="8000"` | autoplay time for this slide |
| `data-us-kenburns="zoom-out"` | Ken Burns preset (or `false` to disable for this slide) |
| `data-us-rain="storm"` | weather for this slide (`off` to stop the rain here); blends smoothly from the previous slide |
| `data-us-title="…"` | used for bullets, thumbnails and screen-reader labels |
| `data-us-thumb="url"` | thumbnail image |
| `data-us-hash="about"` | deep-link id (with `hash: true`) |

### Layer attributes

Any element inside a slide can be a layer:

```html
<h2 data-us-layer="mask-up" data-us-split="words" data-us-stagger="80"
    data-us-delay="200" data-us-duration="900" data-us-easing="expo-out"
    data-us-loop="float" data-us-out="fade-up" data-us-parallax="30">Title</h2>
```

| Attribute | Description |
| --- | --- |
| `data-us-layer` | entrance animation (default `fade`) |
| `data-us-delay` / `data-us-duration` / `data-us-easing` | timing (ms / ms / easing name or CSS timing function) |
| `data-us-split` | `words` or `chars` — animate each word/character |
| `data-us-stagger` | ms between split units, or `random` / `random:40` to scatter them like raindrops |
| `data-us-distance` | travel distance in px for `fade-*` / `slide-*` presets |
| `data-us-loop` | idle loop after the entrance: `float`, `pulse`, `spin`, `wiggle`, `sway`, `bounce`, `heartbeat`, `blink`, `glow` |
| `data-us-out` | out-animation played before the slide leaves (the preset in reverse; `true` = same as entrance) |
| `data-us-parallax` | mouse-parallax travel in px (negative = opposite direction); needs `parallax` enabled |

Media: `<video autoplay muted>` inside a slide only plays while the slide is active; add `data-us-wait` to hold
autoplay until the video ends. YouTube/Vimeo iframes with their JS API enabled and `data-us-video` are paused when their slide leaves.

## Options

| Option | Default | Description |
| --- | --- | --- |
| `type` | `'slider'` | `'slider'` or `'carousel'` |
| `mode` | `'hybrid'` | `'auto'`, `'manual'`, `'hybrid'` |
| `preset` | `null` | preset name(s): `'hero'`, `'hero 3d'`, `['gallery', 'minimal']` |
| `template` / `slides` | `null` | template name and its data |
| `theme` | `'dark'` | `dark`, `light`, `glass`, `minimal`, `neon`, `rounded`, `none` |
| `className` | `''` | extra classes for the root |
| `layout` | `'auto'` | `auto`, `fullwidth` (breaks out to 100vw), `fullscreen` |
| `aspectRatio` | `'16 / 9'` | stage ratio for `layout: 'auto'` (`'21:9'`, `2.39` …) |
| `height` | `null` | fixed stage height (number = px, or any CSS length) |
| `minHeight` | `320` | minimum stage height |
| `offset` | `0` | fullscreen: px or a selector (e.g. `'.site-header'`) to subtract |
| `autoHeight` | `false` | stage follows the active slide's height |
| `direction` | `'horizontal'` | or `'vertical'` |
| `start` | `0` | first slide |
| `loop` | `true` | wrap around |
| `speed` | `900` | transition duration (ms) |
| `easing` | `'smooth'` | `linear`, `ease`, `in`, `out`, `in-out`, `smooth`, `expo`, `expo-out`, `back`, `back-in`, `snappy`, `power2`, `circ` or any CSS timing function |
| `transition` | `'fade'` | name, array (random pick), `'random'`, or an inline transition object |
| `perView` | `1` | carousel: slides in view (fractions allowed, e.g. `1.2`) |
| `gap` | `0` | carousel: px between slides |
| `center` | `false` | carousel: centre the active slide |
| `effect` | `'slide'` | carousel effect: `slide`, `fade`, `scale`, `coverflow`, `cards`, `ring`, `depth` |
| `perMove` | `1` | carousel: slides per next/prev |
| `freeMode` | `false` | carousel: momentum scrolling without snapping |
| `ticker` | `0` | carousel: continuous marquee speed in px/s |
| `slideRatio` | `null` | carousel: aspect ratio of each slide |
| `slideToClicked` | `false` | carousel: clicking a slide moves to it |
| `carouselEasing` | `'out'` | `linear`, `out`, `in-out`, `expo-out`, `back` or a function |
| `autoplay` | `{ enabled: true, delay: 5000, pauseOnHover: true, pauseOnFocus: true, pauseHidden: true, stopOnInteraction: false, reverse: false }` | `true`/`false`/a delay number also work |
| `navigation` | `{ arrows, bullets, progress, playPause: true; thumbnails, fraction: false; bulletStyle: 'dots', arrowStyle: 'circle' }` | `false` hides everything |
| `keyboard` | `true` | `true` (when focused), `'global'` (whenever ≥50% visible) or `false` |
| `drag` | `true` | touch / mouse swipe |
| `wheel` | `false` | mouse-wheel / trackpad navigation |
| `layers` | `{ enabled: true, start: 0.45, out: true, outDuration: 450, outPreset: null }` | `start` = fraction of the transition after which layers begin |
| `kenburns` | `false` | `true` (random), a preset name or `{ preset, duration, easing }` |
| `rain` | `false` | live weather: `true`, a preset name or `{ preset, drops, speed, length, width, angle, opacity, splash, puddle, glass, mist, lightning, color, layer }` — see [Rain effects](#rain-effects) |
| `ripple` | `false` | water ripples on click/tap: `true` or `{ click, hover, rings, color }` |
| `parallax` | `false` | `true`, a px number, or `{ mouse, bg, scroll }` |
| `lazy` | `{ enabled: true, preload: 1 }` | load visible slides ± `preload` |
| `video` | `true` | manage videos inside slides |
| `a11y` | `{ label: 'Slider', announce: true }` | also `prev`, `next`, `goTo`, `play`, `pause` labels for translation |
| `hash` | `false` | sync the URL hash with the slide |
| `reducedMotion` | `'auto'` | follow `prefers-reduced-motion`, or force `true`/`false` |
| `breakpoints` | `null` | `{ 768: { perView: 2 }, 1200: { perView: 3 } }` (min-width) |
| `on` | `null` | event handlers, e.g. `{ change() {} }` |
| `modules` | `[]` | extra per-instance modules |

## Rain effects

UniSlider's signature: real weather on top of (or behind) your slides, drawn on one `<canvas>` per slider.

```js
new UniSlider('#hero', { rain: 'storm' });                       // a preset
new UniSlider('#hero', { rain: { preset: 'rain', angle: -15 } }); // tweak it
```

```html
<div data-us-rain="downpour">…</div>   <!-- per slide; "off" stops the rain on that slide -->
```

| Rain preset | Looks like |
| --- | --- |
| `drizzle` | a few fine, slow drops |
| `rain` | steady rain with small splashes |
| `downpour` | heavy rain, splashes and puddle ripples |
| `storm` | wind-driven rain and lightning that strikes on its own |
| `monsoon` | heavy rain, puddles and drifting mist |
| `glass` | drops gathering on a window and sliding down, leaving trails |
| `mist` | drifting fog with a little drizzle |
| `off` | nothing (useful per slide) |

Every value can be tuned: `drops` (count per 1280×720), `speed`, `length`, `width`, `angle` (wind, degrees),
`opacity`, `splash`, `puddle`, `glass`, `mist`, `lightning` (0–1), plus `color` and `layer`
(`'over'` the content, or `'back'` — between the background and the content, slider type only).
Changing slides blends the weather instead of switching abruptly.

```js
slider.rain.set('monsoon');   // change the weather now (null = follow the slides again)
slider.rain.strike();         // lightning, on demand
slider.on('lightning', () => …);
UniSlider.registerRainPreset('typhoon', { drops: 900, speed: 32, length: 44, width: 1.5, angle: 35, opacity: 0.6, splash: 1, puddle: 1, glass: 0, mist: 0.4, lightning: 1 });
```

The canvas pauses when the slider is off screen or the tab is hidden, and is not created at all when the
visitor prefers reduced motion.

**Rain transitions (11):** `rain` (strips fall like streaks) · `drizzle` (soft tiles settle top-down) ·
`downpour` (heavy columns that splash on landing) · `storm` (wind-driven diagonal rain + lightning flash) ·
`thunder` (double lightning, the scene changes in the flash) · `ripple` (the next slide spreads out from
raindrop ripples) · `drip` (wet-paint drips with rounded tips) · `melt` (the old slide is washed away) ·
`mist` (fogged glass clears into the next slide) · `splash` (one big drop bursts open) · `liquid`
(both slides wobble like a reflection on water).

**Rain layer animations:** `raindrop` (falls, squashes, settles) · `splash-in` · `drip-in` · `ripple-in` ·
`mist-in` · `rainfall` (for split characters — pair it with `data-us-stagger="random"`) · `wave-in` · `wash-in`.
**Rain loops:** `drip` `bob` `jelly` `shimmer` `ripple`.

**Also rain-themed:** the `rain` theme, raindrop bullets (`navigation.bulletStyle: 'drops'`), `wave` and
`cascade` carousel effects, `drift-down` / `rain-zoom` Ken Burns, presets `rainy` `drizzle` `storm` `monsoon`
`window` `waves` `waterfall`, the `rain-hero` template and `ripple: true` click ripples.

## Transitions, layer animations & effects

**Slide transitions (40):**
rain: `rain` `drizzle` `downpour` `storm` `thunder` `ripple` `drip` `melt` `mist` `splash` `liquid` ·
`fade` `fade-through` `slide` `slide-vertical` `slide-over` `reveal` `parallax` `stack` `zoom-in` `zoom-out`
`blur` `skew` `rotate` `glitch` · 3D: `cube` `flip` `cards` `fold` · masks: `wipe` `circle` `diamond` `curtain`
`diagonal` · tiles: `slices` `blinds` `boxes` `mosaic` `split` `shutter`

**Layer entrance animations (34):** rain: `raindrop` `splash-in` `drip-in` `ripple-in` `mist-in` `rainfall` `wave-in` `wash-in` ·
`fade` `fade-up` `fade-down` `fade-left` `fade-right` `slide-up` `slide-left` `mask-up` `mask-down` `mask-left`
`mask-right` `zoom-in` `zoom-out` `pop` `blur-in` `rotate-in` `flip-x` `flip-y` `skew-in` `light-speed` `drop`
`bounce-in` `swing` `roll-in` `tracking` `typewriter` (use with `data-us-split="chars"`)

**Loops (14):** `float` `pulse` `spin` `wiggle` `sway` `bounce` `heartbeat` `blink` `glow` `drip` `bob` `jelly` `shimmer` `ripple`

**Carousel effects (9):** `slide` `fade` `scale` `coverflow` `cards` `ring` `depth` `wave` `cascade`

**Ken Burns (10 + random):** `zoom-in` `zoom-out` `pan-left` `pan-right` `pan-up` `pan-down` `zoom-in-left` `zoom-in-right` `drift-down` `rain-zoom`

List them at runtime: `UniSlider.transitions.list()`, `UniSlider.transitionsByCategory()`, `UniSlider.layerAnimations.list()`, `UniSlider.rainPresets.list()`, …

## Presets

Presets are named option bundles; combine several with spaces: `preset: 'hero 3d'`.

| Preset | What it sets |
| --- | --- |
| `hero` | full-width 21:9 hero, Ken Burns, mouse parallax, line bullets |
| `fullscreen` | full-screen, `slide-over`, fraction counter |
| `cinematic` | 2.39:1, tile transitions, Ken Burns |
| `creative` | random transition every time |
| `3d` | cube / flip / fold / cards |
| `minimal` | minimal theme, fraction, `fade-through` |
| `gallery` | thumbnails + fraction |
| `vertical` | vertical slider with wheel |
| `testimonial` | auto height, light theme, `fade-through` |
| `carousel` | responsive 1.15 → 2 → 3 cards |
| `cards` | stacked cards carousel |
| `coverflow` | 3D coverflow, click to focus |
| `ring` | 3D ring carousel |
| `depth` | blurred depth carousel |
| `ticker` | endless marquee (logos, partners) |
| `rainy` | rain theme, live rain, click ripples, rain transitions, raindrop bullets |
| `drizzle` | light rain, `drizzle` / `mist` transitions |
| `storm` | storm with lightning, `storm` / `thunder` / `downpour` transitions |
| `monsoon` | full-width 21:9, heavy rain with puddles and mist, `downpour` / `melt` / `liquid` / `ripple` |
| `window` | rain on glass, `mist` / `drip` transitions |
| `waves` | carousel floating on a wave |
| `waterfall` | carousel stepping down like a waterfall |

## Templates

Templates generate slide markup from data and bring their own option defaults. Include
`dist/unislider-templates.min.css` when you use them.

| Template | Slide data fields |
| --- | --- |
| `rain-hero` | `title`, `kicker`, `text`, `image`, `weather` (rain preset for that slide), `overlay`, `align`, `button(s)` |
| `hero-fullscreen` | `title`, `kicker`, `text`, `image`, `overlay`, `align` (`left`/`center`/`right`), `button` or `buttons[]` |
| `hero-split` | `title`, `kicker`, `text`, `image`, `alt`, `background`, `button(s)` |
| `agency` | `title`, `text`, `image`, `overlay`, `button(s)` |
| `product-showcase` | `title`, `kicker`, `text`, `price`, `image`, `thumb`, `background`, `button(s)` |
| `testimonials` | `quote`, `name`, `role`, `avatar` |
| `cards-carousel` | `title`, `tag`, `text`, `image`, `href`, `link` |
| `coverflow-gallery` | `image`, `title`, `alt` |
| `logo-ticker` | `image` or `title` |
| `vertical-showcase` | `title`, `kicker`, `text`, `image`, `button(s)` |
| `news-headlines` | `title`, `tag`, `date`, `href` |

Every slide may also have `id`, `transition`, `duration` (autoplay ms) and `thumb`. Text is HTML-escaped.

## Themes & styling

Themes: `dark` (default), `rain`, `light`, `glass`, `minimal`, `neon`, `rounded`, `none`. Everything is driven by CSS
custom properties, so restyling is a few variables:

```css
#hero {
  --us-accent: #ff4d6d;      /* progress bar, active states */
  --us-ui-bg: rgba(0,0,0,.5);/* arrows, play button */
  --us-ui-fg: #fff;
  --us-arrow-size: 56px;
  --us-bullet-size: 12px;
  --us-radius: 24px;         /* rounded stage */
  --us-thumb-size: 120px;
}
```

Useful classes: `.us-slide.is-active`, `.is-entering`, `.is-leaving`, `.is-prev`, `.is-next`, `.is-visible`
(carousel), root `.is-playing` / `.is-paused`. The autoplay progress is available as `var(--us-progress)` (0–1)
and the current index as `var(--us-index)`.

## API

```js
const slider = new UniSlider(elementOrSelector, options);   // or UniSlider.create(…)

slider.next();                 // → Promise<boolean>
slider.prev();
slider.goTo(2);                // { immediate: true } skips the transition
slider.play(); slider.pause(); slider.toggle();
slider.update({ transition: 'cube', speed: 1400 });   // change options at runtime
slider.addSlide('<div>New</div>', 1);
slider.removeSlide(0);
slider.destroy();              // restores the original markup

slider.index; slider.length; slider.activeSlide; slider.isPlaying; slider.options;

UniSlider.get('#hero');          // instance for an element
UniSlider.init();                // initialise [data-unislider] elements (done automatically by the script build)
```

## Events

```js
slider.on('change', ({ index, previous, dir, source, slide }) => {});
```

| Event | When |
| --- | --- |
| `init` | after setup |
| `beforeChange` | a move was requested (before layer out-animations) |
| `change` | the index changed; the transition starts |
| `afterChange` | the transition finished |
| `transition:start` | `{ name, speed }` of the running transition |
| `layers:in` | layers of a slide started animating |
| `lightning` | the rain canvas drew a lightning strike |
| `autoplay:start` / `:stop` / `:pause` / `:resume` / `:progress` | autoplay state (`progress` 0–1) |
| `dragStart` / `dragEnd` / `progress` | carousel dragging and position |
| `load` | a slide's lazy media was requested |
| `resize` / `breakpoint` / `update` / `slidesChange` / `destroy` | lifecycle |
| `*` | every event: `(name, detail)` |

`source` tells you what caused a move: `api`, `autoplay`, `nav`, `bullet`, `thumb`, `keyboard`, `swipe`, `drag`, `wheel`, `click`, `hash`, `ticker`.

## Extending UniSlider (plugins)

Everything is registered by name, so new transitions, animations or features can be added without touching
the core — by you, in a later version, or by third-party plugins:

```js
UniSlider.use((S) => {
  // a slide transition: keyframes for the incoming and outgoing slide
  S.registerTransition('swirl', (ctx) => ({
    in:  [{ transform: `rotate(${-90 * ctx.dir}deg) scale(0)`, opacity: 0 }, { transform: 'none', opacity: 1 }],
    out: [{ opacity: 1 }, { opacity: 0 }],
  }));

  // a layer animation
  S.registerLayerAnimation('drop-spin', [
    { opacity: 0, transform: 'translateY(-80px) rotate(-180deg)' },
    { opacity: 1, transform: 'none' },
  ]);

  // a carousel effect (offset = distance from the active slide, in slides)
  S.registerCarouselEffect('tilt', ({ offset }) => ({ transform: `rotate(${offset * 6}deg)` }));

  // an option preset
  S.registerPreset('brand', { theme: 'glass', transition: 'swirl', navigation: { bulletStyle: 'lines' } });

  // a template
  S.registerTemplate('quote-card', {
    options: { preset: 'testimonial' },
    render: (slides) => slides.map((s) => `<div><blockquote data-us-layer="fade-up">${s.quote}</blockquote></div>`).join(''),
  });

  // a feature module: runs for every slider
  S.registerModule({
    name: 'analytics',
    setup(slider) {
      const log = ({ index }) => console.log('viewed slide', index);
      slider.on('afterChange', log);
      return { destroy: () => slider.off('afterChange', log) };
    },
  });
});
```

Fully custom transitions can implement `run(ctx)` and return Web Animations (see `src/transitions/tiles.js`,
which also exposes `UniSlider.buildTiles()` for grid effects). Async work before a slide leaves can be added with
`slider.hook('leave', async (ctx) => {…})`.

## Accessibility

- WAI-ARIA carousel pattern: `role="region"` + `aria-roledescription="carousel"`, slides as labelled groups
- hidden slides are `inert` and `aria-hidden`, so keyboard and screen-reader users only reach the visible slide
- manual changes are announced through a polite live region; autoplay changes are not (no chatter)
- a play/pause button is shown whenever autoplay is available (WCAG 2.2.2); autoplay pauses on hover, keyboard focus, hidden tabs and when scrolled away
- `prefers-reduced-motion`: transitions become short fades, layers only fade, Ken Burns and parallax are off
- all control labels are translatable through `a11y`

## Browser support

All evergreen browsers (Chrome/Edge 100+, Firefox 100+, Safari 15.4+). Uses the Web Animations API,
CSS custom properties, `aspect-ratio`, `inert` and `ResizeObserver`.

## Development & updates

```bash
npm install
npm run build     # dist/ (IIFE, ESM, min, CSS)
npm run dev       # rebuild on change
npm test          # unit tests + Playwright browser tests (demo/index.html)
```

```
unislider/
├── src/
│   ├── core/          UniSlider class, options, events, registries, utils
│   ├── engines/       slider (stacked) & carousel engines, carousel effects
│   ├── transitions/   basic, 3d, clip (masks), tiles
│   ├── layers/        layer controller, animation presets, text splitting
│   ├── modules/       autoplay, navigation, input, a11y, media, motion (Ken Burns, parallax, hash)
│   ├── presets/       option presets
│   ├── templates/     data-driven templates
│   ├── index.js       ES module entry (registers everything)
│   └── browser.js     script-tag entry (auto-init)
├── css/               unislider.css (core + themes), unislider-templates.css
├── dist/              built files
├── demo/              showcase + playground
├── types/             TypeScript definitions
└── tests/             unit (node:test) + e2e (Playwright)
```

Bug reports and ideas are welcome in [Issues](https://github.com/JuwelKhan/unislider/issues).
The plugin follows [semantic versioning](https://semver.org): new transitions, animations, presets, templates
and options are minor releases; anything that changes existing behaviour is a major release. See
[CONTRIBUTING.md](CONTRIBUTING.md) for how to add features and [CHANGELOG.md](CHANGELOG.md) for history.

---

## বাংলায় দ্রুত শুরু

**UniSlider** (Universal Slider) একটি হালকা (≈২৮ KB) জাভাস্ক্রিপ্ট স্লাইডার/ক্যারোসেল প্লাগিন — কোনো ডিপেন্ডেন্সি নেই, যেকোনো ওয়েবসাইটে চলে। এর বিশেষত্ব হলো আসল বৃষ্টি: স্লাইডের উপর লাইভ বৃষ্টি, বজ্রপাত, কাচে জমা ফোঁটা, কুয়াশা আর বৃষ্টির ট্রানজিশন।

**১. ফাইল যুক্ত করুন**

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/JuwelKhan/unislider@1.0.0/dist/unislider.min.css">
<script src="https://cdn.jsdelivr.net/gh/JuwelKhan/unislider@1.0.0/dist/unislider.min.js" defer></script>
```

**২. HTML লিখুন — জাভাস্ক্রিপ্ট ছাড়াই চলবে**

```html
<div data-unislider="rainy">
  <div data-us-bg="ছবি-১.jpg" data-us-rain="storm">
    <h2 data-us-layer="rainfall" data-us-split="chars" data-us-stagger="random">প্রথম স্লাইড</h2>
  </div>
  <div data-us-bg="ছবি-২.jpg" data-us-transition="ripple" data-us-rain="glass">
    <h2 data-us-layer="raindrop">দ্বিতীয় স্লাইড</h2>
  </div>
</div>
```

**৩. অথবা জাভাস্ক্রিপ্ট দিয়ে নিয়ন্ত্রণ করুন**

```js
new UniSlider('#slider', {
  mode: 'auto',          // auto = নিজে চলবে, manual = ইউজার চালাবে, hybrid = দুটোই
  preset: 'hero',        // প্রিসেট: hero, rainy, storm, monsoon, carousel, coverflow …
  transition: 'random',  // ৪০টা ট্রানজিশনের যেকোনোটা (rain, drip, ripple, storm …)
  rain: 'storm',         // লাইভ বৃষ্টি: drizzle, rain, downpour, storm, monsoon, glass, mist
  ripple: true,          // ক্লিক করলে পানির ঢেউ
});
```

**৪. টেমপ্লেট — শুধু ডেটা দিন, পুরো স্লাইডার তৈরি**

```js
UniSlider.create('#reviews', {
  template: 'testimonials',
  slides: [{ quote: 'দারুণ!', name: 'রহিম', role: 'ডেভেলপার' }],
});
```

- **মোড:** `auto` (অটো প্লে, অ্যারো লুকানো), `manual` (অটো প্লে নেই), `hybrid` (ডিফল্ট — দুটোই)
- **বৃষ্টি:** প্রতিটা স্লাইডে আলাদা আবহাওয়া দেওয়া যায় (`data-us-rain="storm"`), স্লাইড বদলালে বৃষ্টি ধীরে ধীরে বদলায়। `slider.rain.strike()` দিলে বিদ্যুৎ চমকায়
- **নতুন ফিচার যোগ করা:** `UniSlider.use()` দিয়ে নতুন ট্রানজিশন, অ্যানিমেশন, প্রিসেট, টেমপ্লেট বা মডিউল যোগ করা যায় — কোর কোড না বদলেই
- **ডেমো দেখুন:** [juwelkhan.github.io/unislider](https://juwelkhan.github.io/unislider/) অথবা `demo/index.html` ব্রাউজারে খুলুন
