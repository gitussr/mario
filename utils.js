/* ═══════════════════════════════════════════════════════
   MARIO BIRDS — UTILITIES
   Collision detection, math helpers, particles, save/load
═══════════════════════════════════════════════════════ */

// ── AABB Collision ─────────────────────────────────────
function rectOverlap(a, b) {
  return a.x < b.x + b.w &&
         a.x + a.w > b.x &&
         a.y < b.y + b.h &&
         a.y + a.h > b.y;
}

function rectContains(rect, px, py) {
  return px >= rect.x && px <= rect.x + rect.w &&
         py >= rect.y && py <= rect.y + rect.h;
}

// Returns overlap vector on collision (for resolution)
function collisionSide(moving, fixed) {
  const mCX = moving.x + moving.w / 2;
  const mCY = moving.y + moving.h / 2;
  const fCX = fixed.x  + fixed.w  / 2;
  const fCY = fixed.y  + fixed.h  / 2;

  const dx = mCX - fCX;
  const dy = mCY - fCY;
  const hw = (moving.w + fixed.w) / 2;
  const hh = (moving.h + fixed.h) / 2;

  const ox = hw - Math.abs(dx);
  const oy = hh - Math.abs(dy);

  if (ox < oy) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'bottom' : 'top';
}

// ── MATH HELPERS ───────────────────────────────────────
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const lerp  = (a, b, t)     => a + (b - a) * t;
const rand  = (min, max)    => Math.random() * (max - min) + min;
const randInt = (min, max)  => Math.floor(rand(min, max + 1));
const dist  = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);

// ── PARTICLE SYSTEM ────────────────────────────────────
class ParticleSystem {
  constructor() { this.particles = []; }

  emit({ x, y, count = 8, colors = ['#ffd700','#ff4444','#fff'],
         speed = 4, life = 0.8, size = 6, gravity = 400, type = 'square' }) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + rand(-0.3, 0.3);
      const spd   = rand(speed * 0.5, speed * 1.5);
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - rand(1, 3),
        life, maxLife: life,
        size: rand(size * 0.6, size * 1.4),
        color: colors[randInt(0, colors.length - 1)],
        gravity, type,
        rot: rand(0, Math.PI * 2),
        rotV: rand(-5, 5)
      });
    }
  }

  emitCoin(x, y) {
    this.emit({ x, y, count: 6, colors: ['#ffd700','#ffe066','#fff8b0'],
                speed: 5, life: 0.7, size: 8, type: 'circle' });
  }

  emitStomp(x, y) {
    this.emit({ x, y, count: 10, colors: ['#57cc57','#3a8f3a','#fff','#ffe066'],
                speed: 6, life: 0.6, size: 7 });
  }

  emitBreak(x, y, color = '#c8832a') {
    this.emit({ x, y, count: 14, colors: [color, '#fff', '#555'],
                speed: 7, life: 1.0, size: 9, gravity: 500 });
  }

  emitExplosion(x, y) {
    this.emit({ x, y, count: 20, colors: ['#ff4444','#ff8c00','#ffd700','#fff'],
                speed: 9, life: 1.2, size: 10, gravity: 350 });
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) { this.particles.splice(i, 1); continue; }
      p.x  += p.vx * dt * 60;
      p.y  += p.vy * dt * 60;
      p.vy += p.gravity * dt;
      p.rot += p.rotV * dt;
    }
  }

  draw(ctx) {
    this.particles.forEach(p => {
      const alpha = clamp(p.life / p.maxLife, 0, 1);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;

      if (p.type === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      }
      ctx.restore();
    });
  }
}

// ── FLOATING TEXT ──────────────────────────────────────
class FloatingText {
  constructor() { this.items = []; }

  add(x, y, text, color = '#ffd700', size = 28) {
    this.items.push({ x, y, text, color, size, life: 1.0, vy: -1.5 });
  }

