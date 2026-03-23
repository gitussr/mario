/* ═══════════════════════════════════════════════════════
   MARIO BIRDS — ENTITIES
   Player, Pigs, Coins, Blocks, Structures, Slingshot, Flag
═══════════════════════════════════════════════════════ */

// ══════════════════════════════════════════════════════
// PLAYER — Mario Bird
// ══════════════════════════════════════════════════════
class Player {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.w = 44; this.h = 48;
    this.vx = 0; this.vy = 0;
    this.onGround = false;
    this.alive = true;
    this.invincible = 0;   // seconds of invincibility
    this.jumpHeld  = 0;    // for variable jump height
    this.facingRight = true;
    this.state = 'idle';   // idle | run | jump | fall | hurt | dead | slingshot
    this.animFrame = 0;
    this.animTimer = 0;

    // Slingshot state
    this.nearSlingshot = null;
    this.inSlingshot   = false;
    this.slingshotCharge = 0; // 0–1

    // Stats
    this.score = 0;
    this.coins = 0;
    this.lives = 3;

    // Physics constants
    this.speed     = 260;
    this.jumpPower = 580;
    this.maxFall   = 800;
  }

  get rect() { return { x: this.x, y: this.y, w: this.w, h: this.h }; }
  get cx()   { return this.x + this.w / 2; }
  get cy()   { return this.y + this.h / 2; }
  get bottom(){ return this.y + this.h; }

  update(dt, level, particles, floatingText) {
    if (!this.alive) return;
    if (this.invincible > 0) this.invincible -= dt;

    // Slingshot interaction
    if (this.inSlingshot) {
      this._updateSlingshot(dt, level, particles, floatingText);
      return;
    }

    // Horizontal movement
    const acc = this.onGround ? 1.0 : 0.75;
    if (Input.left)  {
      this.vx = lerp(this.vx, -this.speed, acc * dt * 10);
      this.facingRight = false;
    } else if (Input.right) {
      this.vx = lerp(this.vx, this.speed, acc * dt * 10);
      this.facingRight = true;
    } else {
      // Friction
      this.vx = lerp(this.vx, 0, (this.onGround ? 18 : 6) * dt);
      if (Math.abs(this.vx) < 1) this.vx = 0;
    }

    // Jump
    if (Input.jumpPressed && this.onGround) {
      this.vy = -this.jumpPower;
      this.jumpHeld = 0.18;
      this.onGround = false;
      Audio8bit.play('jump');
    }
    if (Input.jump && this.jumpHeld > 0) {
      this.vy -= 800 * dt;
      this.jumpHeld -= dt;
    } else { this.jumpHeld = 0; }

    // NOTE: gravity, X/Y movement, and collision are handled by Physics.update()

    // Animation state
    this._animate(dt);

    // Check slingshot proximity
    this.nearSlingshot = null;
    for (const s of level.slingshotObjs || []) {
      if (dist(this.cx, this.cy, s.cx, s.cy) < 90) {
        this.nearSlingshot = s;
        break;
      }
    }
    if (Input.action && this.nearSlingshot) {
      this._enterSlingshot(this.nearSlingshot);
    }
  }

  _enterSlingshot(s) {
    this.inSlingshot = true;
    this.slingshotCharge = 0;
    this.x = s.cx - this.w / 2;
    this.y = s.launchY - this.h;
    this.vx = 0; this.vy = 0;
    this.state = 'slingshot';
    Audio8bit.play('slingshotCharge');
  }

  _updateSlingshot(dt) {
    this.slingshotCharge = Math.min(1, this.slingshotCharge + dt * 1.2);

    // Launch on jump or action release
    if (!Input.jump && !Input.action && this.slingshotCharge > 0.1) {
      const power = 900 + this.slingshotCharge * 700;
      this.vx = this.facingRight ? power * 0.85 : -power * 0.85;
      this.vy = -power * 0.55;
      this.inSlingshot = false;
      this.state = 'jump';
      Audio8bit.play('slingshotLaunch');
    }
  }

  _animate(dt) {
    this.animTimer += dt;
    const moving = Math.abs(this.vx) > 20;
    const fps = moving ? 10 : 4;
    if (this.animTimer > 1 / fps) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 4;
    }
    if (!this.onGround) {
      this.state = this.vy < 0 ? 'jump' : 'fall';
    } else if (moving) {
      this.state = 'run';
    } else {
      this.state = 'idle';
    }
  }

  hurt(particles) {
    if (this.invincible > 0 || !this.alive) return;
    this.invincible = 2.0;
    this.lives--;
    this.state = 'hurt';
    this.vy = -400;
    Audio8bit.play('hurt');
    if (this.lives <= 0) this.die();
  }

  die() {
    this.alive = false;
    this.state = 'dead';
    this.vy = -700;
    Audio8bit.play('death');
  }

  addScore(pts, x, y, floatingText) {
    this.score += pts;
    if (floatingText && x !== undefined) {
      floatingText.add(x, y, '+' + pts, '#ffd700');
    }
  }

  addCoin(x, y, floatingText) {
    this.coins++;
    this.score += 100;
    Audio8bit.play('coin');
    if (floatingText) floatingText.add(x, y, '+100', '#ffd700', 22);
    if (this.coins % 100 === 0) {
      this.lives++;
      Audio8bit.play('oneUp');
      if (floatingText) floatingText.add(x, y - 30, '1-UP!', '#7fff7f', 32);
    }
  }
}

