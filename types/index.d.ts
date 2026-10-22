// Type definitions for unislider

export type Mode = 'auto' | 'manual' | 'hybrid';
export type SliderType = 'slider' | 'carousel';
export type Layout = 'auto' | 'fullwidth' | 'fullscreen';
export type Direction = 'horizontal' | 'vertical';
export type Theme = 'dark' | 'rain' | 'light' | 'glass' | 'minimal' | 'neon' | 'rounded' | 'none' | (string & {});

export type TransitionName =
  | 'fade' | 'fade-through' | 'slide' | 'slide-vertical' | 'slide-over' | 'reveal' | 'parallax' | 'stack'
  | 'zoom-in' | 'zoom-out' | 'blur' | 'skew' | 'rotate' | 'glitch'
  | 'cube' | 'flip' | 'cards' | 'fold'
  | 'wipe' | 'circle' | 'diamond' | 'curtain' | 'diagonal'
  | 'slices' | 'blinds' | 'boxes' | 'mosaic' | 'split' | 'shutter'
  | 'rain' | 'drizzle' | 'downpour' | 'storm' | 'thunder' | 'ripple' | 'drip' | 'melt' | 'mist' | 'splash' | 'liquid'
  | 'random' | (string & {});

export type RainPresetName = 'off' | 'drizzle' | 'rain' | 'downpour' | 'storm' | 'monsoon' | 'glass' | 'mist' | (string & {});

/** Numeric weather parameters (blended between slides). */
export interface RainParams {
  /** Drops per 1280×720 area. */
  drops: number;
  speed: number;
  length: number;
  width: number;
  /** Wind angle in degrees (negative = blowing left). */
  angle: number;
  opacity: number;
  /** 0–1 */
  splash: number;
  /** 0–1 */
  puddle: number;
  /** 0–1: drops on glass */
  glass: number;
  /** 0–1: drifting fog */
  mist: number;
  /** 0–1: automatic lightning */
  lightning: number;
}

export interface RainOptions extends Partial<RainParams> {
  preset?: RainPresetName;
  color?: string;
  /** 'over' the content (default) or 'back' — between background and content (slider type only). */
  layer?: 'over' | 'back';
}

export interface RippleOptions {
  click?: boolean;
  hover?: boolean;
  rings?: number;
  color?: string;
}

export interface RainController {
  /** Change the weather now; `null` follows the slides again. */
  set(value: RainPresetName | RainOptions | false | null): void;
  /** Lightning on demand. */
  strike(): void;
  readonly params: RainParams;
}

export type CarouselEffectName = 'slide' | 'fade' | 'scale' | 'coverflow' | 'cards' | 'ring' | 'depth' | 'wave' | 'cascade' | (string & {});

export interface AutoplayOptions {
  enabled?: boolean;
  /** ms per slide (override per slide with `data-us-autoplay`). */
  delay?: number;
  pauseOnHover?: boolean;
  pauseOnFocus?: boolean;
  /** Pause while the tab is hidden or the slider is off screen. */
  pauseHidden?: boolean;
  stopOnInteraction?: boolean;
  reverse?: boolean;
}

export interface NavigationOptions {
  arrows?: boolean;
  bullets?: boolean;
  thumbnails?: boolean;
  fraction?: boolean;
  progress?: boolean;
  playPause?: boolean;
  bulletStyle?: 'dots' | 'drops' | 'lines' | 'numbers' | 'titles';
  arrowStyle?: 'circle' | 'square' | 'minimal' | 'bottom' | 'hover' | (string & {});
}

export interface LayerOptions {
  enabled?: boolean;
  /** When layers start, as a fraction of the transition speed (0 = with it, 1 = after it). */
  start?: number;
  /** Animate `data-us-out` layers before a slide leaves. */
  out?: boolean;
  outDuration?: number;
  /** Out animation for every layer without its own `data-us-out`. */
  outPreset?: string | null;
}

export interface KenBurnsOptions {
  preset?: string;
  duration?: number;
  easing?: string;
}

export interface ParallaxOptions {
  /** Default mouse travel in px for `[data-us-parallax]` layers. */
  mouse?: number;
  /** Mouse travel in px for slide backgrounds. */
  bg?: number;
  /** Scroll parallax strength for backgrounds (0–1). */
  scroll?: number;
}

export interface A11yOptions {
  label?: string;
  announce?: boolean;
  roledescription?: string;
  prev?: string;
  next?: string;
  goTo?: string;
  play?: string;
  pause?: string;
}

