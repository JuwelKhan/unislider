import { easing } from '../core/easing.js';
import { data, pick, settled } from '../core/utils.js';
import { getTransition, transitions } from '../transitions/index.js';

/**
 * Slider engine: slides are stacked on top of each other and swapped with a
 * transition (Web Animations API). Supports every registered transition,
 * per-slide overrides and interruption at any time.
 */
export class SliderEngine {
  constructor(slider) {
    this.slider = slider;
    this.animations = [];
    this.cleanup = null;
  }

  mount() {
    const { slider } = this;
    slider.root.classList.add('us-type-slider');
    slider.root.classList.toggle('us-auto-height', Boolean(slider.options.autoHeight));
    slider.slides[slider.index]?.classList.add('is-active');
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
    if (slider.reducedMotion) return 'fade';
    let value = data(slide, 'transition') ?? slider.options.transition;
    if (typeof value === 'string' && value.includes(',')) value = value.split(',').map((v) => v.trim());
    if (Array.isArray(value)) value = pick(value);
    if (value === 'random') value = pick(transitions.list());
    return value;
  }

  async go({ from, to, dir, immediate }) {
    const { slider } = this;
    const fromEl = slider.slides[from];
    const toEl = slider.slides[to];
    this.finish();

    fromEl.classList.remove('is-active');
    toEl.classList.add('is-active');
    this.syncHeight(to);

    const speed = slider.reducedMotion
      ? Math.min(slider.options.speed, 300)
      : Number(data(toEl, 'speed') ?? slider.options.speed);
    if (immediate || speed <= 0 || from === to) return;

    const def = getTransition(this.pickTransition(toEl)) ?? getTransition('fade');
    this.lastTransition = def.name;
    const stage = slider.stage;
    const ctx = {
      from: fromEl,
      to: toEl,
      dir,
      vertical: slider.options.direction === 'vertical',
      width: stage.clientWidth,
      height: stage.clientHeight,
      speed,
      easing: easing(data(toEl, 'easing') ?? slider.options.easing),
      stage,
      slider,
    };

    fromEl.classList.add('is-leaving');
    toEl.classList.add('is-entering');
    if (def.perspective) slider.track.style.perspective = def.perspective;

    let animations = [];
    let extraCleanup = null;
    if (def.run) {
      const result = def.run(ctx);
      animations = Array.isArray(result) ? result : result?.animations ?? [];
      extraCleanup = result?.cleanup ?? null;
    } else {
      const frames = def.keyframes(ctx);
      const timing = { duration: speed, easing: frames.easing ?? ctx.easing, fill: 'both' };
      if (frames.top === 'out') fromEl.style.zIndex = '3';
      if (def.backface) {
        fromEl.style.backfaceVisibility = 'hidden';
        toEl.style.backfaceVisibility = 'hidden';
      }
      animations = [frames.in && toEl.animate(frames.in, timing), frames.out && fromEl.animate(frames.out, timing)];
    }
    animations = animations.filter(Boolean);
    slider.emit('transition:start', { from, to, dir, name: def.name, speed });

    const cleanup = () => {
      for (const animation of animations) animation.cancel();
      extraCleanup?.();
      fromEl.classList.remove('is-leaving');
      toEl.classList.remove('is-entering');
      for (const node of [fromEl, toEl]) {
        node.style.zIndex = '';
        node.style.backfaceVisibility = '';
      }
      slider.track.style.perspective = '';
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
    this.slider.root.classList.remove('us-type-slider', 'us-auto-height');
    this.slider.stage.style.height = '';
  }
}
