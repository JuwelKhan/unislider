/** Named easings → CSS timing functions (usable by Web Animations). */
export const EASINGS = {
  linear: 'linear',
  ease: 'ease',
  in: 'cubic-bezier(0.55, 0, 1, 0.45)',
  out: 'cubic-bezier(0.16, 1, 0.3, 1)',
  'in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
  smooth: 'cubic-bezier(0.77, 0, 0.175, 1)',
  expo: 'cubic-bezier(0.87, 0, 0.13, 1)',
  'expo-out': 'cubic-bezier(0.19, 1, 0.22, 1)',
  back: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  'back-in': 'cubic-bezier(0.36, 0, 0.66, -0.56)',
  snappy: 'cubic-bezier(0.2, 0.9, 0.1, 1)',
  power2: 'cubic-bezier(0.45, 0, 0.55, 1)',
  circ: 'cubic-bezier(0.85, 0, 0.15, 1)',
};

export const easing = (name, fallback = EASINGS.out) => (name ? EASINGS[name] ?? name : fallback);

/** JS easing functions for the requestAnimationFrame-driven carousel. */
export const EASE_FN = {
  linear: (t) => t,
  out: (t) => 1 - Math.pow(1 - t, 4),
  'in-out': (t) => (t < 0.5 ? 8 * t ** 4 : 1 - Math.pow(-2 * t + 2, 4) / 2),
  'expo-out': (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  back: (t) => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2),
};

export const easeFn = (name) => (typeof name === 'function' ? name : EASE_FN[name] ?? EASE_FN.out);