export interface UniSliderOptions {
  type?: SliderType;
  mode?: Mode;
  /** One preset name, several separated by spaces, or an array. */
  preset?: string | string[] | null;
  template?: string | null;
  slides?: Array<Record<string, any>> | null;
  theme?: Theme;
  className?: string;
  layout?: Layout;
  height?: number | string | null;
  aspectRatio?: number | string | null;
  minHeight?: number | string;
  /** Pixels or a selector (e.g. a fixed header) subtracted in fullscreen layout. */
  offset?: number | string;
  autoHeight?: boolean;
  direction?: Direction;
  start?: number;
  loop?: boolean;
  speed?: number;
  easing?: string;
  transition?: TransitionName | TransitionName[] | TransitionDefinition;

  perView?: number;
  gap?: number;
  center?: boolean;
  effect?: CarouselEffectName;
  perMove?: number;
  freeMode?: boolean;
  ticker?: number;
  slideRatio?: number | string | null;
  slideToClicked?: boolean;
  carouselEasing?: 'linear' | 'out' | 'in-out' | 'expo-out' | 'back' | ((t: number) => number);

  autoplay?: boolean | number | AutoplayOptions;
  navigation?: boolean | NavigationOptions;
  keyboard?: boolean | 'global';
  drag?: boolean;
  wheel?: boolean;
  layers?: boolean | LayerOptions;
  kenburns?: boolean | string | KenBurnsOptions;
  rain?: boolean | RainPresetName | RainOptions;
  ripple?: boolean | RippleOptions;
  parallax?: boolean | number | ParallaxOptions;
  lazy?: boolean | { enabled?: boolean; preload?: number };
  video?: boolean;
  a11y?: string | A11yOptions;
  hash?: boolean;
  reducedMotion?: 'auto' | boolean;
  /** Min-width keyed overrides, e.g. `{ 768: { perView: 2 } }`. */
  breakpoints?: Record<number, UniSliderOptions> | null;
  on?: Partial<Record<UniSliderEvent, (detail: any) => void>> | null;
  modules?: UniSliderModule[];
}

export type UniSliderEvent =
  | 'init' | 'beforeChange' | 'change' | 'afterChange' | 'transition:start'
  | 'autoplay:start' | 'autoplay:stop' | 'autoplay:pause' | 'autoplay:resume' | 'autoplay:progress'
  | 'layers:in' | 'lightning' | 'load' | 'progress' | 'dragStart' | 'dragEnd'
  | 'resize' | 'breakpoint' | 'update' | 'slidesChange' | 'destroy' | '*';

export interface ChangeDetail {
  index: number;
  previous: number;
  dir: 1 | -1;
  source: string;
  slide: HTMLElement;
  previousSlide: HTMLElement;
}

export interface NavigateOptions {
  source?: string;
  dir?: 1 | -1;
  immediate?: boolean;
}

export interface TransitionContext {
  from: HTMLElement;
  to: HTMLElement;
  dir: 1 | -1;
  vertical: boolean;
  width: number;
  height: number;
  speed: number;
  easing: string;
  stage: HTMLElement;
  slider: UniSlider;
}

export interface TransitionDefinition {
  name?: string;
  category?: 'classic' | '3d' | 'mask' | 'tiles' | 'rain' | 'custom' | (string & {});
  perspective?: string;
  backface?: boolean;
  keyframes?(ctx: TransitionContext): { in?: Keyframe[]; out?: Keyframe[]; top?: 'in' | 'out'; easing?: string };
  run?(ctx: TransitionContext): Animation[] | { animations: Animation[]; cleanup?: () => void };
}

export interface LayerAnimation {
  keyframes: Keyframe[] | ((options: { distance?: number }) => Keyframe[]);
  duration?: number;
  easing?: string;
}

export interface CarouselEffectContext {
  offset: number;
  base: number;
  origin: number;
  step: number;
  size: number;
  viewport: number;
  perView: number;
  vertical: boolean;
  count: number;
  index: number;
}

export interface CarouselEffect {
  perspective?: string;
  apply(ctx: CarouselEffectContext): { x?: number; transform?: string; opacity?: number; zIndex?: number; filter?: string };
}

export interface UniSliderModule {
  name: string;
  setup(slider: UniSlider): { destroy?(): void; [key: string]: any } | null | void;
}

export interface Template {
  description?: string;
  options?: UniSliderOptions;
  render(slides: Array<Record<string, any>>, options: UniSliderOptions): string;
}

export interface Registry<T> {
  register(name: string, item: T): T;
  get(name: string): T | null;
  has(name: string): boolean;
  list(): string[];
  remove(name: string): boolean;
}

