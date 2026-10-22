const EDITABLE = 'input, textarea, select, [contenteditable=""], [contenteditable="true"]';

/** Arrow keys / Home / End. `keyboard: 'global'` also listens while the slider is on screen. */
export const keyboardModule = {
  name: 'keyboard',
  setup(slider) {
    const mode = slider.options.keyboard;
    if (!mode) return null;
    const vertical = slider.options.direction === 'vertical';
    let onScreen = false;
    let observer = null;

    const onKey = (e) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.target.closest?.(EDITABLE)) return;
      const inside = slider.root.contains(e.target);
      if (!inside && !(mode === 'global' && onScreen)) return;
      const key = e.key;
      const back = key === 'ArrowLeft' || (vertical && key === 'ArrowUp');
      const forward = key === 'ArrowRight' || (vertical && key === 'ArrowDown');
      if (back) slider.prev({ source: 'keyboard' });
      else if (forward) slider.next({ source: 'keyboard' });
      else if (key === 'Home') slider.goTo(0, { source: 'keyboard' });
      else if (key === 'End') slider.goTo(slider.length - 1, { source: 'keyboard' });
      else return;
      e.preventDefault();
    };

    const target = mode === 'global' ? document : slider.root;
    target.addEventListener('keydown', onKey);
    if (mode === 'global' && typeof IntersectionObserver === 'function') {
      observer = new IntersectionObserver(([entry]) => (onScreen = entry.intersectionRatio >= 0.5), { threshold: [0, 0.5, 1] });
      observer.observe(slider.root);
    }
    return {
      destroy() {
        target.removeEventListener('keydown', onKey);
        observer?.disconnect();
      },
    };
  },
};

/** Touch / mouse swipe for the stacked slider (the carousel engine drags itself). */
export const swipeModule = {
  name: 'swipe',
  setup(slider) {
    if (!slider.options.drag || slider.options.type !== 'slider' || slider.length < 2) return null;
    const stage = slider.stage;
    const vertical = slider.options.direction === 'vertical';
    const axis = (e) => (vertical ? e.clientY : e.clientX);
    const cross = (e) => (vertical ? e.clientX : e.clientY);
    let state = null;
    stage.classList.add('us-draggable');

    const down = (e) => {
      if (e.button !== 0 || e.target.closest('.us-ui, input, textarea, select, video, [data-us-nodrag]')) return;
      state = { id: e.pointerId, x: axis(e), y: cross(e), t: e.timeStamp, moved: false, slide: slider.activeSlide };
    };
    const move = (e) => {
      if (!state || e.pointerId !== state.id) return;
      const dx = axis(e) - state.x;
      const dy = cross(e) - state.y;
      if (!state.moved) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        if (Math.abs(dy) > Math.abs(dx)) {
          state = null;
          return;
        }
        state.moved = true;
        stage.setPointerCapture?.(e.pointerId);
        stage.classList.add('is-dragging');
      }
      state.dx = dx;
      // a little resistance so the slide follows the finger
      state.slide.style.translate = vertical ? `0 ${dx * 0.15}px` : `${dx * 0.15}px 0`;
      e.preventDefault();
    };
    const up = (e) => {
      if (!state || e.pointerId !== state.id) return;
      const { moved, dx = 0, t, slide } = state;
      state = null;
      if (!moved) return;
      stage.classList.remove('is-dragging');
      const offset = slide.style.translate;
      slide.style.translate = '';
      if (offset) slide.animate([{ translate: offset }, { translate: '0 0' }], { duration: 350, easing: 'ease-out' });
      stage.addEventListener('click', swallow, { capture: true, once: true });
      setTimeout(() => stage.removeEventListener('click', swallow, true), 50);
      const velocity = Math.abs(dx) / Math.max(1, e.timeStamp - t);
      if (Math.abs(dx) > 50 || (Math.abs(dx) > 15 && velocity > 0.4)) {
        if (dx < 0) slider.next({ source: 'swipe' });
        else slider.prev({ source: 'swipe' });
      }
    };
    const swallow = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    stage.addEventListener('pointerdown', down);
    stage.addEventListener('pointermove', move);
    stage.addEventListener('pointerup', up);
    stage.addEventListener('pointercancel', up);
    return {
      destroy() {
        stage.classList.remove('us-draggable', 'is-dragging');
        stage.removeEventListener('pointerdown', down);
        stage.removeEventListener('pointermove', move);
        stage.removeEventListener('pointerup', up);
        stage.removeEventListener('pointercancel', up);
      },
    };
  },
};

/** Mouse wheel / trackpad navigation (opt-in: `wheel: true`). */
export const wheelModule = {
  name: 'wheel',
  setup(slider) {
    if (!slider.options.wheel) return null;
    let total = 0;
    let locked = false;
    let resetTimer = 0;
    const onWheel = (e) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const forward = delta > 0;
      const atEdge = !slider.options.loop && (forward ? slider.index >= slider.length - 1 : slider.index <= 0);
      if (atEdge) return; // let the page scroll past the slider
      e.preventDefault();
      if (locked) return;
      total += delta;
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => (total = 0), 200);
      if (Math.abs(total) < 40) return;
      locked = true;
      total = 0;
      (forward ? slider.next({ source: 'wheel' }) : slider.prev({ source: 'wheel' })).finally(() => {
        setTimeout(() => (locked = false), 350);
      });
    };
    slider.stage.addEventListener('wheel', onWheel, { passive: false });
    return {
      destroy() {
        clearTimeout(resetTimer);
        slider.stage.removeEventListener('wheel', onWheel);
      },
    };
  },
};