  update(dt) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const t = this.items[i];
      t.life -= dt * 1.5;
      t.y    += t.vy;
      t.vy   *= 0.97;
      if (t.life <= 0) this.items.splice(i, 1);
    }
  }

  draw(ctx) {
    this.items.forEach(t => {
      ctx.save();
      ctx.globalAlpha = clamp(t.life, 0, 1);
      ctx.font = `bold ${t.size}px 'Fredoka One', cursive`;
      ctx.fillStyle = t.color;
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = 4;
      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    });
  }
}

// ── SCREEN SHAKE ───────────────────────────────────────
const ScreenShake = {
  strength: 0,
  decay: 8,
  x: 0, y: 0,

  trigger(strength = 8) {
    this.strength = Math.max(this.strength, strength);
  },

  update(dt) {
    if (this.strength > 0.1) {
      this.x = rand(-this.strength, this.strength);
      this.y = rand(-this.strength, this.strength);
      this.strength -= this.decay * dt;
    } else {
      this.strength = 0; this.x = 0; this.y = 0;
    }
  }
};

// ── SAVE / LOAD ─────────────────────────────────────────
const Save = {
  KEY: 'mario_birds_save',

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : this.defaultSave();
    } catch { return this.defaultSave(); }
  },

  save(data) {
    try { localStorage.setItem(this.KEY, JSON.stringify(data)); } catch {}
  },

  defaultSave() {
    return {
      highScore: 0,
      unlockedLevels: [true, false, false, false, false, false, false, false, false, false],
      levelStars: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      levelHighScores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    };
  },

  completeLevel(levelIdx, score, coins, timeLeft) {
    const data = this.load();
    // Stars: 3 = quick + all coins, 2 = coins or speed, 1 = just finish
    const stars = (coins >= 5 && timeLeft > 150) ? 3
                : (coins >= 3 || timeLeft > 100)  ? 2 : 1;

    if (stars > (data.levelStars[levelIdx] || 0)) data.levelStars[levelIdx] = stars;
    if (score > (data.levelHighScores[levelIdx] || 0)) data.levelHighScores[levelIdx] = score;
    if (score > data.highScore) data.highScore = score;
    if (levelIdx + 1 < 10) data.unlockedLevels[levelIdx + 1] = true;
    this.save(data);
    return stars;
  }
};

// ── TIMER ──────────────────────────────────────────────
class GameTimer {
  constructor(seconds) {
    this.total   = seconds;
    this.current = seconds;
    this.active  = false;
  }
  start() { this.active = true; }
  stop()  { this.active = false; }
  reset() { this.current = this.total; }
  update(dt) {
    if (!this.active) return;
    this.current = Math.max(0, this.current - dt);
  }
  get isExpired() { return this.current <= 0; }
  get display()   { return Math.ceil(this.current); }
}

// ── INPUT MANAGER ──────────────────────────────────────
const Input = {
  keys: {},
  justPressed: {},
  justReleased: {},
  _prev: {},

  init() {
    window.addEventListener('keydown', e => {
      if (!this.keys[e.code]) this.justPressed[e.code] = true;
      this.keys[e.code] = true;
      // Prevent arrow key scrolling
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) {
        e.preventDefault();
      }
    });
    window.addEventListener('keyup', e => {
      this.keys[e.code] = false;
      this.justReleased[e.code] = true;
    });
  },

  isDown(code)       { return !!this.keys[code]; },
  wasPressed(code)   { return !!this.justPressed[code]; },
  wasReleased(code)  { return !!this.justReleased[code]; },

  // Composite helpers
  get left()   { return this.isDown('ArrowLeft')  || this.isDown('KeyA'); },
  get right()  { return this.isDown('ArrowRight') || this.isDown('KeyD'); },
  get jump()   { return this.isDown('ArrowUp')    || this.isDown('Space') || this.isDown('KeyW'); },
  get jumpPressed() { return this.wasPressed('ArrowUp') || this.wasPressed('Space') || this.wasPressed('KeyW'); },
  get action() { return this.wasPressed('KeyF')   || this.wasPressed('KeyE'); },
  get pause()  { return this.wasPressed('Escape') || this.wasPressed('KeyP'); },

  flush() {
    this.justPressed  = {};
    this.justReleased = {};
  }
};
