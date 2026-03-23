/* ═══════════════════════════════════════════════
   PHYSICS — sweep-based, tight Mario-feel gravity
   Gravity: 2200 px/s²  |  Jump: -820 px/s
   Terminal velocity: 1200 px/s
═══════════════════════════════════════════════ */
const GRAVITY      = 2200;   // strong gravity — snappy arc
const JUMP_VEL     = -820;   // initial jump velocity
const JUMP_HOLD    = 0.14;   // seconds you can hold jump for extra height
const JUMP_HOLD_F  = 600;    // extra upward force while holding
const MAX_FALL     = 1200;   // terminal velocity
const WALK_SPEED   = 280;
const RUN_SPEED    = 440;

const Physics = (() => {

  function overlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function getSolids(platforms, blocks, structureBlocks) {
    const s = [];
    for (const p of platforms) s.push({ x:p.x, y:p.y, w:p.w, h:p.h, type:'platform' });
    for (const b of blocks)    if (!b.destroyed) s.push({ x:b.x, y:b.y+b.bounceY, w:b.w, h:b.h, type:'block', ref:b });
    for (const b of structureBlocks) if (b.alive) s.push({ x:b.x, y:b.y, w:b.w, h:b.h, type:'struct', ref:b });
    return s;
  }

  function sweepX(ent, dx, solids, onHit) {
    ent.x += dx;
    for (const s of solids) {
      if (!overlap(ent, s)) continue;
      if (dx > 0) ent.x = s.x - ent.w;
      else        ent.x = s.x + s.w;
      ent.vx = 0;
      if (onHit) onHit(s);
    }
  }

  function sweepY(ent, dy, solids, onLand, onCeil) {
    ent.y += dy;
    for (const s of solids) {
      if (!overlap(ent, s)) continue;
      if (dy >= 0) {
        ent.y = s.y - ent.h;
        ent.vy = 0;
        ent.onGround = true;
        if (onLand) onLand(s);
      } else {
        ent.y = s.y + s.h;
        ent.vy = 0;
        if (onCeil) onCeil(s);
      }
    }
  }

  // ── stomp / side-hit ───────────────────────────────
  function checkStomp(player, pigs, particles, floatText) {
    if (!player.alive || player.invincible > 0) return;
    for (const pig of pigs) {
      if (!pig.alive) continue;
      if (!overlap(player.rect, pig.rect)) continue;
      const feet = player.y + player.h;
      const pigTop = pig.y;
      if (player.vy >= 0 && feet <= pig.y + pig.h * 0.45 && feet >= pigTop - 10) {
        pig.hit(1, particles);
        player.vy = -460;
        player.onGround = false;
        player.addScore(pig.points, pig.cx, pig.y - 20, floatText);
        ScreenShake.trigger(5);
      } else if (player.invincible <= 0) {
        player.hurt(particles);
        player.vx = (player.cx < pig.cx ? -1 : 1) * 360;
        player.vy = -300;
      }
    }
  }

  function collectCoins(player, coins, floatText) {
    for (const c of coins) {
      if (c.collected) continue;
      if (overlap(player.rect, { x:c.x, y:c.y-4, w:c.w, h:c.h })) {
        c.collected = true;
        player.addCoin(c.x+12, c.y, floatText);
      }
    }
  }

  function checkBlast(player, pigs, structs, particles, floatText) {
    const spd = Math.hypot(player.vx, player.vy);
    if (spd < 400) return;
    const r = 70 + spd / 35;
    for (const pig of pigs) {
      if (!pig.alive) continue;
      if (dist(player.cx, player.cy, pig.cx, pig.cy) < r + pig.w/2) {
        pig.hit(Math.ceil(spd/300), particles);
        player.addScore(pig.points, pig.cx, pig.y, floatText);
        ScreenShake.trigger(9);
      }
    }
    for (const b of structs) {
      if (!b.alive) continue;
      if (dist(player.cx, player.cy, b.x+b.w/2, b.y+b.h/2) < r+30)
        b.damage(Math.ceil(spd/280), particles);
    }
  }

  function pigPhysics(pig, platforms, structs, dt) {
    if (!pig.alive) {
      pig.vy = Math.min(pig.vy + GRAVITY * dt, MAX_FALL);
      pig.y += pig.vy * dt;
      return;
    }
    pig.vy = Math.min(pig.vy + GRAVITY * dt, MAX_FALL);
    pig.onGround = false;
    const solids = [];
    for (const p of platforms) solids.push(p);
    for (const b of structs) if (b.alive) solids.push({x:b.x,y:b.y,w:b.w,h:b.h});

    sweepX(pig, pig.vx * dt, solids, () => { pig.vx*=-1; pig.patrolDir*=-1; });
    sweepY(pig, pig.vy * dt, solids, () => { pig.vy=0; pig.onGround=true; });

    // No-edge-ahead turn
    if (pig.onGround) {
      const fx = pig.vx > 0 ? pig.x + pig.w + 3 : pig.x - 3;
      const fy = pig.y + pig.h + 4;
      let floor = false;
      for (const s of solids) {
        if (fx > s.x && fx < s.x+s.w && fy > s.y && fy < s.y+s.h+6) { floor=true; break; }
      }
      if (!floor) { pig.vx*=-1; pig.patrolDir*=-1; }
    }
  }

  function update(dt, gs, canvasH) {
    const { player, pigs, coins, blocks, structureBlocks,
            platforms, particles, floatingText } = gs;
    if (!player.alive) return;

    const solids = getSolids(platforms, blocks, structureBlocks);

    // Gravity
    player.vy = Math.min(player.vy + GRAVITY * dt, MAX_FALL);
    player.onGround = false;

    // Sweep X
    sweepX(player, player.vx * dt, solids, (s) => {
      if (s.type === 'struct' && Math.abs(player.vx) > 300) {
        s.ref.damage(Math.ceil(Math.abs(player.vx)/200), particles);
        player.vx *= -0.2;
        ScreenShake.trigger(6);
      }
    });

    // Sweep Y
    sweepY(player, player.vy * dt, solids,
      (s) => { // land
        if (s.type === 'struct' && player.vy > 400) {
          s.ref.damage(Math.ceil(player.vy/250), particles);
          ScreenShake.trigger(6);
        }
      },
      (s) => { // ceiling
        if (s.type === 'block' && s.ref) s.ref.hitBlock(player, particles, floatingText);
        if (s.type === 'struct' && s.ref) s.ref.damage(1, particles);
      }
    );

    checkStomp(player, pigs, particles, floatingText);
    collectCoins(player, coins, floatingText);
    checkBlast(player, pigs, structureBlocks, particles, floatingText);

    for (const pig of pigs) pigPhysics(pig, platforms, structureBlocks, dt);

    if (player.y > canvasH + 100) player.die();
    if (player.x < 0) { player.x = 0; if (player.vx < 0) player.vx = 0; }
  }

  return { update, GRAVITY, JUMP_VEL, JUMP_HOLD, JUMP_HOLD_F, MAX_FALL, WALK_SPEED, RUN_SPEED };
})();
