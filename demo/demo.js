/* global UniSlider */

// 1. Hero — plain markup + options
window.demoHero = new UniSlider('#hero', {
  preset: 'hero',
  theme: 'rain',
  layout: 'fullscreen',
  offset: '.demo-header',
  transition: 'rain',
  speed: 1400,
  ripple: true,
  autoplay: { delay: 7000 },
  navigation: { arrows: false, fraction: true, bulletStyle: 'drops', arrowStyle: 'minimal' },
  // arrows only where there is room for them
  breakpoints: { 760: { navigation: { arrows: true } } },
  parallax: { mouse: 0 },
  a11y: { label: 'UniSlider features' },
});

// 2. Rain studio
const $ = (id) => document.getElementById(id);
const rainState = { weather: 'rain', angle: 8, layer: 'over' };
const rainSlider = new UniSlider('#rain-slider', {
  preset: 'rainy',
  aspectRatio: '16 / 7',
  rain: { preset: 'rain', angle: 8 },
  autoplay: { delay: 6000 },
  navigation: { fraction: true },
  a11y: { label: 'Rain studio' },
});
window.demoRain = rainSlider;
const rainOptions = () =>
  rainState.weather === 'off' ? false : { preset: rainState.weather, angle: rainState.angle, layer: rainState.layer };
const showRainCode = (transition = rainSlider.engine.lastTransition ?? 'rain') => {
  $('rain-code').textContent = `new UniSlider('#slider', {
  preset: 'rainy',
  rain: ${JSON.stringify(rainOptions()).replace(/"(\w+)":/g, '$1: ').replace(/"/g, "'").replace(/,/g, ', ')},
  transition: '${transition}',
  ripple: true,
});`;
};
const rainButtons = $('rain-transitions');
for (const name of UniSlider.transitionsByCategory().rain) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = name;
  button.addEventListener('click', () => {
    rainSlider.update({ transition: name });
    rainSlider.next({ source: 'nav' });
    showRainCode(name);
  });
  rainButtons.append(button);
}
$('rain-weather').addEventListener('change', (e) => {
  rainState.weather = e.target.value;
  rainSlider.rain ? rainSlider.rain.set(rainOptions()) : rainSlider.update({ rain: rainOptions() });
  showRainCode();
});
$('rain-wind').addEventListener('change', (e) => {
  rainState.angle = Number(e.target.value);
  rainSlider.rain?.set(rainOptions());
  showRainCode();
});
$('rain-layer').addEventListener('change', (e) => {
  rainState.layer = e.target.value;
  rainSlider.update({ rain: rainOptions() });
  showRainCode();
});
$('rain-strike').addEventListener('click', () => {
  if (!rainSlider.rain) {
    rainState.weather = 'storm';
    $('rain-weather').value = 'storm';
    rainSlider.update({ rain: rainOptions() });
  }
  rainSlider.rain?.strike();
});
showRainCode('rain');

// 3. Playground
const pg = new UniSlider('#playground-slider', {
  transition: 'cube',
  speed: 1000,
  aspectRatio: '16 / 7',
  navigation: { fraction: true, bulletStyle: 'dots' },
  a11y: { label: 'Transition playground' },
});
window.demoPlayground = pg;

const fill = (select, names, selected) => {
  select.innerHTML = names.map((name) => `<option${name === selected ? ' selected' : ''}>${name}</option>`).join('');
};
$('pg-transition').innerHTML =
  '<option>random</option>' +
  Object.entries(UniSlider.transitionsByCategory())
    .map(([group, names]) => `<optgroup label="${group}">${names.map((n) => `<option${n === 'cube' ? ' selected' : ''}>${n}</option>`).join('')}</optgroup>`)
    .join('');
fill($('pg-layer'), UniSlider.layerAnimations.list(), 'fade-up');

const showCode = () => {
  const o = pg.options;
  $('pg-code').textContent = `new UniSlider('#slider', {
  transition: '${$('pg-transition').value}',
  speed: ${o.speed},
  mode: '${o.mode}',
  theme: '${o.theme}',
});
// layers: <h3 data-us-layer="${$('pg-layer').value}">…</h3>`;
};

