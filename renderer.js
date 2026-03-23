/* ═══════════════════════════════════════════════
   RENDERER — Classic pixel-art Mario + all objects
═══════════════════════════════════════════════ */
const Renderer = (() => {

  const THEMES = {
    grass:  { sky:['#5c94fc','#5c94fc'], groundTop:'#4caf50', groundFill:'#8B5E3C', hill:'rgba(34,120,34,0.35)' },
    desert: { sky:['#e8c96a','#f5d87a'], groundTop:'#c8a020', groundFill:'#8a5a10', hill:'rgba(180,120,0,0.25)' },
    snow:   { sky:['#9dd4f8','#c8ecff'], groundTop:'#ddeeff', groundFill:'#7aaabb', hill:'rgba(200,230,255,0.4)' },
    lava:   { sky:['#c84000','#e05800'], groundTop:'#882200', groundFill:'#441100', hill:'rgba(200,60,0,0.3)' },
    sky:    { sky:['#2060c0','#4080e0'], groundTop:'#1060a0', groundFill:'#083060', hill:'rgba(0,60,150,0.3)' },
    castle: { sky:['#181828','#302848'], groundTop:'#444',    groundFill:'#222',    hill:'rgba(40,20,60,0.5)' },
  };

  // ── pixel helpers ──
  function px(ctx, x, y, w, h, col) {
    ctx.fillStyle = col;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  function outline(ctx, color='#000', lw=2.5) {
    ctx.strokeStyle=color; ctx.lineWidth=lw; ctx.stroke();
  }

  function roundRect(ctx,x,y,w,h,r=6) {
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
    ctx.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx.lineTo(x+w,y+h-r);
    ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    ctx.lineTo(x+r,y+h);
    ctx.quadraticCurveTo(x,y+h,x,y+h-r);
    ctx.lineTo(x,y+r);
    ctx.quadraticCurveTo(x,y,x+r,y);
    ctx.closePath();
  }

  // ── BACKGROUND ──────────────────────────────────
  function drawBackground(ctx, cw, ch, scrollX, level, tick) {
    const theme = THEMES[level.theme] || THEMES.grass;
    const grad = ctx.createLinearGradient(0,0,0,ch);
    grad.addColorStop(0, theme.sky[0]);
    grad.addColorStop(1, theme.sky[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,cw,ch);

    // Clouds layer 1
    drawClouds(ctx, cw, ch, scrollX*0.18, tick, 0);
    // BG hills
    drawHills(ctx, cw, ch, scrollX*0.45, theme);
    // Clouds layer 2
    drawClouds(ctx, cw, ch, scrollX*0.35, tick, 1);
  }

  function drawClouds(ctx, cw, ch, off, tick, layer) {
    const positions = layer===0
      ? [[0.05,0.10],[0.30,0.07],[0.55,0.13],[0.80,0.06],[1.10,0.11]]
      : [[0.18,0.20],[0.45,0.17],[0.72,0.22],[0.95,0.18]];
    for (const [px2,py] of positions) {
      const x = ((px2*cw*3 - off) % (cw*1.4)) - 80;
      drawCloud(ctx, x, py*ch, layer===0 ? 1 : 0.7);
    }
  }

  function drawCloud(ctx, x, y, scale) {
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth=2;
    for (const [dx,dy,r] of [[0,0,30],[28,-12,24],[56,0,28],[82,-8,22],[108,2,26]]) {
      ctx.beginPath(); ctx.arc(x+dx*scale, y+dy*scale, r*scale, 0, Math.PI*2);
      ctx.fill(); ctx.stroke();
    }
  }

  function drawHills(ctx, cw, ch, off, theme) {
    ctx.fillStyle = theme.hill;
    ctx.beginPath(); ctx.moveTo(0, ch);
    for (let x=0; x<=cw; x+=8) {
      const y = ch*0.75 - Math.sin((x+off)*0.004)*40 - Math.sin((x+off)*0.011)*20;
      x===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
    }
    ctx.lineTo(cw,ch); ctx.closePath(); ctx.fill();
  }

  // ── GROUND ──────────────────────────────────────
  function drawGround(ctx, cw, ch, scrollX, level, groundY) {
    const theme = THEMES[level.theme] || THEMES.grass;
    ctx.fillStyle = theme.groundTop;
    ctx.fillRect(0, groundY, cw, 24);
    ctx.fillStyle = theme.groundFill;
    ctx.fillRect(0, groundY+24, cw, ch-groundY-24);
    ctx.strokeStyle='rgba(0,0,0,0.3)'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(0,groundY); ctx.lineTo(cw,groundY); ctx.stroke();
    // Tile marks
    ctx.strokeStyle='rgba(0,0,0,0.1)'; ctx.lineWidth=1;
    const toff = scrollX % TILE;
    for (let x=-toff; x<cw; x+=TILE) {
      ctx.beginPath(); ctx.moveTo(x,groundY+24); ctx.lineTo(x,ch); ctx.stroke();
    }
  }

  // ── PLATFORMS ───────────────────────────────────
  function drawPlatform(ctx, p, scrollX) {
    const sx = p.x - scrollX;
    const cols = {
      grass:  {top:'#4caf50', fill:'#8B5E3C'},
      stone:  {top:'#9e9e9e', fill:'#666'},
      cloud:  {top:'#fff',    fill:'#d0ecff'},
      ice:    {top:'#b3e5fc', fill:'#7dc8e8'},
      ground: {top:'#4caf50', fill:'#8B5E3C'},
    };
    const c = cols[p.type] || cols.grass;
    ctx.fillStyle = c.fill;
    roundRect(ctx, sx, p.y, p.w, p.h, 6); ctx.fill();
    ctx.fillStyle = c.top;
    roundRect(ctx, sx, p.y, p.w, 14, 6); ctx.fill();
    ctx.strokeStyle='#1a1a2e'; ctx.lineWidth=2.5;
    roundRect(ctx, sx, p.y, p.w, p.h, 6); ctx.stroke();
    if (p.type==='cloud') {
      ctx.fillStyle='rgba(255,255,255,0.55)';
      for (let i=0;i<Math.floor(p.w/24);i++) {
        ctx.beginPath(); ctx.arc(sx+12+i*24, p.y-5, 8, 0, Math.PI*2); ctx.fill();
      }
    }
  }

  // ── BLOCKS ──────────────────────────────────────
  function drawBlock(ctx, b, scrollX, tick) {
    if (b.destroyed) return;
    const sx=b.x-scrollX, sy=b.y+b.bounceY;
    if (b.type==='question') {
      ctx.fillStyle = b.hit ? '#888' : `hsl(${44+Math.sin(tick*6)*8},100%,52%)`;
      roundRect(ctx,sx,sy,TILE,TILE,5); ctx.fill();
      ctx.strokeStyle='#1a1a2e'; ctx.lineWidth=3;
      roundRect(ctx,sx,sy,TILE,TILE,5); ctx.stroke();
      ctx.font=`bold ${TILE*0.55}px 'Fredoka One',cursive`;
      ctx.fillStyle=b.hit?'#555':'#fff'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.strokeStyle='#000'; ctx.lineWidth=2.5;
      const label = b.hit?'':'?';
      ctx.strokeText(label,sx+TILE/2,sy+TILE/2); ctx.fillText(label,sx+TILE/2,sy+TILE/2);
    } else {
      ctx.fillStyle='#b94a1a';
      roundRect(ctx,sx,sy,TILE,TILE,4); ctx.fill();
      ctx.strokeStyle='#1a1a2e'; ctx.lineWidth=2.5;
      roundRect(ctx,sx,sy,TILE,TILE,4); ctx.stroke();
      ctx.strokeStyle='#7a2c08'; ctx.lineWidth=2;
      ctx.beginPath();
      ctx.moveTo(sx,sy+TILE/2); ctx.lineTo(sx+TILE,sy+TILE/2);
      ctx.moveTo(sx+TILE*0.5,sy); ctx.lineTo(sx+TILE*0.5,sy+TILE/2);
      ctx.moveTo(sx+TILE*0.25,sy+TILE/2); ctx.lineTo(sx+TILE*0.25,sy+TILE);
      ctx.moveTo(sx+TILE*0.75,sy+TILE/2); ctx.lineTo(sx+TILE*0.75,sy+TILE);
      ctx.stroke();
    }
  }

  // ── STRUCTURE BLOCKS ────────────────────────────
  function drawStructureBlock(ctx, b, scrollX) {
    if (!b.alive) return;
    const sx=b.x-scrollX;
    const cols = { wood:{f:'#c8832a',g:'#a06820'}, stone:{f:'#8e8e8e',g:'#7a7a7a'}, glass:{f:'rgba(180,230,255,0.7)',g:'rgba(255,255,255,0.4)'} };
    const c = cols[b.type]||cols.wood;
    ctx.fillStyle = b.hitFlash>0?'#fff':c.f;
    roundRect(ctx,sx,b.y,b.w,b.h,4); ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,0.3)'; ctx.lineWidth=1.5;
    if (b.type==='wood') {
      for (let i=1;i<3;i++){ctx.beginPath();ctx.moveTo(sx,b.y+b.h*i/3);ctx.lineTo(sx+b.w,b.y+b.h*i/3);ctx.stroke();}
    } else if (b.type==='stone') {
      ctx.beginPath();ctx.moveTo(sx+b.w/2,b.y);ctx.lineTo(sx+b.w/2,b.y+b.h);
      ctx.moveTo(sx,b.y+b.h/2);ctx.lineTo(sx+b.w,b.y+b.h/2);ctx.stroke();
    }
    if (b.crackLevel>0) {
      ctx.strokeStyle='rgba(0,0,0,0.55)'; ctx.lineWidth=b.crackLevel;
      ctx.beginPath();ctx.moveTo(sx+b.w*0.3,b.y+b.h*0.2);ctx.lineTo(sx+b.w*0.5,b.y+b.h*0.5);ctx.lineTo(sx+b.w*0.7,b.y+b.h*0.8);ctx.stroke();
      if(b.crackLevel>1){ctx.beginPath();ctx.moveTo(sx+b.w*0.6,b.y+b.h*0.1);ctx.lineTo(sx+b.w*0.4,b.y+b.h*0.6);ctx.stroke();}
    }
    ctx.strokeStyle='#1a1a2e'; ctx.lineWidth=2.2;
    roundRect(ctx,sx,b.y,b.w,b.h,4); ctx.stroke();
  }

  // ── COIN ────────────────────────────────────────
  function drawCoin(ctx, coin, scrollX, tick) {
    if (coin.collected) return;
    const sx=coin.x-scrollX, sy=coin.y-Math.sin(tick*3+coin.bobOffset)*5;
    const squish=Math.abs(Math.sin(tick*4+coin.bobOffset))*0.55+0.45;
    ctx.save(); ctx.translate(sx+11,sy+11); ctx.scale(squish,1);
    const g=ctx.createRadialGradient(0,0,2,0,0,11);
    g.addColorStop(0,'#ffe066'); g.addColorStop(1,'#ffd700');
    ctx.fillStyle=g;
    ctx.beginPath(); ctx.arc(0,0,11,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='#c8a000'; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.arc(0,0,11,0,Math.PI*2); ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,0.6)'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(-2,-2,5,0,Math.PI*2); ctx.stroke();
    ctx.restore();
  }

  // ── SLINGSHOT ───────────────────────────────────
  function drawSlingshot(ctx, s, scrollX, nearPlayer, charge) {
    const sx=s.x-scrollX, sy=s.y;
    // Post
    ctx.fillStyle='#7b4a1a'; ctx.strokeStyle='#4a2800'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.roundRect(sx+18,sy,12,s.h,3); ctx.fill(); ctx.stroke();
    // Arms
    for (const [tx,ty] of [[4,-8],[44,-8]]) {
      ctx.beginPath(); ctx.moveTo(sx+24,sy+30); ctx.quadraticCurveTo(sx+tx,sy+10,sx+tx,sy+ty);
      ctx.lineWidth=7; ctx.strokeStyle='#7b4a1a'; ctx.stroke();
      ctx.lineWidth=2.5; ctx.strokeStyle='#4a2800'; ctx.stroke();
    }
    // Rubber bands
    if (nearPlayer) {
      const pull = charge * 16;
      ctx.strokeStyle='#c05010'; ctx.lineWidth=3;
      ctx.beginPath(); ctx.moveTo(sx+4,sy-8); ctx.lineTo(sx+24-pull,sy+20); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx+44,sy-8); ctx.lineTo(sx+24+pull,sy+20); ctx.stroke();
    }
    // Prompt
    if (nearPlayer && charge===0) {
      ctx.font="bold 13px 'Nunito',sans-serif";
      ctx.fillStyle='#fff'; ctx.strokeStyle='#000'; ctx.lineWidth=3;
      ctx.textAlign='center';
      ctx.strokeText('[F] Slingshot', sx+24, sy-18); ctx.fillText('[F] Slingshot', sx+24, sy-18);
    }
    // Charge bar
    if (nearPlayer && charge>0) {
      ctx.fillStyle='rgba(0,0,0,0.5)';
      ctx.fillRect(sx-2, sy-30, 52, 10);
      ctx.fillStyle=`hsl(${120-charge*120},100%,50%)`;
      ctx.fillRect(sx-2, sy-30, 52*charge, 10);
      ctx.strokeStyle='#fff'; ctx.lineWidth=1.5;
      ctx.strokeRect(sx-2, sy-30, 52, 10);
    }
  }

  // ── FLAG ────────────────────────────────────────
  function drawFlag(ctx, flag, scrollX, tick) {
    const sx=flag.poleX-scrollX, ty=flag.y;
    ctx.fillStyle='#aaa'; ctx.fillRect(sx-3,ty,6,flag.h);
    ctx.strokeStyle='#666'; ctx.lineWidth=1.5; ctx.strokeRect(sx-3,ty,6,flag.h);
    const fy=ty+flag.slideY, wave=Math.sin(tick*4)*5;
    ctx.fillStyle='#e63946';
    ctx.beginPath(); ctx.moveTo(sx+3,fy); ctx.lineTo(sx+38+wave,fy+10); ctx.lineTo(sx+3,fy+24); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='#900'; ctx.lineWidth=1.5; ctx.stroke();
    ctx.fillStyle='#ffd700';
    ctx.beginPath(); ctx.arc(sx,ty,8,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='#a06000'; ctx.lineWidth=2; ctx.stroke();
  }

  // ══════════════════════════════════════════════
  // MARIO — Classic NES pixel-art style
  // ══════════════════════════════════════════════
  function drawMario(ctx, player, scrollX, tick) {
    const sx = player.x - scrollX;
    const sy = player.y;
    const flash = player.invincible>0 && Math.floor(tick*10)%2===0;
    if (flash) return;

    ctx.save();
    ctx.translate(sx + player.w/2, sy + player.h/2);
    if (!player.facingRight) ctx.scale(-1,1);

    const W=player.w, H=player.h;
    const x=-W/2, y=-H/2;

    // ─ Pixel-art scale: each "pixel" = 4px ─
    const P = 4;  // pixel size
    const draw = (col, px2, py2, pw, ph) => {
      ctx.fillStyle=col;
      ctx.fillRect(x+px2*P, y+py2*P, pw*P, ph*P);
    };

    // PALETTE
    const RED   = '#c01000'; // hat + shirt
    const SKIN  = '#fc9838'; // face / hands
    const BROWN = '#6c3c00'; // hair, mustache, shoes
    const BLUE  = '#2038ac'; // overalls
    const WHITE = '#ffffff';

    // ── Hat (top 3 rows) ──
    // Row 0: hat top
    draw(RED,   2,0, 4, 1);
    // Row 1: hat brim
    draw(RED,   1,1, 6, 1);
    // Row 2: hat brim bottom / hair
    draw(BROWN, 0,2, 2, 1);
    draw(RED,   2,2, 4, 1);
    draw(SKIN,  6,2, 2, 1);

    // ── Face (rows 3-5) ──
    draw(SKIN,  1,3, 6, 1);
    // Eyes + mustache row
    draw(BROWN, 1,4, 2, 1); // left eye
    draw(SKIN,  3,4, 1, 1);
    draw(BROWN, 4,4, 2, 1); // right eye
    // Nose row
    draw(SKIN,  2,5, 4, 1);
    // Mustache
    draw(BROWN, 1,5, 1, 1);
    draw(BROWN, 5,5, 2, 1);

    // ── Body — overalls + shirt (rows 6-8) ──
    draw(RED,   2,6, 4, 1); // shirt collar
    draw(BLUE,  1,7, 6, 1); // overalls top
    draw(BLUE,  0,8, 8, 1); // overalls wide

    // Overalls buttons
    draw(WHITE, 2,6, 1, 1);
    draw(WHITE, 5,6, 1, 1);

    // ── Arms (rows 6-8) ──
    if (player.state==='run' && player.runFrame%2===1) {
      // Pumping arms
      draw(RED,  0,6, 1, 2); // left arm up
      draw(RED,  7,7, 1, 2); // right arm down
      draw(SKIN, 0,8, 1, 1); draw(SKIN, 7,9, 1, 1); // hands
    } else if (player.state==='jump') {
      draw(RED,  0,5, 1, 3); // arms raised
      draw(RED,  7,5, 1, 3);
      draw(SKIN, 0,8, 1, 1); draw(SKIN, 7,8, 1, 1);
    } else {
      draw(RED,  0,7, 1, 2); // arms down
      draw(RED,  7,7, 1, 2);
      draw(SKIN, 0,9, 1, 1); draw(SKIN, 7,9, 1, 1);
    }

    // ── Legs / shoes (rows 9-11) ──
    const legOff = player.state==='run' ? (player.runFrame%2)*2 : 0;
    draw(BLUE,   1,9, 3, 1); draw(BLUE,   4,9, 3, 1);
    draw(BROWN,  1,10,3,1);  draw(BROWN,  4,10,3,1);
    // Shoes — walk animation
    if (player.state==='run') {
      if (player.runFrame%4 < 2) {
        draw(BROWN, 0,11, 3, 1); draw(BROWN, 4,11, 4, 1);
      } else {
        draw(BROWN, 1,11, 4, 1); draw(BROWN, 5,11, 2, 1);
      }
    } else {
      draw(BROWN, 1,11, 6, 1);
    }

    // Slingshot charge glow
    if (player.inSlingshot && player.slingshotCharge>0) {
      ctx.globalAlpha=0.5;
      ctx.fillStyle=`hsl(${60-player.slingshotCharge*60},100%,55%)`;
      ctx.beginPath(); ctx.arc(0,0,H*0.55+player.slingshotCharge*14,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha=1;
    }

    ctx.restore();
  }

  // ══════════════════════════════════════════════
  // PIG RENDER
  // ══════════════════════════════════════════════
  function drawPig(ctx, pig, scrollX, tick) {
    if (!pig.alive) {
      if (pig.dieTimer>1.4) return;
      ctx.save(); ctx.globalAlpha=Math.max(0,1-pig.dieTimer/1.4);
      ctx.translate(pig.cx-scrollX, pig.cy);
      ctx.rotate(pig.dieTimer*6);
      _pigBody(ctx, pig, 0, 0, true);
      ctx.restore(); return;
    }
    ctx.save();
    ctx.translate(pig.cx-scrollX, pig.cy);
    if (!pig.facingRight) ctx.scale(-1,1);
    if (pig.hitFlash>0) ctx.filter='brightness(3)';
    _pigBody(ctx, pig, 0, 0, false);
    ctx.restore();
  }

  function _pigBody(ctx, pig, cx, cy, dead) {
    const r=pig.w*0.5;
    const bob = dead?0:Math.sin(Date.now()/280)*1.5;

    ctx.fillStyle='#57cc57';
    ctx.beginPath(); ctx.arc(cx,cy+bob,r,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='#1a1a2e'; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.arc(cx,cy+bob,r,0,Math.PI*2); ctx.stroke();

    // Belly
    ctx.fillStyle='#7fff7f';
    ctx.beginPath(); ctx.ellipse(cx+r*0.15,cy+r*0.2+bob,r*0.42,r*0.38,-0.2,0,Math.PI*2); ctx.fill();

    // Ears
    ctx.fillStyle='#3a8f3a';
    ctx.beginPath(); ctx.ellipse(cx-r*0.6,cy-r*0.68+bob,r*0.26,r*0.2,-0.4,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx+r*0.6,cy-r*0.68+bob,r*0.26,r*0.2,0.4,0,Math.PI*2); ctx.fill();

    // Helmet/crown
    if (pig.type==='helmet'||pig.type==='king') {
      ctx.fillStyle=pig.type==='king'?'#ffd700':'#aaa';
      ctx.beginPath(); ctx.arc(cx,cy-r*0.28+bob,r*0.82,Math.PI,0); ctx.fill();
      ctx.strokeStyle='#1a1a2e'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(cx,cy-r*0.28+bob,r*0.82,Math.PI,0); ctx.stroke();
      if (pig.type==='king') {
        ctx.fillStyle='#ffd700';
        for (let i=0;i<3;i++) {
          const px2=cx-r*0.5+i*r*0.5;
          ctx.beginPath(); ctx.moveTo(px2-5,cy-r*0.88+bob); ctx.lineTo(px2,cy-r*1.28+bob); ctx.lineTo(px2+5,cy-r*0.88+bob); ctx.closePath(); ctx.fill();
        }
      }
    }

    // Eyes
    const ey=cy-r*0.14+bob;
    const angry=pig.hp<pig.maxHp;
    if (angry) {
      ctx.strokeStyle='#1a1a2e'; ctx.lineWidth=2.5;
      ctx.beginPath(); ctx.moveTo(cx-r*0.52,ey-10); ctx.lineTo(cx-r*0.1,ey-6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx+r*0.52,ey-10); ctx.lineTo(cx+r*0.1,ey-6); ctx.stroke();
    }
    // Eyeballs
    for (const [ex,pu] of [[cx-r*0.34,[-1,1]],[cx+r*0.34,[1,1]]]) {
      ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(ex,ey,r*0.22,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#1a1a2e'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(ex,ey,r*0.22,0,Math.PI*2); ctx.stroke();
      ctx.fillStyle='#1a1a2e'; ctx.beginPath(); ctx.arc(ex+pu[0]*r*0.08,ey+pu[1]*r*0.06,r*0.12,0,Math.PI*2); ctx.fill();
    }

    // Snout
    ctx.fillStyle='#3a8f3a';
    ctx.beginPath(); ctx.ellipse(cx,cy+r*0.3+bob,r*0.36,r*0.24,0,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='#1a1a2e'; ctx.lineWidth=1.5; ctx.stroke();
    ctx.fillStyle='#1a5c1a';
    ctx.beginPath(); ctx.arc(cx-r*0.13,cy+r*0.28+bob,r*0.06,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx+r*0.13,cy+r*0.28+bob,r*0.06,0,Math.PI*2); ctx.fill();

    // HP bar for fat/king
    if ((pig.type==='fat'||pig.type==='king')&&pig.hp>0&&pig.hp<pig.maxHp) {
      const bw=r*2.2,bh=5,bx=cx-bw/2,by=cy-r-14;
      ctx.fillStyle='#333'; ctx.fillRect(bx,by,bw,bh);
      ctx.fillStyle=pig.type==='king'?'#ffd700':'#f44';
      ctx.fillRect(bx,by,bw*(pig.hp/pig.maxHp),bh);
      ctx.strokeStyle='#000'; ctx.lineWidth=1; ctx.strokeRect(bx,by,bw,bh);
    }

    if (pig.isBoss) {
      ctx.font=`${r*0.75}px serif`; ctx.textAlign='center';
      ctx.fillText('👑',cx,cy-r*1.85+Math.sin(Date.now()/400)*5+bob);
    }
  }

  // ══════════════════════════════════════════════
  // MAIN RENDER
  // ══════════════════════════════════════════════
  function render(ctx, cw, ch, state, scrollX, tick) {
    const { level, player, pigs, coins, blocks, structureBlocks,
            slingshotObjs, flag, particles, floatingText, groundY } = state;

    ctx.clearRect(0,0,cw,ch);

    drawBackground(ctx, cw, ch, scrollX, level, tick);
    drawGround(ctx, cw, ch, scrollX, level, groundY);

    for (const p of level.platforms) {
      if (p.isGround) continue;
      if (p.x-scrollX > cw+120 || p.x+p.w-scrollX < -120) continue;
      drawPlatform(ctx, p, scrollX);
    }

    for (const b of blocks) if (!b.destroyed) drawBlock(ctx, b, scrollX, tick);
    for (const b of structureBlocks) if (b.alive) {
      if (b.x-scrollX<cw+100 && b.x+b.w-scrollX>-100) drawStructureBlock(ctx, b, scrollX);
    }
    for (const c of coins) if (!c.collected) drawCoin(ctx, c, scrollX, tick);

    for (const s of slingshotObjs) {
      const near = player.nearSlingshot===s || player.inSlingshot;
      const charge = (player.inSlingshot && player.nearSlingshot===s) ? player.slingshotCharge : 0;
      drawSlingshot(ctx, s, scrollX, near, charge);
    }

    drawFlag(ctx, flag, scrollX, tick);

    for (const pig of pigs) drawPig(ctx, pig, scrollX, tick);

    drawMario(ctx, player, scrollX, tick);

    particles.draw(ctx);
    floatingText.draw(ctx);
  }

  return { render };
})();
