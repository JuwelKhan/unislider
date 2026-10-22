# Changelog

All notable changes to UniSlider are documented here. The project follows
[semantic versioning](https://semver.org).

## [1.0.0] — 2026-10-18

First release.

### Added
- **Live rain (signature feature):** canvas weather with wind, depth layers, splashes, puddle ripples, drops sliding down glass, drifting mist and lightning; 8 presets (`drizzle`, `rain`, `downpour`, `storm`, `monsoon`, `glass`, `mist`, `off`), per-slide weather (`data-us-rain`) that blends between slides, `slider.rain.set()` / `strike()`, `lightning` event, `registerRainPreset()`.
- **11 rain transitions:** rain, drizzle, downpour, storm, thunder, ripple, drip, melt, mist, splash, liquid; transitions now carry a category (`UniSlider.transitionsByCategory()`).
- **Rain layer animations:** raindrop, splash-in, drip-in, ripple-in, mist-in, rainfall, wave-in, wash-in; loops drip, bob, jelly, shimmer, ripple; random ("raindrop") stagger via `data-us-stagger="random"`.
- Click/tap water ripples (`ripple: true`), `rain` theme, raindrop bullets, `wave` and `cascade` carousel effects, `drift-down` and `rain-zoom` Ken Burns, presets `rainy`, `drizzle`, `storm`, `monsoon`, `window`, `waves`, `waterfall`, and the `rain-hero` template.
- **Engines:** stacked `slider` engine (Web Animations transitions, interruptible at any time) and `carousel` engine (continuous position: seamless loop without clones, multi-slide views, momentum drag, free mode, ticker/marquee, click-to-slide).
- **29 classic slide transitions:** fade, fade-through, slide, slide-vertical, slide-over, reveal, parallax, stack, zoom-in, zoom-out, blur, skew, rotate, glitch, cube, flip, cards, fold, wipe, circle, diamond, curtain, diagonal, slices, blinds, boxes, mosaic, split, shutter — plus `random`, arrays and per-slide overrides.
- **Layers:** 26 classic entrance presets, 9 idle loops, split text (words/chars) with stagger, out-animations before a slide leaves, mask reveals.
- **Motion:** Ken Burns (8 presets + random), mouse parallax per layer, scroll parallax for backgrounds.
- **Navigation:** arrows (circle, square, minimal, bottom, hover), bullets (dots, lines with progress, numbers, titles), thumbnails, fraction counter, autoplay progress bar, play/pause.
- **Input:** touch & mouse swipe, keyboard (focused or global), mouse wheel, URL hash deep links.
- **Modes:** `auto`, `manual`, `hybrid`; autoplay pauses on hover, focus, hidden tab, off-screen and while a `data-us-wait` video plays.
- **Layouts:** aspect ratio, fixed height, full-width, full-screen with offset, auto height, min-width breakpoints.
- **Media:** lazy images/backgrounds, slide-aware HTML5 video, YouTube/Vimeo pause.
- **15 classic presets**, **10 templates**, **6 themes** (+ `none`), CSS custom properties for styling.
- **Extensibility:** registries for transitions, layer animations, loops, carousel effects, Ken Burns presets, presets, templates, modules and engines; `UniSlider.use(plugin)`; `slider.hook('leave')`.
- **API:** `next`, `prev`, `goTo`, `play`, `pause`, `toggle`, `update`, `addSlide`, `removeSlide`, `destroy` (restores markup), events, `UniSlider.init()` auto-init via `data-unislider`.
- **Accessibility:** ARIA carousel pattern, inert hidden slides, live announcements, reduced-motion support, translatable labels.
- TypeScript definitions, demo with playground, unit and Playwright tests.
