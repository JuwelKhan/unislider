/** Small DOM / math helpers shared by every module. */

export const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/** Positive modulo: mod(-1, 5) === 4. */
export const mod = (value, length) => ((value % length) + length) % length;

export const lerp = (a, b, t) => a + (b - a) * t;

export const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

/** Deep merge of plain objects; arrays and other values are replaced. */
export function merge(target, ...sources) {
  for (const source of sources) {
    if (!isObject(source)) continue;
    for (const [key, value] of Object.entries(source)) {
      if (value === undefined) continue;
      target[key] = isObject(value) ? merge(isObject(target[key]) ? target[key] : {}, value) : value;
    }
  }
  return target;
}

export function resolveElement(target, root = isBrowser ? document : null) {
  if (typeof target === 'string') return root?.querySelector(target) ?? null;
  return target ?? null;
}

/** Create an element with classes, attributes and children. */
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === null || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'html') node.innerHTML = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'style' && isObject(value)) Object.assign(node.style, value);
    else node.setAttribute(key, value === true ? '' : value);
  }
  for (const child of [].concat(children)) if (child) node.append(child);
  return node;
}

/** Remove classes and drop the attribute when nothing is left. */
export function removeClass(node, ...names) {
  node.classList.remove(...names);
  if (!node.classList.length) node.removeAttribute('class');
}

/** Parse a data-attribute value: JSON, number, boolean or plain string. */
export function parseValue(raw) {
  if (raw === undefined || raw === null) return undefined;
  const value = String(raw).trim();
  if (value === '') return true;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value !== '' && !Number.isNaN(Number(value))) return Number(value);
  if (/^[[{]/.test(value)) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

/** Read `data-us-<name>` from an element, parsed. */
export const data = (node, name) => parseValue(node?.getAttribute?.(`data-us-${name}`) ?? undefined);

export const prefersReducedMotion = () =>
  isBrowser && typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Wait for a set of Web Animations to finish (cancelled ones resolve too). */
export const settled = (animations) =>
  Promise.all(animations.filter(Boolean).map((a) => a.finished.catch(() => null)));

export const pick = (list) => list[Math.floor(Math.random() * list.length)];

export const pad = (n, size = 2) => String(n).padStart(size, '0');

let uid = 0;
export const nextId = (prefix = 'us') => `${prefix}-${++uid}`;