$('pg-transition').addEventListener('change', (e) => {
  pg.update({ transition: e.target.value });
  pg.next({ source: 'nav' });
  showCode();
});
$('pg-layer').addEventListener('change', (e) => {
  pg.slides.forEach((slide) => slide.querySelector('.pg-title')?.setAttribute('data-us-layer', e.target.value));
  pg.update({});
  showCode();
});
$('pg-mode').addEventListener('change', (e) => {
  pg.update({ mode: e.target.value });
  showCode();
});
$('pg-theme').addEventListener('change', (e) => {
  pg.update({ theme: e.target.value });
  showCode();
});
$('pg-speed').addEventListener('input', (e) => {
  $('pg-speed-out').textContent = `${e.target.value}ms`;
});
$('pg-speed').addEventListener('change', (e) => {
  pg.update({ speed: Number(e.target.value) });
  showCode();
});
$('pg-prev').addEventListener('click', () => pg.prev({ source: 'nav' }));
$('pg-next').addEventListener('click', () => pg.next({ source: 'nav' }));
showCode();

// 4. Templates
UniSlider.create('#tpl-rain', {
  template: 'rain-hero',
  slides: [
    { kicker: 'Monsoon collection', title: 'Dance in the rain', text: 'Waterproof gear for people who love the weather.', image: 'assets/city.svg', weather: 'downpour', button: { label: 'Shop the rain' } },
    { kicker: 'Weekend escape', title: 'Quiet lake, soft rain', text: 'Cabins by the water, rain on the roof.', image: 'assets/lake.svg', weather: 'drizzle', buttons: [{ label: 'Book now' }, { label: 'Gallery' }] },
    { kicker: 'Storm chasers', title: 'Feel the thunder', text: 'Guided tours into the heart of the storm.', image: 'assets/ocean.svg', weather: 'storm', align: 'left' },
  ],
});

UniSlider.create('#tpl-split', {
  template: 'hero-split',
  slides: [
    {
      kicker: 'New release',
      title: 'Sound you can feel',
      text: 'Studio-grade wireless headphones with 40 hours of battery and adaptive noise cancelling.',
      image: 'assets/headphones.svg',
      buttons: [{ label: 'Shop now', href: '#' }, { label: 'Learn more', href: '#' }],
    },
    {
      kicker: 'Wearables',
      title: 'Time, reimagined',
      text: 'A watch that tracks your day and gets out of your way.',
      image: 'assets/watch.svg',
      background: 'linear-gradient(135deg, #e8fff6, #fef9e7)',
      button: { label: 'Discover', href: '#' },
    },
    {
      kicker: 'Photography',
      title: 'Capture the moment',
      text: 'Full-frame sensor, pocket-sized body.',
      image: 'assets/camera.svg',
      background: 'linear-gradient(135deg, #eaf4ff, #f3eaff)',
      button: { label: 'Pre-order', href: '#' },
    },
  ],
});

UniSlider.create('#tpl-product', {
  template: 'product-showcase',
  slides: [
    { kicker: 'Running', title: 'Velocity Runner', text: 'Featherlight cushioning for your fastest miles.', price: '$129', image: 'assets/sneaker.svg', background: '#ffe0e0', button: { label: 'Add to cart' } },
    { kicker: 'Audio', title: 'Pulse Headphones', text: 'Immersive sound, all-day comfort.', price: '$249', image: 'assets/headphones.svg', background: '#e7e4ff', button: { label: 'Add to cart' } },
    { kicker: 'Smart', title: 'Orbit Watch', text: 'Health, fitness and notifications at a glance.', price: '$199', image: 'assets/watch.svg', background: '#d8f8ec', button: { label: 'Add to cart' } },
    { kicker: 'Photo', title: 'Lumen Camera', text: 'Your next favourite travel companion.', price: '$899', image: 'assets/camera.svg', background: '#dcecff', button: { label: 'Add to cart' } },
  ],
});

UniSlider.create('#tpl-agency', {
  template: 'agency',
  slides: [
    { title: 'We build brands', text: 'Strategy, identity and digital products for ambitious teams.', image: 'assets/neon.svg', button: { label: 'See our work' } },
    { title: 'Bold ideas', text: 'Campaigns people remember.', image: 'assets/sunset.svg' },
    { title: 'Made to move', text: 'Motion design that tells your story.', image: 'assets/ocean.svg' },
  ],
});

