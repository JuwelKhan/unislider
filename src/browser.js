/**
 * Script-tag build: exposes `window.UniSlider` and initialises every
 * `[data-unislider]` element once the DOM is ready.
 */
import UniSlider from './index.js';

if (typeof window !== 'undefined') {
  const boot = () => UniSlider.init();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else queueMicrotask(boot);
}

export default UniSlider;
