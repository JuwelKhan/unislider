import { registerTransition as register } from './registry.js';

const registerTransition = (name, def) => register(name, def, 'tiles');

/**
 * Tile transitions cut a snapshot of a slide into a grid and animate the
 * pieces. The snapshot is a clone without layers (layers animate in on the
 * real slide afterwards), so this works for images, gradients and video
 * posters alike.
 */
export function buildTiles(ctx, { source = 'to', cols = 1, rows = 1 } = {}) {
  const slide = source === 'to' ? ctx.to : ctx.from;
  const { width, height } = ctx;
  const overlay = document.createElement('div');
  overlay.className = 'us-tiles';
  const tiles = [];
  const tileW = width / cols;
  const tileH = height / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tile = document.createElement('div');
      tile.className = 'us-tile';
      const x = Math.round(c * tileW);
      const y = Math.round(r * tileH);
      const w = Math.round((c + 1) * tileW) - x;
      const h = Math.round((r + 1) * tileH) - y;
      Object.assign(tile.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` });
      const snap = snapshot(slide);
      Object.assign(snap.style, { left: `${-x}px`, top: `${-y}px`, width: `${width}px`, height: `${height}px` });
      tile.append(snap);
      overlay.append(tile);
      tiles.push({ tile, row: r, col: c, index: tiles.length });
    }
  }
  ctx.stage.append(overlay);
  return { overlay, tiles, remove: () => overlay.remove() };
}

export function snapshot(slide) {
  const clone = slide.cloneNode(true);
  clone.classList.add('us-snapshot');
  clone.classList.remove('is-active', 'is-entering', 'is-leaving');
  clone.removeAttribute('id');
  clone.removeAttribute('style');
  clone.querySelectorAll('[data-us-layer], .us-layer, .us-rain, video, iframe, script, canvas').forEach((node) => node.remove());
  clone.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
  clone.setAttribute('aria-hidden', 'true');
  clone.inert = true;
  return clone;
}

/** Helper: run tile animations for an incoming slide, keep it hidden meanwhile. */
export function tileIn(ctx, grid, animateTile) {
  const { tiles, remove } = buildTiles(ctx, { source: 'to', ...grid });
  const total = ctx.speed;
  const hold = ctx.to.animate([{ opacity: 0 }, { opacity: 0 }], { duration: total });
  const animations = tiles.map((t) => animateTile(t, tiles.length));
  return { animations: [hold, ...animations], cleanup: remove };
}

export function tileOut(ctx, grid, animateTile) {
  const { tiles, remove } = buildTiles(ctx, { source: 'from', ...grid });
  const hold = ctx.from.animate([{ opacity: 0 }, { opacity: 0 }], { duration: ctx.speed });
  const animations = tiles.map((t) => animateTile(t, tiles.length));
  return { animations: [hold, ...animations], cleanup: remove };
}

const order = (ctx, index, count) => (ctx.dir > 0 ? index : count - 1 - index);

registerTransition('slices', {
  run(ctx) {
    const cols = ctx.width < 600 ? 6 : 10;
    const step = (ctx.speed * 0.45) / cols;
    const duration = ctx.speed - step * (cols - 1);
    return tileIn(ctx, { cols }, ({ tile, col }) =>
      tile.animate(
        [
          { transform: `translateY(${col % 2 ? 100 : -100}%)`, opacity: 0 },
          { transform: 'translateY(0)', opacity: 1 },
        ],
        { duration, delay: order(ctx, col, cols) * step, easing: ctx.easing, fill: 'both' },
      ),
    );
  },
});

registerTransition('blinds', {
  run(ctx) {
    const cols = ctx.vertical ? 1 : ctx.width < 600 ? 5 : 8;
    const rows = ctx.vertical ? 6 : 1;
    const count = cols * rows;
    const step = (ctx.speed * 0.35) / count;
    const duration = ctx.speed - step * (count - 1);
    const from = ctx.vertical ? 'inset(0 0 100% 0)' : ctx.dir > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)';
    return tileIn(ctx, { cols, rows }, ({ tile, index }) =>
      tile.animate([{ clipPath: from }, { clipPath: 'inset(0 0 0 0)' }], {
        duration,
        delay: order(ctx, index, count) * step,
        easing: ctx.easing,
        fill: 'both',
      }),
    );
  },
});

registerTransition('boxes', {
  run(ctx) {
    const cols = ctx.width < 600 ? 4 : 8;
    const rows = Math.max(2, Math.round((cols * ctx.height) / ctx.width));
    const step = (ctx.speed * 0.5) / (cols + rows);
    const duration = ctx.speed - step * (cols + rows - 2);
    return tileIn(ctx, { cols, rows }, ({ tile, row, col }) => {
      const wave = ctx.dir > 0 ? row + col : rows - 1 - row + (cols - 1 - col);
      return tile.animate(
        [
          { transform: 'scale(0) rotate(-45deg)', opacity: 0 },
          { transform: 'scale(1) rotate(0deg)', opacity: 1 },
        ],
        { duration, delay: wave * step, easing: ctx.easing, fill: 'both' },
      );
    });
  },
});

registerTransition('mosaic', {
  run(ctx) {
    const cols = ctx.width < 600 ? 4 : 7;
    const rows = Math.max(2, Math.round((cols * ctx.height) / ctx.width));
    const count = cols * rows;
    const delays = Array.from({ length: count }, () => Math.random());
    return tileIn(ctx, { cols, rows }, ({ tile, index }) =>
      tile.animate([{ opacity: 0, transform: 'scale(1.3)' }, { opacity: 1, transform: 'scale(1)' }], {
        duration: ctx.speed * 0.5,
        delay: delays[index] * ctx.speed * 0.5,
        easing: ctx.easing,
        fill: 'both',
      }),
    );
  },
});

registerTransition('split', {
  run(ctx) {
    const vertical = !ctx.vertical;
    return tileOut(ctx, vertical ? { rows: 2 } : { cols: 2 }, ({ tile, index }) => {
      const sign = index === 0 ? -1 : 1;
      const to = vertical ? `translateY(${sign * 100}%)` : `translateX(${sign * 100}%)`;
      return tile.animate([{ transform: 'translate(0, 0)' }, { transform: to }], {
        duration: ctx.speed,
        easing: ctx.easing,
        fill: 'both',
      });
    });
  },
});

registerTransition('shutter', {
  run(ctx) {
    const rows = ctx.vertical ? 1 : 6;
    const cols = ctx.vertical ? 6 : 1;
    const count = rows * cols;
    const step = (ctx.speed * 0.4) / count;
    const duration = ctx.speed - step * (count - 1);
    return tileOut(ctx, { rows, cols }, ({ tile, index }) =>
      tile.animate(
        [{ transform: 'scale(1, 1)' }, { transform: ctx.vertical ? 'scale(0, 1)' : 'scale(1, 0)' }],
        { duration, delay: order(ctx, index, count) * step, easing: ctx.easing, fill: 'both' },
      ),
    );
  },
});
