/* ═══════════════════════════════════════════════════════
   MARIO BIRDS — AUDIO ENGINE
   Procedural 8-bit sounds via Web Audio API
   No external files required
═══════════════════════════════════════════════════════ */

const Audio8bit = (() => {
  let ctx = null;
  let masterGain = null;
  let muted = false;

  function init() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.35;
    masterGain.connect(ctx.destination);
  }

  function resume() {
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  // ── Low-level tone helpers ──────────────────────────
  function playTone({ freq = 440, type = 'square', duration = 0.15, volume = 0.5,
                       startFreq, endFreq, delay = 0, attack = 0.005, decay = 0.05 }) {
    if (!ctx || muted) return;
    const t = ctx.currentTime + delay;

    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    if (startFreq !== undefined && endFreq !== undefined) {
      osc.frequency.setValueAtTime(startFreq, t);
      osc.frequency.exponentialRampToValueAtTime(endFreq, t + duration);
    } else {
      osc.frequency.setValueAtTime(freq, t);
    }

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(volume, t + attack);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(t);
    osc.stop(t + duration + 0.01);
  }

  function playNoise({ duration = 0.1, volume = 0.3, delay = 0 }) {
    if (!ctx || muted) return;
    const t = ctx.currentTime + delay;
    const bufLen = ctx.sampleRate * duration;
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;

    const src  = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filt = ctx.createBiquadFilter();

    src.buffer = buf;
    filt.type = 'lowpass';
    filt.frequency.value = 400;

    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    src.connect(filt);
    filt.connect(gain);
    gain.connect(masterGain);
    src.start(t);
    src.stop(t + duration + 0.01);
  }

  // ── SOUND LIBRARY ──────────────────────────────────

  const sounds = {

    // Jump — classic Mario-style rising arp
    jump() {
      playTone({ freq: 523, type: 'square', duration: 0.08, volume: 0.4 });
      playTone({ freq: 659, type: 'square', duration: 0.08, volume: 0.35, delay: 0.06 });
      playTone({ freq: 784, type: 'square', duration: 0.1,  volume: 0.3,  delay: 0.12 });
    },

    // Coin collect — bright ding
    coin() {
      playTone({ freq: 1047, type: 'square', duration: 0.06, volume: 0.45 });
      playTone({ freq: 1319, type: 'square', duration: 0.1,  volume: 0.4, delay: 0.05 });
    },

    // Stomp pig — satisfying crunch
    stomp() {
      playTone({ startFreq: 300, endFreq: 80, type: 'square', duration: 0.12, volume: 0.5 });
      playNoise({ duration: 0.08, volume: 0.3 });
    },

    // Player hurt / death
    hurt() {
      playTone({ freq: 440, type: 'sawtooth', duration: 0.1, volume: 0.4 });
      playTone({ freq: 220, type: 'sawtooth', duration: 0.2, volume: 0.4, delay: 0.08 });
      playTone({ freq: 110, type: 'sawtooth', duration: 0.3, volume: 0.35, delay: 0.24 });
    },

    // Death full
    death() {
      const notes = [330, 294, 262, 247, 220, 196, 175, 131];
      notes.forEach((f, i) => {
        playTone({ freq: f, type: 'square', duration: 0.15, volume: 0.4, delay: i * 0.08 });
      });
    },

    // Block hit — bwump
    blockHit() {
      playTone({ startFreq: 220, endFreq: 180, type: 'square', duration: 0.1, volume: 0.4 });
      playNoise({ duration: 0.06, volume: 0.2 });
    },

    // Question block reveal
    powerup() {
      const notes = [523, 587, 659, 784, 880];
      notes.forEach((f, i) => {
        playTone({ freq: f, type: 'square', duration: 0.1, volume: 0.4, delay: i * 0.07 });
      });
    },

    // Slingshot charge
    slingshotCharge() {
      playTone({ startFreq: 150, endFreq: 400, type: 'sawtooth', duration: 0.4, volume: 0.3 });
    },

    // Slingshot launch — whoosh
    slingshotLaunch() {
      playTone({ startFreq: 800, endFreq: 200, type: 'sawtooth', duration: 0.25, volume: 0.45 });
      playNoise({ duration: 0.15, volume: 0.2 });
    },

    // Wood structure break
    woodBreak() {
      playNoise({ duration: 0.15, volume: 0.5 });
      playTone({ startFreq: 180, endFreq: 60, type: 'square', duration: 0.2, volume: 0.3, delay: 0.05 });
    },

    // Stone structure break
    stoneBreak() {
      playNoise({ duration: 0.2, volume: 0.6 });
      playTone({ startFreq: 120, endFreq: 50, type: 'square', duration: 0.3, volume: 0.35, delay: 0.08 });
    },

    // Level complete — jingle
    levelComplete() {
      const melody = [
        [523, 0], [659, 0.1], [784, 0.2], [1047, 0.3],
        [784, 0.45], [1047, 0.55], [1319, 0.7]
      ];
      melody.forEach(([f, d]) => {
        playTone({ freq: f, type: 'square', duration: 0.15, volume: 0.4, delay: d });
      });
    },

    // Game over — descending
    gameOver() {
      const melody = [
        [392, 0], [294, 0.25], [233, 0.5], [196, 0.75],
        [175, 1.0], [131, 1.3]
      ];
      melody.forEach(([f, d]) => {
        playTone({ freq: f, type: 'sawtooth', duration: 0.3, volume: 0.4, delay: d });
      });
    },

    // Flag pole
    flagPole() {
      const notes = [659, 698, 784, 880, 988, 1047];
      notes.forEach((f, i) => {
        playTone({ freq: f, type: 'square', duration: 0.12, volume: 0.38, delay: i * 0.06 });
      });
    },

    // 1-Up
    oneUp() {
      const notes = [392, 523, 659, 784, 1047, 1319];
      notes.forEach((f, i) => {
        playTone({ freq: f, type: 'square', duration: 0.09, volume: 0.42, delay: i * 0.055 });
      });
    },

    // Pig squeal when hit
    pigSqueal() {
      playTone({ startFreq: 900, endFreq: 400, type: 'sawtooth', duration: 0.2, volume: 0.35 });
    },

    // Pipe enter
    pipe() {
      playTone({ startFreq: 800, endFreq: 300, type: 'square', duration: 0.3, volume: 0.35 });
    },

    // Countdown tick
    tick() {
      playTone({ freq: 880, type: 'square', duration: 0.05, volume: 0.3 });
    }
  };

  // ── Background music loops ──────────────────────────
  let bgmTimeout = null;
  let bgmActive  = false;

  // Simple Mario-ish overworld motif (procedural)
  const overworld = [
    659,659,0,659,0,523,659,784,392,
    523,392,330,440,494,466,440,392,
    659,784,880,698,784,659,523,587,494
  ];

  function playBGM() {
    if (!ctx || muted || !bgmActive) return;
    let delay = 0;
    const tempo = 0.18;
    overworld.forEach(f => {
      if (f !== 0) {
        playTone({ freq: f, type: 'square', duration: tempo * 0.8, volume: 0.15, delay });
      }
      delay += tempo;
    });
    bgmTimeout = setTimeout(playBGM, delay * 1000);
  }

  function startBGM() {
    if (bgmActive) return;
    bgmActive = true;
    playBGM();
  }

  function stopBGM() {
    bgmActive = false;
    if (bgmTimeout) clearTimeout(bgmTimeout);
    bgmTimeout = null;
  }

  function toggleMute() {
    muted = !muted;
    if (masterGain) masterGain.gain.value = muted ? 0 : 0.35;
    if (muted) stopBGM();
    else startBGM();
    return muted;
  }

  return {
    init,
    resume,
    play: (name, ...args) => { if (sounds[name]) sounds[name](...args); },
    startBGM,
    stopBGM,
    toggleMute,
    isMuted: () => muted
  };
})();
