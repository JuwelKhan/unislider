import { registerTransition } from './registry.js';
import { snapshot, tileIn, tileOut } from './tiles.js';

/**
 * Rain transitions — the signature effects of UniSlider.
 * Strips fall like rain, drip like paint, ripple like a puddle, and storms
 * come with lightning.
 */

const GRAVITY = 'cubic-bezier(0.55, 0, 0.85, 0.35)';
const rand = (min, max) => min + Math.random() * (max - min);
const strips = (ctx, desktop, mobile) => (ctx.width < 600 ? mobile : desktop);

/** A white flash on top of the stage (lightning). */
function flash(ctx, at = 0.05, strength = 0.9) {
  const node = document.createElement('div');
  node.className = 'us-flash';
  ctx.stage.append(node);
  const animation = node.animate(
    [
      { opacity: 0 },
      { opacity: strength, offset: at },
      { opacity: 0.05, offset: at + 0.04 },
      { opacity: strength * 0.75, offset: at + 0.08 },
      { opacity: 0, offset: Math.min(1, at + 0.3) },
      { opacity: 0 },
    ],
    { duration: ctx.speed, easing: 'linear' },
  );
  return { animation, remove: () => node.remove() };
}

/** Combine several { animations, cleanup } results. */
const combine = (...parts) => ({
  animations: parts.flatMap((p) => p.animations ?? [p.animation]),
  cleanup: () => parts.forEach((p) => (p.cleanup ?? p.remove)?.()),
});

// Thin strips of the next slide fall in like rain streaks.
registerTransition('rain', {
  category: 'rain',
  run(ctx) {
    const cols = strips(ctx, 28, 14);
    return tileIn(ctx, { cols }, ({ tile }) => {
      const duration = ctx.speed * rand(0.35, 0.5);
      return tile.animate(
        [
          { transform: 'translateY(-110%) scaleY(1.5)', opacity: 0.4 },
          { transform: 'translateY(0) scaleY(1)', opacity: 1 },
        ],
        { duration, delay: rand(0, ctx.speed - duration), easing: GRAVITY, fill: 'both' },
      );
    });
  },
});

// Small tiles settle gently from top to bottom.
registerTransition('drizzle', {
  category: 'rain',
  run(ctx) {
    const cols = strips(ctx, 16, 8);
    const rows = Math.max(4, Math.round((cols * ctx.height) / ctx.width));
    const duration = ctx.speed * 0.35;
    return tileIn(ctx, { cols, rows }, ({ tile, row }) =>
      tile.animate(
        [
          { transform: 'translateY(-40%)', opacity: 0 },
          { transform: 'translateY(0)', opacity: 1 },
        ],
        {
          duration,
          delay: (row / rows) * ctx.speed * 0.35 + rand(0, ctx.speed * 0.3),
          easing: 'ease-out',
          fill: 'both',
        },
      ),
    );
  },
});

// Heavy rain: fast columns that splash (squash) when they land.
registerTransition('downpour', {
  category: 'rain',
  run(ctx) {
    const cols = strips(ctx, 20, 10);
    return tileIn(ctx, { cols }, ({ tile }) => {
      const duration = ctx.speed * rand(0.45, 0.6);
      return tile.animate(
        [
          { transform: 'translateY(-105%) scaleY(1.7)', transformOrigin: 'bottom' },
          { transform: 'translateY(0) scaleY(0.9)', transformOrigin: 'bottom', offset: 0.7 },
          { transform: 'translateY(0) scaleY(1.04)', transformOrigin: 'bottom', offset: 0.85 },
          { transform: 'translateY(0) scaleY(1)', transformOrigin: 'bottom' },
        ],
        { duration, delay: rand(0, ctx.speed * 0.35), easing: 'linear', fill: 'both' },
      );
    });
  },
});

