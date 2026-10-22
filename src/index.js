/**
 * UniSlider — public ES module entry.
 *
 *   import UniSlider from 'unislider';
 *   import 'unislider/css';
 *   new UniSlider('#hero', { preset: 'hero' });
 */
import { UniSlider, engines, modules, presets, templates } from './core/UniSlider.js';
import { transitions, registerTransition, buildTiles } from './transitions/index.js';
import { layerPresets, loopPresets, registerLayerAnimation, registerLoopAnimation } from './layers/presets.js';
import { carouselEffects, registerCarouselEffect } from './engines/effects.js';
import { kenburnsPresets } from './modules/motion.js';
import { DEFAULTS } from './core/options.js';
import { EASINGS } from './core/easing.js';
import { registerTemplate } from './templates/index.js';
import './presets/index.js';

import { a11yModule } from './modules/a11y.js';
import { lazyModule, videoModule } from './modules/media.js';
import { layersModule } from './layers/Layers.js';
import { kenburnsModule, parallaxModule, hashModule } from './modules/motion.js';
import { rainModule, rippleModule, rainPresets } from './modules/rain.js';
import { transitionsByCategory } from './transitions/index.js';
import { autoplayModule } from './modules/autoplay.js';
import { navigationModule, thumbnailsModule } from './modules/navigation.js';
import { keyboardModule, swipeModule, wheelModule } from './modules/input.js';

// Order matters: later modules may use earlier ones (navigation reads autoplay).
for (const module of [
  a11yModule,
  lazyModule,
  videoModule,
  layersModule,
  kenburnsModule,
  parallaxModule,
  rainModule,
  rippleModule,
  autoplayModule,
  navigationModule,
  thumbnailsModule,
  keyboardModule,
  swipeModule,
  wheelModule,
  hashModule,
]) {
  modules.register(module.name, module);
}

Object.assign(UniSlider, {
  defaults: DEFAULTS,
  easings: EASINGS,
  transitions,
  layerAnimations: layerPresets,
  loopAnimations: loopPresets,
  carouselEffects,
  kenburns: kenburnsPresets,
  rainPresets,
  transitionsByCategory,
  presets,
  templates,
  modules,
  engines,
  registerTransition,
  registerLayerAnimation,
  registerLoopAnimation,
  registerCarouselEffect,
  registerTemplate,
  registerPreset: (name, options) => presets.register(name, options),
  registerRainPreset: (name, params) => rainPresets.register(name, params),
  registerModule: (module) => modules.register(module.name, module),
  buildTiles,
  /**
   * Install a plugin: a function `(UniSlider) => void` or an object with
   * `install(UniSlider)`. Plugins typically register transitions, layer
   * animations, presets, templates or modules.
   */
  use(plugin, options) {
    const installed = (UniSlider._plugins ??= new Set());
    if (installed.has(plugin)) return UniSlider;
    installed.add(plugin);
    if (typeof plugin === 'function') plugin(UniSlider, options);
    else plugin?.install?.(UniSlider, options);
    return UniSlider;
  },
});

export {
  UniSlider,
  transitions,
  layerPresets,
  loopPresets,
  carouselEffects,
  presets,
  templates,
  modules,
  registerTransition,
  registerLayerAnimation,
  registerLoopAnimation,
  registerCarouselEffect,
  registerTemplate,
  rainPresets,
  DEFAULTS,
};
export default UniSlider;
