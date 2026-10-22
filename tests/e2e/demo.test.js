/**
 * Browser tests against demo/index.html (run `npm run build` first).
 * Uses the Playwright library with the locally installed Chromium; skipped
 * automatically when no browser is available.
 */
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const DEMO = pathToFileURL(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../demo/index.html')).href;

let browser;
let skip = false;
const errors = [];

before(async () => {
  try {
    const { chromium } = await import('playwright');
    browser = await chromium.launch();
  } catch (error) {
    skip = `Playwright/Chromium not available: ${error.message.split('\n')[0]}`;
  }
});

after(async () => browser?.close());

async function open({ viewport = { width: 1280, height: 800 }, reducedMotion = 'no-preference' } = {}) {
  const page = await browser.newPage({ viewport, reducedMotion });
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(DEMO);
  return page;
}

/** Build a fresh slider inside the demo page. */
const mount = (page, options, slides = 4, tag = 'div') =>
  page.evaluate(
    ({ options, slides, tag }) => {
      const root = document.createElement('div');
      root.id = 'fixture';
      root.innerHTML = Array.from({ length: slides }, (_, i) => `<${tag} data-us-title="S${i}"><h2 data-us-layer="fade-up">Slide ${i}</h2></${tag}>`).join('');
      document.querySelector('main').prepend(root);
      root.scrollIntoView({ block: 'center', behavior: 'instant' });
      window.fx = new UniSlider(root, options);
      root.scrollIntoView({ block: 'center', behavior: 'instant' });
      return root.outerHTML.length;
    },
    { options, slides, tag },
  );

const state = (page) =>
  page.evaluate(() => {
    const slides = [...document.querySelectorAll('#fixture .us-slide')];
    return {
      index: fx.index,
      active: slides.map((s, i) => (s.classList.contains('is-active') ? i : -1)).filter((i) => i >= 0),
      inert: slides.map((s) => s.inert),
      transient: document.querySelectorAll('#fixture .is-leaving, #fixture .is-entering, #fixture .us-tiles').length,
      bullet: [...document.querySelectorAll('#fixture .us-bullet')].findIndex((b) => b.hasAttribute('aria-current')),
    };
  });

describe('UniSlider demo', () => {
  test('every demo slider initialises without errors', async (t) => {
    if (skip) return t.skip(skip);
    const page = await open();
    await page.waitForTimeout(500);
    const count = await page.locator('.unislider').count();
    assert.ok(count >= 13, `found ${count} sliders`);
    assert.equal(await page.locator('#hero .us-slide').count(), 4);
    assert.equal(await page.locator('#hero .us-slide.is-active').count(), 1);
    assert.equal(await page.locator('#hero .us-bullet').count(), 4);
    assert.equal(await page.getAttribute('#hero', 'aria-roledescription'), 'carousel');
    assert.equal(await page.locator('#auto-init.unislider').count(), 1, 'data-unislider auto-init');
    assert.deepEqual(errors, []);
    await page.close();
  });

  test('API navigation updates classes, ARIA and bullets', async (t) => {
    if (skip) return t.skip(skip);
    const page = await open();
    await mount(page, { speed: 100, autoplay: false });
    assert.deepEqual((await state(page)).active, [0]);
    assert.equal(await page.evaluate(() => fx.next()), true);
    let s = await state(page);
    assert.deepEqual([s.index, s.active, s.bullet, s.transient], [1, [1], 1, 0]);
    assert.deepEqual(s.inert, [true, false, true, true]);
    await page.evaluate(() => fx.prev());
    await page.evaluate(() => fx.prev()); // loops to the end
    s = await state(page);
    assert.deepEqual([s.index, s.active], [3, [3]]);
    await page.evaluate(() => fx.goTo(1));
    assert.equal((await state(page)).index, 1);
    await page.close();
  });

  test('rapid navigation never leaves stale transition state', async (t) => {
    if (skip) return t.skip(skip);
    const page = await open();
    await mount(page, { speed: 600, transition: ['cube', 'slices', 'fade', 'boxes'], autoplay: false });
    await page.evaluate(async () => {
      fx.next();
      fx.next();
      fx.prev();
      fx.goTo(3);
      await fx.next();
    });
    await page.waitForTimeout(700);
    const s = await state(page);
    assert.equal(s.index, 0);
    assert.deepEqual(s.active, [0]);
    assert.equal(s.transient, 0);
    assert.equal(await page.evaluate(() => fx._busy), false);
    await page.close();
  });

  test('keyboard, bullets and arrows navigate', async (t) => {
    if (skip) return t.skip(skip);
    const page = await open();
    await mount(page, { speed: 50, autoplay: false, loop: false });
    await page.focus('#fixture');
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(150);
    assert.equal((await state(page)).index, 1);
    await page.keyboard.press('End');
    await page.waitForTimeout(150);
    assert.equal((await state(page)).index, 3);
    assert.equal(await page.locator('#fixture .us-arrow--next').isDisabled(), true);
    await page.click('#fixture .us-bullet >> nth=0');
    await page.waitForTimeout(150);
    assert.equal((await state(page)).index, 0);
    await page.click('#fixture .us-arrow--next');
    await page.waitForTimeout(150);
    assert.equal((await state(page)).index, 1);
    await page.close();
  });

  test('autoplay advances, pauses on hover and can be toggled', async (t) => {
    if (skip) return t.skip(skip);
    const page = await open();
    await mount(page, { speed: 50, autoplay: { delay: 300 } });
    await page.waitForTimeout(500);
    assert.ok((await state(page)).index >= 1, 'advanced');
    await page.hover('#fixture .us-stage');
    const held = (await state(page)).index;
    await page.waitForTimeout(700);
    assert.equal((await state(page)).index, held, 'paused while hovered');
    await page.mouse.move(0, 0);
    await page.click('#fixture .us-playpause', { force: true });
    assert.equal(await page.evaluate(() => fx.isPlaying), false);
    const stopped = (await state(page)).index;
    await page.waitForTimeout(700);
    assert.equal((await state(page)).index, stopped, 'stopped');
    await page.close();
  });

  test('manual mode has no autoplay; auto mode hides arrows', async (t) => {
    if (skip) return t.skip(skip);
    const page = await open();
    await mount(page, { mode: 'manual', autoplay: { delay: 200 } });
    await page.waitForTimeout(500);
    assert.equal((await state(page)).index, 0);
    assert.equal(await page.locator('#fixture .us-arrow').count(), 2);
    await page.evaluate(() => fx.update({ mode: 'auto' }));
    assert.equal(await page.locator('#fixture .us-arrow').count(), 0);
    assert.equal(await page.evaluate(() => fx.isPlaying), true);
    await page.close();
  });

  test('swipe gestures change slides', async (t) => {
    if (skip) return t.skip(skip);
    const page = await open();
    await mount(page, { speed: 50, autoplay: false });
    const box = await page.locator('#fixture .us-stage').boundingBox();
    const y = box.y + box.height / 2;
    await page.mouse.move(box.x + box.width * 0.8, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.5, y, { steps: 6 });
    await page.mouse.move(box.x + box.width * 0.2, y, { steps: 6 });
    await page.mouse.up();
    await page.waitForTimeout(200);
    assert.equal((await state(page)).index, 1);
    await page.close();
  });

  test('layers animate in on the active slide', async (t) => {
    if (skip) return t.skip(skip);
    const page = await open();
    await mount(page, { speed: 100, autoplay: false });
    await page.evaluate(() => fx.next());
    const opacity = await page.evaluate(() => {
      const layer = document.querySelectorAll('#fixture .us-slide')[1].querySelector('.us-layer');
      return layer.getAnimations().length;
    });
    assert.ok(opacity >= 1);
    await page.close();
  });

  test('destroy restores the original markup', async (t) => {
    if (skip) return t.skip(skip);
    const page = await open();
    const before = await page.evaluate(() => {
      const root = document.createElement('div');
      root.id = 'restore';
      root.className = 'mine';
      root.innerHTML = '<div data-us-bg="assets/ocean.svg" data-us-overlay="0.3"><p data-us-layer="fade" data-us-split="chars">Hi there</p></div><div>B</div>';
      document.body.append(root);
      const html = root.outerHTML;
      window.r = new UniSlider(root, { kenburns: true, parallax: true, rain: 'storm', ripple: true, navigation: { thumbnails: true } });
      return html;
    });
    const after = await page.evaluate(async () => {
      await r.next();
      r.destroy();
      return document.getElementById('restore').outerHTML;
    });
    assert.equal(after, before);
    await page.close();
  });

  test('carousel loops, drags and respects breakpoints', async (t) => {
    if (skip) return t.skip(skip);
    const page = await open({ viewport: { width: 1200, height: 800 } });
    await mount(page, { type: 'carousel', perView: 1, gap: 10, speed: 50, autoplay: false, breakpoints: { 1000: { perView: 3 } } }, 6);
    assert.equal(await page.evaluate(() => fx.options.perView), 3);
    assert.equal(await page.locator('#fixture .us-slide.is-visible').count(), 3);
    await page.evaluate(() => fx.prev());
    assert.equal((await state(page)).index, 5, 'wraps backwards');
    const box = await page.locator('#fixture .us-stage').boundingBox();
    const y = box.y + box.height / 2;
    await page.mouse.move(box.x + box.width * 0.7, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.45, y, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(300);
    assert.equal((await state(page)).index, 0, 'dragged forward');
    await page.setViewportSize({ width: 700, height: 800 });
    await page.waitForTimeout(300);
    assert.equal(await page.evaluate(() => fx.options.perView), 1);
    await page.close();
  });

  test('ticker keeps moving', async (t) => {
    if (skip) return t.skip(skip);
    const page = await open();
    const read = () => page.evaluate(() => UniSlider.get('#tpl-ticker').engine.pos);
    await page.locator('#tpl-ticker').scrollIntoViewIfNeeded();
    const a = await read();
    await page.waitForTimeout(400);
    assert.ok((await read()) > a);
    await page.close();
  });

  test('reduced motion swaps transitions for fades and skips Ken Burns', async (t) => {
    if (skip) return t.skip(skip);
    const page = await open({ reducedMotion: 'reduce' });
    await mount(page, { transition: 'cube', kenburns: true, autoplay: false });
    assert.equal(await page.evaluate(() => fx.reducedMotion), true);
    assert.equal(await page.evaluate(() => fx.engine.pickTransition(fx.slides[1])), 'fade');
    assert.equal(await page.evaluate(() => fx.modules.has('kenburns')), false);
    await page.close();
  });

  test('addSlide / removeSlide rebuild navigation', async (t) => {
    if (skip) return t.skip(skip);
    const page = await open();
    await mount(page, { speed: 50, autoplay: false });
    await page.evaluate(() => fx.addSlide('<div data-us-title="New">New</div>'));
    assert.equal(await page.locator('#fixture .us-bullet').count(), 5);
    await page.evaluate(() => fx.removeSlide(0));
    assert.equal(await page.locator('#fixture .us-bullet').count(), 4);
    assert.equal(await page.evaluate(() => fx.slides.length), 4);
    assert.deepEqual(errors, []);
    await page.close();
  });

  test('live rain draws on a canvas, strikes lightning and follows per-slide weather', async (t) => {
    if (skip) return t.skip(skip);
    const page = await open();
    await page.evaluate(() => {
      const root = document.createElement('div');
      root.id = 'fixture';
      root.innerHTML = '<div data-us-rain="storm">A</div><div data-us-rain="off">B</div><div>C</div>';
      document.querySelector('main').prepend(root);
      root.scrollIntoView({ block: 'center', behavior: 'instant' });
      window.fx = new UniSlider(root, { speed: 50, autoplay: false, rain: 'drizzle' });
    });
    await page.waitForTimeout(600);
    const painted = () =>
      page.evaluate(() => {
        const canvas = document.querySelector('#fixture .us-rain');
        const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
        let count = 0;
        for (let i = 3; i < data.length; i += 4) if (data[i]) count++;
        return count;
      });
    assert.ok((await painted()) > 500, 'rain pixels drawn');
    assert.equal(await page.evaluate(() => fx.rain.params.lightning > 0.3), true);
    const strikes = await page.evaluate(() => new Promise((resolve) => {
      let n = 0;
      fx.on('lightning', () => n++);
      fx.rain.strike();
      setTimeout(() => resolve(n), 50);
    }));
    assert.equal(strikes, 1);
    await page.evaluate(() => fx.goTo(1));
    await page.waitForTimeout(2500);
    assert.ok((await page.evaluate(() => fx.rain.params.drops)) < 20, 'rain stops on the "off" slide');
    await page.evaluate(() => fx.goTo(2));
    await page.waitForTimeout(1500);
    const drizzle = await page.evaluate(() => fx.rain.params.drops);
    assert.ok(drizzle > 60 && drizzle < 130, `slide without its own weather uses the global one (${drizzle})`);
    await page.close();
  });

  test('ripple clicks and every rain transition clean up after themselves', async (t) => {
    if (skip) return t.skip(skip);
    const page = await open();
    await mount(page, { speed: 300, autoplay: false, ripple: true });
    const box = await page.locator('#fixture .us-stage').boundingBox();
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    assert.ok((await page.locator('#fixture .us-touch-ripple').count()) >= 1);
    await page.waitForTimeout(2200);
    assert.equal(await page.locator('#fixture .us-touch-ripple').count(), 0, 'ripples removed');
    for (const name of await page.evaluate(() => UniSlider.transitionsByCategory().rain)) {
      await page.evaluate((name) => fx.update({ transition: name }), name);
      assert.equal(await page.evaluate(() => fx.next()), true, name);
      const s = await state(page);
      assert.equal(s.transient, 0, `${name} leftovers`);
      assert.equal(await page.locator('#fixture .us-flash, #fixture .us-svg-filter').count(), 0, `${name} overlay`);
    }
    assert.deepEqual(errors, []);
    await page.close();
  });
});
