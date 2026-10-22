import { createRegistry } from '../core/registry.js';
import { data, el, isObject } from '../core/utils.js';

/**
 * Live weather on a <canvas>: rain streaks with wind, splashes, puddle
 * ripples, drops on glass, drifting mist and lightning. Every slide can have
 * its own weather (`data-us-rain="storm"`); changes blend smoothly.
 *
 *   new UniSlider('#hero', { rain: 'storm' })
 *   new UniSlider('#hero', { rain: { preset: 'rain', angle: -10, color: '#cde' } })
 */

const NUMERIC = ['drops', 'speed', 'length', 'width', 'angle', 'opacity', 'splash', 'puddle', 'glass', 'mist', 'lightning'];

export const rainPresets = createRegistry('rain preset', isObject);

const OFF = { drops: 0, speed: 12, length: 16, width: 1, angle: 6, opacity: 0, splash: 0, puddle: 0, glass: 0, mist: 0, lightning: 0 };
const PRESETS = {
  off: OFF,
  drizzle: { ...OFF, drops: 110, speed: 9, length: 10, angle: 4, opacity: 0.35 },
  rain: { ...OFF, drops: 280, speed: 17, length: 22, width: 1.2, angle: 8, opacity: 0.45, splash: 0.5 },
  downpour: { ...OFF, drops: 620, speed: 25, length: 34, width: 1.4, angle: 12, opacity: 0.5, splash: 1, puddle: 0.7 },
  storm: { ...OFF, drops: 540, speed: 28, length: 40, width: 1.4, angle: 24, opacity: 0.55, splash: 1, lightning: 1 },
  monsoon: { ...OFF, drops: 760, speed: 23, length: 30, width: 1.3, angle: 6, opacity: 0.5, splash: 1, puddle: 1, mist: 0.6 },
  glass: { ...OFF, drops: 80, speed: 14, length: 16, opacity: 0.25, glass: 1 },
  mist: { ...OFF, drops: 40, speed: 8, length: 8, opacity: 0.2, mist: 1 },
};
for (const [name, preset] of Object.entries(PRESETS)) rainPresets.register(name, preset);

const rand = (min, max) => min + Math.random() * (max - min);

/** Turn an option / attribute value into numeric weather params (or null). */
export function resolveRain(value, fallback = null) {
  if (value === undefined || value === null) return fallback;
  if (value === false || value === 'off') return { ...OFF };
  if (value === true) return { ...PRESETS.rain };
  if (typeof value === 'string') return { ...(rainPresets.get(value) ?? PRESETS.rain) };
  if (isObject(value)) {
    const base = rainPresets.get(value.preset ?? 'rain') ?? PRESETS.rain;
    return { ...OFF, ...base, ...value };
  }
  return fallback;
}

