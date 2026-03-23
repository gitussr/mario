/* ═══════════════════════════════════════════════
   GAME LOOP — state machine, coin quota, camera
═══════════════════════════════════════════════ */
const Game = (() => {
  let canvas, ctx, cw, ch;
  let running=false, paused=false;
  let currentLevel=0;
  let rafId=null, lastTime=0, tick=0, scrollX=0;
  let gameState=null, timer=null;
  let state='menu';
  let coinWarning=0; // timer for "need more coins" flash

  const particles  = new ParticleSystem();
  const floatText  = new FloatingText();

  // ── init ──────────────────────────────────────
  function init() {
    canvas = document.getElementById('gameCanvas');
    ctx    = canvas.getContext('2d');
    Input.init();
    Audio8bit.init();
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  function resizeCanvas() {
    const hud = document.getElementById('hud');
    const hudH = hud ? hud.offsetHeight : 56;
    cw = window.innerWidth;
    ch = window.innerHeight - hudH;
    if (ch < 200) ch = window.innerHeight - 56;
    canvas.width = cw; canvas.height = ch;
    if (gameState) {
      gameState.groundY = ch - GH;
      if (gameState.player) gameState.player.y = Math.min(gameState.player.y, gameState.groundY - gameState.player.h);
    }
  }

  // ── load level ────────────────────────────────
  function loadLevel(idx) {
    currentLevel = idx;
    const ld = LEVELS[idx];
    particles.particles = []; floatText.items = [];
    scrollX = 0; tick = 0; coinWarning = 0;

    resizeCanvas(); // force correct ch before building

    const objs = buildLevelObjects(ld, ch);
    objs.particles    = particles;
    objs.floatingText = floatText;
    objs.level        = ld;
    ld.platforms      = objs.platforms;
    ld.slingshotObjs  = objs.slingshotObjs;
    gameState = objs;

    timer = new GameTimer(ld.timeLimit);
    timer.start();
    state = 'playing'; paused = false;
    updateHUD();
    Audio8bit.startBGM();
  }

  // ── start ─────────────────────────────────────
  function start(levelIdx=0) {
    if (rafId) cancelAnimationFrame(rafId);
    running=true; paused=false;
    showScreen('screen-game');
    loadLevel(levelIdx);
    lastTime=performance.now();
    loop(lastTime);
  }

  function loop(now) {
    rafId = requestAnimationFrame(loop);
    const dt = Math.min((now-lastTime)/1000, 0.05);
    lastTime=now;
    if (paused) return;
    tick+=dt;
    if (Input.pause) { togglePause(); Input.flush(); return; }
    update(dt);
    draw();
    Input.flush();
  }

  // ── update ────────────────────────────────────
  function update(dt) {
    if (!gameState || (state!=='playing' && state!=='dying' && state!=='flagPole')) return;
    const { player, pigs, coins, blocks, structureBlocks, slingshotObjs, flag, level } = gameState;

    timer.update(dt);
    if (timer.isExpired && player.alive) player.hurt(particles);
    if (coinWarning>0) coinWarning-=dt;

    // entity updates
    player.update(dt, {...level, slingshotObjs}, particles, floatText);
    for (const p of pigs)   p.update(dt, level);
    for (const c of coins)  c.update(dt);
    for (const b of blocks) b.update(dt);
    for (const b of structureBlocks) b.update(dt);
    flag.update(dt);

    // physics
    Physics.update(dt, gameState, ch);

    // shake, particles, text
    ScreenShake.update(dt);
    particles.update(dt);
    floatText.update(dt);

    updateCamera(player, level);
    updateHUD();

    // ── Coin quota check on flag approach ──
    if (!flag.triggered && player.alive) {
      const levelData = LEVELS[currentLevel];
      const nearFlag = Math.abs((player.cx + scrollX) - flag.poleX) < 200;
      const hasQuota = player.coins >= levelData.coinQuota;

      if (nearFlag && !hasQuota) {
        coinWarning = 2.5;
        floatText.add(
          cw/2 - scrollX, ch/2 - 60,
          `Need ${levelData.coinQuota - player.coins} more coins! 🪙`,
          '#ff4444', 28
        );
        // Bounce player back
        player.vx = player.vx < 0 ? 300 : -300;
      } else if (rectOverlap(player.rect, flag.rect) && hasQuota) {
        triggerFlagPole();
      }
    }

    // death
    if (!player.alive && state==='playing') {
      state='dying'; player._deathTimer=2.0;
    }
    if (state==='dying') {
      player.y  += player.vy * dt;
      player.vy += Physics.GRAVITY * dt;
      player._deathTimer -= dt;
      if (player._deathTimer<=0) {
        if (player.lives>0) { state='dead'; loadLevel(currentLevel); }
        else { showGameOver(); state='gameOver'; }
      }
    }
  }

  // ── camera — snap forward, slow back ──────────
  function updateCamera(player, level) {
    const target = player.cx - cw * 0.35;
    const speed  = target > scrollX ? 0.14 : 0.08;
    scrollX = lerp(scrollX, target, speed);
    scrollX = clamp(scrollX, 0, level.width - cw);
  }

  // ── flag pole ─────────────────────────────────
  function triggerFlagPole() {
    if (!gameState) return;
    gameState.flag.triggered=true;
    gameState.player.vx=0;
    Audio8bit.play('flagPole');
    Audio8bit.stopBGM();
    state='flagPole';
    setTimeout(()=>{ Audio8bit.play('levelComplete'); setTimeout(()=>showLevelComplete(), 1800); }, 800);
  }

  // ── draw ──────────────────────────────────────
  function draw() {
    if (!gameState) return;
    ctx.save();
    if (ScreenShake.strength>0.1) ctx.translate(ScreenShake.x, ScreenShake.y);

    Renderer.render(ctx, cw, ch, {
      level:          gameState.level,
      player:         gameState.player,
      pigs:           gameState.pigs,
      coins:          gameState.coins,
      blocks:         gameState.blocks,
      structureBlocks:gameState.structureBlocks,
      slingshotObjs:  gameState.slingshotObjs,
      flag:           gameState.flag,
      platforms:      gameState.platforms,
      particles, floatingText: floatText,
      groundY:        gameState.groundY
    }, scrollX, tick);

    // Coin quota warning overlay
    if (coinWarning > 0 && gameState) {
      const ld = LEVELS[currentLevel];
      const alpha = Math.min(1, coinWarning*2) * 0.9;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(0, ch/2-46, cw, 52);
      ctx.globalAlpha = alpha;
      ctx.font = "bold 28px 'Fredoka One',cursive";
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText(`⚠️ Collect ${ld.coinQuota - gameState.player.coins} more coins to unlock the flag! 🪙`, cw/2, ch/2-12);
      ctx.restore();
    }

    ctx.restore();
  }

  // ── HUD ───────────────────────────────────────
  function updateHUD() {
    if (!gameState) return;
    const p  = gameState.player;
    const ld = LEVELS[currentLevel];
    const el = id => document.getElementById(id);

    const s  = el('hud-score'); if(s) s.textContent = String(p.score).padStart(6,'0');
    const li = el('hud-lives'); if(li) li.textContent = '❤️'.repeat(Math.max(0,p.lives));
    const co = el('hud-coins');
    if (co) {
      co.textContent = `${p.coins}/${ld.coinQuota}`;
      co.style.color = p.coins>=ld.coinQuota ? '#7fff7f' : 'white';
    }
    const ti = el('hud-time');
    if (ti) {
      const t = timer ? timer.display : '--';
      ti.textContent = t;
      ti.style.color = t<60 ? '#ff4444' : t<100 ? '#ffaa00' : 'white';
    }
    const lv = el('hud-level'); if(lv) lv.textContent = `${ld.world}-${ld.sublevel}`;
  }

  // ── overlays ──────────────────────────────────
  function showLevelComplete() {
    if (state==='levelComplete') return;
    state='levelComplete';
    Audio8bit.stopBGM();
    const p=gameState.player;
    const timeBonus=timer?Math.floor(timer.current*10):0;
    const total=p.score+timeBonus;
    const stars=Save.completeLevel(currentLevel,total,p.coins,timer?timer.current:0);
    const el=id=>document.getElementById(id);
    el('complete-score').textContent=total;
    el('complete-coins').textContent=p.coins;
    el('complete-time').textContent=timeBonus;
    el('star-rating').textContent='⭐'.repeat(stars)+'☆'.repeat(3-stars);
    el('level-complete-overlay').classList.remove('hidden');
    const hs=el('high-score-display');
    if(hs) hs.textContent=Save.load().highScore;
  }

  function showGameOver() {
    state='gameOver';
    Audio8bit.stopBGM(); Audio8bit.play('gameOver');
    const p=gameState?gameState.player:null;
    document.getElementById('gameover-score').textContent=p?p.score:0;
    document.getElementById('game-over-overlay').classList.remove('hidden');
  }

  // ── controls ──────────────────────────────────
  function togglePause() {
    paused=!paused;
    document.getElementById('pause-overlay').classList.toggle('hidden',!paused);
    document.getElementById('pause-btn').textContent=paused?'▶':'⏸';
    if(paused) Audio8bit.stopBGM(); else Audio8bit.startBGM();
  }

  function restartLevel() {
    ['pause-overlay','game-over-overlay','level-complete-overlay'].forEach(id=>document.getElementById(id).classList.add('hidden'));
    paused=false; state='playing';
    loadLevel(currentLevel);
  }

  function nextLevel() {
    document.getElementById('level-complete-overlay').classList.add('hidden');
    if (currentLevel+1<LEVELS.length) loadLevel(currentLevel+1);
    else quitToMenu();
  }

  function quitToMenu() {
    Audio8bit.stopBGM();
    if(rafId) cancelAnimationFrame(rafId);
    running=false; paused=false; state='menu';
    ['pause-overlay','game-over-overlay','level-complete-overlay'].forEach(id=>document.getElementById(id).classList.add('hidden'));
    showScreen('screen-menu');
  }

  return { init, start, togglePause, restartLevel, nextLevel, quitToMenu };
})();

function togglePause()  { Game.togglePause();  }
function restartLevel() { Game.restartLevel(); }
function nextLevel()    { Game.nextLevel();     }
function quitToMenu()   { Game.quitToMenu();   }
