/* ═══════════════════════════════════════════════════════
   MARIO BIRDS — UI CONTROLLER
   Screen transitions, level select grid, menu wiring
═══════════════════════════════════════════════════════ */

// ── Screen switcher ────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.style.display = 'none';
  });
  const target = document.getElementById(id);
  if (target) {
    target.style.display = 'flex';
    target.classList.add('active');
  }

  // Special logic per screen
  if (id === 'screen-menu')   onMenuOpen();
  if (id === 'screen-levels') onLevelsOpen();
  if (id === 'screen-game')   onGameOpen();
}

// ── Menu opened ────────────────────────────────────────
function onMenuOpen() {
  const saveData = Save.load();
  const el = document.getElementById('high-score-display');
  if (el) el.textContent = saveData.highScore.toLocaleString();
}

// ── Level select opened ────────────────────────────────
function onLevelsOpen() {
  const saveData = Save.load();
  const grid = document.getElementById('levels-grid');
  if (!grid) return;

  grid.innerHTML = '';

  LEVEL_META.forEach((meta, idx) => {
    const unlocked = saveData.unlockedLevels[idx];
    const stars    = saveData.levelStars[idx] || 0;
    const card     = document.createElement('div');

    card.className = [
      'level-card',
      !unlocked ? 'locked' : '',
      stars > 0  ? 'completed' : ''
    ].join(' ').trim();

    const diffClass = {
      easy:   'diff-easy',
      medium: 'diff-medium',
      hard:   'diff-hard',
      boss:   'diff-boss'
    }[meta.diff] || 'diff-easy';

    const diffLabel = {
      easy: 'EASY', medium: 'MED', hard: 'HARD', boss: 'BOSS'
    }[meta.diff] || 'EASY';

    card.innerHTML = `
      <span class="level-diff ${diffClass}">${diffLabel}</span>
      <span class="level-num">${meta.emoji}</span>
      <span class="level-name">${meta.name}</span>
      <span class="level-stars">${
        stars > 0
          ? '⭐'.repeat(stars) + '☆'.repeat(3 - stars)
          : unlocked ? '☆☆☆' : '🔒'
      }</span>
      <span style="font-family:'Fredoka One';font-size:13px;color:#888;margin-top:2px">
        ${unlocked ? `Level ${idx + 1}` : 'Locked'}
      </span>
    `;

    if (unlocked) {
      card.addEventListener('click', () => {
        Audio8bit.init();
        Audio8bit.resume();
        Game.start(idx);
      });
      card.addEventListener('mouseenter', () => {
        Audio8bit.init();
        Audio8bit.play('tick');
      });
    }

    grid.appendChild(card);
  });
}

// ── Game screen opened ─────────────────────────────────
function onGameOpen() {
  // Resize canvas to fit
  const canvas = document.getElementById('gameCanvas');
  const hud    = document.getElementById('hud');
  if (canvas && hud) {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight - hud.offsetHeight;
  }
}

// ── Global keyboard for menu screens ──────────────────
window.addEventListener('keydown', e => {
  // Resume audio on first key press anywhere
  Audio8bit.init();
  Audio8bit.resume();

  const activeMenu = document.getElementById('screen-menu');
  if (activeMenu && activeMenu.classList.contains('active')) {
    if (e.code === 'Enter' || e.code === 'Space') {
      e.preventDefault();
      showScreen('screen-levels');
    }
  }
});

// ── Touch/click to resume audio ───────────────────────
window.addEventListener('click', () => {
  Audio8bit.init();
  Audio8bit.resume();
}, { once: false });

// ── Mute toggle (M key anywhere) ──────────────────────
window.addEventListener('keydown', e => {
  if (e.code === 'KeyM') {
    const muted = Audio8bit.toggleMute();
    // Brief visual feedback
    const toast = document.createElement('div');
    toast.style.cssText = `
      position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
      background:rgba(0,0,0,0.82); color:#ffd700;
      font-family:'Fredoka One',cursive; font-size:22px;
      padding:10px 28px; border-radius:14px; border:3px solid #ffd700;
      z-index:9999; pointer-events:none;
      animation: fadeToast 1.8s ease forwards;
    `;
    toast.textContent = muted ? '🔇 Sound OFF' : '🔊 Sound ON';

    if (!document.getElementById('toast-style')) {
      const style = document.createElement('style');
      style.id = 'toast-style';
      style.textContent = `
        @keyframes fadeToast {
          0%   { opacity:0; transform:translateX(-50%) translateY(10px); }
          15%  { opacity:1; transform:translateX(-50%) translateY(0); }
          75%  { opacity:1; }
          100% { opacity:0; transform:translateX(-50%) translateY(-10px); }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1900);
  }
});

// ── Initialize on DOM ready ────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  // Show main menu
  showScreen('screen-menu');

  // Init game engine (canvas etc) — doesn't start loop yet
  Game.init();

  // Preload save data
  const saveData = Save.load();

  // Ensure level 1 always unlocked
  if (!saveData.unlockedLevels[0]) {
    saveData.unlockedLevels[0] = true;
    Save.save(saveData);
  }

  // Easter egg: unlock all levels with Konami code
  let konamiSeq = [];
  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown',
                  'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
                  'KeyB','KeyA'];
  window.addEventListener('keydown', e => {
    konamiSeq.push(e.code);
    konamiSeq = konamiSeq.slice(-10);
    if (konamiSeq.join(',') === KONAMI.join(',')) {
      const data = Save.load();
      data.unlockedLevels = data.unlockedLevels.map(() => true);
      Save.save(data);
      Audio8bit.play('oneUp');
      const toast = document.createElement('div');
      toast.style.cssText = `
        position:fixed; top:40%; left:50%; transform:translate(-50%,-50%);
        background:rgba(0,0,0,0.9); color:#ffd700;
        font-family:'Fredoka One',cursive; font-size:28px;
        padding:20px 40px; border-radius:20px; border:4px solid #ffd700;
        z-index:9999; text-align:center;
        animation: fadeToast 3s ease forwards;
      `;
      toast.innerHTML = '🎮 KONAMI CODE!<br>All Levels Unlocked!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3100);
      // Refresh level grid if open
      const lvlScreen = document.getElementById('screen-levels');
      if (lvlScreen && lvlScreen.classList.contains('active')) onLevelsOpen();
    }
  });

  console.log(
    '%c🐦 MARIO BIRDS 🐷\n%cThe Ultimate Fusion Adventure\nTip: Press M to toggle sound\nSecret: Try the Konami Code on the level select!',
    'font-size:22px; font-weight:bold; color:#e63946',
    'font-size:13px; color:#57cc57'
  );
});
