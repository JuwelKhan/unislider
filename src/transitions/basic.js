import { registerTransition as register } from './registry.js';

const registerTransition = (name, def) => register(name, def, 'classic');

/** translate along the slider axis: move(ctx, 100) → translateX(100%) */
const move = (ctx, pct) => (ctx.vertical ? `translate3d(0, ${pct}%, 0)` : `translate3d(${pct}%, 0, 0)`);
const still = [{ opacity: 1 }, { opacity: 1 }];

registerTransition('fade', () => ({ in: [{ opacity: 0 }, { opacity: 1 }], out: still }));

registerTransition('fade-through', () => ({
  in: [{ opacity: 0 }, { opacity: 0, offset: 0.45 }, { opacity: 1 }],
  out: [{ opacity: 1 }, { opacity: 0, offset: 0.45 }, { opacity: 0 }],
}));

registerTransition('slide', (ctx) => ({
  in: [{ transform: move(ctx, 100 * ctx.dir) }, { transform: move(ctx, 0) }],
  out: [{ transform: move(ctx, 0) }, { transform: move(ctx, -100 * ctx.dir) }],
}));

registerTransition('slide-vertical', (ctx) => {
  const c = { ...ctx, vertical: !ctx.vertical };
  return {
    in: [{ transform: move(c, 100 * ctx.dir) }, { transform: move(c, 0) }],
    out: [{ transform: move(c, 0) }, { transform: move(c, -100 * ctx.dir) }],
  };
});

registerTransition('slide-over', (ctx) => ({
  in: [{ transform: move(ctx, 100 * ctx.dir) }, { transform: move(ctx, 0) }],
  out: [
    { transform: move(ctx, 0), filter: 'brightness(1)' },
    { transform: move(ctx, -30 * ctx.dir), filter: 'brightness(0.5)' },
  ],
}));

registerTransition('reveal', (ctx) => ({
  top: 'out',
  in: [{ transform: 'scale(1.1)' }, { transform: 'scale(1)' }],
  out: [{ transform: move(ctx, 0) }, { transform: move(ctx, -100 * ctx.dir) }],
}));

registerTransition('parallax', (ctx) => ({
  in: [{ transform: move(ctx, 100 * ctx.dir) }, { transform: move(ctx, 0) }],
  out: [{ transform: move(ctx, 0) }, { transform: move(ctx, -45 * ctx.dir) }],
}));

registerTransition('stack', (ctx) => ({
  in: [{ transform: move({ ...ctx, vertical: true }, 100) }, { transform: move({ ...ctx, vertical: true }, 0) }],
  out: [
    { transform: 'scale(1)', filter: 'brightness(1)' },
    { transform: 'scale(0.88)', filter: 'brightness(0.4)' },
  ],
}));

registerTransition('zoom-in', () => ({
  in: [
    { opacity: 0, transform: 'scale(0.6)' },
    { opacity: 1, transform: 'scale(1)' },
  ],
  out: [{ transform: 'scale(1)' }, { transform: 'scale(1.2)' }],
}));

registerTransition('zoom-out', () => ({
  top: 'out',
  in: [{ transform: 'scale(0.85)' }, { transform: 'scale(1)' }],
  out: [
    { opacity: 1, transform: 'scale(1)' },
    { opacity: 0, transform: 'scale(1.5)' },
  ],
}));

registerTransition('blur', () => ({
  in: [
    { opacity: 0, filter: 'blur(24px)', transform: 'scale(1.06)' },
    { opacity: 1, filter: 'blur(0px)', transform: 'scale(1)' },
  ],
  out: [{ filter: 'blur(0px)' }, { filter: 'blur(24px)' }],
}));

registerTransition('skew', (ctx) => {
  const axis = ctx.vertical ? 'skewY' : 'skewX';
  return {
    in: [
      { transform: `${move(ctx, 100 * ctx.dir)} ${axis}(${-18 * ctx.dir}deg)` },
      { transform: `${move(ctx, 0)} ${axis}(0deg)` },
    ],
    out: [
      { transform: `${move(ctx, 0)} ${axis}(0deg)` },
      { transform: `${move(ctx, -100 * ctx.dir)} ${axis}(${18 * ctx.dir}deg)` },
    ],
  };
});

registerTransition('rotate', (ctx) => ({
  in: [
    { opacity: 0, transform: `rotate(${10 * ctx.dir}deg) scale(1.35)` },
    { opacity: 1, transform: 'rotate(0deg) scale(1)' },
  ],
  out: [{ transform: 'scale(1)' }, { transform: 'scale(0.9)' }],
}));

registerTransition('glitch', (ctx) => {
  const x = (pct) => move(ctx, pct * ctx.dir);
  return {
    in: [
      { opacity: 0, transform: x(6), filter: 'hue-rotate(90deg) saturate(3)' },
      { opacity: 1, transform: x(-4), filter: 'hue-rotate(-60deg) saturate(2)', offset: 0.2 },
      { opacity: 0.6, transform: x(3), filter: 'hue-rotate(40deg) saturate(2.5)', offset: 0.4 },
      { opacity: 1, transform: x(-2), filter: 'hue-rotate(-20deg) saturate(1.5)', offset: 0.6 },
      { opacity: 1, transform: x(0), filter: 'hue-rotate(0deg) saturate(1)' },
    ],
    out: still,
  };
});
