import { test } from 'node:test';
import assert from 'node:assert/strict';
import UniSlider from '../../src/index.js';
import { esc } from '../../src/templates/index.js';
import { resolveRain } from '../../src/modules/rain.js';
import { staggerDelays } from '../../src/layers/Layers.js';

const KEYFRAME_TRANSITIONS = [
  'fade', 'fade-through', 'slide', 'slide-vertical', 'slide-over', 'reveal', 'parallax', 'stack', 'zoom-in',
  'zoom-out', 'blur', 'skew', 'rotate', 'glitch', 'cube', 'flip', 'cards', 'fold', 'wipe', 'circle',
  'diamond', 'curtain', 'diagonal', 'thunder', 'mist', 'splash',
];
const TILE_TRANSITIONS = ['slices', 'blinds', 'boxes', 'mosaic', 'split', 'shutter'];
const RAIN_TRANSITIONS = ['rain', 'drizzle', 'downpour', 'storm', 'thunder', 'ripple', 'drip', 'melt', 'mist', 'splash', 'liquid'];

test('all built-in transitions are registered', () => {
  for (const name of [...KEYFRAME_TRANSITIONS, ...TILE_TRANSITIONS, ...RAIN_TRANSITIONS]) {
    assert.ok(UniSlider.transitions.has(name), name);
  }
  assert.equal(UniSlider.transitions.list().length, 40);
});

test('transitions are grouped by category, with a rain group', () => {
  const groups = UniSlider.transitionsByCategory();
  assert.deepEqual(groups.rain.sort(), [...RAIN_TRANSITIONS].sort());
  for (const group of ['classic', '3d', 'mask', 'tiles']) assert.ok(groups[group].length >= 4, group);
});

test('keyframe transitions keep the same properties in every keyframe', () => {
  for (const name of KEYFRAME_TRANSITIONS) {
    const def = UniSlider.transitions.get(name);
    for (const dir of [1, -1]) {
      for (const vertical of [false, true]) {
        const frames = def.keyframes({ dir, vertical, width: 800, height: 450 });
        for (const key of ['in', 'out']) {
          const list = frames[key];
          assert.ok(Array.isArray(list) && list.length >= 2, `${name}.${key}`);
          const props = (f) => Object.keys(f).filter((k) => k !== 'offset').sort().join();
          for (const frame of list) assert.equal(props(frame), props(list[0]), `${name}.${key} dir=${dir}`);
        }
        assert.ok([undefined, 'in', 'out'].includes(frames.top), `${name}.top`);
      }
    }
  }
});

