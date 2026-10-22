import { createRegistry } from '../core/registry.js';

/**
 * Layer animation presets. `keyframes` is an array or a function of options
 * ({ distance }) → array. In-animations play forwards, out-animations play
 * the same preset reversed.
 */
export const layerPresets = createRegistry(
  'layer animation',
  (p) => p && (Array.isArray(p.keyframes) || typeof p.keyframes === 'function'),
);

/** Infinite "idle" animations that start after a layer has animated in. */
export const loopPresets = createRegistry('loop animation', (p) => p && Array.isArray(p.keyframes));

export function registerLayerAnimation(name, preset) {
  return layerPresets.register(name, Array.isArray(preset) ? { keyframes: preset } : preset);
}

export function registerLoopAnimation(name, preset) {
  return loopPresets.register(name, Array.isArray(preset) ? { keyframes: preset } : preset);
}

export function presetKeyframes(name, options = {}) {
  const preset = layerPresets.get(name) ?? layerPresets.get('fade');
  const keyframes = typeof preset.keyframes === 'function' ? preset.keyframes(options) : preset.keyframes;
  return { ...preset, keyframes };
}

const fadeMove = (x, y) => ({ distance = 40 } = {}) => [
  { opacity: 0, transform: `translate3d(${x * distance}px, ${y * distance}px, 0)` },
  { opacity: 1, transform: 'translate3d(0, 0, 0)' },
];

const mask = (from) => [
  { transform: from, clipPath: maskClip[from] },
  { transform: 'translate(0, 0)', clipPath: 'inset(0 0 0 0)' },
];
// Clipping the moving element by the distance it travelled keeps it inside
// its original box, which reads as a mask reveal without wrapper elements.
const maskClip = {
  'translate(0, 100%)': 'inset(0 0 100% 0)',
  'translate(0, -100%)': 'inset(100% 0 0 0)',
  'translate(100%, 0)': 'inset(0 100% 0 0)',
  'translate(-100%, 0)': 'inset(0 0 0 100%)',
};

