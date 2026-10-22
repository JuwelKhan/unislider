import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CarouselEngine } from '../../src/engines/carousel.js';

/** Engine with measured values injected (no DOM). */
function engine({ count, perView, center = false, loop = false }) {
  const slides = Array.from({ length: count }, () => ({ style: {} }));
  const e = new CarouselEngine({ slides, index: 0, options: {} });
  Object.assign(e, { perView, center, size: 100, gap: 0, step: 100, viewport: perView * 100 });
  e.loop = loop && count >= Math.ceil(perView) + 2;
  e.maxPos = e.loop ? Infinity : center ? count - 1 : Math.max(0, count - perView);
  return e;
}

test('snap positions without loop', () => {
  assert.equal(engine({ count: 6, perView: 3 }).snapCount(), 4);
  assert.equal(engine({ count: 6, perView: 2.5 }).snapCount(), 5);
  assert.equal(engine({ count: 6, perView: 3, center: true }).snapCount(), 6);
  assert.equal(engine({ count: 2, perView: 3 }).snapCount(), 1);
});

test('loop needs enough slides', () => {
  assert.equal(engine({ count: 6, perView: 3, loop: true }).loop, true);
  assert.equal(engine({ count: 4, perView: 3, loop: true }).loop, false);
});

test('position ↔ index mapping', () => {
  const looped = engine({ count: 5, perView: 1, loop: true });
  assert.equal(looped.indexForPos(-1), 4);
  assert.equal(looped.indexForPos(7.2), 2);
  const bounded = engine({ count: 6, perView: 2.5 });
  assert.equal(bounded.posForIndex(4), 3.5);
  assert.equal(bounded.indexForPos(3.5), 4);
  assert.equal(bounded.indexForPos(1.4), 1);
});