export const rainModule = {
  name: 'rain',
  setup(slider) {
    const options = slider.options.rain;
    const global = options ? resolveRain(options) : null;
    const own = slider.slides.map((slide) => data(slide, 'rain'));
    if (!global && own.every((v) => v === undefined || v === false || v === 'off')) return null;
    if (slider.reducedMotion || typeof HTMLCanvasElement === 'undefined') return null;

    const settings = isObject(options) ? options : {};
    const color = settings.color ?? 'rgba(210, 225, 255, 1)';
    const back = settings.layer === 'back' && slider.options.type === 'slider';
    const canvas = el('canvas', { class: `us-rain${back ? ' us-rain--back' : ''}`, 'aria-hidden': 'true' });
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const targetFor = (index) => resolveRain(own[index], global) ?? { ...OFF };
    let target = targetFor(slider.index);
    const p = { ...OFF, ...target };
    let override = null;

    let width = 0;
    let height = 0;
    let area = 1;
    let frame = 0;
    let last = 0;
    let visible = true;
    let flash = 0;
    let bolt = null;
    let nextStrike = performance.now() + rand(1500, 4000);
    const drops = [];
    const particles = [];
    const ripples = [];
    const beads = [];
    let specks = null;
    const fog = Array.from({ length: 5 }, () => ({ x: Math.random(), y: rand(0.3, 1), r: rand(0.3, 0.6), v: rand(-0.0004, 0.0004) || 0.0002 }));

    const place = () => {
      const host = back ? slider.activeSlide : slider.stage;
      if (canvas.parentNode !== host) {
        if (back) {
          const anchor = host.querySelector(':scope > .us-overlay') ?? host.querySelector(':scope > .us-bg');
          anchor ? anchor.after(canvas) : host.prepend(canvas);
        } else host.insertBefore(canvas, slider.ui);
      }
    };

    const measure = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      width = slider.stage.clientWidth;
      height = slider.stage.clientHeight;
      area = Math.max(0.2, (width * height) / (1280 * 720));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      specks = null;
    };

    const newDrop = (anywhere = false) => {
      const z = rand(0.35, 1);
      const drift = Math.tan((p.angle * Math.PI) / 180) * height;
      return {
        x: rand(-Math.max(0, drift), width - Math.min(0, drift)),
        y: anywhere ? rand(-height * 0.2, height) : rand(-height * 0.3, -10),
        z,
        f: rand(0.8, 1.2),
        ground: z > 0.75 ? height * rand(0.78, 1) : height + 60,
      };
    };

    const newBead = (anywhere = false) => ({
      x: rand(0, width),
      y: anywhere ? rand(0, height) : rand(-20, height * 0.6),
      r: rand(1.5, 7),
      vy: 0,
      trail: [],
    });

    function strike() {
      flash = 1;
      const segments = [];
      let x = rand(width * 0.15, width * 0.85);
      let y = 0;
      const end = rand(height * 0.45, height * 0.9);
      const path = [[x, y]];
      while (y < end) {
        x += rand(-28, 28);
        y += rand(18, 42);
        path.push([x, y]);
        if (Math.random() < 0.22) {
          const branch = [[x, y]];
          let bx = x;
          let by = y;
          for (let i = 0; i < 4; i++) {
            bx += rand(-30, 30) + (bx > x ? 8 : -8);
            by += rand(14, 30);
            branch.push([bx, by]);
          }
          segments.push(branch);
        }
      }
      segments.unshift(path);
      bolt = { segments, life: 1 };
      setTimeout(() => (flash = Math.max(flash, 0.7)), 110);
      slider.emit('lightning');
    }

    function update(dt, now) {
      const goal = override ?? target;
      const k = Math.min(1, dt * 0.03);
      for (const key of NUMERIC) p[key] += ((goal[key] ?? 0) - p[key]) * k;

      // keep the number of drops in line with the intensity
      const wanted = Math.round(p.drops * area);
      for (let i = 0; i < 25 && drops.length < wanted; i++) drops.push(newDrop(drops.length < wanted * 0.5));
      if (drops.length > wanted) drops.length = Math.max(wanted, drops.length - 25);

      const slant = Math.tan((p.angle * Math.PI) / 180);
      for (const d of drops) {
        const vy = p.speed * d.z * d.f * dt;
        d.y += vy;
        d.x += vy * slant;
        if (d.y > d.ground) {
          if (d.ground < height + 50) {
            if (Math.random() < p.splash) {
              for (let i = 0; i < 3; i++) {
                particles.push({ x: d.x, y: d.ground, vx: rand(-1.6, 1.6), vy: rand(-3.2, -1.2), life: 1 });
              }
            }
            if (Math.random() < p.puddle * 0.35) ripples.push({ x: d.x, y: d.ground, r: 1, max: rand(8, 24), life: 1 });
          }
          Object.assign(d, newDrop());
        }
      }

      for (const s of particles) {
        s.vy += 0.25 * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.life -= 0.045 * dt;
      }
      for (let i = particles.length - 1; i >= 0; i--) if (particles[i].life <= 0) particles.splice(i, 1);
      for (const r of ripples) {
        r.r += (r.max - r.r) * 0.08 * dt;
        r.life -= 0.025 * dt;
      }
      for (let i = ripples.length - 1; i >= 0; i--) if (ripples[i].life <= 0) ripples.splice(i, 1);

      // drops on glass: some grow heavy and slide down, leaving a trail
      const wantedBeads = Math.round(70 * p.glass * area);
      if (beads.length < wantedBeads && Math.random() < 0.3) beads.push(newBead(beads.length < wantedBeads * 0.6));
      if (beads.length > wantedBeads && Math.random() < 0.2) beads.shift();
      for (const b of beads) {
        if (b.vy === 0 && b.r > 5 && Math.random() < 0.004 * dt) b.vy = rand(0.4, 1.2);
        if (b.vy > 0) {
          b.trail.push([b.x, b.y]);
          if (b.trail.length > 40) b.trail.shift();
          b.y += b.vy * dt;
          b.x += rand(-0.3, 0.3);
          b.vy = Math.min(4, b.vy * (1 + 0.01 * dt));
        }
      }
      for (let i = beads.length - 1; i >= 0; i--) if (beads[i].y - beads[i].r > height) beads.splice(i, 1);

      for (const f of fog) {
        f.x += f.v * dt;
        if (f.x > 1.4) f.x = -0.4;
        if (f.x < -0.4) f.x = 1.4;
      }

      if (p.lightning > 0.5 && now > nextStrike) {
        strike();
        nextStrike = now + rand(3500, 9000) / p.lightning;
      }
      flash = Math.max(0, flash - 0.05 * dt);
      if (bolt) bolt.life -= 0.04 * dt;
      if (bolt && bolt.life <= 0) bolt = null;
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      if (p.mist > 0.01) {
        for (const f of fog) {
          const x = f.x * width;
          const y = f.y * height;
          const r = f.r * Math.max(width, height);
          const g = ctx.createRadialGradient(x, y, 0, x, y, r);
          g.addColorStop(0, `rgba(235, 240, 248, ${0.22 * p.mist})`);
          g.addColorStop(1, 'rgba(235, 240, 248, 0)');
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, width, height);
        }
      }

      if (drops.length && p.opacity > 0.01) {
        const slant = Math.tan((p.angle * Math.PI) / 180);
        ctx.strokeStyle = color;
        ctx.lineCap = 'round';
        // three depth layers: far drops are thinner, shorter and fainter
        for (const [min, max] of [[0, 0.55], [0.55, 0.8], [0.8, 1.01]]) {
          const depth = (min + max) / 2;
          ctx.globalAlpha = p.opacity * (0.35 + 0.65 * depth);
          ctx.lineWidth = p.width * (0.5 + depth);
          ctx.beginPath();
          for (const d of drops) {
            if (d.z < min || d.z >= max) continue;
            const len = p.length * d.z;
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(d.x - slant * len, d.y - len);
          }
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      if (particles.length) {
        ctx.fillStyle = color;
        for (const s of particles) {
          ctx.globalAlpha = Math.max(0, s.life) * p.opacity * 1.4;
          ctx.fillRect(s.x, s.y, 1.6, 1.6);
        }
        ctx.globalAlpha = 1;
      }

      if (ripples.length) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        for (const r of ripples) {
          ctx.globalAlpha = Math.max(0, r.life) * 0.5;
          ctx.beginPath();
          ctx.ellipse(r.x, r.y, r.r, r.r * 0.32, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      if (p.glass > 0.01) drawGlass();

      if (bolt) {
        ctx.save();
        ctx.strokeStyle = '#fff';
        ctx.shadowColor = 'rgba(170, 200, 255, 0.95)';
        ctx.shadowBlur = 24;
        ctx.globalAlpha = Math.max(0, bolt.life);
        bolt.segments.forEach((segment, i) => {
          ctx.lineWidth = i === 0 ? 2.6 : 1.2;
          ctx.beginPath();
          segment.forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
          ctx.stroke();
        });
        ctx.restore();
      }
      if (flash > 0.01) {
        ctx.fillStyle = `rgba(225, 235, 255, ${flash * 0.45})`;
        ctx.fillRect(0, 0, width, height);
      }
    }

    function drawGlass() {
      const alpha = Math.min(1, p.glass);
      if (!specks) {
        specks = Array.from({ length: Math.round(260 * area) }, () => [rand(0, width), rand(0, height), rand(0.5, 1.8)]);
      }
      ctx.fillStyle = `rgba(255, 255, 255, ${0.22 * alpha})`;
      for (const [x, y, r] of specks) ctx.fillRect(x, y, r, r);

      for (const b of beads) {
        if (b.trail.length > 1) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * alpha})`;
          ctx.lineWidth = b.r * 0.7;
          ctx.lineCap = 'round';
          ctx.beginPath();
          b.trail.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
          ctx.stroke();
        }
        const g = ctx.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.1, b.x, b.y, b.r);
        g.addColorStop(0, `rgba(255, 255, 255, ${0.35 * alpha})`);
        g.addColorStop(0.6, `rgba(255, 255, 255, ${0.06 * alpha})`);
        g.addColorStop(1, `rgba(255, 255, 255, ${0.3 * alpha})`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(b.x, b.y, b.r * 0.9, b.r, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(0, 0, 0, ${0.18 * alpha})`;
        ctx.beginPath();
        ctx.ellipse(b.x + b.r * 0.15, b.y + b.r * 0.55, b.r * 0.6, b.r * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const idle = () => {
      const goal = override ?? target;
      return !goal.drops && !goal.glass && !goal.mist && p.opacity < 0.02 && !particles.length && !ripples.length && !beads.length && !bolt && flash <= 0;
    };

    function loop(now) {
      const dt = Math.min(3, (now - last) / 16.67);
      last = now;
      update(dt, now);
      draw();
      if (idle()) {
        drops.length = 0;
        ctx.clearRect(0, 0, width, height);
        frame = 0;
        return;
      }
      frame = visible && !document.hidden ? requestAnimationFrame(loop) : 0;
    }

    const kick = () => {
      if (frame || !visible || document.hidden) return;
      last = performance.now();
      frame = requestAnimationFrame(loop);
    };

    const onChange = ({ index }) => {
      target = targetFor(index);
      if (back) place();
      kick();
    };
    const onResize = () => {
      measure();
      kick();
    };
    const onVisibility = () => (document.hidden ? cancel() : kick());
    const cancel = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    place();
    measure();
    slider.on('change', onChange);
    slider.on('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);
    let observer = null;
    if (typeof IntersectionObserver === 'function') {
      observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) kick();
        else cancel();
      });
      observer.observe(slider.root);
    }
    kick();

    return {
      /** Change the weather now: a preset name, options object, or null to follow the slides again. */
      set(value) {
        override = value === null ? null : resolveRain(value, { ...OFF });
        kick();
      },
      strike() {
        strike();
        kick();
      },
      get params() {
        return { ...p };
      },
      destroy() {
        cancel();
        observer?.disconnect();
        slider.off('change', onChange);
        slider.off('resize', onResize);
        document.removeEventListener('visibilitychange', onVisibility);
        canvas.remove();
      },
    };
  },
};

/** Water ripples where the visitor clicks or taps (`ripple: true`). */
export const rippleModule = {
  name: 'ripple',
  setup(slider) {
    const o = slider.options.ripple;
    if (!o || slider.reducedMotion) return null;
    const settings = isObject(o) ? o : {};
    const stage = slider.stage;
    const layer = el('div', { class: 'us-touch-ripples', 'aria-hidden': 'true' });
    stage.insertBefore(layer, slider.ui);
    if (settings.color) layer.style.setProperty('--us-ripple-color', settings.color);
    let lastHover = 0;

    const spawn = (x, y, rings, size) => {
      for (let i = 0; i < rings; i++) {
        const ring = el('span', { class: 'us-touch-ripple', style: { left: `${x}px`, top: `${y}px` } });
        layer.append(ring);
        ring
          .animate(
            [
              { transform: 'translate(-50%, -50%) scale(0)', opacity: 0.8 },
              { transform: `translate(-50%, -50%) scale(${size - i * size * 0.25})`, opacity: 0 },
            ],
            { duration: 1100 + i * 150, delay: i * 140, easing: 'cubic-bezier(0.2, 0.6, 0.3, 1)', fill: 'both' },
          )
          .finished.then(() => ring.remove(), () => ring.remove());
      }
    };
    const point = (e) => {
      const rect = stage.getBoundingClientRect();
      return [e.clientX - rect.left, e.clientY - rect.top];
    };
    const onDown = (e) => {
      if (e.target.closest('.us-ui > *')) return;
      spawn(...point(e), settings.rings ?? 3, 14);
    };
    const onMove = (e) => {
      if (e.pointerType !== 'mouse' || e.timeStamp - lastHover < 90) return;
      lastHover = e.timeStamp;
      spawn(...point(e), 1, 5);
    };
    if (settings.click !== false) stage.addEventListener('pointerdown', onDown);
    if (settings.hover) stage.addEventListener('pointermove', onMove);
    return {
      spawn,
      destroy() {
        stage.removeEventListener('pointerdown', onDown);
        stage.removeEventListener('pointermove', onMove);
        layer.remove();
      },
    };
  },
};