// ══════════════════════════════════════════════════════
// PIG ENEMY
// ══════════════════════════════════════════════════════
class Pig {
  constructor(cfg) {
    this.x  = cfg.x;
    this.y  = cfg.y;
    this.type = cfg.type || 'normal'; // normal | helmet | fat | king
    this.hp   = cfg.hp   || 1;
    this.maxHp = this.hp;
    this.isBoss = cfg.isBoss || false;
    this.vx   = 0;
    this.vy   = 0;
    this.onGround = false;
    this.alive = true;
    this.dieTimer = 0;
    this.hitFlash = 0;
    this.facingRight = false;
    this.animFrame = 0;
    this.animTimer = 0;
    this.patrolDir = Math.random() > 0.5 ? 1 : -1;
    this.patrolTimer = rand(1.5, 3.5);

    // Size based on type
    const sizes = { normal: [38,38], helmet: [38,42], fat: [48,52], king: [56,60] };
    [this.w, this.h] = sizes[this.type] || [38,38];
  }

  get rect() { return { x: this.x, y: this.y, w: this.w, h: this.h }; }
  get cx()   { return this.x + this.w / 2; }
  get cy()   { return this.y + this.h / 2; }
  get points() {
    const pts = { normal: 200, helmet: 400, fat: 600, king: 1000 };
    return (pts[this.type] || 200) * (this.isBoss ? 5 : 1);
  }

  update(dt, level) {
    if (!this.alive) {
      this.dieTimer += dt;
      this.vy += (level.gravity || 900) * dt;
      this.y  += this.vy * dt;
      return;
    }
    if (this.hitFlash > 0) this.hitFlash -= dt;

    // Simple patrol AI
    this.patrolTimer -= dt;
    if (this.patrolTimer <= 0) {
      this.patrolDir  *= -1;
      this.patrolTimer = rand(1.5, 3.5);
    }
    const speed = { normal: 60, helmet: 50, fat: 40, king: 70 }[this.type] || 60;
    this.vx = this.patrolDir * speed;
    this.facingRight = this.vx > 0;

    // Gravity
    this.vy = Math.min(this.vy + (level.gravity || 900) * dt, 800);
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.onGround = false;

    // Animation
    this.animTimer += dt;
    if (this.animTimer > 0.15) { this.animTimer = 0; this.animFrame = (this.animFrame + 1) % 4; }
  }

  hit(dmg = 1, particles) {
    if (!this.alive) return;
    this.hp -= dmg;
    this.hitFlash = 0.25;
    Audio8bit.play('pigSqueal');
    if (particles) particles.emitStomp(this.cx, this.cy);
    if (this.hp <= 0) this.kill(particles);
  }

  kill(particles) {
    this.alive = false;
    this.vy = -300;
    this.dieTimer = 0;
    if (particles) {
      particles.emitStomp(this.cx, this.cy);
      particles.emit({
        x: this.cx, y: this.cy, count: 8,
        colors: ['#57cc57','#3a8f3a','#fff'], speed: 5, life: 0.6
      });
    }
    Audio8bit.play('stomp');
  }
}

// ══════════════════════════════════════════════════════
// COIN
// ══════════════════════════════════════════════════════
class Coin {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.w = 24; this.h = 24;
    this.collected = false;
    this.animFrame = 0;
    this.animTimer = 0;
    this.bobOffset = Math.random() * Math.PI * 2;
  }
  get rect() { return { x: this.x, y: this.y - Math.sin(this.bobOffset) * 4, w: this.w, h: this.h }; }
  update(dt) {
    this.bobOffset += dt * 3;
    this.animTimer += dt;
    if (this.animTimer > 0.1) { this.animTimer = 0; this.animFrame = (this.animFrame + 1) % 6; }
  }
}

// ══════════════════════════════════════════════════════
// BLOCK (Question / Brick)
// ══════════════════════════════════════════════════════
class Block {
  constructor(cfg) {
    this.x = cfg.x; this.y = cfg.y;
    this.w = TILE; this.h = TILE;
    this.type = cfg.type; // question | brick | pipe
    this.hit  = false;
    this.bounceTimer = 0;
    this.bounceY = 0;
    this.item = cfg.item || 'coin'; // coin | mushroom
  }
  get rect() { return { x: this.x, y: this.y + this.bounceY, w: this.w, h: this.h }; }

  hitBlock(player, particles, floatingText) {
    if (this.hit && this.type === 'question') return;
    Audio8bit.play('blockHit');
    this.bounceTimer = 0.18;

    if (this.type === 'question' && !this.hit) {
      this.hit = true;
      Audio8bit.play('powerup');
      player.addScore(200, this.x + this.w / 2, this.y, floatingText);
      if (particles) particles.emitCoin(this.x + this.w / 2, this.y);
    } else if (this.type === 'brick') {
      if (particles) particles.emitBreak(this.x + this.w / 2, this.y + this.h / 2, '#c8832a');
      this.destroyed = true;
    }
  }

