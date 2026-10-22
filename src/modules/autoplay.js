import { clamp, data } from '../core/utils.js';

const PASSIVE_SOURCES = new Set(['autoplay', 'api', 'ticker', 'hash']);

/**
 * Autoplay with a frame-accurate timer: pausing (hover, focus, hidden tab,
 * off-screen, video playing, …) keeps the elapsed time, and the progress is
 * exposed as the `--us-progress` CSS variable.
 *
 * The module always exists (so `play()` works in manual mode); it only starts
 * by itself when `autoplay.enabled` is true.
 */
export const autoplayModule = {
  name: 'autoplay',
  setup(slider) {
    const o = slider.options.autoplay;
    if (slider.length < 2 || (slider.options.type === 'carousel' && slider.options.ticker > 0)) return null;
    const root = slider.root;
    const reasons = new Set();
    const cleanups = [];
    let frame = 0;
    let last = 0;
    let elapsed = 0;
    let duration = 0;

    const listen = (target, type, handler, opts) => {
      target.addEventListener(type, handler, opts);
      cleanups.push(() => target.removeEventListener(type, handler, opts));
    };

    const setProgress = (value) => {
      root.style.setProperty('--us-progress', value.toFixed(4));
      slider.emit('autoplay:progress', { progress: value, remaining: Math.max(0, duration - elapsed) });
    };

    const api = {
      running: false,
      reasons,
      start() {
        if (api.running) return;
        api.running = true;
        api.reset();
        last = performance.now();
        frame = requestAnimationFrame(tick);
        root.classList.add('is-playing');
        slider.emit('autoplay:start');
      },
      stop() {
        if (!api.running) return;
        api.running = false;
        cancelAnimationFrame(frame);
        root.classList.remove('is-playing');
        setProgress(0);
        slider.emit('autoplay:stop');
      },
      reset() {
        elapsed = 0;
        duration = Number(data(slider.activeSlide, 'autoplay') ?? o.delay) || 5000;
        setProgress(0);
      },
      pause(reason = 'api') {
        const was = reasons.size;
        reasons.add(reason);
        if (!was && api.running) {
          root.classList.add('is-paused');
          slider.emit('autoplay:pause', { reason });
        }
      },
      resume(reason = 'api') {
        if (!reasons.delete(reason) || reasons.size) return;
        root.classList.remove('is-paused');
        if (api.running) slider.emit('autoplay:resume', { reason });
      },
      destroy() {
        api.stop();
        for (const off of cleanups) off();
        observer?.disconnect();
        slider.off('change', onChange);
        root.classList.remove('is-playing', 'is-paused');
        root.style.removeProperty('--us-progress');
      },
    };

    function tick(now) {
      const dt = Math.min(100, now - last);
      last = now;
      if (!reasons.size && !slider._busy) {
        elapsed += dt;
        setProgress(clamp(elapsed / duration, 0, 1));
        if (elapsed >= duration) {
          elapsed = 0;
          const options = { source: 'autoplay', rewind: true };
          if (o.reverse) slider.prev(options);
          else slider.next(options);
        }
      }
      if (api.running) frame = requestAnimationFrame(tick);
    }

    const onChange = ({ source }) => {
      api.reset();
      if (!PASSIVE_SOURCES.has(source) && o.stopOnInteraction) api.stop();
    };
    slider.on('change', onChange);

    if (o.pauseOnHover) {
      listen(root, 'pointerenter', (e) => e.pointerType === 'mouse' && api.pause('hover'));
      listen(root, 'pointerleave', () => api.resume('hover'));
    }
    if (o.pauseOnFocus) {
      listen(root, 'focusin', (e) => e.target.matches(':focus-visible') && api.pause('focus'));
      listen(root, 'focusout', (e) => !root.contains(e.relatedTarget) && api.resume('focus'));
    }
    if (o.pauseHidden) {
      listen(document, 'visibilitychange', () => (document.hidden ? api.pause('hidden') : api.resume('hidden')));
    }
    let observer = null;
    if (o.pauseHidden && typeof IntersectionObserver === 'function') {
      observer = new IntersectionObserver(([entry]) =>
        entry.isIntersecting ? api.resume('offscreen') : api.pause('offscreen'),
      );
      observer.observe(root);
    }

    if (o.enabled) api.start();
    return api;
  },
};
