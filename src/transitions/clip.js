import { registerTransition as register } from './registry.js';

const registerTransition = (name, def) => register(name, def, 'mask');

const still = [{ opacity: 1 }, { opacity: 1 }];
const drift = (ctx, pct) => (ctx.vertical ? `translateY(${pct}%)` : `translateX(${pct}%)`);

registerTransition('wipe', (ctx) => {
  // clip from the side the next slide arrives from
  const sides = ctx.vertical ? ['0 0 0 0', ctx.dir > 0 ? '100% 0 0 0' : '0 0 100% 0'] : ['0 0 0 0', ctx.dir > 0 ? '0 0 0 100%' : '0 100% 0 0'];
  return {
    in: [{ clipPath: `inset(${sides[1]})` }, { clipPath: `inset(${sides[0]})` }],
    out: [{ transform: drift(ctx, 0) }, { transform: drift(ctx, -20 * ctx.dir) }],
  };
});

registerTransition('circle', () => ({
  in: [{ clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)' }],
  out: [{ transform: 'scale(1)' }, { transform: 'scale(1.1)' }],
}));

registerTransition('diamond', () => ({
  in: [
    { clipPath: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)' },
    { clipPath: 'polygon(50% -50%, 150% 50%, 50% 150%, -50% 50%)' },
  ],
  out: still,
}));

registerTransition('curtain', (ctx) => ({
  in: [
    { clipPath: ctx.vertical ? 'inset(50% 0 50% 0)' : 'inset(0 50% 0 50%)' },
    { clipPath: 'inset(0 0 0 0)' },
  ],
  out: [{ transform: 'scale(1)' }, { transform: 'scale(0.92)' }],
}));

registerTransition('diagonal', (ctx) => {
  const start = ctx.dir > 0
    ? 'polygon(100% 0, 100% 0, 100% 0, 100% 0)'
    : 'polygon(0 100%, 0 100%, 0 100%, 0 100%)';
  const end = ctx.dir > 0
    ? 'polygon(100% 0, -100% 0, 100% 200%, 100% 0)'
    : 'polygon(0 100%, 0 -100%, 200% 100%, 0 100%)';
  return { in: [{ clipPath: start }, { clipPath: end }], out: still };
});