  update(dt) {
    if (this.bounceTimer > 0) {
      this.bounceTimer -= dt;
      const t = 1 - (this.bounceTimer / 0.18);
      this.bounceY = -Math.sin(t * Math.PI) * 12;
    } else { this.bounceY = 0; }
  }
}

// ══════════════════════════════════════════════════════
// STRUCTURE BLOCK (Wood / Stone / Glass)
// ══════════════════════════════════════════════════════
class StructureBlock {
  constructor(x, y, w, h, type) {
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.type = type; // wood | stone | glass
    this.maxHp = type === 'stone' ? 3 : type === 'wood' ? 2 : 1;
    this.hp    = this.maxHp;
    this.alive = true;
    this.hitFlash = 0;
    this.crackLevel = 0;
  }
  get rect() { return { x: this.x, y: this.y, w: this.w, h: this.h }; }

  damage(dmg, particles) {
    if (!this.alive) return;
    this.hp -= dmg;
    this.hitFlash = 0.2;
    this.crackLevel = Math.floor((1 - this.hp / this.maxHp) * 3);
    if (this.hp <= 0) {
      this.alive = false;
      const col = this.type === 'stone' ? '#888' : this.type === 'wood' ? '#c8832a' : '#aef';
      if (particles) particles.emitBreak(this.x + this.w/2, this.y + this.h/2, col);
      Audio8bit.play(this.type === 'stone' ? 'stoneBreak' : 'woodBreak');
    }
  }

  update(dt) {
    if (this.hitFlash > 0) this.hitFlash -= dt;
  }
}

// ══════════════════════════════════════════════════════
// SLINGSHOT
// ══════════════════════════════════════════════════════
class Slingshot {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.w = 48; this.h = 80;
    this.used = false;
    this.animFrame = 0;
  }
  get cx()      { return this.x + this.w / 2; }
  get launchY() { return this.y + 20; }
}

// ══════════════════════════════════════════════════════
// FLAG
// ══════════════════════════════════════════════════════
class Flag {
  constructor(x, groundY) {
    this.x = x;
    this.y = groundY - 320;
    this.w = 16;
    this.h = 320;
    this.poleX = x + 8;
    this.triggered = false;
    this.slideY = 0;
    this.animFrame = 0;
    this.animTimer = 0;
  }
  get rect() { return { x: this.x, y: this.y, w: 64, h: this.h }; }

  update(dt) {
    this.animTimer += dt;
    if (this.animTimer > 0.1) { this.animTimer = 0; this.animFrame = (this.animFrame + 1) % 4; }
    if (this.triggered && this.slideY < this.h - 60) {
      this.slideY += 180 * dt;
    }
  }
}

// ══════════════════════════════════════════════════════
// LEVEL OBJECT FACTORY
// Converts raw level data → live game objects
// ══════════════════════════════════════════════════════
function buildLevelObjects(levelData, canvasHeight) {
  const groundY = canvasHeight - GH;

  // Helper: resolve gy() sentinel or plain number
  const ry = val => (typeof resolveY === 'function') ? resolveY(val, groundY) : val;

  // Platforms (static AABB) — resolve y values
  const platforms = levelData.platforms.map(p => ({
    ...p,
    y: ry(p.y),
    isGround: false
  }));
  // Add the main ground floor
  platforms.push({ x: 0, y: groundY, w: levelData.width, h: GH, type: 'ground', isGround: true });

  // Player — always spawn on ground surface
  const player = new Player(levelData.startX, groundY - 52);

  // Pigs — resolve y, default to sitting on ground
  const pigs = levelData.pigs.map(p => new Pig({
    ...p,
    x: p.x,
    y: ry(p.y !== undefined ? p.y : groundY - 52)
  }));

  // Coins — resolve y
  const coins = levelData.coins.map(c => new Coin(c.x, ry(c.y)));

  // Blocks — resolve y
  const blocks = levelData.blocks.map(b => new Block({ ...b, y: ry(b.y) }));

  // Structures → flat arrays of StructureBlocks + embedded pigs
  const structureBlocks = [];
  for (const s of levelData.structures) {
    const sy = ry(s.y);  // structure base Y (resolved)
    for (const b of s.blocks) {
      structureBlocks.push(new StructureBlock(
        s.x + b.dx,
        sy + b.dy,        // dy is always a plain pixel offset
        b.w || TILE, b.h || TILE, b.type
      ));
    }
    for (const p of (s.pigs || [])) {
      pigs.push(new Pig({
        ...p,
        x: s.x + p.x,
        y: sy + p.y,      // p.y is a pixel offset relative to structure base
      }));
    }
  }

  // Slingshots — always on ground
  const slingshotObjs = levelData.slingshots.map(s => new Slingshot(s.x, groundY - 80));

  // Flag
  const flag = new Flag(levelData.flagX, groundY);

  return { player, pigs, coins, blocks, structureBlocks, platforms, slingshotObjs, flag, groundY };
}
