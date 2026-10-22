# Contributing & extending

UniSlider is built so that it can keep growing: almost everything is a named entry in a registry.
Adding a feature usually means adding **one file or one registration**, never editing the core.

## Setup

```bash
npm install
npm run dev      # rebuilds dist/ on every change
npm test         # unit + browser tests (run `npm run build` first)
```

Open `demo/index.html` directly in a browser (no server needed). The playground lists every registered
transition and layer animation automatically, so new ones show up there right away.

## Where things go

| You want to add… | Put it in | Register with |
| --- | --- | --- |
| a slide transition | `src/transitions/*.js` (rain ones in `rain.js`) | `registerTransition(name, keyframesFn \| { keyframes } \| { run }, category)` |
| a layer entrance animation | `src/layers/presets.js` | `registerLayerAnimation(name, keyframes \| { keyframes, duration, easing })` |
| an idle loop | `src/layers/presets.js` | `registerLoopAnimation(name, …)` |
| a carousel effect | `src/engines/effects.js` | `registerCarouselEffect(name, applyFn \| { apply, perspective })` |
| a rain preset (weather) | `src/modules/rain.js` | `registerRainPreset(name, { drops, speed, length, width, angle, opacity, splash, puddle, glass, mist, lightning })` |
| a Ken Burns move | `src/modules/motion.js` | `kenburnsPresets.register(name, keyframes)` |
| an option preset | `src/presets/index.js` | `PRESETS` object |
| a template | `src/templates/index.js` (+ styles in `css/unislider-templates.css`) | `registerTemplate(name, { options, render })` |
| a feature (behaviour) | `src/modules/<name>.js` | add it to the module list in `src/index.js` |
| a new option | `DEFAULTS` in `src/core/options.js` + `types/index.d.ts` + README table | — |

### Rules of thumb

- **Transitions** receive `ctx = { from, to, dir, vertical, width, height, speed, easing, stage }`. Mirror
  directional motion with `ctx.dir` and support `ctx.vertical`. Keyframe transitions must use the same CSS
  properties in every keyframe (a unit test checks this).
- **Modules** return `{ destroy() }` and must undo everything they changed (classes, attributes, listeners,
  inline styles). The `destroy restores the original markup` test catches leaks.
- Respect `slider.reducedMotion` for anything that moves.
- Keep it small: no runtime dependencies. Check the size printed by `npm run build`.
- Add a test for new behaviour (`tests/unit` for pure logic, `tests/e2e` for browser behaviour).

## Reporting bugs & proposing features

Open an [issue](https://github.com/JuwelKhan/unislider/issues) with the browser, a minimal HTML snippet and
what you expected. Pull requests are welcome — run `npm run build && npm test` before opening one, and
commit the rebuilt `dist/` files.

## Releasing an update

See [RELEASING.md](RELEASING.md) for the full checklist (versioning, CHANGELOG, tags, CDN links, npm).
