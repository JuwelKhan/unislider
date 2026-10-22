import { easeFn } from '../core/easing.js';
import { clamp, mod } from '../core/utils.js';
import { carouselEffects } from './effects.js';

const DRAG_THRESHOLD = 6;

/**
 * Carousel engine: a continuous position (`pos`, in slides) is rendered to
 * per-slide transforms. That one model gives seamless looping without cloned
 * DOM, multi-slide views, momentum dragging, 3D effects and ticker mode.
 */
export class CarouselEngine {
  constructor(slider) {
    this.slider = slider;
    this.pos = slider.index;
    this.tween = null;
    this.pendingPos = null;
    this.listeners = [];
    this.tickerFrame = 0;
    this.paused = new Set();
  }

  get count() {
    return this.slider.slides.length;
  }

  mount() {
    const { slider } = this;
    const o = slider.options;
    slider.root.classList.add('us-type-carousel');
    this.vertical = o.direction === 'vertical';
    this.effect = carouselEffects.get(o.effect) ?? carouselEffects.get('slide');
    slider.root.classList.add(`us-effect-${o.effect}`);
    if (this.effect.perspective) slider.track.style.perspective = this.effect.perspective;
    this.measure();
    this.pos = this.posForIndex(slider.index);
    this.render();
    if (o.drag) this.bindDrag();
    if (o.slideToClicked) this.listen(slider.track, 'click', (e) => this.onSlideClick(e));
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
      slide.style[this.vertical ? 'height' : 'width'] = `${this.size}px`;
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
        index: i,
      });
      const x = fx.x ?? base;
      const move = this.vertical ? `translate3d(0, ${x}px, 0)` : `translate3d(${x}px, 0, 0)`;
      slide.style.transform = fx.transform ? `${move} ${fx.transform}` : move;
      slide.style.opacity = fx.opacity === undefined ? '' : String(fx.opacity);
      slide.style.zIndex = fx.zIndex === undefined ? '' : String(fx.zIndex);
      slide.style.filter = fx.filter ?? '';
      const inView = x + this.size > 1 && x < this.viewport - 1 && fx.opacity !== 0;
      slide.classList.toggle('is-visible', inView);
      slide.classList.toggle('is-active', i === activeSlide);
      if (inView) visible.push(i);
    });
    this.visible = visible;
    slider.emit('progress', { position: this.pos, progress: this.progress() });
  }

  progress() {
    if (this.loop) return mod(this.pos, this.count) / Math.max(1, this.count - 1);
    return this.maxPos ? clamp(this.pos / this.maxPos, 0, 1) : 0;
  }

  /** Animate `pos` to a target. Resolves when it arrives (or is interrupted). */
  animateTo(target, duration = this.slider.options.speed) {
    this.stopTween();
    const from = this.pos;
    if (Math.abs(target - from) < 0.0001 || duration <= 0) {
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
    stage.classList.add('us-draggable');
    let state = null;

    const axis = (e) => (this.vertical ? e.clientY : e.clientX);
    const cross = (e) => (this.vertical ? e.clientX : e.clientY);

    this.listen(stage, 'pointerdown', (e) => {
      if (e.button !== 0 || e.target.closest('.us-ui, input, textarea, select, [data-us-nodrag]')) return;
      state = {
        id: e.pointerId,
        start: axis(e),
        startCross: cross(e),
        startPos: this.pos,
        moved: false,
        locked: e.pointerType === 'mouse',
        samples: [{ t: e.timeStamp, v: axis(e) }],
      };
    });

    this.listen(stage, 'pointermove', (e) => {
      if (!state || e.pointerId !== state.id) return;
      const delta = axis(e) - state.start;
      if (!state.locked) {
        const crossDelta = Math.abs(cross(e) - state.startCross);
        if (Math.abs(delta) < DRAG_THRESHOLD && crossDelta < DRAG_THRESHOLD) return;
        if (crossDelta > Math.abs(delta)) {
          state = null; // let the page scroll
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
        stage.classList.add('is-dragging');
        this.slider.emit('dragStart');
      }
      let pos = state.startPos - delta / this.step;
      if (!this.loop) {
        if (pos < 0) pos /= 3;
        else if (pos > this.maxPos) pos = this.maxPos + (pos - this.maxPos) / 3;
      }
      this.pos = pos;
      this.render();
      state.samples.push({ t: e.timeStamp, v: axis(e) });
      if (state.samples.length > 6) state.samples.shift();
      e.preventDefault();
    });

    const release = (e) => {
      if (!state || e.pointerId !== state.id) return;
      const finished = state;
      state = null;
      if (!finished.moved) return;
      this.dragging = false;
      stage.classList.remove('is-dragging');
      stage.releasePointerCapture?.(e.pointerId);
      // swallow the click that follows a drag
      this.listenOnce(stage, 'click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
      });
      const last = finished.samples[finished.samples.length - 1];
      const first = finished.samples.find((sample) => last.t - sample.t <= 100) ?? last;
      const velocity = (last.v - first.v) / Math.max(1, last.t - first.t); // px per ms
      this.release(finished.startPos, axis(e) - finished.start, velocity);
    };
    this.listen(stage, 'pointerup', release);
    this.listen(stage, 'pointercancel', release);
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
      // glide with momentum, at most a couple of views far
      const glide = clamp((-velocity * 300) / this.step, -this.perView * 2, this.perView * 2);
      target = this.pos + glide;
    } else if (Math.abs(velocity) > 0.3) {
      // a flick snaps to the next slide in the flick direction
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
    slider.emit('dragEnd', { velocity });
    if (index !== slider.index) {
      this.pendingPos = { index, pos: target };
      slider.goTo(index, { source: 'drag', dir: Math.sign(target - startPos) || 1 }).then((moved) => {
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
    const slide = e.target.closest('.us-slide');
    if (!slide || e.defaultPrevented) return;
    const i = this.slider.slides.indexOf(slide);
    if (i < 0 || slide.classList.contains('is-active')) return;
    e.preventDefault();
    this.slider.goTo(this.loop || this.center ? i : this.indexForPos(Math.min(i, this.maxPos)), { source: 'click' });
  }

  // ------------------------------------------------------------------ ticker

  startTicker() {
    const { slider } = this;
    const speed = Number(slider.options.ticker);
    let last = performance.now();
    const hover = () => this.paused.add('hover');
    const leave = () => this.paused.delete('hover');
    if (slider.options.autoplay.pauseOnHover) {
      this.listen(slider.root, 'pointerenter', hover);
      this.listen(slider.root, 'pointerleave', leave);
    }
    const tick = (now) => {
      const dt = Math.min(64, now - last);
      last = now;
      if (!this.paused.size && !this.dragging && !this.tween) {
        const dir = slider.options.autoplay.reverse ? -1 : 1;
        this.pos += (dir * (speed * dt)) / 1000 / this.step;
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
    slider.root.classList.remove('us-type-carousel', `us-effect-${slider.options.effect}`);
    slider.stage.classList.remove('us-draggable', 'is-dragging');
    slider.track.style.perspective = '';
    for (const slide of slider.slides) {
      for (const prop of ['transform', 'opacity', 'zIndex', 'filter', 'width', 'height']) slide.style[prop] = '';
      slide.classList.remove('is-visible', 'is-active');
    }
  }
}
