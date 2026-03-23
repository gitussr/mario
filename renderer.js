/* ═══════════════════════════════════════════════════════
   MARIO BIRDS — RENDERER
   All canvas drawing: backgrounds, player, pigs, structures,
   coins, blocks, UI elements — cartoon comic art style
═══════════════════════════════════════════════════════ */

const Renderer = (() => {

  // ── Theme palettes ─────────────────────────────────
  const THEMES = {
    grass:   { sky: ['#5bc8f5','#87e0ff'], groundTop: '#4caf50', groundFill: '#8B5E3C', cloud: '#fff' },
    desert:  { sky: ['#f5d06b','#fbe8a6'], groundTop: '#d4a017', groundFill: '#9b7030', cloud: '#fffbe6' },
    snow:    { sky: ['#c8e8ff','#e8f4ff'], groundTop: '#d0eaff', groundFill: '#7ab0cc', cloud: '#fff' },
    lava:    { sky: ['#ff9c40','#ffcc88'], groundTop: '#cc4400', groundFill: '#882200', cloud: '#ffaa66' },
    sky:     { sky: ['#2a9fd6','#5bc8f5'], groundTop: '#1170a0', groundFill: '#0d4d70', cloud: '#fff' },
    castle:  { sky: ['#4a3060','#6a5080'], groundTop: '#555',    groundFill: '#333',    cloud: '#887799' },
  };

  // ── Helper drawing functions ────────────────────────
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function outline(ctx, color = '#1a1a2e', width = 3) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  }

  function eyeball(ctx, cx, cy, r, pupilDx = 0, pupilDy = 0) {
    // White
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    outline(ctx, '#1a1a2e', 2);
    // Pupil
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath(); ctx.arc(cx + pupilDx, cy + pupilDy, r * 0.55, 0, Math.PI * 2); ctx.fill();
    // Shine
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(cx + pupilDx + r*0.15, cy + pupilDy - r*0.2, r * 0.2, 0, Math.PI * 2); ctx.fill();
  }

  // ── BACKGROUND ─────────────────────────────────────
  function drawBackground(ctx, cw, ch, scrollX, level, tick) {
    const theme = THEMES[level.theme] || THEMES.grass;

    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, ch);
    grad.addColorStop(0, theme.sky[0]);
    grad.addColorStop(1, theme.sky[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, cw, ch);

    // Parallax clouds (layer 1 — slow)
    drawClouds(ctx, cw, ch, scrollX * 0.2, theme.cloud, tick, 0);
    // Parallax hills/bg decor (layer 2)
    drawBgDecor(ctx, cw, ch, scrollX * 0.5, level.theme, tick);
    // Parallax clouds (layer 2 — faster)
    drawClouds(ctx, cw, ch, scrollX * 0.4, theme.cloud, tick, 1);
  }

  function drawClouds(ctx, cw, ch, off, color, tick, layer) {
    const positions = layer === 0
      ? [[0.05,0.12],[0.28,0.08],[0.52,0.15],[0.76,0.07],[0.92,0.14],[1.15,0.10]]
      : [[0.14,0.22],[0.40,0.18],[0.65,0.25],[0.88,0.20]];

    for (const [px, py] of positions) {
      const x = ((px * cw * 3 - off * 0.6) % (cw * 1.5)) - 100;
      const y = py * ch;
      const scale = layer === 0 ? 1 : 0.75;
      drawCloud(ctx, x, y, scale, color);
    }
  }

  function drawCloud(ctx, x, y, scale, color) {
    const s = scale;
    ctx.fillStyle = color;
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.lineWidth = 3 * s;

    const parts = [[0,0,38],[30,-15,28],[60,0,36],[90,-10,26],[115,2,32]];
    for (const [dx, dy, r] of parts) {
      ctx.beginPath();
      ctx.arc(x + dx * s, y + dy * s, r * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  function drawBgDecor(ctx, cw, ch, off, theme, tick) {
    if (theme === 'grass' || theme === 'sky') {
      // Rolling hills
      ctx.fillStyle = 'rgba(100,200,100,0.18)';
      ctx.beginPath();
      ctx.moveTo(0, ch * 0.75);
      for (let x = 0; x <= cw; x += 10) {
        const y = ch * 0.72 - Math.sin((x + off * 0.5) / 180) * 30;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(cw, ch); ctx.lineTo(0, ch); ctx.closePath(); ctx.fill();
    }
    if (theme === 'castle' || theme === 'lava') {
      // Dark distant fortress silhouettes
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      const bx = ((off * 0.3) % (cw * 2)) - cw;
      for (let i = 0; i < 4; i++) {
        const bxOff = bx + i * 600;
        ctx.fillRect(bxOff, ch * 0.55, 120, ch * 0.45);
        ctx.fillRect(bxOff - 20, ch * 0.47, 40, ch * 0.53);
        ctx.fillRect(bxOff + 100, ch * 0.49, 40, ch * 0.51);
      }
    }
  }

  // ── GROUND ─────────────────────────────────────────
  function drawGround(ctx, cw, ch, scrollX, level, groundY) {
    const theme = THEMES[level.theme] || THEMES.grass;

    // Ground top strip
    ctx.fillStyle = theme.groundTop;
    ctx.fillRect(0, groundY, cw, 28);
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(cw, groundY); ctx.stroke();

    // Ground fill
    ctx.fillStyle = theme.groundFill;
    ctx.fillRect(0, groundY + 28, cw, ch - groundY - 28);

    // Tile lines on ground
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 1.5;
    const tileOff = scrollX % TILE;
    for (let x = -tileOff; x < cw; x += TILE) {
      ctx.beginPath(); ctx.moveTo(x, groundY + 28); ctx.lineTo(x, ch); ctx.stroke();
    }

    // Grass blades
    ctx.fillStyle = '#2e7d32';
    for (let x = ((-scrollX * 0.1) % 32); x < cw + 32; x += 18 + (Math.floor(x / 30) % 5) * 3) {
      const bh = 8 + (x % 5) * 2;
      ctx.fillRect(x, groundY - bh + 28, 4, bh);
    }
  }

  // ── PLATFORMS ──────────────────────────────────────
  function drawPlatform(ctx, p, scrollX) {
    const sx = p.x - scrollX;
    const colors = {
      grass:  { top: '#4caf50', fill: '#8B5E3C', line: '#2e7d32' },
      stone:  { top: '#9e9e9e', fill: '#616161', line: '#424242' },
      cloud:  { top: '#fff',    fill: '#e3f2fd', line: '#90caf9' },
      ice:    { top: '#b3e5fc', fill: '#81d4fa', line: '#4fc3f7' },
    };
    const c = colors[p.type] || colors.grass;

    // Platform body
    ctx.fillStyle = c.fill;
    roundRect(ctx, sx, p.y, p.w, p.h, 8);
    ctx.fill();

    // Top strip
    ctx.fillStyle = c.top;
    roundRect(ctx, sx, p.y, p.w, 16, 8);
    ctx.fill();

    // Outline
    outline(ctx);
    roundRect(ctx, sx, p.y, p.w, p.h, 8);
    outline(ctx);

    // Cloud fluff
    if (p.type === 'cloud') {
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      for (let i = 0; i < Math.floor(p.w / 28); i++) {
        ctx.beginPath();
        ctx.arc(sx + 14 + i * 28, p.y - 6, 10, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // ── BLOCKS ─────────────────────────────────────────
  function drawBlock(ctx, b, scrollX, tick) {
    if (b.destroyed) return;
    const sx = b.x - scrollX;
    const sy = b.y + b.bounceY;

    if (b.type === 'question') {
      // Animated golden block
      const pulse = Math.sin(tick * 5) * 0.08;
      ctx.fillStyle = b.hit ? '#888' : `hsl(${45 + pulse * 30}, 100%, 55%)`;
      roundRect(ctx, sx, sy, TILE, TILE, 6);
      ctx.fill();
      outline(ctx);
      roundRect(ctx, sx, sy, TILE, TILE, 6);
      outline(ctx);

      // "?" text or empty
      ctx.font = `bold ${TILE * 0.6}px 'Fredoka One', cursive`;
      ctx.fillStyle = b.hit ? '#555' : '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = '#1a1a2e'; ctx.lineWidth = 3;
      ctx.strokeText(b.hit ? '' : '?', sx + TILE/2, sy + TILE/2);
      ctx.fillText(b.hit ? '' : '?', sx + TILE/2, sy + TILE/2);

    } else if (b.type === 'brick') {
      ctx.fillStyle = '#c0522a';
      roundRect(ctx, sx, sy, TILE, TILE, 4);
      ctx.fill();
      outline(ctx);
      roundRect(ctx, sx, sy, TILE, TILE, 4);
      outline(ctx);

      // Brick pattern
      ctx.strokeStyle = '#9b3a1a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx, sy + TILE/2); ctx.lineTo(sx + TILE, sy + TILE/2);
      ctx.moveTo(sx + TILE/2, sy); ctx.lineTo(sx + TILE/2, sy + TILE/2);
      ctx.moveTo(sx + TILE*0.25, sy + TILE/2); ctx.lineTo(sx + TILE*0.25, sy + TILE);
      ctx.moveTo(sx + TILE*0.75, sy + TILE/2); ctx.lineTo(sx + TILE*0.75, sy + TILE);
      ctx.stroke();
    }
  }

  // ── STRUCTURE BLOCKS ───────────────────────────────
  function drawStructureBlock(ctx, b, scrollX) {
    if (!b.alive) return;
    const sx = b.x - scrollX;

    const colors = {
      wood:  { fill: '#c8832a', dark: '#9b5e1a', grain: '#a06820' },
      stone: { fill: '#8e8e8e', dark: '#666',    grain: '#7a7a7a' },
      glass: { fill: 'rgba(180,230,255,0.7)', dark: '#6ab4cc', grain: 'rgba(255,255,255,0.4)' }
    };
    const c = colors[b.type] || colors.wood;

    if (b.hitFlash > 0) {
      ctx.fillStyle = '#fff';
    } else {
      ctx.fillStyle = c.fill;
    }
    roundRect(ctx, sx, b.y, b.w, b.h, 5);
    ctx.fill();

    // Grain lines
    ctx.strokeStyle = c.grain;
    ctx.lineWidth = 2;
    if (b.type === 'wood') {
      for (let i = 1; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(sx, b.y + b.h * i / 3);
        ctx.lineTo(sx + b.w, b.y + b.h * i / 3);
        ctx.stroke();
      }
    } else if (b.type === 'stone') {
      ctx.beginPath();
      ctx.moveTo(sx + b.w/2, b.y); ctx.lineTo(sx + b.w/2, b.y + b.h);
      ctx.moveTo(sx, b.y + b.h/2); ctx.lineTo(sx + b.w, b.y + b.h/2);
      ctx.stroke();
    }

    // Cracks
    if (b.crackLevel > 0) {
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = b.crackLevel;
      ctx.beginPath();
      ctx.moveTo(sx + b.w * 0.3, b.y + b.h * 0.2);
      ctx.lineTo(sx + b.w * 0.5, b.y + b.h * 0.5);
      ctx.lineTo(sx + b.w * 0.7, b.y + b.h * 0.8);
      ctx.stroke();
      if (b.crackLevel > 1) {
        ctx.beginPath();
        ctx.moveTo(sx + b.w * 0.6, b.y + b.h * 0.1);
        ctx.lineTo(sx + b.w * 0.4, b.y + b.h * 0.6);
        ctx.stroke();
      }
    }

    outline(ctx, '#1a1a2e', 2.5);
    roundRect(ctx, sx, b.y, b.w, b.h, 5);
    outline(ctx, '#1a1a2e', 2.5);
  }

  // ── COIN ───────────────────────────────────────────
  function drawCoin(ctx, coin, scrollX, tick) {
    if (coin.collected) return;
    const sx = coin.x - scrollX;
    const sy = coin.y - Math.sin(tick * 3 + coin.bobOffset) * 5;
    const r = 12;

    // Glow
    const glow = ctx.createRadialGradient(sx + r, sy + r, 2, sx + r, sy + r, r + 6);
    glow.addColorStop(0, 'rgba(255,215,0,0.4)');
    glow.addColorStop(1, 'rgba(255,215,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(sx - 6, sy - 6, (r + 6) * 2, (r + 6) * 2);

    // Coin body (spinning effect via squish)
    const squish = Math.abs(Math.sin(tick * 4 + coin.bobOffset)) * 0.5 + 0.5;
    ctx.save();
    ctx.translate(sx + r, sy + r);
    ctx.scale(squish, 1);
    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    outline(ctx, '#1a1a2e', 2.5);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2);
    outline(ctx, '#1a1a2e', 2.5);

    // Inner ring
    ctx.strokeStyle = '#ffe066';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  // ── SLINGSHOT ──────────────────────────────────────
  function drawSlingshot(ctx, s, scrollX, playerNear, charge) {
    const sx = s.x - scrollX;
    const sy = s.y;

    // Fork base
    ctx.fillStyle = '#7b4a1a';
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 4;

    // Main pole
    ctx.fillRect(sx + 20, sy, 8, s.h);
    outline(ctx);
    ctx.fillRect(sx + 20, sy, 8, s.h);
    outline(ctx);

    // Left arm
    ctx.beginPath();
    ctx.moveTo(sx + 24, sy + 28);
    ctx.quadraticCurveTo(sx + 2, sy + 8, sx + 4, sy - 10);
    ctx.lineWidth = 7;
    ctx.strokeStyle = '#7b4a1a';
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#1a1a2e';
    ctx.stroke();

    // Right arm
    ctx.beginPath();
    ctx.moveTo(sx + 24, sy + 28);
    ctx.quadraticCurveTo(sx + 46, sy + 8, sx + 44, sy - 10);
    ctx.lineWidth = 7;
    ctx.strokeStyle = '#7b4a1a';
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#1a1a2e';
    ctx.stroke();

    // Rubber bands
    if (playerNear) {
      const bandTension = charge * 14;
      ctx.strokeStyle = '#c8641a';
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.moveTo(sx + 4, sy - 10);
      ctx.lineTo(sx + 24 - bandTension, sy + 18);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(sx + 44, sy - 10);
      ctx.lineTo(sx + 24 + bandTension, sy + 18);
      ctx.stroke();

      // Prompt
      if (charge === 0) {
        ctx.font = "bold 14px 'Nunito', sans-serif";
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#1a1a2e'; ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        ctx.strokeText('[F] Slingshot', sx + 24, sy - 22);
        ctx.fillText('[F] Slingshot', sx + 24, sy - 22);
      }
    }
  }

  // ── FLAG ───────────────────────────────────────────
  function drawFlag(ctx, flag, scrollX, tick) {
    const sx = flag.poleX - scrollX;
    const topY = flag.y;

    // Pole
    ctx.fillStyle = '#aaa';
    ctx.fillRect(sx - 4, topY, 8, flag.h);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx - 4, topY, 8, flag.h);

    // Waving flag
    const fy = topY + flag.slideY;
    const wave = Math.sin(tick * 4) * 6;
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.moveTo(sx + 4, fy);
    ctx.lineTo(sx + 44 + wave, fy + 12);
    ctx.lineTo(sx + 4, fy + 28);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1a1a2e'; ctx.lineWidth = 2; ctx.stroke();

    // Pole ball
    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.arc(sx, topY, 10, 0, Math.PI * 2); ctx.fill();
    outline(ctx, '#1a1a2e', 3);
    ctx.beginPath(); ctx.arc(sx, topY, 10, 0, Math.PI * 2);
    outline(ctx, '#1a1a2e', 3);
  }

  // ── PLAYER (Mario Bird) ─────────────────────────────
  function drawPlayer(ctx, player, scrollX, tick) {
    const sx = player.x - scrollX;
    const sy = player.y;
    const flash = player.invincible > 0 && Math.floor(tick * 10) % 2 === 0;
    if (flash) return;

    ctx.save();
    if (!player.facingRight) {
      ctx.translate(sx + player.w / 2, sy + player.h / 2);
      ctx.scale(-1, 1);
      ctx.translate(-(player.w / 2), -(player.h / 2));
    } else {
      ctx.translate(sx, sy);
    }

    const x = 0, y = 0, w = player.w, h = player.h;

    // Body — round bird shape
    const bobY = player.state === 'idle' ? Math.sin(tick * 3) * 2 : 0;
    ctx.fillStyle = '#e63946';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2 + bobY, h * 0.48, 0, Math.PI * 2);
    ctx.fill();
    outline(ctx, '#1a1a2e', 3);
    ctx.beginPath(); ctx.arc(w/2, h/2 + bobY, h*0.48, 0, Math.PI*2);
    outline(ctx, '#1a1a2e', 3);

    // Belly
    ctx.fillStyle = '#ff9999';
    ctx.beginPath();
    ctx.ellipse(w/2, h*0.62 + bobY, w*0.28, h*0.22, 0, 0, Math.PI*2);
    ctx.fill();

    // Mario hat
    ctx.fillStyle = '#e63946';
    ctx.fillRect(w*0.1, y + bobY - 4, w*0.8, h*0.28);
    outline(ctx, '#1a1a2e', 2.5);
    ctx.fillRect(w*0.1, y + bobY - 4, w*0.8, h*0.28);
    outline(ctx, '#1a1a2e', 2.5);
    // Hat brim
    ctx.fillStyle = '#e63946';
    ctx.fillRect(x - 4, y + h*0.22 + bobY, w + 8, h*0.1);
    outline(ctx, '#1a1a2e', 2.5);
    ctx.fillRect(x - 4, y + h*0.22 + bobY, w + 8, h*0.1);
    outline(ctx, '#1a1a2e', 2.5);
    // M on hat
    ctx.font = `bold ${h * 0.18}px 'Fredoka One', cursive`;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#1a1a2e'; ctx.lineWidth = 2;
    ctx.strokeText('M', w/2, y + h*0.15 + bobY);
    ctx.fillText('M', w/2, y + h*0.15 + bobY);

    // Eyes
    const eyeY = h*0.44 + bobY;
    const brow = player.state === 'jump' ? -3 : 0;
    // Angry brows
    ctx.strokeStyle = '#1a1a2e'; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w*0.5, eyeY - 14 + brow);
    ctx.lineTo(w*0.72, eyeY - 10 + brow);
    ctx.stroke();
    eyeball(ctx, w*0.62, eyeY, 7, 1, 1);

    // Beak
    ctx.fillStyle = '#ffc107';
    ctx.beginPath();
    ctx.moveTo(w*0.68, h*0.54 + bobY);
    ctx.lineTo(w*0.92, h*0.50 + bobY);
    ctx.lineTo(w*0.68, h*0.62 + bobY);
    ctx.closePath(); ctx.fill();
    outline(ctx, '#1a1a2e', 2);
    ctx.beginPath();
    ctx.moveTo(w*0.68, h*0.54 + bobY);
    ctx.lineTo(w*0.92, h*0.50 + bobY);
    ctx.lineTo(w*0.68, h*0.62 + bobY);
    ctx.closePath();
    outline(ctx, '#1a1a2e', 2);

    // Tail (jump squish)
    if (player.state === 'jump' || player.state === 'fall') {
      ctx.fillStyle = '#c62828';
      ctx.beginPath();
      ctx.moveTo(w*0.1, h*0.7 + bobY);
      ctx.lineTo(-6, h*0.9 + bobY);
      ctx.lineTo(w*0.3, h*0.8 + bobY);
      ctx.closePath(); ctx.fill();
      outline(ctx, '#1a1a2e', 2);
    }

    // Feet
    ctx.fillStyle = '#ffc107';
    ctx.beginPath(); ctx.ellipse(w*0.35, h + bobY, 10, 7, 0.2, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(w*0.65, h + bobY, 10, 7, -0.2, 0, Math.PI*2); ctx.fill();
    outline(ctx, '#1a1a2e', 2);

    // Slingshot charge indicator
    if (player.inSlingshot && player.slingshotCharge > 0) {
      ctx.fillStyle = `hsl(${60 - player.slingshotCharge * 60}, 100%, 55%)`;
      ctx.globalAlpha = 0.7;
      ctx.beginPath(); ctx.arc(w/2, h/2, h/2 + 8 + player.slingshotCharge * 10, 0, Math.PI*2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  // ── PIG ────────────────────────────────────────────
  function drawPig(ctx, pig, scrollX, tick) {
    if (!pig.alive) {
      if (pig.dieTimer > 1.2) return;
      // Dead pig — tumbling
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - pig.dieTimer / 1.2);
      ctx.translate(pig.cx - scrollX, pig.cy);
      ctx.rotate(pig.dieTimer * 5);
      _drawPigBody(ctx, pig, 0, 0, true);
      ctx.restore();
      return;
    }

    const sx = pig.x - scrollX;
    const flash = pig.hitFlash > 0 && Math.floor(tick * 12) % 2 === 0;

    ctx.save();
    ctx.translate(sx + pig.w/2, pig.y + pig.h/2);
    if (!pig.facingRight) ctx.scale(-1, 1);

    if (flash) ctx.filter = 'brightness(3)';

    _drawPigBody(ctx, pig, 0, 0, false);
    ctx.restore();
  }

  function _drawPigBody(ctx, pig, cx, cy, isDead) {
    const r = pig.w * 0.5;
    const wobble = isDead ? 0 : Math.sin(Date.now() / 300) * 1.5;

    // Body
    ctx.fillStyle = '#57cc57';
    ctx.beginPath(); ctx.arc(cx, cy + wobble, r, 0, Math.PI*2); ctx.fill();
    outline(ctx, '#1a1a2e', 3);
    ctx.beginPath(); ctx.arc(cx, cy + wobble, r, 0, Math.PI*2);
    outline(ctx, '#1a1a2e', 3);

    // Belly highlight
    ctx.fillStyle = '#7fff7f';
    ctx.beginPath();
    ctx.ellipse(cx + r*0.15, cy + r*0.2 + wobble, r*0.45, r*0.4, -0.2, 0, Math.PI*2);
    ctx.fill();

    // Ears
    ctx.fillStyle = '#3a8f3a';
    ctx.beginPath(); ctx.ellipse(cx - r*0.6, cy - r*0.7 + wobble, r*0.28, r*0.22, -0.4, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + r*0.6, cy - r*0.7 + wobble, r*0.28, r*0.22, 0.4, 0, Math.PI*2); ctx.fill();

    // Helmet for helmet/king pig
    if (pig.type === 'helmet' || pig.type === 'king') {
      ctx.fillStyle = pig.type === 'king' ? '#ffd700' : '#aaa';
      ctx.beginPath();
      ctx.arc(cx, cy - r*0.3 + wobble, r*0.85, Math.PI, 0);
      ctx.fill();
      outline(ctx, '#1a1a2e', 2.5);
      ctx.beginPath();
      ctx.arc(cx, cy - r*0.3 + wobble, r*0.85, Math.PI, 0);
      outline(ctx, '#1a1a2e', 2.5);

      if (pig.type === 'king') {
        // Crown points
        ctx.fillStyle = '#ffd700';
        for (let i = 0; i < 3; i++) {
          const cx2 = cx - r*0.5 + i * r*0.5;
          ctx.beginPath();
          ctx.moveTo(cx2 - 6, cy - r*0.9 + wobble);
          ctx.lineTo(cx2, cy - r*1.3 + wobble);
          ctx.lineTo(cx2 + 6, cy - r*0.9 + wobble);
          ctx.closePath(); ctx.fill();
          outline(ctx, '#1a1a2e', 2);
        }
      }
    }

    // Eyes
    const eyeY = cy - r*0.15 + wobble;
    const angry = pig.hp < pig.maxHp;
    if (angry) {
      ctx.strokeStyle = '#1a1a2e'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(cx - r*0.5, eyeY - 10); ctx.lineTo(cx - r*0.1, eyeY - 6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + r*0.5, eyeY - 10); ctx.lineTo(cx + r*0.1, eyeY - 6); ctx.stroke();
    }
    eyeball(ctx, cx - r*0.35, eyeY, r*0.22, -1, 1);
    eyeball(ctx, cx + r*0.35, eyeY, r*0.22, 1, 1);

    // Snout
    ctx.fillStyle = '#3a8f3a';
    ctx.beginPath(); ctx.ellipse(cx, cy + r*0.3 + wobble, r*0.38, r*0.25, 0, 0, Math.PI*2); ctx.fill();
    outline(ctx, '#1a1a2e', 2);
    // Nostrils
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath(); ctx.arc(cx - r*0.15, cy + r*0.28 + wobble, r*0.06, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + r*0.15, cy + r*0.28 + wobble, r*0.06, 0, Math.PI*2); ctx.fill();

    // HP bar for fat/king pigs
    if ((pig.type === 'fat' || pig.type === 'king') && pig.hp > 0 && pig.hp < pig.maxHp) {
      const bw = r * 2.2, bh = 6;
      const bx = cx - bw/2, by = cy - r - 16;
      ctx.fillStyle = '#333';
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = pig.type === 'king' ? '#ffd700' : '#ff4444';
      ctx.fillRect(bx, by, bw * (pig.hp / pig.maxHp), bh);
      ctx.strokeStyle = '#1a1a2e'; ctx.lineWidth = 1.5;
      ctx.strokeRect(bx, by, bw, bh);
    }

    // Boss crown floating
    if (pig.isBoss) {
      ctx.font = `${r * 0.8}px serif`;
      ctx.textAlign = 'center';
      ctx.fillText('👑', cx, cy - r * 1.8 + Math.sin(Date.now()/400) * 5 + wobble);
    }
  }

  // ── MAIN RENDER FUNCTION ───────────────────────────
  function render(ctx, cw, ch, state, scrollX, tick) {
    const { level, player, pigs, coins, blocks, structureBlocks,
            slingshotObjs, flag, particles, floatingText, groundY } = state;

    ctx.clearRect(0, 0, cw, ch);

    // 1. Background
    drawBackground(ctx, cw, ch, scrollX, level, tick);

    // 2. Ground
    drawGround(ctx, cw, ch, scrollX, level, groundY);

    // 3. Platforms
    for (const p of level.platforms) {
      if (p.isGround) continue;
      if (p.x - scrollX > cw + 100 || p.x + p.w - scrollX < -100) continue;
      drawPlatform(ctx, p, scrollX);
    }

    // 4. Blocks
    for (const b of blocks) {
      if (b.destroyed) continue;
      drawBlock(ctx, b, scrollX, tick);
    }

    // 5. Structure blocks
    for (const b of structureBlocks) {
      if (!b.alive) continue;
      if (b.x - scrollX > cw + 100 || b.x + b.w - scrollX < -100) continue;
      drawStructureBlock(ctx, b, scrollX);
    }

    // 6. Coins
    for (const c of coins) {
      if (!c.collected) drawCoin(ctx, c, scrollX, tick);
    }

    // 7. Slingshots
    for (const s of slingshotObjs) {
      const charge = player.nearSlingshot === s ? player.slingshotCharge : 0;
      drawSlingshot(ctx, s, scrollX, player.nearSlingshot === s || player.inSlingshot, charge);
    }

    // 8. Flag
    drawFlag(ctx, flag, scrollX, tick);

    // 9. Pigs
    for (const pig of pigs) drawPig(ctx, pig, scrollX, tick);

    // 10. Player
    drawPlayer(ctx, player, scrollX, tick);

    // 11. Particles
    particles.draw(ctx);

    // 12. Floating text
    floatingText.draw(ctx);
  }

  return { render };
})();
