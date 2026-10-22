import { registerTransition as register } from './registry.js';

const registerTransition = (name, def) => register(name, def, '3d');

const axis = (ctx) => (ctx.vertical ? 'X' : 'Y');
const shift = (ctx, pct) => (ctx.vertical ? `translateY(${pct}%)` : `translateX(${pct}%)`);
// rotateX turns the top edge away for positive angles, rotateY the right edge,
// so the vertical axis needs the opposite sign to fold the same way.
const sign = (ctx) => (ctx.vertical ? -1 : 1);

registerTransition('cube', {
  perspective: '1600px',
  keyframes(ctx) {
    const d = ctx.dir;
    const a = axis(ctx);
    const s = sign(ctx);
    const near = ctx.vertical ? (d > 0 ? 'center top' : 'center bottom') : d > 0 ? 'left center' : 'right center';
    const far = ctx.vertical ? (d > 0 ? 'center bottom' : 'center top') : d > 0 ? 'right center' : 'left center';
    return {
      in: [
        { transformOrigin: near, transform: `${shift(ctx, 100 * d)} rotate${a}(${90 * d * s}deg)` },
        { transformOrigin: near, transform: `${shift(ctx, 0)} rotate${a}(0deg)` },
      ],
      out: [
        { transformOrigin: far, transform: `${shift(ctx, 0)} rotate${a}(0deg)` },
        { transformOrigin: far, transform: `${shift(ctx, -100 * d)} rotate${a}(${-90 * d * s}deg)` },
      ],
    };
  },
});

registerTransition('flip', {
  perspective: '2000px',
  backface: true,
  keyframes(ctx) {
    const a = axis(ctx);
    const deg = 180 * ctx.dir * sign(ctx);
    return {
      in: [{ transform: `rotate${a}(${-deg}deg)` }, { transform: `rotate${a}(0deg)` }],
      out: [{ transform: `rotate${a}(0deg)` }, { transform: `rotate${a}(${deg}deg)` }],
    };
  },
});

registerTransition('cards', {
  perspective: '1400px',
  keyframes(ctx) {
    const a = axis(ctx);
    return {
      in: [
        { transform: `${shift(ctx, 110 * ctx.dir)} rotate${a}(${-25 * ctx.dir * sign(ctx)}deg)` },
        { transform: `${shift(ctx, 0)} rotate${a}(0deg)` },
      ],
      out: [
        { transform: 'translateZ(0) scale(1)', opacity: 1, filter: 'brightness(1)' },
        { transform: 'translateZ(-200px) scale(0.8)', opacity: 0.5, filter: 'brightness(0.5)' },
      ],
    };
  },
});

registerTransition('fold', {
  perspective: '1800px',
  keyframes(ctx) {
    const a = axis(ctx);
    const origin = ctx.vertical ? (ctx.dir > 0 ? 'center top' : 'center bottom') : ctx.dir > 0 ? 'left center' : 'right center';
    return {
      top: 'out',
      in: [{ filter: 'brightness(0.3)' }, { filter: 'brightness(1)' }],
      out: [
        { transformOrigin: origin, transform: `rotate${a}(0deg)`, opacity: 1 },
        { transformOrigin: origin, transform: `rotate${a}(${-100 * ctx.dir * sign(ctx)}deg)`, opacity: 0.4 },
      ],
    };
  },
});
