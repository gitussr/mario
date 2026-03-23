/* ═══════════════════════════════════════════════════════
   MARIO BIRDS — PHYSICS ENGINE
   Collision resolution, stomp detection, structure impacts
═══════════════════════════════════════════════════════ */

const Physics = (() => {

  // ── Resolve player vs static platforms ─────────────
  function resolvePlatforms(player, platforms) {
    for (const p of platforms) {
      if (!rectOverlap(player.rect, p)) continue;
      const side = collisionSide(player.rect, p);

      if (side === 'bottom') {
        player.y = p.y - player.h;
        if (player.vy > 0) { player.vy = 0; player.onGround = true; }
      } else if (side === 'top') {
        player.y = p.y + p.h;
        if (player.vy < 0) player.vy = 0;
      } else if (side === 'left') {
        player.x = p.x + p.w;
        player.vx = 0;
      } else if (side === 'right') {
        player.x = p.x - player.w;
        player.vx = 0;
      }
    }
  }

  // ── Resolve player vs blocks (stomp on top / hit from below) ──
  function resolveBlocks(player, blocks, particles, floatingText) {
    for (const b of blocks) {
      if (b.destroyed) continue;
      if (!rectOverlap(player.rect, b.rect)) continue;
      const side = collisionSide(player.rect, b.rect);

      if (side === 'bottom') {
        // Land on top of block
        player.y = b.rect.y - player.h;
        if (player.vy > 0) { player.vy = 0; player.onGround = true; }
      } else if (side === 'top') {
        // Hit block from below
        player.y = b.rect.y + b.rect.h;
        player.vy = Math.abs(player.vy) * 0.5;
        b.hitBlock(player, particles, floatingText);
      } else if (side === 'left') {
        player.x = b.rect.x + b.rect.w;
        player.vx = 0;
      } else if (side === 'right') {
        player.x = b.rect.x - player.w;
        player.vx = 0;
      }
    }
  }

  // ── Resolve player vs structure blocks ─────────────
  function resolveStructureBlocks(player, structureBlocks, particles, floatingText) {
    for (const b of structureBlocks) {
      if (!b.alive) continue;
      if (!rectOverlap(player.rect, b.rect)) continue;
      const side = collisionSide(player.rect, b.rect);

      if (side === 'bottom') {
        player.y = b.y - player.h;
        if (player.vy > 0) { player.vy = 0; player.onGround = true; }
      } else if (side === 'top') {
        // Player launches into structure from below — damage it
        if (player.vy < -200 || (player.inSlingshot === false && Math.abs(player.vx) > 400)) {
          const dmg = player.inSlingshot ? 3 : 1;
          b.damage(dmg, particles);
          player.vy = Math.abs(player.vy) * 0.3;
          player.y = b.y + b.h;
          ScreenShake.trigger(5);
        } else {
          player.y = b.y + b.h;
          player.vy = 0;
        }
      } else if (side === 'left') {
        const speed = Math.abs(player.vx);
        if (speed > 300) {
          b.damage(Math.ceil(speed / 200), particles);
          player.vx *= -0.3;
          ScreenShake.trigger(speed / 80);
        } else {
          player.x = b.x + b.w;
          player.vx = 0;
        }
      } else if (side === 'right') {
        const speed = Math.abs(player.vx);
        if (speed > 300) {
          b.damage(Math.ceil(speed / 200), particles);
          player.vx *= -0.3;
          ScreenShake.trigger(speed / 80);
        } else {
          player.x = b.x - player.w;
          player.vx = 0;
        }
      }
    }
  }

  // ── Player vs Pigs ─────────────────────────────────
  function resolvePlayerPigs(player, pigs, particles, floatingText) {
    if (!player.alive || player.invincible > 0) return;

    for (const pig of pigs) {
      if (!pig.alive) continue;
      if (!rectOverlap(player.rect, pig.rect)) continue;

      const side = collisionSide(player.rect, pig.rect);

      if (side === 'bottom' && player.vy > 0) {
        // STOMP — player lands on pig from above
        const pts = pig.points;
        pig.hit(1, particles);
        player.vy = -380; // bounce up
        player.onGround = false;
        player.addScore(pts, pig.cx, pig.y - 20, floatingText);
        ScreenShake.trigger(4);
        Audio8bit.play('stomp');
      } else if (side !== 'bottom') {
        // Side / head hit — player takes damage
        player.hurt(particles);
        // Knock player away
        const knockDir = player.cx < pig.cx ? -1 : 1;
        player.vx = knockDir * 280;
        player.vy = -250;
      }
    }
  }

  // ── Pig vs Structure blocks (slingshot blast radius) ─
  function resolveSlingshotImpact(player, pigs, structureBlocks, particles, floatingText) {
    if (!player.alive) return;

    // If player is moving very fast (post-launch), check pig collisions by brute force
    const spd = Math.hypot(player.vx, player.vy);
    if (spd < 500) return;

    const blastR = 60 + spd / 40;
    const px = player.cx, py = player.cy;

    for (const pig of pigs) {
      if (!pig.alive) continue;
      if (dist(px, py, pig.cx, pig.cy) < blastR + pig.w / 2) {
        const dmg = Math.ceil(spd / 350);
        pig.hit(dmg, particles);
        player.addScore(pig.points, pig.cx, pig.y, floatingText);
        ScreenShake.trigger(8);
      }
    }

    for (const b of structureBlocks) {
      if (!b.alive) continue;
      if (dist(px, py, b.x + b.w/2, b.y + b.h/2) < blastR + 30) {
        const dmg = Math.ceil(spd / 300);
        b.damage(dmg, particles);
      }
    }
  }

  // ── Pig vs platforms ───────────────────────────────
  function resolvePigPlatforms(pig, platforms) {
    if (!pig.alive) return;

    for (const p of platforms) {
      if (!rectOverlap(pig.rect, p)) continue;
      const side = collisionSide(pig.rect, p);

      if (side === 'bottom') {
        pig.y = p.y - pig.h;
        pig.vy = 0;
        pig.onGround = true;
      } else if (side === 'left') {
        pig.x = p.x + p.w;
        pig.vx *= -1;
        pig.patrolDir *= -1;
      } else if (side === 'right') {
        pig.x = p.x - pig.w;
        pig.vx *= -1;
        pig.patrolDir *= -1;
      }
    }
  }

  // ── Player vs coins ────────────────────────────────
  function resolveCoins(player, coins, floatingText) {
    for (const c of coins) {
      if (c.collected) continue;
      if (rectOverlap(player.rect, c.rect)) {
        c.collected = true;
        player.addCoin(c.rect.x + 12, c.rect.y, floatingText);
      }
    }
  }

  // ── Pit death check ────────────────────────────────
  function checkPitDeath(player, canvasHeight) {
    if (player.y > canvasHeight + 80) {
      player.die();
    }
  }

  // ── Level boundary ─────────────────────────────────
  function clampToLevel(player, levelWidth) {
    if (player.x < 0) { player.x = 0; player.vx = 0; }
    // Don't clamp right — let player advance
  }

  // ── Run all physics ────────────────────────────────
  function update(dt, gameState, canvasHeight) {
    const { player, pigs, coins, blocks, structureBlocks,
            platforms, particles, floatingText, level } = gameState;

    if (!player.alive) return;

    // Player vs world
    resolvePlatforms(player, platforms);
    resolveBlocks(player, blocks, particles, floatingText);
    resolveStructureBlocks(player, structureBlocks, particles, floatingText);

    // Player vs entities
    resolvePlayerPigs(player, pigs, particles, floatingText);
    resolveSlingshotImpact(player, pigs, structureBlocks, particles, floatingText);
    resolveCoins(player, coins, floatingText);

    // Pigs vs world
    for (const pig of pigs) {
      if (!pig.alive) continue;
      resolvePigPlatforms(pig, platforms);
      // Pigs also collide with structure blocks
      for (const b of structureBlocks) {
        if (!b.alive) continue;
        if (rectOverlap(pig.rect, b.rect)) {
          const side = collisionSide(pig.rect, b.rect);
          if (side === 'bottom') { pig.y = b.y - pig.h; pig.vy = 0; pig.onGround = true; }
          else if (side === 'left')  { pig.x = b.x + b.w; pig.vx *= -1; pig.patrolDir *= -1; }
          else if (side === 'right') { pig.x = b.x - pig.w; pig.vx *= -1; pig.patrolDir *= -1; }
        }
      }
    }

    // Death checks
    checkPitDeath(player, canvasHeight);
    clampToLevel(player, level.width);
  }

  return { update };
})();
