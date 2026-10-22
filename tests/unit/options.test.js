import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULTS, applyBreakpoints, breakpointKey, normalize, resolveOptions } from '../../src/core/options.js';
import { createRegistry } from '../../src/core/registry.js';

const presets = createRegistry('preset', () => true);
presets.register('big', { speed: 2000, navigation: { fraction: true }, breakpoints: { 600: { perView: 2 } } });
presets.register('fast', { speed: 300 });
const templates = createRegistry('template', () => true);
templates.register('tpl', { options: { preset: 'big', theme: 'light' }, render: () => '' });

test('shorthands expand to option objects', () => {
  assert.deepEqual(normalize({ autoplay: 3000 }).autoplay, { enabled: true, delay: 3000 });
  assert.deepEqual(normalize({ autoplay: false }).autoplay, { enabled: false });
  assert.equal(normalize({ navigation: false }).navigation.arrows, false);
  assert.equal(normalize({ navigation: false }).navigation.bullets, false);
  assert.deepEqual(normalize({ kenburns: 'zoom-out' }).kenburns, { preset: 'zoom-out' });
  assert.deepEqual(normalize({ parallax: 12 }).parallax, { mouse: 12, scroll: 0 });
  assert.deepEqual(normalize({ layers: false }).layers, { enabled: false });
});

test('defaults are not mutated by resolving', () => {
  const before = JSON.stringify(DEFAULTS);
  resolveOptions({ autoplay: { delay: 1 }, navigation: { arrows: false } });
  assert.equal(JSON.stringify(DEFAULTS), before);
});

test('modes set defaults that user options still override', () => {
  assert.equal(resolveOptions({ mode: 'manual' }).autoplay.enabled, false);
  assert.equal(resolveOptions({ mode: 'auto' }).navigation.arrows, false);
  assert.equal(resolveOptions({ mode: 'auto', navigation: { arrows: true } }).navigation.arrows, true);
  assert.equal(resolveOptions({}).mode, 'hybrid');
});

test('presets merge in order and user options win', () => {
  const o = resolveOptions({ preset: 'big fast', navigation: { bullets: false } }, { presets });
  assert.equal(o.speed, 300);
  assert.equal(o.navigation.fraction, true);
  assert.equal(o.navigation.bullets, false);
  assert.equal(o.navigation.arrows, true);
});

test('template options and the template preset apply before user options', () => {
  const o = resolveOptions({ template: 'tpl', theme: 'glass' }, { presets, templates });
  assert.equal(o.speed, 2000);
  assert.equal(o.theme, 'glass');
});

test('breakpoints are replaced by the most specific source', () => {
  assert.deepEqual(resolveOptions({ preset: 'big' }, { presets }).breakpoints, { 600: { perView: 2 } });
  assert.deepEqual(resolveOptions({ preset: 'big', breakpoints: { 900: { perView: 4 } } }, { presets }).breakpoints, {
    900: { perView: 4 },
  });
});

test("a user preset drops the template preset's breakpoints", () => {
  presets.register('plain', { speed: 5 });
  assert.equal(resolveOptions({ template: 'tpl', preset: 'plain' }, { presets, templates }).breakpoints, null);
  assert.deepEqual(resolveOptions({ template: 'tpl' }, { presets, templates }).breakpoints, { 600: { perView: 2 } });
});

test('breakpoints apply min-width overrides in ascending order', () => {
  const base = resolveOptions({ perView: 1, breakpoints: { 1024: { perView: 3 }, 640: { perView: 2, autoplay: false } } });
  assert.equal(applyBreakpoints(base, 320).perView, 1);
  assert.equal(applyBreakpoints(base, 700).perView, 2);
  assert.equal(applyBreakpoints(base, 700).autoplay.enabled, false);
  assert.equal(applyBreakpoints(base, 700).autoplay.delay, 5000);
  assert.equal(applyBreakpoints(base, 1200).perView, 3);
  assert.notEqual(breakpointKey(base, 700), breakpointKey(base, 1200));
  assert.equal(breakpointKey(base, 700), breakpointKey(base, 800));
});
