/**
 * Named registries are how UniSlider grows: transitions, layer animations,
 * carousel effects, presets, templates and modules are all looked up by name,
 * so new ones can ship in a later version (or a third-party plugin) without
 * touching the core.
 */
export function createRegistry(kind, validate = () => true) {
  const items = new Map();
  return {
    kind,
    register(name, item) {
      if (typeof name !== 'string' || !name) throw new TypeError(`${kind}: name must be a non-empty string`);
      if (!validate(item)) throw new TypeError(`${kind} "${name}" is invalid`);
      items.set(name, item);
      return item;
    },
    get: (name) => items.get(name) ?? null,
    has: (name) => items.has(name),
    list: () => [...items.keys()],
    remove: (name) => items.delete(name),
  };
}