test('direction mirrors directional transitions', () => {
  const slide = UniSlider.transitions.get('slide');
  assert.match(slide.keyframes({ dir: 1 }).in[0].transform, /100%/);
  assert.match(slide.keyframes({ dir: -1 }).in[0].transform, /-100%/);
  assert.match(slide.keyframes({ dir: 1, vertical: true }).in[0].transform, /translate3d\(0, 100%/);
});

test('custom transitions, layer animations and effects can be registered', () => {
  UniSlider.registerTransition('test-pop', () => ({ in: [{ opacity: 0 }, { opacity: 1 }], out: [{}, {}] }));
  assert.equal(UniSlider.transitions.get('test-pop').name, 'test-pop');
  assert.throws(() => UniSlider.registerTransition('broken', {}), TypeError);

  UniSlider.registerLayerAnimation('test-in', [{ opacity: 0 }, { opacity: 1 }]);
  assert.ok(UniSlider.layerAnimations.has('test-in'));
  UniSlider.registerCarouselEffect('test-fx', () => ({ opacity: 1 }));
  assert.deepEqual(UniSlider.carouselEffects.get('test-fx').apply({}), { opacity: 1 });
});

test('layer presets and loops all produce keyframes', () => {
  assert.ok(UniSlider.layerAnimations.list().length >= 34);
  for (const name of ['raindrop', 'splash-in', 'drip-in', 'ripple-in', 'mist-in', 'rainfall', 'wave-in', 'wash-in']) {
    assert.ok(UniSlider.layerAnimations.has(name), name);
  }
  for (const name of ['drip', 'bob', 'jelly', 'shimmer', 'ripple']) assert.ok(UniSlider.loopAnimations.has(name), name);
  for (const name of UniSlider.layerAnimations.list()) {
    const preset = UniSlider.layerAnimations.get(name);
    const frames = typeof preset.keyframes === 'function' ? preset.keyframes({}) : preset.keyframes;
    assert.ok(frames.length >= 2, name);
  }
  for (const name of UniSlider.loopAnimations.list()) assert.ok(UniSlider.loopAnimations.get(name).keyframes.length >= 2, name);
});

test('carousel effects return style objects for any offset', () => {
  for (const name of UniSlider.carouselEffects.list()) {
    for (const offset of [-2.5, -1, -0.3, 0, 0.6, 1, 3]) {
      const fx = UniSlider.carouselEffects.get(name).apply({ offset, base: offset * 300, origin: 0, step: 300, size: 280, viewport: 900, perView: 3, count: 6 });
      assert.equal(typeof fx, 'object', name);
      if (fx.opacity !== undefined) assert.ok(fx.opacity >= 0 && fx.opacity <= 1, `${name} opacity ${fx.opacity}`);
    }
  }
});

test('presets reference only known option keys', () => {
  const known = new Set(Object.keys(UniSlider.defaults));
  for (const name of UniSlider.presets.list()) {
    for (const key of Object.keys(UniSlider.presets.get(name))) assert.ok(known.has(key), `${name}.${key}`);
  }
});

test('templates render escaped markup with layers', () => {
  assert.ok(UniSlider.templates.list().length >= 10);
  const html = UniSlider.templates.get('hero-fullscreen').render([{ title: '<b>Hi</b> & "you"', image: 'a.jpg' }], {});
  assert.match(html, /&lt;b&gt;Hi&lt;\/b&gt; &amp; &quot;you&quot;/);
  assert.match(html, /data-us-layer=/);
  assert.match(html, /data-us-bg="a.jpg"/);
  assert.equal(esc(`'`), '&#39;');
  for (const name of UniSlider.templates.list()) {
    const out = UniSlider.templates.get(name).render([{ title: 'A', text: 'B', image: 'c.png', quote: 'q', name: 'n' }], {});
    assert.equal(typeof out, 'string', name);
    assert.ok(out.length > 20, name);
  }
});

test('plugins install once', () => {
  let calls = 0;
  const plugin = (S) => {
    calls++;
    S.registerPreset('plugin-preset', { speed: 1 });
  };
  UniSlider.use(plugin).use(plugin);
  assert.equal(calls, 1);
  assert.ok(UniSlider.presets.has('plugin-preset'));
});

test('rain options resolve to numeric weather', () => {
  assert.equal(resolveRain(undefined), null);
  assert.equal(resolveRain(false).drops, 0);
  assert.equal(resolveRain('off').opacity, 0);
  assert.equal(resolveRain(true).drops, resolveRain('rain').drops);
  assert.equal(resolveRain('storm').lightning, 1);
  assert.equal(resolveRain('nonsense').drops, resolveRain('rain').drops);
  const custom = resolveRain({ preset: 'drizzle', angle: -20 });
  assert.equal(custom.angle, -20);
  assert.equal(custom.drops, resolveRain('drizzle').drops);
  for (const name of UniSlider.rainPresets.list()) {
    for (const [key, value] of Object.entries(resolveRain(name))) assert.equal(typeof value, 'number', `${name}.${key}`);
  }
});

test('stagger delays: fixed steps or random raindrops', () => {
  assert.deepEqual(staggerDelays(4, 50), [0, 50, 100, 150]);
  assert.deepEqual(staggerDelays(3, undefined), [0, 0, 0]);
  const random = staggerDelays(20, 'random:30');
  assert.equal(random.length, 20);
  assert.ok(random.every((d) => d >= 0 && d <= 600));
  assert.ok(new Set(random).size > 5);
});
