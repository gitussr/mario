/* ═══════════════════════════════════════════════════════
   MARIO BIRDS — MAIN GAME LOOP
   State machine, camera, level lifecycle, main tick
═══════════════════════════════════════════════════════ */

const Game = (() => {

  // ── Canvas setup ───────────────────────────────────
  let canvas, ctx;
  let cw, ch;

  // ── Game state ─────────────────────────────────────
  let running     = false;
  let paused      = false;
  let currentLevel = 0;
  let rafId       = null;
  let lastTime    = 0;
  let tick        = 0;
  let scrollX     = 0;

  // ── Level objects (live game state) ────────────────
  let gameState   = null;
  let timer       = null;

  // ── Systems ────────────────────────────────────────
  const particles   = new ParticleSystem();
  const floatText   = new FloatingText();

  // ── Game flow states ───────────────────────────────
  let state = 'menu'; // menu | playing | paused | levelComplete | gameOver | dead

  // ══════════════════════════════════════════════════
  // INIT
  // ══════════════════════════════════════════════════
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
    if (ch < 200) ch = window.innerHeight - 56; // fallback if hud not rendered yet
    canvas.width  = cw;
    canvas.height = ch;
    if (gameState) {
      gameState.groundY = ch - GH;
      if (gameState.player) {
        gameState.player.y = Math.min(gameState.player.y, gameState.groundY - gameState.player.h);
      }
    }
  }

  // ══════════════════════════════════════════════════
  // LOAD LEVEL
  // ══════════════════════════════════════════════════
  function loadLevel(idx) {
    currentLevel = idx;
    const levelData = LEVELS[idx];

    // Reset systems
    particles.particles = [];
    floatText.items = [];
    scrollX = 0;
    tick = 0;

    // Force correct canvas size BEFORE building level objects
    resizeCanvas();

    // Build live objects
    const objs = buildLevelObjects(levelData, ch);

    // Attach systems to objects
    objs.particles   = particles;
    objs.floatingText = floatText;
    objs.level       = levelData;

    gameState = objs;

    // Add the built platforms array back into level for rendering
    levelData.platforms = objs.platforms;
    levelData.slingshotObjs = objs.slingshotObjs;

    // Timer
    timer = new GameTimer(levelData.timeLimit);
    timer.start();

    // Update HUD
    updateHUD();

    state = 'playing';
    paused = false;
    Audio8bit.startBGM();
  }

  // ══════════════════════════════════════════════════
  // GAME LOOP
  // ══════════════════════════════════════════════════
  function start(levelIdx = 0) {
    if (rafId) cancelAnimationFrame(rafId);
    running = true;
    paused  = false;

    // Show game screen
    showScreen('screen-game');

    loadLevel(levelIdx);
    lastTime = performance.now();
    loop(lastTime);
  }

  function loop(now) {
    rafId = requestAnimationFrame(loop);
    let dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    if (paused) return;

    tick += dt;

    // Input pause
    if (Input.pause) {
      togglePause();
      Input.flush();
      return;
    }

    update(dt);
    draw();
    Input.flush();
  }

  // ══════════════════════════════════════════════════
  // UPDATE
  // ══════════════════════════════════════════════════
  function update(dt) {
    if (!gameState || (state !== 'playing' && state !== 'dying' && state !== 'flagPole')) return;

    const { player, pigs, coins, blocks, structureBlocks,
            slingshotObjs, flag, level } = gameState;

    // Update timer
    timer.update(dt);

    // Time up → hurt
    if (timer.isExpired && player.alive) {
      player.hurt(particles);
    }

    // Update all entities
    player.update(dt, { ...level, slingshotObjs }, particles, floatText);

    for (const pig of pigs) pig.update(dt, level);
    for (const coin of coins) coin.update(dt);
    for (const b of blocks) b.update(dt);
    for (const b of structureBlocks) b.update(dt);
    flag.update(dt);

    // Physics
    Physics.update(dt, gameState, ch);

    // Screen shake
    ScreenShake.update(dt);

    // Particles + float text
    particles.update(dt);
    floatText.update(dt);

    // Camera follow
    updateCamera(player, level);

    // HUD
    updateHUD();

    // Flag trigger
    if (!flag.triggered && player.alive &&
        rectOverlap(player.rect, flag.rect)) {
      triggerFlagPole();
    }

    // Player death → game over / retry
    if (!player.alive && state === 'playing') {
      state = 'dying';
      player._deathTimer = 2.2;
    }
    if (state === 'dying') {
      player.y  += player.vy * dt;
      player.vy += (level.gravity || 900) * dt;
      player._deathTimer -= dt;
      if (player._deathTimer <= 0) {
        if (player.lives > 0) {
          state = 'dead';
          loadLevel(currentLevel);
        } else {
          showGameOver();
          state = 'gameOver';
        }
      }
    }
  }

  // ── Camera ─────────────────────────────────────────
  function updateCamera(player, level) {
    const targetX = player.cx - cw * 0.38;
    scrollX = lerp(scrollX, targetX, 0.12);
    scrollX = clamp(scrollX, 0, level.width - cw);
  }

  // ── Flag pole ──────────────────────────────────────
  function triggerFlagPole() {
    if (!gameState) return;
    gameState.flag.triggered = true;
    gameState.player.vx = 0;
    Audio8bit.play('flagPole');
    Audio8bit.stopBGM();
    state = 'flagPole';

    setTimeout(() => {
      Audio8bit.play('levelComplete');
      setTimeout(() => showLevelComplete(), 1800);
    }, 800);
  }

  // ══════════════════════════════════════════════════
  // DRAW
  // ══════════════════════════════════════════════════
  function draw() {
    if (!gameState) return;

    ctx.save();

    // Screen shake
    if (ScreenShake.strength > 0.1) {
      ctx.translate(ScreenShake.x, ScreenShake.y);
    }

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
      particles,
      floatingText:   floatText,
      groundY:        gameState.groundY
    }, scrollX, tick);

    ctx.restore();
  }

  // ══════════════════════════════════════════════════
  // HUD
  // ══════════════════════════════════════════════════
  function updateHUD() {
    if (!gameState) return;
    const p = gameState.player;
    const level = LEVELS[currentLevel];

    const scoreEl = document.getElementById('hud-score');
    const livesEl = document.getElementById('hud-lives');
    const coinsEl = document.getElementById('hud-coins');
    const timeEl  = document.getElementById('hud-time');
    const lvlEl   = document.getElementById('hud-level');

    if (scoreEl) scoreEl.textContent = String(p.score).padStart(6, '0');
    if (livesEl) livesEl.textContent = '❤️'.repeat(Math.max(0, p.lives));
    if (coinsEl) coinsEl.textContent = String(p.coins).padStart(3, '0');
    if (timeEl)  {
      const t = timer ? timer.display : '--';
      timeEl.textContent = t;
      timeEl.style.color = t < 100 ? '#ff4444' : 'white';
    }
    if (lvlEl)   lvlEl.textContent = `${level.world}-${level.sublevel}`;
  }

  // ══════════════════════════════════════════════════
  // OVERLAYS
  // ══════════════════════════════════════════════════
  function showLevelComplete() {
    if (state === 'levelComplete') return;
    state = 'levelComplete';
    Audio8bit.stopBGM();

    const p = gameState.player;
    const timeBonus = timer ? Math.floor(timer.current * 10) : 0;
    const totalScore = p.score + timeBonus;

    const stars = Save.completeLevel(currentLevel, totalScore, p.coins, timer ? timer.current : 0);

    document.getElementById('complete-score').textContent = totalScore;
    document.getElementById('complete-coins').textContent = p.coins;
    document.getElementById('complete-time').textContent  = timeBonus;
    document.getElementById('star-rating').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);

    document.getElementById('level-complete-overlay').classList.remove('hidden');

    // Update high score in menu
    const saveData = Save.load();
    const hsEl = document.getElementById('high-score-display');
    if (hsEl) hsEl.textContent = saveData.highScore;
  }

  function showDeathRetry() {
    state = 'dead';
    // Simply reload same level — no overlay, brief flash
    setTimeout(() => { loadLevel(currentLevel); state = 'playing'; }, 400);
  }

  function showGameOver() {
    state = 'gameOver';
    Audio8bit.stopBGM();
    Audio8bit.play('gameOver');
    const p = gameState.player;
    document.getElementById('gameover-score').textContent = p.score;
    document.getElementById('game-over-overlay').classList.remove('hidden');
  }

  // ══════════════════════════════════════════════════
  // PUBLIC CONTROLS
  // ══════════════════════════════════════════════════
  function togglePause() {
    paused = !paused;
    const overlay = document.getElementById('pause-overlay');
    if (overlay) overlay.classList.toggle('hidden', !paused);
    const btn = document.getElementById('pause-btn');
    if (btn) btn.textContent = paused ? '▶' : '⏸';
    if (paused) Audio8bit.stopBGM(); else Audio8bit.startBGM();
  }

  function restartLevel() {
    document.getElementById('pause-overlay').classList.add('hidden');
    document.getElementById('game-over-overlay').classList.add('hidden');
    document.getElementById('level-complete-overlay').classList.add('hidden');
    paused = false;
    state  = 'playing';
    loadLevel(currentLevel);
  }

  function nextLevel() {
    document.getElementById('level-complete-overlay').classList.add('hidden');
    if (currentLevel + 1 < LEVELS.length) {
      loadLevel(currentLevel + 1);
    } else {
      // All levels done!
      quitToMenu();
    }
  }

  function quitToMenu() {
    Audio8bit.stopBGM();
    if (rafId) cancelAnimationFrame(rafId);
    running = false;
    paused  = false;
    state   = 'menu';
    ['pause-overlay','game-over-overlay','level-complete-overlay'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });
    showScreen('screen-menu');
  }

  return { init, start, togglePause, restartLevel, nextLevel, quitToMenu };
})();

// ── Wire up global controls used by HTML onclick ───
function togglePause()  { Game.togglePause();   }
function restartLevel() { Game.restartLevel();  }
function nextLevel()    { Game.nextLevel();      }
function quitToMenu()   { Game.quitToMenu();    }