const IN = {
  fade: { keyframes: [{ opacity: 0 }, { opacity: 1 }] },
  'fade-up': { keyframes: fadeMove(0, 1) },
  'fade-down': { keyframes: fadeMove(0, -1) },
  'fade-left': { keyframes: fadeMove(1, 0) },
  'fade-right': { keyframes: fadeMove(-1, 0) },
  'slide-up': { keyframes: ({ distance = 120 } = {}) => fadeMove(0, 1)({ distance }), easing: 'expo-out' },
  'slide-left': { keyframes: ({ distance = 160 } = {}) => fadeMove(1, 0)({ distance }), easing: 'expo-out' },
  'mask-up': { keyframes: mask('translate(0, 100%)'), easing: 'expo-out' },
  'mask-down': { keyframes: mask('translate(0, -100%)'), easing: 'expo-out' },
  'mask-left': { keyframes: mask('translate(100%, 0)'), easing: 'expo-out' },
  'mask-right': { keyframes: mask('translate(-100%, 0)'), easing: 'expo-out' },
  'zoom-in': {
    keyframes: [
      { opacity: 0, transform: 'scale(0.5)' },
      { opacity: 1, transform: 'scale(1)' },
    ],
  },
  'zoom-out': {
    keyframes: [
      { opacity: 0, transform: 'scale(1.6)' },
      { opacity: 1, transform: 'scale(1)' },
    ],
  },
  pop: {
    keyframes: [
      { opacity: 0, transform: 'scale(0.3)' },
      { opacity: 1, transform: 'scale(1)' },
    ],
    easing: 'back',
  },
  'blur-in': {
    keyframes: [
      { opacity: 0, filter: 'blur(16px)', transform: 'scale(1.15)' },
      { opacity: 1, filter: 'blur(0px)', transform: 'scale(1)' },
    ],
  },
  'rotate-in': {
    keyframes: [
      { opacity: 0, transform: 'rotate(-120deg) scale(0.6)' },
      { opacity: 1, transform: 'rotate(0deg) scale(1)' },
    ],
  },
  'flip-x': {
    keyframes: [
      { opacity: 0, transform: 'perspective(800px) rotateX(90deg)' },
      { opacity: 1, transform: 'perspective(800px) rotateX(0deg)' },
    ],
    easing: 'back',
  },
  'flip-y': {
    keyframes: [
      { opacity: 0, transform: 'perspective(800px) rotateY(90deg)' },
      { opacity: 1, transform: 'perspective(800px) rotateY(0deg)' },
    ],
    easing: 'back',
  },
  'skew-in': {
    keyframes: [
      { opacity: 0, transform: 'translateX(-80px) skewX(30deg)' },
      { opacity: 1, transform: 'translateX(0) skewX(0deg)' },
    ],
    easing: 'expo-out',
  },
  'light-speed': {
    keyframes: [
      { opacity: 0, transform: 'translateX(60%) skewX(-30deg)' },
      { opacity: 1, transform: 'translateX(-4%) skewX(12deg)', offset: 0.6 },
      { opacity: 1, transform: 'translateX(0) skewX(0deg)' },
    ],
  },
  drop: {
    keyframes: [
      { opacity: 0, transform: 'translateY(-120%)' },
      { opacity: 1, transform: 'translateY(0)', offset: 0.6 },
      { opacity: 1, transform: 'translateY(-12%)', offset: 0.8 },
      { opacity: 1, transform: 'translateY(0)' },
    ],
    easing: 'ease-out',
  },
  'bounce-in': {
    keyframes: [
      { opacity: 0, transform: 'scale(0.3)' },
      { opacity: 1, transform: 'scale(1.08)', offset: 0.5 },
      { opacity: 1, transform: 'scale(0.95)', offset: 0.75 },
      { opacity: 1, transform: 'scale(1)' },
    ],
    easing: 'ease-out',
  },
  swing: {
    keyframes: [
      { opacity: 0, transformOrigin: 'top center', transform: 'rotate(-30deg)' },
      { opacity: 1, transformOrigin: 'top center', transform: 'rotate(12deg)', offset: 0.5 },
      { opacity: 1, transformOrigin: 'top center', transform: 'rotate(-6deg)', offset: 0.75 },
      { opacity: 1, transformOrigin: 'top center', transform: 'rotate(0deg)' },
    ],
    easing: 'ease-out',
  },
  'roll-in': {
    keyframes: [
      { opacity: 0, transform: 'translateX(-100%) rotate(-120deg)' },
      { opacity: 1, transform: 'translateX(0) rotate(0deg)' },
    ],
  },
  tracking: {
    keyframes: [
      { opacity: 0, letterSpacing: '0.6em', filter: 'blur(8px)' },
      { opacity: 1, letterSpacing: 'normal', filter: 'blur(0px)' },
    ],
  },
  typewriter: {
    keyframes: [
      { opacity: 0, offset: 0 },
      { opacity: 0, offset: 0.99 },
      { opacity: 1, offset: 1 },
    ],
    duration: 60,
    easing: 'linear',
  },
};

// Rain-themed entrances
Object.assign(IN, {
  raindrop: {
    keyframes: [
      { opacity: 0, transform: 'translateY(-140px) scale(0.85, 1.35)' },
      { opacity: 1, transform: 'translateY(0) scale(0.9, 1.2)', offset: 0.55 },
      { opacity: 1, transform: 'translateY(0) scale(1.15, 0.8)', offset: 0.7 },
      { opacity: 1, transform: 'translateY(0) scale(0.97, 1.05)', offset: 0.85 },
      { opacity: 1, transform: 'translateY(0) scale(1, 1)' },
    ],
    easing: 'ease-in',
    duration: 1000,
  },
  'splash-in': {
    keyframes: [
      { opacity: 0, transform: 'scale(0, 0)' },
      { opacity: 1, transform: 'scale(1.25, 0.7)', offset: 0.45 },
      { opacity: 1, transform: 'scale(0.9, 1.12)', offset: 0.65 },
      { opacity: 1, transform: 'scale(1.04, 0.97)', offset: 0.82 },
      { opacity: 1, transform: 'scale(1, 1)' },
    ],
    easing: 'ease-out',
  },
  'drip-in': {
    keyframes: [
      { clipPath: 'inset(0 0 100% 0 round 0 0 40% 40%)', transform: 'translateY(-14px) scaleY(1.12)', transformOrigin: 'top' },
      { clipPath: 'inset(0 0 0% 0 round 0 0 0% 0%)', transform: 'translateY(0) scaleY(1)', transformOrigin: 'top' },
    ],
    easing: 'in-out',
    duration: 1100,
  },
  'ripple-in': {
    keyframes: [
      { opacity: 0, clipPath: 'circle(0% at 50% 50%)', transform: 'scale(0.9)' },
      { opacity: 1, clipPath: 'circle(75% at 50% 50%)', transform: 'scale(1)' },
    ],
  },
  'mist-in': {
    keyframes: [
      { opacity: 0, filter: 'blur(14px) brightness(1.6)', transform: 'translateY(12px) scale(1.06)' },
      { opacity: 1, filter: 'blur(0px) brightness(1)', transform: 'translateY(0) scale(1)' },
    ],
    duration: 1300,
  },
  rainfall: {
    keyframes: [
      { opacity: 0, transform: 'translateY(-1.4em) scaleY(1.6)' },
      { opacity: 1, transform: 'translateY(0.06em) scaleY(0.88)', offset: 0.8 },
      { opacity: 1, transform: 'translateY(0) scaleY(1)' },
    ],
    easing: 'cubic-bezier(0.55, 0, 0.85, 0.35)',
    duration: 650,
  },
  'wave-in': {
    keyframes: [
      { opacity: 0, transform: 'translateY(0.7em) rotate(10deg)' },
      { opacity: 1, transform: 'translateY(-0.12em) rotate(-3deg)', offset: 0.65 },
      { opacity: 1, transform: 'translateY(0) rotate(0deg)' },
    ],
    duration: 800,
  },
  'wash-in': {
    keyframes: [
      { opacity: 0, transform: 'translateX(-50px) skewX(20deg)', filter: 'blur(6px)' },
      { opacity: 1, transform: 'translateX(0) skewX(0deg)', filter: 'blur(0px)' },
    ],
    easing: 'expo-out',
  },
});

