/* ═══════════════════════════════════════════════════════
   MARIO BIRDS — PHYSICS ENGINE (REWRITE)
   Sweep-based: move X then resolve, move Y then resolve.
   This avoids the "wrong collision side" bug entirely.
═══════════════════════════════════════════════════════ */

const Physics = (() => {

  // Build flat solid list from all collidable objects
  function getSolids(platforms, blocks, structureBlocks) {
    const solids = [];
    for (const p of platforms) {
      solids.push({ x: p.x, y: p.y, w: p.w, h: p.h, type: 'platform' });
    }
    for (const b of blocks) {
      if (!b.destroyed) solids.push({ x: b.x, y: b.y + b.bounceY, w: b.w, h: b.h, type: 'block', ref: b });
    }
    for (const b of structureBlocks) {
      if (b.alive) solids.push({ x: b.x, y: b.y, w: b.w, h: b.h, type: 'struct', ref: b });
    }
    return solids;
  }

  // Move entity on X axis, then push out of any overlapping solids
  function moveX(ent, dx, solids, onHit) {
    ent.x += dx;
    for (const s of solids) {
      if (!overlap(ent, s)) continue;
      if (dx > 0) { ent.x = s.x - ent.w; }
      else if (dx < 0) { ent.x = s.x + s.w; }
      else { // stationary but overlapping — push out toward nearest edge
        const mid = s.x + s.w / 2;
        ent.x = ent.x + ent.w / 2 < mid ? s.x - ent.w : s.x + s.w;
      }
      ent.vx = 0;
      if (onHit) onHit(s);
    }
  }

  // Move entity on Y axis, then push out of any overlapping solids
  function moveY(ent, dy, solids, onLand, onCeiling) {
    ent.y += dy;
    for (const s of solids) {
      if (!overlap(ent, s)) continue;
      if (dy >= 0) {
        // Falling or stationary — land on top
        ent.y = s.y - ent.h;
        ent.vy = 0;
        ent.onGround = true;
        if (onLand) onLand(s);
      } else {
        // Rising — hit ceiling
        ent.y = s.y + s.h;
        ent.vy = 0;
        if (onCeiling) onCeiling(s);
      }
    }
  }

  function overlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
  }

  // ── Player stomps pig ───────────────────────────────
  function checkStomp(player, pigs, particles, floatingText) {
    if (!player.alive || player.invincible > 0) return;
    for (const pig of pigs) {
      if (!pig.alive) continue;
      if (!overlap(player.rect, pig.rect)) continue;

      const playerFeet = player.y + player.h;
      const pigTop     = pig.y;
      const pigMid     = pig.y + pig.h * 0.4;

      if (player.vy >= 0 && playerFeet <= pigMid + 12 && playerFeet >= pigTop - 8) {
        // STOMP from above
        pig.hit(1, particles);
        player.vy = -380;
        player.onGround = false;
        player.addScore(pig.points, pig.cx, pig.y - 20, floatingText);
        ScreenShake.trigger(4);
        Audio8bit.play('stomp');
      } else {
        // Side collision — player hurt
        if (player.invincible <= 0) {
          player.hurt(particles);
          const dir = player.cx < pig.cx ? -1 : 1;
          player.vx = dir * 300;
          player.vy = -280;
        }
      }
    }
  }

  // ── Coin collection ─────────────────────────────────
  function collectCoins(player, coins, floatingText) {
    for (const c of coins) {
      if (c.collected) continue;
      const cr = { x: c.x, y: c.y - 4, w: c.w, h: c.h };
      if (overlap(player.rect, cr)) {
        c.collected = true;
        player.addCoin(c.x + 12, c.y, floatingText);
      }
    }
  }

  // ── Slingshot blast ─────────────────────────────────
  function checkBlast(player, pigs, structureBlocks, particles, floatingText) {
    if (!player.alive) return;
    const spd = Math.hypot(player.vx, player.vy);
    if (spd < 500) return;
    const blastR = 60 + spd / 40;
    for (const pig of pigs) {
      if (!pig.alive) continue;
      if (dist(player.cx, player.cy, pig.cx, pig.cy) < blastR + pig.w / 2) {
        pig.hit(Math.ceil(spd / 350), particles);
        player.addScore(pig.points, pig.cx, pig.y, floatingText);
        ScreenShake.trigger(8);
      }
    }
    for (const b of structureBlocks) {
      if (!b.alive) continue;
      if (dist(player.cx, player.cy, b.x + b.w / 2, b.y + b.h / 2) < blastR + 30) {
        b.damage(Math.ceil(spd / 300), particles);
      }
    }
  }

  // ── Pig movement + collision ─────────────────────────
  function updatePig(pig, platforms, structureBlocks, dt) {
    if (!pig.alive) {
      pig.vy = Math.min(pig.vy + 900 * dt, 900);
      pig.y += pig.vy * dt;
      return;
    }
    pig.vy = Math.min(pig.vy + 900 * dt, 900);
    pig.onGround = false;

    const solids = [];
    for (const p of platforms) solids.push(p);
    for (const b of structureBlocks) if (b.alive) solids.push({ x: b.x, y: b.y, w: b.w, h: b.h });

    moveX(pig, pig.vx * dt, solids, () => { pig.vx *= -1; pig.patrolDir *= -1; });
    moveY(pig, pig.vy * dt, solids, () => { pig.vy = 0; pig.onGround = true; });

    // Turn around at edges (no ground ahead check)
    if (pig.onGround) {
      const frontX = pig.vx > 0 ? pig.x + pig.w + 2 : pig.x - 2;
      const footY  = pig.y + pig.h + 2;
      let hasFloor = false;
      for (const s of solids) {
        if (frontX > s.x && frontX < s.x + s.w && footY > s.y && footY < s.y + s.h + 8) {
          hasFloor = true; break;
        }
      }
      if (!hasFloor) { pig.vx *= -1; pig.patrolDir *= -1; }
    }
  }

  // ── MAIN ────────────────────────────────────────────
  function update(dt, gameState, canvasHeight) {
    const { player, pigs, coins, blocks, structureBlocks,
            platforms, particles, floatingText } = gameState;

    if (!player.alive) return;

    const gravity = gameState.level.gravity || 900;
    const solids  = getSolids(platforms, blocks, structureBlocks);

    // Apply gravity
    player.vy = Math.min(player.vy + gravity * dt, player.maxFall);
    player.onGround = false;

    // Sweep X
    moveX(player, player.vx * dt, solids, (s) => {
      if (s.type === 'struct' && Math.abs(player.vx) > 300) {
        s.ref.damage(Math.ceil(Math.abs(player.vx) / 200), particles);
        player.vx *= -0.25;
        ScreenShake.trigger(5);
      }
    });

    // Sweep Y
    moveY(player, player.vy * dt, solids,
      (s) => { // onLand
        if (s.type === 'struct' && player.vy > 300) {
          s.ref.damage(Math.ceil(player.vy / 250), particles);
          ScreenShake.trigger(5);
        }
      },
      (s) => { // onCeiling
        if (s.type === 'block' && s.ref) s.ref.hitBlock(player, particles, floatingText);
        if (s.type === 'struct' && s.ref) s.ref.damage(1, particles);
      }
    );

    // Interactions
    checkStomp(player, pigs, particles, floatingText);
    collectCoins(player, coins, floatingText);
    checkBlast(player, pigs, structureBlocks, particles, floatingText);

    // Pig AI
    for (const pig of pigs) updatePig(pig, platforms, structureBlocks, dt);

    // Pit / fall off
    if (player.y > canvasHeight + 120) player.die();

    // Left boundary
    if (player.x < 0) { player.x = 0; if (player.vx < 0) player.vx = 0; }
  }

  return { update };
})();
