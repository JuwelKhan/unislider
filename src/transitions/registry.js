import { createRegistry } from '../core/registry.js';

/**
 * A transition is either
 *   { keyframes(ctx) => { in, out, top?, perspective? } }   // two Web Animations
 * or
 *   { run(ctx) => Animation[] | Promise }                    // fully custom (tiles, …)
 *
 * ctx: { from, to, dir (1 | -1), vertical, width, height, speed, easing, stage, tiles() }
 */
export const transitions = createRegistry(
  'transition',
  (def) => def && (typeof def.keyframes === 'function' || typeof def.run === 'function'),
);

export function registerTransition(name, def, category = 'custom') {
  const item = typeof def === 'function' ? { keyframes: def } : def;
  return transitions.register(name, { name, category, ...item });
}

/** Transitions grouped by category (classic, 3d, mask, tiles, rain, custom…). */
export function transitionsByCategory() {
  const groups = {};
  for (const name of transitions.list()) (groups[transitions.get(name).category] ??= []).push(name);
  return groups;
}

export const getTransition = (name) =>
  name && typeof name === 'object' ? name : transitions.get(name);
