/* ═══════════════════════════════════════════════
   ENTITIES — Player, Pig, Coin, Block, Slingshot, Flag
═══════════════════════════════════════════════ */

// ══════════════════════════════════════════════
// PLAYER
// ══════════════════════════════════════════════
class Player {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.w = 32; this.h = 48;
    this.vx = 0; this.vy = 0;
    this.onGround = false;
    this.alive = true;
    this.invincible = 0;
    this.jumpHeld = 0;
    this.facingRight = true;
    this.state = 'idle';
    this.animFrame = 0;
    this.animTimer = 0;
    this.runFrame = 0;

    // Slingshot
    this.nearSlingshot = null;
    this.inSlingshot   = false;
    this.slingshotDir  = 1;    // 1=right, -1=left
    this.slingshotCharge = 0;
    this.slingshotActive = false; // true while F held

    // Stats
    this.score = 0;
    this.coins = 0;
    this.lives = 3;
  }

  get rect()  { return { x:this.x, y:this.y, w:this.w, h:this.h }; }
  get cx()    { return this.x + this.w/2; }
  get cy()    { return this.y + this.h/2; }
  get maxFall(){ return Physics.MAX_FALL; }

  update(dt, level, particles, floatText) {
    if (!this.alive) return;
    if (this.invincible > 0) this.invincible -= dt;

    // ── Slingshot ──
    if (this.inSlingshot) {
      this._slingshotUpdate(dt);
      return;
    }

    // ── Horizontal ──
    const onGnd = this.onGround;
    const run   = Input.isDown('ShiftLeft') || Input.isDown('ShiftRight');
    const topSpd = run ? Physics.RUN_SPEED : Physics.WALK_SPEED;

    if (Input.left) {
      this.vx = lerp(this.vx, -topSpd, (onGnd ? 14 : 7) * dt);
      this.facingRight = false;
    } else if (Input.right) {
      this.vx = lerp(this.vx, topSpd,  (onGnd ? 14 : 7) * dt);
      this.facingRight = true;
    } else {
      this.vx = lerp(this.vx, 0, (onGnd ? 22 : 5) * dt);
      if (Math.abs(this.vx) < 2) this.vx = 0;
    }

    // ── Jump — snappy ──
    if (Input.jumpPressed && this.onGround) {
      this.vy = Physics.JUMP_VEL;
      this.jumpHeld = Physics.JUMP_HOLD;
      this.onGround = false;
      Audio8bit.play('jump');
      ScreenShake.trigger(2);
    }
    // Variable height — hold for higher
    if (Input.jump && this.jumpHeld > 0 && this.vy < 0) {
      this.vy -= Physics.JUMP_HOLD_F * dt;
      this.jumpHeld -= dt;
    } else {
      this.jumpHeld = 0;
    }

    // ── Slingshot enter ──
    this.nearSlingshot = null;
    for (const s of (level.slingshotObjs || [])) {
      if (dist(this.cx, this.cy, s.cx, s.cy) < 100) { this.nearSlingshot = s; break; }
    }
    if (Input.action && this.nearSlingshot && !this.inSlingshot) {
      this._enterSlingshot(this.nearSlingshot);
    }

    this._animate(dt);
  }

  _enterSlingshot(s) {
    this.inSlingshot     = true;
    this.slingshotCharge = 0;
    this.slingshotActive = true;
    this.slingshotDir    = this.facingRight ? 1 : -1;
    // Snap to slingshot cup position
    this.x  = s.cx - this.w / 2;
    this.y  = s.launchY - this.h;
    this.vx = 0; this.vy = 0;
    this.state = 'slingshot';
    Audio8bit.play('slingshotCharge');
  }

  _slingshotUpdate(dt) {
    if (this.slingshotActive) {
      // Charge while F / E held
      this.slingshotCharge = Math.min(1, this.slingshotCharge + dt * 1.6);

      // Aim direction with arrow keys
      if (Input.left)  this.slingshotDir = -1;
      if (Input.right) this.slingshotDir =  1;

      // Release: key lifted OR jump pressed
      const released = !Input.isDown('KeyF') && !Input.isDown('KeyE');
      const jumpFire  = Input.jumpPressed;

      if ((released || jumpFire) && this.slingshotCharge > 0.08) {
        this._slingshotLaunch();
      }
    }
  }

  _slingshotLaunch() {
    const charge = this.slingshotCharge;
    const power  = 1000 + charge * 800;
    this.vx = this.slingshotDir * power * 0.88;
    this.vy = -power * 0.52;
    this.inSlingshot     = false;
    this.slingshotActive = false;
    this.slingshotCharge = 0;
    this.state = 'jump';
    this.facingRight = this.slingshotDir > 0;
    Audio8bit.play('slingshotLaunch');
    ScreenShake.trigger(6);
  }

  _animate(dt) {
    this.animTimer += dt;
    const spd = Math.abs(this.vx);
    const fps  = spd > 200 ? 12 : spd > 60 ? 8 : 4;
    if (this.animTimer > 1/fps) {
      this.animTimer = 0;
      this.runFrame = (this.runFrame + 1) % 4;
    }
    if (!this.onGround) {
      this.state = this.vy < 0 ? 'jump' : 'fall';
    } else if (Math.abs(this.vx) > 20) {
      this.state = 'run';
    } else {
      this.state = 'idle';
    }
  }

  hurt(particles) {
    if (this.invincible > 0 || !this.alive) return;
    this.invincible = 2.2;
    this.lives--;
    this.vy = -500;
    Audio8bit.play('hurt');
    if (particles) particles.emitExplosion(this.cx, this.cy);
    if (this.lives <= 0) this.die();
  }

  die() {
    this.alive = false;
    this.vy = -700;
    Audio8bit.play('death');
  }

  addScore(pts, x, y, ft) {
    this.score += pts;
    if (ft && x !== undefined) ft.add(x, y, '+'+pts, '#ffd700');
  }

  addCoin(x, y, ft) {
    this.coins++;
    this.score += 200;
    Audio8bit.play('coin');
    if (ft) ft.add(x, y, '+200', '#ffd700', 22);
    if (this.coins % 50 === 0) {
      this.lives++;
      Audio8bit.play('oneUp');
      if (ft) ft.add(x, y-30, '1-UP!', '#7fff7f', 32);
    }
  }
}