// Wind-driven diagonal rain with a lightning flash.
registerTransition('storm', {
  category: 'rain',
  run(ctx) {
    const cols = strips(ctx, 18, 9);
    const wind = ctx.dir > 0 ? -1 : 1;
    const rain = tileIn(ctx, { cols }, ({ tile }) => {
      const duration = ctx.speed * rand(0.35, 0.5);
      return tile.animate(
        [
          { transform: `translate(${wind * 35}%, -110%) skewX(${wind * -14}deg)`, opacity: 0.3 },
          { transform: 'translate(0, 0) skewX(0deg)', opacity: 1 },
        ],
        { duration, delay: rand(ctx.speed * 0.1, ctx.speed - duration), easing: GRAVITY, fill: 'both' },
      );
    });
    return combine(rain, flash(ctx, 0.04));
  },
});

// Lightning strikes twice and the scene changes in the flash.
registerTransition('thunder', {
  category: 'rain',
  keyframes: () => ({
    easing: 'linear',
    in: [
      { opacity: 0, filter: 'brightness(1)' },
      { opacity: 0, filter: 'brightness(1)', offset: 0.18 },
      { opacity: 1, filter: 'brightness(3.2)', offset: 0.2 },
      { opacity: 1, filter: 'brightness(0.7)', offset: 0.3 },
      { opacity: 1, filter: 'brightness(2.2)', offset: 0.34 },
      { opacity: 1, filter: 'brightness(1)' },
    ],
    out: [
      { opacity: 1, filter: 'brightness(1)' },
      { opacity: 1, filter: 'brightness(2.6)', offset: 0.06 },
      { opacity: 1, filter: 'brightness(0.6)', offset: 0.1 },
      { opacity: 1, filter: 'brightness(0.6)', offset: 0.18 },
      { opacity: 1, filter: 'brightness(0.6)', offset: 0.3 },
      { opacity: 1, filter: 'brightness(0.6)' },
    ],
  }),
});

// Raindrops hit a puddle: the next slide spreads out from several ripples.
registerTransition('ripple', {
  category: 'rain',
  run(ctx) {
    const overlay = document.createElement('div');
    overlay.className = 'us-tiles';
    ctx.stage.append(overlay);
    const count = ctx.width < 600 ? 4 : 6;
    const animations = [ctx.to.animate([{ opacity: 0 }, { opacity: 0 }], { duration: ctx.speed })];
    for (let i = 0; i < count; i++) {
      const x = i === 0 ? 50 : rand(10, 90);
      const y = i === 0 ? 55 : rand(15, 85);
      const delay = i === 0 ? 0 : rand(0, ctx.speed * 0.45);
      const duration = ctx.speed - delay;
      const layer = snapshot(ctx.to);
      layer.classList.add('us-ripple-layer');
      overlay.append(layer);
      animations.push(
        layer.animate([{ clipPath: `circle(0% at ${x}% ${y}%)` }, { clipPath: `circle(150% at ${x}% ${y}%)` }], {
          duration,
          delay,
          easing: 'cubic-bezier(0.3, 0.1, 0.4, 1)',
          fill: 'both',
        }),
      );
      for (let r = 0; r < 2; r++) {
        const ring = document.createElement('span');
        ring.className = 'us-ripple-ring';
        Object.assign(ring.style, { left: `${x}%`, top: `${y}%` });
        overlay.append(ring);
        animations.push(
          ring.animate(
            [
              { transform: 'translate(-50%, -50%) scale(0)', opacity: 0.9 },
              { transform: `translate(-50%, -50%) scale(${18 - r * 6})`, opacity: 0 },
            ],
            { duration: duration * 0.8, delay: delay + r * 120, easing: 'cubic-bezier(0.2, 0.6, 0.3, 1)', fill: 'both' },
          ),
        );
      }
    }
    return { animations, cleanup: () => overlay.remove() };
  },
});

