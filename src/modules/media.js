import { data, mod } from '../core/utils.js';

/** Lazy-load images/backgrounds of visible slides and their neighbours. */
export const lazyModule = {
  name: 'lazy',
  setup(slider) {
    const o = slider.options.lazy;
    const n = slider.slides.length;
    if (!o.enabled) {
      for (let i = 0; i < n; i++) slider.loadSlide(i);
      return null;
    }
    const preload = Math.max(0, Number(o.preload) || 0);
    const load = () => {
      const visible = slider.engine.visibleIndexes?.() ?? [slider.index];
      for (const i of new Set([...visible, slider.index])) {
        for (let d = -preload; d <= preload; d++) slider.loadSlide(mod(i + d, n));
      }
    };
    load();
    slider.on('change afterChange', load);
    return { destroy: () => slider.off('change afterChange', load) };
  },
};

const PAUSE_MESSAGES = ['{"event":"command","func":"pauseVideo","args":""}', '{"method":"pause"}'];
const PLAY_MESSAGES = ['{"event":"command","func":"playVideo","args":""}', '{"method":"play"}'];

/**
 * HTML5 video (and YouTube/Vimeo iframes with their JS API enabled) play
 * only while their slide is active. `<video data-us-wait>` holds autoplay
 * until the video ends.
 */
export const videoModule = {
  name: 'video',
  setup(slider) {
    if (slider.options.video === false) return null;
    const videos = slider.slides.map((slide) => [...slide.querySelectorAll('video')]);
    const frames = slider.slides.map((slide) => [...slide.querySelectorAll('iframe[data-us-video]')]);
    if (!videos.flat().length && !frames.flat().length) return null;

    for (const video of videos.flat()) {
      if (video.hasAttribute('autoplay')) {
        video.removeAttribute('autoplay');
        video.dataset.usAutoplayVideo = 'true';
        video.muted = true;
        video.playsInline = true;
      }
    }

    let waiting = null;
    const post = (frame, messages) => messages.forEach((m) => frame.contentWindow?.postMessage(m, '*'));

    const sync = () => {
      const active = slider.activeSlide;
      slider.slides.forEach((slide, i) => {
        const on = slide === active;
        for (const video of videos[i]) {
          if (on && video.dataset.usAutoplayVideo) video.play?.().catch(() => {});
          else if (!on && !video.paused) {
            video.pause();
            if (data(video, 'restart') !== false) video.currentTime = 0;
          }
        }
        for (const frame of frames[i]) post(frame, on && data(frame, 'video') === 'autoplay' ? PLAY_MESSAGES : PAUSE_MESSAGES);
      });
      hold(videos[slider.index]?.find((v) => v.hasAttribute('data-us-wait')));
    };

    function hold(video) {
      if (waiting) {
        waiting.video.removeEventListener('ended', waiting.onEnded);
        slider.autoplay?.resume('video');
        waiting = null;
      }
      if (!video || !slider.autoplay) return;
      const onEnded = () => {
        slider.autoplay.resume('video');
        if (slider.isPlaying) slider.next({ source: 'autoplay', rewind: true });
      };
      video.addEventListener('ended', onEnded);
      slider.autoplay.pause('video');
      waiting = { video, onEnded };
    }

    // autoplay is created after this module; sync once everything exists
    queueMicrotask(sync);
    slider.on('change', sync);
    return {
      destroy() {
        slider.off('change', sync);
        hold(null);
        for (const video of videos.flat()) {
          video.pause();
          if (video.dataset.usAutoplayVideo) {
            video.setAttribute('autoplay', '');
            delete video.dataset.usAutoplayVideo;
          }
        }
      },
    };
  },
};