UniSlider.create('#tpl-testimonials', {
  template: 'testimonials',
  slides: [
    { quote: 'We replaced a 400 KB slider plugin with UniSlider and our hero got faster and prettier at the same time.', name: 'Amira Rahman', role: 'Front-end lead, Northwind', avatar: 'assets/avatar-1.svg' },
    { quote: 'The templates saved us days. Our marketing team now builds new landing page sliders without asking developers.', name: 'Marco Klein', role: 'Product manager', avatar: 'assets/avatar-2.svg' },
    { quote: 'Keyboard support, screen reader announcements and reduced-motion handling out of the box. Finally.', name: 'Sofia Lopez', role: 'Accessibility consultant', avatar: 'assets/avatar-3.svg' },
  ],
});

UniSlider.create('#tpl-news', {
  template: 'news-headlines',
  slides: [
    { tag: 'Release', title: 'UniSlider 1.0 ships with 29 transitions and 10 templates', date: 'Today', href: '#' },
    { tag: 'Guide', title: 'How to build a full-screen hero in five lines of HTML', date: 'Yesterday', href: '#' },
    { tag: 'Plugins', title: 'Write your own transition in under 20 lines', date: 'This week', href: '#' },
  ],
});

UniSlider.create('#tpl-vertical', {
  template: 'vertical-showcase',
  layout: 'auto',
  aspectRatio: '16 / 8',
  wheel: false,
  slides: [
    { kicker: 'Chapter one', title: 'Scroll through stories', text: 'Vertical sliders for portfolios and product tours.', image: 'assets/forest.svg' },
    { kicker: 'Chapter two', title: 'Keyboard & wheel ready', text: 'Arrow keys, trackpads and touch all just work.', image: 'assets/desert.svg' },
    { kicker: 'Chapter three', title: 'Deep-linkable', text: 'Turn on `hash: true` and every slide gets a URL.', image: 'assets/aurora.svg' },
  ],
});

// 5. Carousels
const posts = [
  ['Design', 'Designing motion that feels natural', 'assets/aurora.svg'],
  ['Guide', 'Building a hero slider in five minutes', 'assets/sunset.svg'],
  ['Performance', 'Why Web Animations beat JS tweening', 'assets/ocean.svg'],
  ['Accessibility', 'Carousels that work for everyone', 'assets/forest.svg'],
  ['Plugins', 'Extending UniSlider with custom effects', 'assets/desert.svg'],
  ['Showcase', 'Ten sliders we loved this month', 'assets/neon.svg'],
];
UniSlider.create('#tpl-cards', {
  template: 'cards-carousel',
  theme: 'light',
  slides: posts.map(([tag, title, image]) => ({ tag, title, image, text: 'A short teaser that describes the article in a sentence or two.', href: '#' })),
});

const gallery = ['aurora', 'sunset', 'ocean', 'forest', 'desert', 'neon'].map((name) => ({
  title: name[0].toUpperCase() + name.slice(1),
  image: `assets/${name}.svg`,
}));
UniSlider.create('#tpl-coverflow', { template: 'coverflow-gallery', slides: gallery, autoplay: { delay: 3000 } });
UniSlider.create('#fx-ring', { template: 'coverflow-gallery', preset: 'ring', slides: gallery, autoplay: { delay: 2500 } });
UniSlider.create('#fx-cards', {
  template: 'coverflow-gallery',
  preset: 'cards',
  slideRatio: '4 / 5',
  slides: gallery,
  autoplay: { delay: 2500 },
});

UniSlider.create('#fx-waves', { template: 'coverflow-gallery', preset: 'waves', slides: gallery, autoplay: { delay: 2200 } });
UniSlider.create('#fx-waterfall', { template: 'coverflow-gallery', preset: 'waterfall', slides: gallery, autoplay: { delay: 2400 } });

UniSlider.create('#tpl-ticker', {
  template: 'logo-ticker',
  slides: ['Northwind', 'Acme', 'Globex', 'Initech', 'Umbrella', 'Hooli', 'Vandelay', 'Stark'].map((title) => ({ title })),
});
