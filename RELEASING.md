# Releasing

How UniSlider is published and how to ship an update.

## One-time setup

- **GitHub Pages:** *Settings → Pages → Build and deployment → Source: GitHub Actions*. The
  `Deploy demo to GitHub Pages` workflow then publishes the demo at https://juwelkhan.github.io/unislider/
  on every push to `main`.
- **CI:** the `CI` workflow builds and runs the unit + browser tests on every push and pull request
  (Node 20 and 22). It also fails when `dist/` was not rebuilt after a source change.
- **npm (optional):** create an account on npmjs.com, then on your own computer run `npm login` once.

## Shipping a new version

1. Make the change, then bump `version` in `package.json` ([semver](https://semver.org)):
   - patch `1.0.1` — bug fixes
   - minor `1.1.0` — new transitions, animations, presets, templates or options
   - major `2.0.0` — anything that changes existing behaviour (defaults, names, classes)
2. Add an entry at the top of `CHANGELOG.md`.
3. `npm run build && npm test` and commit, including `dist/`.
4. Tag and push: `git tag v1.1.0 && git push origin main --tags`.
5. On GitHub: *Releases → Draft a new release*, pick the tag, paste the CHANGELOG entry and attach the
   files from `dist/` if you like.
6. Update the version in the CDN links in `README.md`
   (`https://cdn.jsdelivr.net/gh/JuwelKhan/unislider@1.1.0/dist/unislider.min.js`).
   jsDelivr serves every tag automatically — nothing to upload.
7. npm (optional): `npm publish` — `prepublishOnly` builds and tests first.

## Manual checks before a release

The automated tests run in Chromium only. Worth checking by hand:

- [ ] Safari (macOS + iOS) — every transition, especially `cube`, `flip`, `liquid` and the tile ones
- [ ] Firefox — every transition and the rain canvas
- [ ] A phone: swipe, the rain effect's frame rate, layouts at small widths
- [ ] Keyboard only (Tab, arrows, Home/End) and a screen reader (VoiceOver / NVDA)
- [ ] OS "reduce motion" setting on (rain and Ken Burns should be off, transitions short fades)