// ══════════════════════════════════════════════
// PIG
// ══════════════════════════════════════════════
class Pig {
  constructor(cfg) {
    this.x = cfg.x; this.y = cfg.y;
    this.type   = cfg.type  || 'normal';
    this.hp     = cfg.hp    || 1;
    this.maxHp  = this.hp;
    this.isBoss = cfg.isBoss|| false;
    this.vx = 0; this.vy = 0;
    this.onGround = false;
    this.alive = true;
    this.dieTimer  = 0;
    this.hitFlash  = 0;
    this.facingRight = Math.random() > 0.5;
    this.patrolDir   = this.facingRight ? 1 : -1;
    this.patrolTimer = rand(1.5, 3.5);
    this.animFrame = 0; this.animTimer = 0;
    const sz = { normal:[36,36], helmet:[36,40], fat:[46,50], king:[54,58] };
    [this.w, this.h] = sz[this.type] || [36,36];
  }
  get rect(){ return {x:this.x,y:this.y,w:this.w,h:this.h}; }
  get cx()  { return this.x+this.w/2; }
  get cy()  { return this.y+this.h/2; }
  get points(){ const p={normal:200,helmet:500,fat:800,king:1500}; return (p[this.type]||200)*(this.isBoss?8:1); }

  update(dt, level) {
    if (!this.alive) { this.dieTimer+=dt; return; }
    if (this.hitFlash > 0) this.hitFlash -= dt;
    this.patrolTimer -= dt;
    if (this.patrolTimer <= 0) { this.patrolDir*=-1; this.patrolTimer=rand(1.5,3.5); }
    const spd = {normal:70,helmet:55,fat:45,king:90}[this.type]||70;
    this.vx = this.patrolDir * spd;
    this.facingRight = this.vx > 0;
    this.animTimer += dt;
    if (this.animTimer > 0.14) { this.animTimer=0; this.animFrame=(this.animFrame+1)%4; }
  }

  hit(dmg, particles) {
    if (!this.alive) return;
    this.hp -= dmg;
    this.hitFlash = 0.22;
    Audio8bit.play('pigSqueal');
    if (particles) particles.emitStomp(this.cx, this.cy);
    if (this.hp <= 0) this.kill(particles);
  }

  kill(particles) {
    this.alive = false; this.vy = -280; this.dieTimer = 0;
    if (particles) particles.emitExplosion(this.cx, this.cy);
    Audio8bit.play('stomp');
  }
}

// ══════════════════════════════════════════════
// COIN
// ══════════════════════════════════════════════
class Coin {
  constructor(x, y) {
    this.x=x; this.y=y; this.w=22; this.h=22;
    this.collected=false;
    this.bobOffset=Math.random()*Math.PI*2;
    this.animFrame=0; this.animTimer=0;
  }
  get rect(){ return {x:this.x, y:this.y - Math.sin(this.bobOffset)*4, w:this.w, h:this.h}; }
  update(dt){ this.bobOffset+=dt*3; this.animTimer+=dt; if(this.animTimer>0.1){this.animTimer=0;this.animFrame=(this.animFrame+1)%6;} }
}