// The next slide drips down like wet paint (uneven columns, rounded tips).
registerTransition('drip', {
  category: 'rain',
  run(ctx) {
    const cols = strips(ctx, 14, 7);
    return tileIn(ctx, { cols }, ({ tile }) => {
      const duration = ctx.speed * rand(0.55, 0.8);
      return tile.animate(
        [
          { clipPath: 'inset(0 0 100% 0 round 0 0 50% 50%)' },
          { clipPath: 'inset(0 0 0% 0 round 0 0 0% 0%)' },
        ],
        { duration, delay: rand(0, ctx.speed - duration), easing: 'cubic-bezier(0.45, 0, 0.3, 1)', fill: 'both' },
      );
    });
  },
});

// The current slide is washed away downwards, column by column.
registerTransition('melt', {
  category: 'rain',
  run(ctx) {
    const cols = strips(ctx, 16, 8);
    return tileOut(ctx, { cols }, ({ tile }) => {
      const duration = ctx.speed * rand(0.5, 0.75);
      return tile.animate(
        [
          { transform: 'translateY(0) scaleY(1)', opacity: 1, transformOrigin: 'top' },
          { transform: 'translateY(110%) scaleY(1.4)', opacity: 0.2, transformOrigin: 'top' },
        ],
        { duration, delay: rand(0, ctx.speed - duration), easing: GRAVITY, fill: 'both' },
      );
    });
  },
});

// Misted glass: the scene fogs over and clears into the next one.
registerTransition('mist', {
  category: 'rain',
  keyframes: () => ({
    in: [
      { opacity: 0, filter: 'blur(28px) brightness(1.5) saturate(0.3)', transform: 'scale(1.08)' },
      { opacity: 1, filter: 'blur(0px) brightness(1) saturate(1)', transform: 'scale(1)' },
    ],
    out: [
      { opacity: 1, filter: 'blur(0px) brightness(1) saturate(1)', transform: 'scale(1)' },
      { opacity: 1, filter: 'blur(28px) brightness(1.5) saturate(0.3)', transform: 'scale(1.04)' },
    ],
  }),
});

// A single big drop: the next slide bursts out from the centre with a bounce.
registerTransition('splash', {
  category: 'rain',
  keyframes: () => ({
    easing: 'cubic-bezier(0.25, 0.8, 0.35, 1)',
    in: [
      { clipPath: 'circle(0% at 50% 55%)', transform: 'scale(1.35)' },
      { clipPath: 'circle(48% at 50% 55%)', transform: 'scale(1.08)', offset: 0.45 },
      { clipPath: 'circle(40% at 50% 55%)', transform: 'scale(1.1)', offset: 0.55 },
      { clipPath: 'circle(80% at 50% 55%)', transform: 'scale(1)' },
    ],
    out: [
      { transform: 'scale(1)', filter: 'brightness(1)' },
      { transform: 'scale(0.9)', filter: 'brightness(0.6)' },
    ],
  }),
});

let filterId = 0;

// Liquid: both slides wobble like a reflection on water while crossfading
// (SVG turbulence + displacement; browsers without it get a plain crossfade).
registerTransition('liquid', {
  category: 'rain',
  run(ctx) {
    const id = `us-liquid-${++filterId}`;
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'us-svg-filter');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = `<filter id="${id}" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.006 0.03" numOctaves="2" seed="${Math.round(rand(1, 99))}" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G"/>
    </filter>`;
    ctx.stage.append(svg);
    const map = svg.querySelector('feDisplacementMap');
    const turbulence = svg.querySelector('feTurbulence');
    ctx.from.style.filter = `url(#${id})`;
    ctx.to.style.filter = `url(#${id})`;
    const fade = ctx.to.animate([{ opacity: 0 }, { opacity: 1 }], { duration: ctx.speed, easing: 'ease-in-out', fill: 'both' });
    let frame = 0;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / ctx.speed);
      map.setAttribute('scale', String(Math.sin(t * Math.PI) * 90));
      turbulence.setAttribute('baseFrequency', `${0.006 + t * 0.004} ${0.03 - t * 0.01}`);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return {
      animations: [fade],
      cleanup() {
        cancelAnimationFrame(frame);
        ctx.from.style.filter = '';
        ctx.to.style.filter = '';
        svg.remove();
      },
    };
  },
});
