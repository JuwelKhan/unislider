import { createRegistry } from '../core/registry.js';
import { clamp } from '../core/utils.js';

/**
 * Carousel effects map a slide's distance from the current position
 * (`offset`, in slides, fractional while moving) to a style.
 * Return { x?, transform?, opacity?, zIndex?, filter? }.
 */
export const carouselEffects = createRegistry('carousel effect', (fx) => fx && typeof fx.apply === 'function');

export function registerCarouselEffect(name, fx) {
  return carouselEffects.register(name, typeof fx === 'function' ? { apply: fx } : fx);
}

const rot = (ctx) => (ctx.vertical ? 'rotateX' : 'rotateY');
const flip = (ctx) => (ctx.vertical ? -1 : 1);

registerCarouselEffect('slide', () => ({}));

registerCarouselEffect('fade', ({ offset, origin }) => {
  const a = Math.abs(offset);
  return { x: origin, opacity: clamp(1 - a, 0, 1), zIndex: Math.round(100 - a * 10) };
});

registerCarouselEffect('scale', ({ offset }) => {
  const a = Math.min(Math.abs(offset), 1);
  return { transform: `scale(${1 - a * 0.18})`, opacity: 1 - a * 0.45 };
});

registerCarouselEffect('coverflow', {
  perspective: '1200px',
  apply(ctx) {
    const { offset, size } = ctx;
    const a = Math.abs(offset);
    const c = clamp(offset, -1, 1);
    return {
      transform: `translateZ(${-Math.min(a, 3) * size * 0.3}px) ${rot(ctx)}(${-c * 50 * flip(ctx)}deg)`,
      zIndex: Math.round(100 - a * 10),
      opacity: clamp(ctx.perView / 2 + 1.5 - a, 0, 1),
    };
  },
});

registerCarouselEffect('cards', ({ offset, origin, size }) => {
  if (offset <= 0) return { zIndex: 100 };
  const a = Math.min(offset, 4);
  return {
    x: origin + a * size * 0.06,
    transform: `scale(${1 - a * 0.07})`,
    zIndex: Math.round(100 - offset * 10),
    opacity: clamp(4 - offset, 0, 1),
    filter: `brightness(${1 - a * 0.12})`,
  };
});

registerCarouselEffect('ring', {
  perspective: '1600px',
  apply(ctx) {
    const { offset, origin, count, size } = ctx;
    const angle = 360 / Math.max(count, 6);
    const radius = Math.round(size / 2 / Math.tan(Math.PI / Math.max(count, 6))) + 20;
    const deg = offset * angle * flip(ctx);
    const facing = Math.cos((offset * angle * Math.PI) / 180);
    return {
      x: origin,
      transform: `translateZ(${-radius}px) ${rot(ctx)}(${deg}deg) translateZ(${radius}px)`,
      zIndex: Math.round(facing * 100),
      opacity: clamp(0.25 + facing, 0, 1),
    };
  },
});

// Slides float on a gentle wave.
registerCarouselEffect('wave', ({ offset, size, vertical }) => {
  const lift = Math.sin(offset * 1.1) * size * 0.12;
  const tilt = Math.max(-12, Math.min(12, offset * 5));
  return {
    transform: vertical ? `translateX(${lift}px) rotate(${-tilt}deg)` : `translateY(${lift}px) rotate(${tilt}deg)`,
    zIndex: Math.round(100 - Math.abs(offset) * 10),
  };
});

// Slides step down like a waterfall on both sides of the active one.
registerCarouselEffect('cascade', ({ offset, size, vertical }) => {
  const a = Math.min(Math.abs(offset), 4);
  const drop = a * size * 0.16;
  return {
    transform: `${vertical ? `translateX(${drop}px)` : `translateY(${drop}px)`} scale(${1 - a * 0.1})`,
    opacity: clamp(1.2 - a * 0.3, 0, 1),
    zIndex: Math.round(100 - a * 10),
    filter: a > 0.01 ? `brightness(${1 - a * 0.15})` : 'none',
  };
});

registerCarouselEffect('depth', ({ offset }) => {
  const a = Math.min(Math.abs(offset), 3);
  return {
    transform: `scale(${1 - a * 0.12})`,
    filter: a > 0.01 ? `blur(${a * 2.5}px)` : 'none',
    opacity: 1 - a * 0.2,
    zIndex: Math.round(100 - a * 10),
  };
});