const LOOP = {
  float: { keyframes: [{ transform: 'translateY(0)' }, { transform: 'translateY(-14px)' }], duration: 2600 },
  pulse: { keyframes: [{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }], duration: 1400 },
  spin: { keyframes: [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], duration: 8000, direction: 'normal', easing: 'linear' },
  wiggle: { keyframes: [{ transform: 'rotate(-3deg)' }, { transform: 'rotate(3deg)' }], duration: 600 },
  sway: { keyframes: [{ transform: 'translateX(-10px)' }, { transform: 'translateX(10px)' }], duration: 3000 },
  bounce: {
    keyframes: [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-18px)', offset: 0.4 },
      { transform: 'translateY(0)', offset: 0.8 },
      { transform: 'translateY(0)' },
    ],
    duration: 1600,
    direction: 'normal',
  },
  heartbeat: {
    keyframes: [
      { transform: 'scale(1)' },
      { transform: 'scale(1.12)', offset: 0.14 },
      { transform: 'scale(1)', offset: 0.28 },
      { transform: 'scale(1.12)', offset: 0.42 },
      { transform: 'scale(1)', offset: 0.7 },
      { transform: 'scale(1)' },
    ],
    duration: 1600,
    direction: 'normal',
  },
  blink: { keyframes: [{ opacity: 1 }, { opacity: 0.25 }], duration: 900 },
  drip: {
    keyframes: [
      { transform: 'translateY(0) scaleY(1)', transformOrigin: 'top' },
      { transform: 'translateY(2px) scaleY(1.06)', transformOrigin: 'top' },
    ],
    duration: 1800,
  },
  bob: {
    keyframes: [{ transform: 'translateY(0) rotate(-2deg)' }, { transform: 'translateY(-8px) rotate(2deg)' }],
    duration: 2400,
  },
  jelly: {
    keyframes: [{ transform: 'scale(1.04, 0.96)' }, { transform: 'scale(0.96, 1.04)' }],
    duration: 900,
  },
  shimmer: {
    keyframes: [{ filter: 'brightness(1) saturate(1)' }, { filter: 'brightness(1.25) saturate(1.2)' }],
    duration: 1600,
  },
  ripple: {
    keyframes: [
      { boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.55)' },
      { boxShadow: '0 0 0 22px rgba(255, 255, 255, 0)' },
    ],
    duration: 1800,
    direction: 'normal',
    easing: 'ease-out',
  },
  glow: {
    keyframes: [
      { filter: 'drop-shadow(0 0 0 rgba(255,255,255,0))' },
      { filter: 'drop-shadow(0 0 18px rgba(255,255,255,0.65))' },
    ],
    duration: 1800,
  },
};

for (const [name, preset] of Object.entries(IN)) registerLayerAnimation(name, preset);
for (const [name, preset] of Object.entries(LOOP)) registerLoopAnimation(name, preset);