export interface AutoplayController {
  running: boolean;
  start(): void;
  stop(): void;
  reset(): void;
  pause(reason?: string): void;
  resume(reason?: string): void;
}

export declare class UniSlider {
  constructor(target: string | HTMLElement, options?: UniSliderOptions);

  static version: string;
  static defaults: UniSliderOptions;
  static transitions: Registry<TransitionDefinition>;
  static layerAnimations: Registry<LayerAnimation>;
  static loopAnimations: Registry<LayerAnimation>;
  static carouselEffects: Registry<CarouselEffect>;
  static presets: Registry<UniSliderOptions>;
  static templates: Registry<Template>;
  static modules: Registry<UniSliderModule>;
  static rainPresets: Registry<RainParams>;
  static transitionsByCategory(): Record<string, string[]>;
  static registerRainPreset(name: string, params: Partial<RainParams>): RainParams;
  static get(element: string | HTMLElement): UniSlider | null;
  static init(scope?: ParentNode): UniSlider[];
  static create(target: string | HTMLElement, options?: UniSliderOptions): UniSlider;
  static use(plugin: ((S: typeof UniSlider, options?: any) => void) | { install(S: typeof UniSlider, options?: any): void }, options?: any): typeof UniSlider;
  static registerTransition(name: string, def: TransitionDefinition | TransitionDefinition['keyframes'], category?: string): TransitionDefinition;
  static registerLayerAnimation(name: string, preset: LayerAnimation | Keyframe[]): LayerAnimation;
  static registerLoopAnimation(name: string, preset: LayerAnimation | Keyframe[]): LayerAnimation;
  static registerCarouselEffect(name: string, fx: CarouselEffect | CarouselEffect['apply']): CarouselEffect;
  static registerPreset(name: string, options: UniSliderOptions): UniSliderOptions;
  static registerTemplate(name: string, template: Template): Template;
  static registerModule(module: UniSliderModule): UniSliderModule;

  readonly root: HTMLElement;
  readonly stage: HTMLElement;
  readonly track: HTMLElement;
  readonly ui: HTMLElement;
  readonly slides: HTMLElement[];
  readonly options: Required<UniSliderOptions> & Record<string, any>;
  readonly index: number;
  readonly previousIndex: number | null;
  readonly length: number;
  readonly activeSlide: HTMLElement;
  readonly isPlaying: boolean;
  readonly autoplay: AutoplayController | null;
  readonly rain: RainController | null;
  readonly reducedMotion: boolean;
  readonly modules: Map<string, any>;

  next(options?: NavigateOptions & { rewind?: boolean }): Promise<boolean>;
  prev(options?: NavigateOptions & { rewind?: boolean }): Promise<boolean>;
  goTo(index: number, options?: NavigateOptions): Promise<boolean>;
  play(): this;
  pause(): this;
  toggle(): this;
  update(options?: UniSliderOptions): this;
  addSlide(content: string | HTMLElement, at?: number): HTMLElement;
  removeSlide(index: number): HTMLElement | null;
  loadSlide(index: number): void;
  hook(name: 'leave', fn: (ctx: { from: number; to: number; dir: number; source: string }) => void | Promise<void>): () => void;
  destroy(): void;

  on(event: 'change' | 'beforeChange' | 'afterChange', handler: (detail: ChangeDetail) => void): this;
  on(event: UniSliderEvent | (string & {}), handler: (detail: any) => void): this;
  once(event: UniSliderEvent | (string & {}), handler: (detail: any) => void): this;
  off(event: UniSliderEvent | (string & {}), handler?: (detail: any) => void): this;
  emit(event: string, detail?: any): this;
}

export declare const transitions: Registry<TransitionDefinition>;
export declare const layerPresets: Registry<LayerAnimation>;
export declare const loopPresets: Registry<LayerAnimation>;
export declare const carouselEffects: Registry<CarouselEffect>;
export declare const presets: Registry<UniSliderOptions>;
export declare const templates: Registry<Template>;
export declare const modules: Registry<UniSliderModule>;
export declare const registerTransition: typeof UniSlider.registerTransition;
export declare const registerLayerAnimation: typeof UniSlider.registerLayerAnimation;
export declare const registerLoopAnimation: typeof UniSlider.registerLoopAnimation;
export declare const registerCarouselEffect: typeof UniSlider.registerCarouselEffect;
export declare const registerTemplate: typeof UniSlider.registerTemplate;
export declare const rainPresets: Registry<RainParams>;
export declare const DEFAULTS: UniSliderOptions;
export default UniSlider;