// ══════════════════════════════════════════════
// BLOCK
// ══════════════════════════════════════════════
class Block {
  constructor(cfg) {
    this.x=cfg.x; this.y=cfg.y; this.w=TILE; this.h=TILE;
    this.type=cfg.type; this.hit=false; this.destroyed=false;
    this.bounceTimer=0; this.bounceY=0;
  }
  get rect(){ return {x:this.x, y:this.y+this.bounceY, w:this.w, h:this.h}; }
  hitBlock(player, particles, ft) {
    if (this.hit && this.type==='question') return;
    Audio8bit.play('blockHit');
    this.bounceTimer=0.16;
    if (this.type==='question' && !this.hit) {
      this.hit=true;
      Audio8bit.play('powerup');
      player.addScore(200, this.x+this.w/2, this.y, ft);
      if (particles) particles.emitCoin(this.x+this.w/2, this.y);
    } else if (this.type==='brick') {
      if (particles) particles.emitBreak(this.x+this.w/2, this.y+this.h/2, '#c8832a');
      this.destroyed=true;
    }
  }
  update(dt) {
    if (this.bounceTimer>0) {
      this.bounceTimer-=dt;
      this.bounceY = -Math.sin((1-this.bounceTimer/0.16)*Math.PI)*14;
    } else { this.bounceY=0; }
  }
}

// ══════════════════════════════════════════════
// STRUCTURE BLOCK
// ══════════════════════════════════════════════
class StructureBlock {
  constructor(x,y,w,h,type) {
    this.x=x; this.y=y; this.w=w; this.h=h; this.type=type;
    this.maxHp = type==='stone'?4 : type==='wood'?2 : 1;
    this.hp=this.maxHp; this.alive=true;
    this.hitFlash=0; this.crackLevel=0;
  }
  get rect(){ return {x:this.x,y:this.y,w:this.w,h:this.h}; }
  damage(dmg, particles) {
    if (!this.alive) return;
    this.hp-=dmg; this.hitFlash=0.18;
    this.crackLevel=Math.min(3, Math.floor((1-this.hp/this.maxHp)*3+1));
    if (this.hp<=0) {
      this.alive=false;
      const col=this.type==='stone'?'#888':this.type==='wood'?'#c8832a':'#aef';
      if (particles) particles.emitBreak(this.x+this.w/2,this.y+this.h/2,col);
      Audio8bit.play(this.type==='stone'?'stoneBreak':'woodBreak');
    }
  }
  update(dt){ if(this.hitFlash>0) this.hitFlash-=dt; }
}

// ══════════════════════════════════════════════
// SLINGSHOT
// ══════════════════════════════════════════════
class Slingshot {
  constructor(x,y) { this.x=x; this.y=y; this.w=48; this.h=80; }
  get cx()      { return this.x+this.w/2; }
  get launchY() { return this.y+20; }
}

// ══════════════════════════════════════════════
// FLAG
// ══════════════════════════════════════════════
class Flag {
  constructor(x, groundY) {
    this.x=x; this.y=groundY-300; this.w=16; this.h=300;
    this.poleX=x+8; this.triggered=false; this.slideY=0;
    this.animFrame=0; this.animTimer=0;
  }
  get rect(){ return {x:this.x,y:this.y,w:64,h:this.h}; }
  update(dt) {
    this.animTimer+=dt; if(this.animTimer>0.1){this.animTimer=0;this.animFrame=(this.animFrame+1)%4;}
    if (this.triggered && this.slideY < this.h-50) this.slideY+=200*dt;
  }
}

// ══════════════════════════════════════════════
// LEVEL BUILDER
// ══════════════════════════════════════════════
function buildLevelObjects(levelData, canvasHeight) {
  const groundY = canvasHeight - GH;
  const ry = v => (v && v[GY_TAG]) ? groundY - v.n * TILE : v;

  const platforms = levelData.platforms.map(p => ({ ...p, y: ry(p.y), isGround:false }));
  platforms.push({ x:0, y:groundY, w:levelData.width, h:GH, type:'ground', isGround:true });

  const player = new Player(levelData.startX || 80, groundY - 52);

  const pigH = { normal:36, helmet:40, fat:50, king:58 };
  const pigs = levelData.pigs.map(p => new Pig({
    ...p,
    y: p.y !== undefined ? ry(p.y) : groundY - (pigH[p.type]||36)
  }));

  const coins = levelData.coins.map(c => new Coin(c.x, ry(c.y)));
  const blocks = levelData.blocks.map(b => new Block({...b, y:ry(b.y)}));

  const structureBlocks = [];
  for (const s of levelData.structures) {
    const sy = ry(s.y);
    for (const b of s.blocks) {
      structureBlocks.push(new StructureBlock(
        s.x+b.dx, sy+b.dy, b.w||TILE, b.h||TILE, b.type
      ));
    }
    for (const p of (s.pigs||[])) {
      pigs.push(new Pig({ ...p, x:s.x+p.x, y:sy+p.y }));
    }
  }

  const slingshotObjs = levelData.slingshots.map(s => new Slingshot(s.x, groundY-80));
  const flag = new Flag(levelData.flagX, groundY);

  return { player, pigs, coins, blocks, structureBlocks, platforms, slingshotObjs, flag, groundY };
}
