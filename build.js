/**
 * UniSlider build
 * ------------------------------------------------------------
 *   dist/unislider.js                 IIFE → window.UniSlider (+ [data-unislider] auto-init)
 *   dist/unislider.min.js             minified IIFE
 *   dist/unislider.esm.js             ES module
 *   dist/unislider.css (+ .min)       core styles + themes
 *   dist/unislider-templates.css (+ .min)   template styles
 *
 *   npm run build      one-off build
 *   npm run dev        rebuild on change
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(fs.readFileSync(path.join(DIR, 'package.json'), 'utf8'));
const banner = `/*! UniSlider v${pkg.version} | MIT License | https://github.com/JuwelKhan/unislider */`;
const watch = process.argv.includes('--watch');
const r = (...parts) => path.join(DIR, ...parts);

const common = {
  bundle: true,
  target: 'es2020',
  banner: { js: banner },
  define: { __UNISLIDER_VERSION__: JSON.stringify(pkg.version) },
  logLevel: 'silent',
};

const iife = { ...common, entryPoints: [r('src/browser.js')], format: 'iife', globalName: 'UniSlider' };

const jsBuilds = [
  { ...iife, footer: { js: 'UniSlider = UniSlider.default;' }, outfile: r('dist/unislider.js') },
  { ...iife, footer: { js: 'UniSlider=UniSlider.default;' }, minify: true, outfile: r('dist/unislider.min.js') },
  { ...common, entryPoints: [r('src/index.js')], format: 'esm', outfile: r('dist/unislider.esm.js') },
];

const cssFiles = ['unislider', 'unislider-templates'];

async function buildCss() {
  for (const name of cssFiles) {
    const source = fs.readFileSync(r(`css/${name}.css`), 'utf8');
    fs.writeFileSync(r(`dist/${name}.css`), `${banner}\n${source}`);
    const { code } = await esbuild.transform(source, { loader: 'css', minify: true, target: ['chrome100', 'safari15', 'firefox100'] });
    fs.writeFileSync(r(`dist/${name}.min.css`), banner + code);
  }
}

const gz = (file) => (zlib.gzipSync(fs.readFileSync(r(file))).length / 1024).toFixed(1);

async function buildAll() {
  const started = Date.now();
  try {
    fs.mkdirSync(r('dist'), { recursive: true });
    await Promise.all(jsBuilds.map((options) => esbuild.build(options)));
    await buildCss();
    console.log(
      `✔ unislider built in ${Date.now() - started}ms — min.js ${gz('dist/unislider.min.js')} KB gz, min.css ${gz('dist/unislider.min.css')} KB gz`,
    );
    return true;
  } catch (error) {
    console.error(`✖ unislider build failed:\n${error.message}`);
    return false;
  }
}

const ok = await buildAll();
if (!watch) process.exit(ok ? 0 : 1);

let timer;
for (const folder of ['src', 'css']) {
  fs.watch(r(folder), { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(buildAll, 100);
  });
}
console.log('👀 Watching src/ and css/');
