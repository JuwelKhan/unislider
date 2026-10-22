/** Minimal event emitter used by every slider instance. */
export class Emitter {
  #handlers = new Map();

  on(name, handler) {
    for (const event of String(name).split(/\s+/)) {
      if (!this.#handlers.has(event)) this.#handlers.set(event, new Set());
      this.#handlers.get(event).add(handler);
    }
    return this;
  }

  once(name, handler) {
    const wrapper = (...args) => {
      this.off(name, wrapper);
      handler.apply(this, args);
    };
    return this.on(name, wrapper);
  }

  off(name, handler) {
    for (const event of String(name).split(/\s+/)) {
      if (!handler) this.#handlers.delete(event);
      else this.#handlers.get(event)?.delete(handler);
    }
    return this;
  }

  emit(name, detail) {
    for (const handler of [...(this.#handlers.get(name) ?? [])]) handler.call(this, detail);
    for (const handler of [...(this.#handlers.get('*') ?? [])]) handler.call(this, name, detail);
    return this;
  }

  clearListeners() {
    this.#handlers.clear();
  }
}
