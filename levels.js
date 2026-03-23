/* ═══════════════════════════════════════════════════════
   MARIO BIRDS — LEVEL DATA
   All 10 levels: platforms, pigs, structures, coins, slingshots
   Difficulty: Easy (1-3) → Medium (4-6) → Hard (7-9) → Boss (10)
═══════════════════════════════════════════════════════ */

const TILE = 48; // Base tile size
const GH   = 80; // Ground height (canvas - GH = ground y)

/*
  PLATFORM  : { x, y, w, h, type: 'grass'|'stone'|'cloud'|'ice' }
  PIG       : { x, y, type: 'normal'|'helmet'|'king'|'fat', hp }
  BLOCK     : { x, y, type: 'question'|'brick'|'pipe' }
  COIN      : { x, y }
  STRUCTURE : { x, y, blocks: [{dx,dy,type:'wood'|'stone'|'glass'}], pigs: [pigIndex] }
  SLINGSHOT : { x, y }
  FLAG      : { x }
*/

function makeLevel(cfg) {
  return {
    name:       cfg.name       || 'Level',
    world:      cfg.world      || 1,
    sublevel:   cfg.sublevel   || 1,
    theme:      cfg.theme      || 'grass',    // grass | desert | snow | lava | castle
    bgColor:    cfg.bgColor    || '#5bc8f5',
    width:      cfg.width      || 5000,
    timeLimit:  cfg.timeLimit  || 400,
    platforms:  cfg.platforms  || [],
    pigs:       cfg.pigs       || [],
    blocks:     cfg.blocks     || [],
    coins:      cfg.coins      || [],
    structures: cfg.structures || [],
    slingshots: cfg.slingshots || [],
    flagX:      cfg.flagX      || cfg.width - 200,
    startX:     cfg.startX     || 80,
    gravity:    cfg.gravity    || 900,
    scrollSpeed:cfg.scrollSpeed|| 0,
    difficulty: cfg.difficulty || 'easy',
    pigCount:   (cfg.pigs || []).length
  };
}

// ── HELPER: Ground-relative y ──────────────────────────
// gy(n) stores a sentinel resolved to real pixels at load time
// gy(0) = ground surface, gy(1) = 1 tile above, etc.
const GY_TAG = '__GY__';
function gy(n) { return { [GY_TAG]: true, n }; }
const gx = n => n * TILE;
function resolveY(val, groundY) {
  if (val && val[GY_TAG]) return groundY - (val.n * TILE);
  return val;
}

// ══════════════════════════════════════════════════════
// LEVEL 1 — "Green Hills" (Easy)
// ══════════════════════════════════════════════════════
const level1 = makeLevel({
  name: 'Green Hills', world: 1, sublevel: 1,
  theme: 'grass', difficulty: 'easy',
  width: 3200, timeLimit: 400,
  bgColor: '#5bc8f5',
  flagX: 3000,

  platforms: [
    { x: 400,  y: gy(3), w: 144, h: TILE, type: 'grass' },
    { x: 700,  y: gy(4), w: 96,  h: TILE, type: 'grass' },
    { x: 950,  y: gy(3), w: 192, h: TILE, type: 'grass' },
    { x: 1300, y: gy(5), w: 144, h: TILE, type: 'grass' },
    { x: 1600, y: gy(3), w: 96,  h: TILE, type: 'cloud' },
    { x: 2000, y: gy(4), w: 192, h: TILE, type: 'grass' },
    { x: 2400, y: gy(3), w: 144, h: TILE, type: 'grass' },
    { x: 2700, y: gy(4), w: 96,  h: TILE, type: 'grass' },
  ],

  blocks: [
    { x: 500,  y: gy(6), type: 'question' },
    { x: 548,  y: gy(6), type: 'brick' },
    { x: 596,  y: gy(6), type: 'question' },
    { x: 1100, y: gy(6), type: 'question' },
    { x: 1500, y: gy(6), type: 'brick' },
    { x: 1900, y: gy(5), type: 'question' },
    { x: 2200, y: gy(6), type: 'question' },
    { x: 2600, y: gy(6), type: 'brick' },
  ],

  coins: [
    { x: 600,  y: gy(8)  },
    { x: 648,  y: gy(8)  },
    { x: 696,  y: gy(8)  },
    { x: 1000, y: gy(6)  },
    { x: 1048, y: gy(6)  },
    { x: 1700, y: gy(6)  },
    { x: 2100, y: gy(7)  },
    { x: 2500, y: gy(5)  },
  ],

  pigs: [
    { x: 900,  y: gy(0), type: 'normal',  hp: 1 },
    { x: 1400, y: gy(0), type: 'normal',  hp: 1 },
    { x: 2200, y: gy(0), type: 'normal',  hp: 1 },
  ],

  structures: [
    {
      x: 1800, y: gy(0),
      blocks: [
        { dx: 0,   dy: 0,    type: 'wood', w: TILE,   h: TILE*2 },
        { dx: TILE*1.5, dy: 0, type: 'wood', w: TILE, h: TILE*2 },
        { dx: TILE*0.5, dy: -TILE*2, type: 'wood', w: TILE*2, h: TILE*0.5 },
      ],
      pigs: [{ x: TILE*0.6, y: -TILE*2.1, type: 'normal', hp: 1 }]
    }
  ],

  slingshots: [{ x: 250, y: gy(0) }]
});

// ══════════════════════════════════════════════════════
// LEVEL 2 — "Pig Valley" (Easy)
// ══════════════════════════════════════════════════════
const level2 = makeLevel({
  name: 'Pig Valley', world: 1, sublevel: 2,
  theme: 'grass', difficulty: 'easy',
  width: 3600, timeLimit: 380,
  bgColor: '#6dd5fa',
  flagX: 3400,

  platforms: [
    { x: 350,  y: gy(4), w: 144, h: TILE, type: 'grass' },
    { x: 600,  y: gy(5), w: 96,  h: TILE, type: 'grass' },
    { x: 850,  y: gy(3), w: 192, h: TILE, type: 'grass' },
    { x: 1200, y: gy(6), w: 144, h: TILE, type: 'cloud' },
    { x: 1500, y: gy(4), w: 192, h: TILE, type: 'grass' },
    { x: 1900, y: gy(5), w: 144, h: TILE, type: 'grass' },
    { x: 2300, y: gy(3), w: 192, h: TILE, type: 'grass' },
    { x: 2700, y: gy(5), w: 144, h: TILE, type: 'cloud' },
    { x: 3100, y: gy(4), w: 96,  h: TILE, type: 'grass' },
  ],

  blocks: [
    { x: 450,  y: gy(7), type: 'question' },
    { x: 498,  y: gy(7), type: 'question' },
    { x: 900,  y: gy(6), type: 'brick' },
    { x: 1300, y: gy(9), type: 'question' },
    { x: 1700, y: gy(7), type: 'brick' },
    { x: 2000, y: gy(7), type: 'question' },
    { x: 2400, y: gy(6), type: 'brick' },
    { x: 2800, y: gy(9), type: 'question' },
  ],

  coins: Array.from({length: 12}, (_, i) => ({
    x: 400 + i * 240, y: gy(9)
  })),

  pigs: [
    { x: 700,  y: gy(0), type: 'normal', hp: 1 },
    { x: 1100, y: gy(0), type: 'normal', hp: 1 },
    { x: 1600, y: gy(0), type: 'normal', hp: 1 },
    { x: 2400, y: gy(0), type: 'normal', hp: 1 },
    { x: 3000, y: gy(0), type: 'normal', hp: 1 },
  ],

  structures: [
    {
      x: 2000, y: gy(0),
      blocks: [
        { dx: 0,       dy: 0,       type: 'wood', w: TILE,   h: TILE*3 },
        { dx: TILE*2,  dy: 0,       type: 'wood', w: TILE,   h: TILE*3 },
        { dx: 0,       dy: -TILE*3, type: 'wood', w: TILE*3, h: TILE*0.5 },
      ],
      pigs: [
        { x: TILE*0.5, y: -TILE*3.5, type: 'normal', hp: 1 },
        { x: TILE*1.5, y: -TILE*3.5, type: 'normal', hp: 1 },
      ]
    }
  ],

  slingshots: [{ x: 200, y: gy(0) }, { x: 1400, y: gy(0) }]
});

// ══════════════════════════════════════════════════════
// LEVEL 3 — "Mushroom Plateau" (Easy-Medium)
// ══════════════════════════════════════════════════════
const level3 = makeLevel({
  name: 'Mushroom Plateau', world: 1, sublevel: 3,
  theme: 'grass', difficulty: 'easy',
  width: 4000, timeLimit: 360,
  bgColor: '#7dc8f5',
  flagX: 3800,

  platforms: [
    { x: 300,  y: gy(5), w: 96,  h: TILE, type: 'grass' },
    { x: 550,  y: gy(7), w: 144, h: TILE, type: 'grass' },
    { x: 820,  y: gy(4), w: 96,  h: TILE, type: 'grass' },
    { x: 1050, y: gy(6), w: 192, h: TILE, type: 'grass' },
    { x: 1400, y: gy(8), w: 96,  h: TILE, type: 'cloud' },
    { x: 1700, y: gy(5), w: 144, h: TILE, type: 'grass' },
    { x: 2050, y: gy(7), w: 96,  h: TILE, type: 'grass' },
    { x: 2350, y: gy(4), w: 192, h: TILE, type: 'grass' },
    { x: 2700, y: gy(6), w: 144, h: TILE, type: 'grass' },
    { x: 3100, y: gy(5), w: 192, h: TILE, type: 'grass' },
    { x: 3500, y: gy(4), w: 144, h: TILE, type: 'grass' },
  ],

  blocks: [
    { x: 600,  y: gy(10), type: 'question' },
    { x: 648,  y: gy(10), type: 'brick' },
    { x: 696,  y: gy(10), type: 'question' },
    { x: 1100, y: gy(9),  type: 'question' },
    { x: 1800, y: gy(8),  type: 'question' },
    { x: 2400, y: gy(7),  type: 'brick' },
    { x: 2700, y: gy(9),  type: 'question' },
    { x: 3200, y: gy(8),  type: 'question' },
  ],

  coins: Array.from({length: 15}, (_, i) => ({
    x: 350 + i * 240, y: gy(10)
  })),

  pigs: [
    { x: 650,  y: gy(0), type: 'normal',  hp: 1 },
    { x: 1150, y: gy(0), type: 'normal',  hp: 1 },
    { x: 1800, y: gy(0), type: 'normal',  hp: 1 },
    { x: 2450, y: gy(0), type: 'helmet',  hp: 2 },
    { x: 3100, y: gy(0), type: 'normal',  hp: 1 },
    { x: 3600, y: gy(0), type: 'helmet',  hp: 2 },
  ],

  structures: [
    {
      x: 1500, y: gy(0),
      blocks: [
        { dx: 0,      dy: 0,      type: 'wood',  w: TILE, h: TILE*2 },
        { dx: TILE,   dy: 0,      type: 'wood',  w: TILE, h: TILE*2 },
        { dx: TILE*2, dy: 0,      type: 'wood',  w: TILE, h: TILE*2 },
        { dx: 0,      dy:-TILE*2, type: 'wood',  w: TILE*3, h: TILE*0.5 },
      ],
      pigs: [{ x: TILE, y: -TILE*2.5, type: 'normal', hp: 1 }]
    },
    {
      x: 3000, y: gy(0),
      blocks: [
        { dx: 0,      dy: 0,      type: 'stone', w: TILE,   h: TILE*3 },
        { dx: TILE*2, dy: 0,      type: 'stone', w: TILE,   h: TILE*3 },
        { dx: 0,      dy:-TILE*3, type: 'stone', w: TILE*3, h: TILE*0.5 },
      ],
      pigs: [{ x: TILE*0.8, y: -TILE*3.5, type: 'helmet', hp: 2 }]
    }
  ],

  slingshots: [{ x: 180, y: gy(0) }, { x: 1050, y: gy(0) }, { x: 2600, y: gy(0) }]
});

// ══════════════════════════════════════════════════════
// LEVEL 4 — "Desert Dunes" (Medium)
// ══════════════════════════════════════════════════════
const level4 = makeLevel({
  name: 'Desert Dunes', world: 2, sublevel: 1,
  theme: 'desert', difficulty: 'medium',
  width: 4500, timeLimit: 340,
  bgColor: '#f5d06b',
  flagX: 4300,

  platforms: [
    { x: 400,  y: gy(4), w: 96,  h: TILE, type: 'stone' },
    { x: 700,  y: gy(6), w: 144, h: TILE, type: 'stone' },
    { x: 1050, y: gy(4), w: 96,  h: TILE, type: 'stone' },
    { x: 1400, y: gy(7), w: 192, h: TILE, type: 'stone' },
    { x: 1800, y: gy(5), w: 144, h: TILE, type: 'stone' },
    { x: 2200, y: gy(3), w: 96,  h: TILE, type: 'stone' },
    { x: 2550, y: gy(6), w: 192, h: TILE, type: 'stone' },
    { x: 3000, y: gy(4), w: 144, h: TILE, type: 'stone' },
    { x: 3400, y: gy(7), w: 96,  h: TILE, type: 'stone' },
    { x: 3800, y: gy(5), w: 192, h: TILE, type: 'stone' },
  ],

  blocks: [
    { x: 500,  y: gy(7), type: 'question' },
    { x: 800,  y: gy(9), type: 'brick' },
    { x: 1100, y: gy(7), type: 'question' },
    { x: 1500, y: gy(10), type: 'question' },
    { x: 1900, y: gy(8), type: 'brick' },
    { x: 2300, y: gy(6), type: 'question' },
    { x: 2600, y: gy(9), type: 'brick' },
    { x: 3100, y: gy(7), type: 'question' },
    { x: 3500, y: gy(10), type: 'question' },
  ],

  coins: Array.from({length: 18}, (_, i) => ({
    x: 300 + i * 220, y: gy(11)
  })),

  pigs: [
    { x: 600,  y: gy(0), type: 'normal', hp: 1 },
    { x: 900,  y: gy(0), type: 'helmet', hp: 2 },
    { x: 1300, y: gy(0), type: 'normal', hp: 1 },
    { x: 1700, y: gy(0), type: 'helmet', hp: 2 },
    { x: 2150, y: gy(0), type: 'normal', hp: 1 },
    { x: 2700, y: gy(0), type: 'helmet', hp: 2 },
    { x: 3200, y: gy(0), type: 'normal', hp: 1 },
  ],

  structures: [
    {
      x: 1200, y: gy(0),
      blocks: [
        { dx: 0,      dy: 0,      type: 'wood',  w: TILE,   h: TILE*2 },
        { dx: TILE,   dy: -TILE,  type: 'wood',  w: TILE,   h: TILE*3 },
        { dx: TILE*2, dy: 0,      type: 'wood',  w: TILE,   h: TILE*2 },
        { dx: 0,      dy:-TILE*2, type: 'stone', w: TILE*3, h: TILE*0.5 },
      ],
      pigs: [
        { x: 0,     y: -TILE*2.5, type: 'normal', hp: 1 },
        { x: TILE*2,y: -TILE*2.5, type: 'helmet', hp: 2 },
      ]
    },
    {
      x: 2900, y: gy(0),
      blocks: [
        { dx: 0,      dy: 0,      type: 'stone', w: TILE,   h: TILE*3 },
        { dx: TILE*1.5, dy: 0,    type: 'stone', w: TILE,   h: TILE*3 },
        { dx: 0,      dy:-TILE*3, type: 'stone', w: TILE*3, h: TILE*0.6 },
        { dx: TILE*0.8, dy:-TILE*3.6, type: 'wood', w: TILE*1.4, h: TILE },
      ],
      pigs: [{ x: TILE, y: -TILE*4.8, type: 'helmet', hp: 2 }]
    }
  ],

  slingshots: [{ x: 200, y: gy(0) }, { x: 1800, y: gy(0) }, { x: 3600, y: gy(0) }]
});

// ══════════════════════════════════════════════════════
// LEVEL 5 — "Icy Caverns" (Medium)
// ══════════════════════════════════════════════════════
const level5 = makeLevel({
  name: 'Icy Caverns', world: 2, sublevel: 2,
  theme: 'snow', difficulty: 'medium',
  width: 4800, timeLimit: 320,
  bgColor: '#c8e8ff',
  flagX: 4600,

  platforms: [
    { x: 300,  y: gy(4), w: 144, h: TILE, type: 'ice' },
    { x: 600,  y: gy(7), w: 96,  h: TILE, type: 'ice' },
    { x: 900,  y: gy(5), w: 192, h: TILE, type: 'ice' },
    { x: 1300, y: gy(3), w: 96,  h: TILE, type: 'ice' },
    { x: 1600, y: gy(6), w: 144, h: TILE, type: 'ice' },
    { x: 2000, y: gy(8), w: 192, h: TILE, type: 'ice' },
    { x: 2450, y: gy(5), w: 96,  h: TILE, type: 'cloud' },
    { x: 2800, y: gy(4), w: 192, h: TILE, type: 'ice' },
    { x: 3200, y: gy(7), w: 144, h: TILE, type: 'ice' },
    { x: 3600, y: gy(5), w: 192, h: TILE, type: 'ice' },
    { x: 4100, y: gy(4), w: 144, h: TILE, type: 'ice' },
  ],

  blocks: [
    { x: 400,  y: gy(7),  type: 'question' },
    { x: 700,  y: gy(10), type: 'brick' },
    { x: 1000, y: gy(8),  type: 'question' },
    { x: 1400, y: gy(6),  type: 'question' },
    { x: 1700, y: gy(9),  type: 'brick' },
    { x: 2100, y: gy(11), type: 'question' },
    { x: 2500, y: gy(8),  type: 'question' },
    { x: 2900, y: gy(7),  type: 'brick' },
    { x: 3300, y: gy(10), type: 'question' },
    { x: 3700, y: gy(8),  type: 'question' },
  ],

  coins: Array.from({length: 20}, (_, i) => ({
    x: 280 + i * 215, y: gy(12)
  })),

  pigs: [
    { x: 500,  y: gy(0), type: 'normal', hp: 1 },
    { x: 800,  y: gy(0), type: 'helmet', hp: 2 },
    { x: 1200, y: gy(0), type: 'fat',    hp: 3 },
    { x: 1700, y: gy(0), type: 'helmet', hp: 2 },
    { x: 2300, y: gy(0), type: 'normal', hp: 1 },
    { x: 2900, y: gy(0), type: 'fat',    hp: 3 },
    { x: 3500, y: gy(0), type: 'helmet', hp: 2 },
    { x: 4000, y: gy(0), type: 'normal', hp: 1 },
  ],

  structures: [
    {
      x: 1000, y: gy(0),
      blocks: [
        { dx: 0,     dy: 0,      type: 'wood',  w: TILE, h: TILE*2 },
        { dx: TILE,  dy:-TILE,   type: 'wood',  w: TILE, h: TILE*3 },
        { dx: TILE*2,dy: 0,      type: 'wood',  w: TILE, h: TILE*2 },
        { dx: TILE*3,dy:-TILE,   type: 'stone', w: TILE, h: TILE*3 },
        { dx: 0,     dy:-TILE*2, type: 'stone', w: TILE*4, h: TILE*0.5 },
      ],
      pigs: [
        { x: 0,     y: -TILE*2.5, type: 'normal', hp: 1 },
        { x: TILE*2,y: -TILE*2.5, type: 'helmet', hp: 2 },
      ]
    },
    {
      x: 2500, y: gy(0),
      blocks: [
        { dx: 0,      dy: 0,      type: 'stone', w: TILE,   h: TILE*4 },
        { dx: TILE*2, dy: 0,      type: 'stone', w: TILE,   h: TILE*4 },
        { dx: TILE*4, dy: 0,      type: 'stone', w: TILE,   h: TILE*4 },
        { dx: 0,      dy:-TILE*4, type: 'stone', w: TILE*5, h: TILE*0.5 },
        { dx: TILE,   dy:-TILE*4.5, type: 'wood', w: TILE*3, h: TILE },
      ],
      pigs: [
        { x: 0,      y: -TILE*4.8, type: 'fat',    hp: 3 },
        { x: TILE*2, y: -TILE*4.8, type: 'helmet', hp: 2 },
        { x: TILE*4, y: -TILE*4.8, type: 'normal', hp: 1 },
      ]
    }
  ],

  slingshots: [{ x: 150, y: gy(0) }, { x: 1500, y: gy(0) }, { x: 3300, y: gy(0) }]
});

// ══════════════════════════════════════════════════════
// LEVEL 6 — "Lava Bridges" (Medium-Hard)
// ══════════════════════════════════════════════════════
const level6 = makeLevel({
  name: 'Lava Bridges', world: 3, sublevel: 1,
  theme: 'lava', difficulty: 'medium',
  width: 5200, timeLimit: 300,
  bgColor: '#ff9c40',
  flagX: 5000,

  platforms: [
    { x: 200,  y: gy(3), w: 144, h: TILE, type: 'stone' },
    { x: 550,  y: gy(5), w: 96,  h: TILE, type: 'stone' },
    { x: 850,  y: gy(3), w: 192, h: TILE, type: 'stone' },
    { x: 1250, y: gy(6), w: 96,  h: TILE, type: 'stone' },
    { x: 1550, y: gy(4), w: 144, h: TILE, type: 'stone' },
    { x: 1950, y: gy(7), w: 192, h: TILE, type: 'stone' },
    { x: 2400, y: gy(3), w: 96,  h: TILE, type: 'stone' },
    { x: 2700, y: gy(5), w: 192, h: TILE, type: 'stone' },
    { x: 3200, y: gy(4), w: 144, h: TILE, type: 'stone' },
    { x: 3600, y: gy(6), w: 96,  h: TILE, type: 'stone' },
    { x: 3950, y: gy(4), w: 192, h: TILE, type: 'stone' },
    { x: 4450, y: gy(3), w: 144, h: TILE, type: 'stone' },
  ],

  blocks: [
    { x: 300,  y: gy(6),  type: 'question' },
    { x: 650,  y: gy(8),  type: 'brick' },
    { x: 950,  y: gy(6),  type: 'question' },
    { x: 1350, y: gy(9),  type: 'question' },
    { x: 1650, y: gy(7),  type: 'brick' },
    { x: 2050, y: gy(10), type: 'question' },
    { x: 2500, y: gy(6),  type: 'brick' },
    { x: 2800, y: gy(8),  type: 'question' },
    { x: 3300, y: gy(7),  type: 'question' },
    { x: 3700, y: gy(9),  type: 'brick' },
  ],

  coins: Array.from({length: 22}, (_, i) => ({
    x: 200 + i * 210, y: gy(12)
  })),

  pigs: [
    { x: 480,  y: gy(0), type: 'normal', hp: 1 },
    { x: 780,  y: gy(0), type: 'helmet', hp: 2 },
    { x: 1180, y: gy(0), type: 'fat',    hp: 3 },
    { x: 1500, y: gy(0), type: 'helmet', hp: 2 },
    { x: 1900, y: gy(0), type: 'normal', hp: 1 },
    { x: 2350, y: gy(0), type: 'fat',    hp: 3 },
    { x: 2650, y: gy(0), type: 'helmet', hp: 2 },
    { x: 3150, y: gy(0), type: 'fat',    hp: 3 },
    { x: 3550, y: gy(0), type: 'helmet', hp: 2 },
  ],

  structures: [
    {
      x: 1300, y: gy(0),
      blocks: [
        { dx: 0,     dy: 0,       type: 'stone', w: TILE,   h: TILE*3 },
        { dx: TILE,  dy: -TILE,   type: 'wood',  w: TILE,   h: TILE*4 },
        { dx: TILE*2,dy: 0,       type: 'stone', w: TILE,   h: TILE*3 },
        { dx: 0,     dy: -TILE*3, type: 'stone', w: TILE*3, h: TILE*0.5 },
        { dx: TILE*0.5, dy: -TILE*3.5, type: 'wood', w: TILE*2, h: TILE },
      ],
      pigs: [
        { x: TILE*0.5, y: -TILE*4.7, type: 'fat',    hp: 3 },
        { x: TILE*1.8, y: -TILE*4.7, type: 'helmet', hp: 2 },
      ]
    },
    {
      x: 2800, y: gy(0),
      blocks: [
        { dx: 0,      dy: 0,       type: 'stone', w: TILE,   h: TILE*5 },
        { dx: TILE*2, dy: 0,       type: 'stone', w: TILE,   h: TILE*5 },
        { dx: TILE*4, dy: 0,       type: 'stone', w: TILE,   h: TILE*5 },
        { dx: 0,      dy: -TILE*5, type: 'stone', w: TILE*5, h: TILE*0.6 },
        { dx: TILE,   dy: -TILE*3, type: 'wood',  w: TILE*3, h: TILE*2 },
        { dx: TILE*1.5, dy: -TILE*5.6, type: 'wood', w: TILE*2, h: TILE },
      ],
      pigs: [
        { x: TILE*0.5, y: -TILE*5.8, type: 'helmet', hp: 2 },
        { x: TILE*2,   y: -TILE*5.8, type: 'fat',    hp: 3 },
        { x: TILE*4,   y: -TILE*5.8, type: 'helmet', hp: 2 },
      ]
    }
  ],

  slingshots: [{ x: 120, y: gy(0) }, { x: 1800, y: gy(0) }, { x: 3700, y: gy(0) }]
});

// ══════════════════════════════════════════════════════
// LEVEL 7 — "Sky Kingdom" (Hard)
// ══════════════════════════════════════════════════════
const level7 = makeLevel({
  name: 'Sky Kingdom', world: 3, sublevel: 2,
  theme: 'sky', difficulty: 'hard',
  width: 5600, timeLimit: 280,
  bgColor: '#2a9fd6',
  flagX: 5400,

  platforms: [
    { x: 200,  y: gy(5), w: 96,  h: TILE, type: 'cloud' },
    { x: 500,  y: gy(8), w: 144, h: TILE, type: 'cloud' },
    { x: 850,  y: gy(6), w: 96,  h: TILE, type: 'cloud' },
    { x: 1200, y: gy(4), w: 144, h: TILE, type: 'cloud' },
    { x: 1600, y: gy(7), w: 96,  h: TILE, type: 'cloud' },
    { x: 1950, y: gy(5), w: 192, h: TILE, type: 'cloud' },
    { x: 2400, y: gy(3), w: 96,  h: TILE, type: 'cloud' },
    { x: 2750, y: gy(6), w: 144, h: TILE, type: 'cloud' },
    { x: 3150, y: gy(4), w: 96,  h: TILE, type: 'cloud' },
    { x: 3500, y: gy(7), w: 192, h: TILE, type: 'cloud' },
    { x: 3950, y: gy(5), w: 96,  h: TILE, type: 'cloud' },
    { x: 4300, y: gy(4), w: 192, h: TILE, type: 'cloud' },
    { x: 4750, y: gy(6), w: 144, h: TILE, type: 'cloud' },
  ],

  blocks: [
    { x: 300,  y: gy(8),  type: 'question' },
    { x: 600,  y: gy(11), type: 'brick' },
    { x: 950,  y: gy(9),  type: 'question' },
    { x: 1300, y: gy(7),  type: 'question' },
    { x: 1700, y: gy(10), type: 'brick' },
    { x: 2050, y: gy(8),  type: 'question' },
    { x: 2500, y: gy(6),  type: 'question' },
    { x: 2850, y: gy(9),  type: 'brick' },
    { x: 3250, y: gy(7),  type: 'question' },
    { x: 3600, y: gy(10), type: 'question' },
    { x: 4050, y: gy(8),  type: 'brick' },
    { x: 4400, y: gy(7),  type: 'question' },
  ],

  coins: Array.from({length: 25}, (_, i) => ({
    x: 200 + i * 200, y: gy(13)
  })),

  pigs: [
    { x: 450,  y: gy(0), type: 'normal', hp: 1 },
    { x: 780,  y: gy(0), type: 'helmet', hp: 2 },
    { x: 1150, y: gy(0), type: 'fat',    hp: 3 },
    { x: 1550, y: gy(0), type: 'helmet', hp: 2 },
    { x: 1900, y: gy(0), type: 'fat',    hp: 3 },
    { x: 2350, y: gy(0), type: 'fat',    hp: 3 },
    { x: 2700, y: gy(0), type: 'helmet', hp: 2 },
    { x: 3100, y: gy(0), type: 'fat',    hp: 3 },
    { x: 3450, y: gy(0), type: 'helmet', hp: 2 },
    { x: 3900, y: gy(0), type: 'fat',    hp: 3 },
  ],

  structures: [
    {
      x: 900, y: gy(0),
      blocks: [
        { dx: 0,      dy: 0,       type: 'stone', w: TILE,   h: TILE*4 },
        { dx: TILE*2, dy: -TILE,   type: 'stone', w: TILE,   h: TILE*5 },
        { dx: TILE*4, dy: 0,       type: 'stone', w: TILE,   h: TILE*4 },
        { dx: TILE,   dy: -TILE*2, type: 'wood',  w: TILE,   h: TILE*2 },
        { dx: TILE*3, dy: -TILE*2, type: 'wood',  w: TILE,   h: TILE*2 },
        { dx: 0,      dy: -TILE*4, type: 'stone', w: TILE*5, h: TILE*0.6 },
        { dx: TILE*1.2, dy: -TILE*4.6, type: 'wood', w: TILE*2.6, h: TILE },
      ],
      pigs: [
        { x: 0,      y: -TILE*4.8, type: 'helmet', hp: 2 },
        { x: TILE*2, y: -TILE*5.8, type: 'fat',    hp: 3 },
        { x: TILE*4, y: -TILE*4.8, type: 'helmet', hp: 2 },
      ]
    },
    {
      x: 2500, y: gy(0),
      blocks: [
        { dx: 0,      dy: 0,       type: 'stone', w: TILE,   h: TILE*6 },
        { dx: TILE*3, dy: 0,       type: 'stone', w: TILE,   h: TILE*6 },
        { dx: TILE,   dy: -TILE*2, type: 'wood',  w: TILE*2, h: TILE*2 },
        { dx: 0,      dy: -TILE*6, type: 'stone', w: TILE*4, h: TILE*0.6 },
        { dx: TILE*1, dy: -TILE*6.6, type: 'stone', w: TILE*2, h: TILE*1.5 },
      ],
      pigs: [
        { x: TILE*0.5, y: -TILE*6.8, type: 'fat',    hp: 3 },
        { x: TILE*2.5, y: -TILE*6.8, type: 'fat',    hp: 3 },
        { x: TILE*1.2, y: -TILE*8.4, type: 'helmet', hp: 2 },
      ]
    }
  ],

  slingshots: [{ x: 100, y: gy(0) }, { x: 1600, y: gy(0) }, { x: 3800, y: gy(0) }]
});

// ══════════════════════════════════════════════════════
// LEVEL 8 — "Pig Fortress" (Hard)
// ══════════════════════════════════════════════════════
const level8 = makeLevel({
  name: 'Pig Fortress', world: 4, sublevel: 1,
  theme: 'castle', difficulty: 'hard',
  width: 6000, timeLimit: 260,
  bgColor: '#4a3060',
  flagX: 5800,

  platforms: [
    { x: 350,  y: gy(4), w: 96,  h: TILE, type: 'stone' },
    { x: 700,  y: gy(6), w: 144, h: TILE, type: 'stone' },
    { x: 1100, y: gy(4), w: 96,  h: TILE, type: 'stone' },
    { x: 1500, y: gy(7), w: 192, h: TILE, type: 'stone' },
    { x: 1950, y: gy(5), w: 144, h: TILE, type: 'stone' },
    { x: 2400, y: gy(4), w: 96,  h: TILE, type: 'stone' },
    { x: 2800, y: gy(6), w: 192, h: TILE, type: 'stone' },
    { x: 3300, y: gy(4), w: 144, h: TILE, type: 'stone' },
    { x: 3750, y: gy(7), w: 96,  h: TILE, type: 'stone' },
    { x: 4150, y: gy(5), w: 192, h: TILE, type: 'stone' },
    { x: 4650, y: gy(4), w: 144, h: TILE, type: 'stone' },
    { x: 5100, y: gy(6), w: 192, h: TILE, type: 'stone' },
  ],

  blocks: [
    { x: 450,  y: gy(7),  type: 'brick' },
    { x: 800,  y: gy(9),  type: 'question' },
    { x: 1200, y: gy(7),  type: 'brick' },
    { x: 1600, y: gy(10), type: 'question' },
    { x: 2050, y: gy(8),  type: 'brick' },
    { x: 2500, y: gy(7),  type: 'question' },
    { x: 2900, y: gy(9),  type: 'brick' },
    { x: 3400, y: gy(7),  type: 'question' },
    { x: 3850, y: gy(10), type: 'brick' },
    { x: 4250, y: gy(8),  type: 'question' },
    { x: 4750, y: gy(7),  type: 'brick' },
    { x: 5200, y: gy(9),  type: 'question' },
  ],

  coins: Array.from({length: 28}, (_, i) => ({
    x: 200 + i * 200, y: gy(13)
  })),

  pigs: [
    { x: 600,  y: gy(0), type: 'helmet', hp: 2 },
    { x: 1000, y: gy(0), type: 'fat',    hp: 3 },
    { x: 1400, y: gy(0), type: 'fat',    hp: 3 },
    { x: 1850, y: gy(0), type: 'helmet', hp: 2 },
    { x: 2300, y: gy(0), type: 'fat',    hp: 3 },
    { x: 2750, y: gy(0), type: 'fat',    hp: 3 },
    { x: 3250, y: gy(0), type: 'helmet', hp: 2 },
    { x: 3700, y: gy(0), type: 'fat',    hp: 3 },
    { x: 4100, y: gy(0), type: 'fat',    hp: 3 },
    { x: 4600, y: gy(0), type: 'helmet', hp: 2 },
    { x: 5050, y: gy(0), type: 'fat',    hp: 3 },
  ],

  structures: [
    {
      x: 800, y: gy(0),
      blocks: [
        { dx: 0,      dy: 0,       type: 'stone', w: TILE*2, h: TILE*5 },
        { dx: TILE*3, dy: 0,       type: 'stone', w: TILE*2, h: TILE*5 },
        { dx: TILE,   dy: -TILE*3, type: 'wood',  w: TILE*3, h: TILE*2 },
        { dx: 0,      dy: -TILE*5, type: 'stone', w: TILE*5, h: TILE*0.7 },
        { dx: TILE,   dy: -TILE*5.7, type: 'wood',  w: TILE*3, h: TILE*1.5 },
        { dx: TILE*1.5, dy:-TILE*7.2, type:'stone', w:TILE*2, h:TILE*1.5 },
      ],
      pigs: [
        { x: 0,      y: -TILE*5.5, type: 'fat',    hp: 3 },
        { x: TILE*3, y: -TILE*5.5, type: 'fat',    hp: 3 },
        { x: TILE*1.5,y:-TILE*8.8, type: 'helmet', hp: 2 },
      ]
    },
    {
      x: 2700, y: gy(0),
      blocks: [
        { dx: 0,       dy: 0,      type: 'stone', w: TILE,   h: TILE*7 },
        { dx: TILE*2,  dy: 0,      type: 'stone', w: TILE,   h: TILE*7 },
        { dx: TILE*4,  dy: 0,      type: 'stone', w: TILE,   h: TILE*7 },
        { dx: TILE*6,  dy: 0,      type: 'stone', w: TILE,   h: TILE*7 },
        { dx: TILE,    dy:-TILE*4, type: 'wood',  w: TILE,   h: TILE*3 },
        { dx: TILE*3,  dy:-TILE*4, type: 'wood',  w: TILE,   h: TILE*3 },
        { dx: TILE*5,  dy:-TILE*4, type: 'wood',  w: TILE,   h: TILE*3 },
        { dx: 0,       dy:-TILE*7, type: 'stone', w: TILE*7, h: TILE*0.7 },
        { dx: TILE*1,  dy:-TILE*7.7, type:'stone', w:TILE*5, h:TILE*2 },
      ],
      pigs: [
        { x: 0,      y:-TILE*7.5, type: 'fat',    hp: 3 },
        { x: TILE*2, y:-TILE*7.5, type: 'helmet', hp: 2 },
        { x: TILE*4, y:-TILE*7.5, type: 'fat',    hp: 3 },
        { x: TILE*6, y:-TILE*7.5, type: 'fat',    hp: 3 },
        { x: TILE*2.5,y:-TILE*9.8,type: 'king',   hp: 5 },
      ]
    }
  ],

  slingshots: [{ x: 100, y: gy(0) }, { x: 1400, y: gy(0) }, { x: 3500, y: gy(0) }, { x: 5000, y: gy(0) }]
});

// ══════════════════════════════════════════════════════
// LEVEL 9 — "Dark Castle" (Hard)
// ══════════════════════════════════════════════════════
const level9 = makeLevel({
  name: 'Dark Castle', world: 4, sublevel: 2,
  theme: 'castle', difficulty: 'hard',
  width: 6400, timeLimit: 240,
  bgColor: '#1a0a30',
  flagX: 6200,

  platforms: [
    { x: 300,  y: gy(5), w: 96,  h: TILE, type: 'stone' },
    { x: 650,  y: gy(7), w: 144, h: TILE, type: 'stone' },
    { x: 1050, y: gy(4), w: 96,  h: TILE, type: 'stone' },
    { x: 1450, y: gy(8), w: 192, h: TILE, type: 'stone' },
    { x: 1900, y: gy(5), w: 96,  h: TILE, type: 'stone' },
    { x: 2300, y: gy(3), w: 144, h: TILE, type: 'stone' },
    { x: 2750, y: gy(7), w: 192, h: TILE, type: 'stone' },
    { x: 3250, y: gy(5), w: 144, h: TILE, type: 'stone' },
    { x: 3700, y: gy(4), w: 96,  h: TILE, type: 'stone' },
    { x: 4100, y: gy(7), w: 192, h: TILE, type: 'stone' },
    { x: 4600, y: gy(5), w: 144, h: TILE, type: 'stone' },
    { x: 5050, y: gy(4), w: 96,  h: TILE, type: 'stone' },
    { x: 5450, y: gy(6), w: 192, h: TILE, type: 'stone' },
    { x: 5900, y: gy(4), w: 144, h: TILE, type: 'stone' },
  ],

  blocks: Array.from({length: 14}, (_, i) => ({
    x: 300 + i * 420, y: gy(10),
    type: i % 3 === 0 ? 'question' : 'brick'
  })),

  coins: Array.from({length: 30}, (_, i) => ({
    x: 200 + i * 195, y: gy(14)
  })),

  pigs: [
    { x: 550,  y: gy(0), type: 'fat',    hp: 3 },
    { x: 950,  y: gy(0), type: 'fat',    hp: 3 },
    { x: 1350, y: gy(0), type: 'king',   hp: 5 },
    { x: 1800, y: gy(0), type: 'fat',    hp: 3 },
    { x: 2250, y: gy(0), type: 'helmet', hp: 2 },
    { x: 2650, y: gy(0), type: 'fat',    hp: 3 },
    { x: 3150, y: gy(0), type: 'king',   hp: 5 },
    { x: 3650, y: gy(0), type: 'fat',    hp: 3 },
    { x: 4050, y: gy(0), type: 'fat',    hp: 3 },
    { x: 4550, y: gy(0), type: 'king',   hp: 5 },
    { x: 5000, y: gy(0), type: 'fat',    hp: 3 },
    { x: 5400, y: gy(0), type: 'helmet', hp: 2 },
  ],

  structures: [
    {
      x: 700, y: gy(0),
      blocks: [
        { dx: 0,      dy: 0,      type: 'stone', w: TILE*2, h: TILE*6 },
        { dx: TILE*3, dy: 0,      type: 'stone', w: TILE*2, h: TILE*6 },
        { dx: TILE*6, dy: 0,      type: 'stone', w: TILE*2, h: TILE*6 },
        { dx: TILE*2, dy:-TILE*4, type: 'wood',  w: TILE,   h: TILE*2 },
        { dx: TILE*5, dy:-TILE*4, type: 'wood',  w: TILE,   h: TILE*2 },
        { dx: 0,      dy:-TILE*6, type: 'stone', w: TILE*8, h: TILE*0.7 },
        { dx: TILE*2, dy:-TILE*6.7, type:'stone', w:TILE*4, h:TILE*3 },
      ],
      pigs: [
        { x: 0,      y:-TILE*6.5, type:'fat',    hp:3 },
        { x: TILE*6, y:-TILE*6.5, type:'fat',    hp:3 },
        { x: TILE*3, y:-TILE*9.8, type:'king',   hp:5 },
      ]
    },
    {
      x: 3000, y: gy(0),
      blocks: Array.from({length: 12}, (_, i) => ({
        dx: (i % 4) * TILE * 2,
        dy: -Math.floor(i / 4) * TILE * 2.5,
        type: i % 2 === 0 ? 'stone' : 'wood',
        w: TILE * 1.5, h: TILE * 2.5
      })),
      pigs: [
        { x: 0,      y:-TILE*9,  type:'king',   hp:5 },
        { x: TILE*2, y:-TILE*6,  type:'fat',    hp:3 },
        { x: TILE*4, y:-TILE*9,  type:'king',   hp:5 },
        { x: TILE*6, y:-TILE*6,  type:'fat',    hp:3 },
        { x: TILE*3, y:-TILE*12, type:'king',   hp:5 },
      ]
    },
    {
      x: 4800, y: gy(0),
      blocks: [
        { dx: 0,      dy:0,       type:'stone', w:TILE*3, h:TILE*8 },
        { dx: TILE*4, dy:0,       type:'stone', w:TILE*3, h:TILE*8 },
        { dx: TILE*1, dy:-TILE*5, type:'wood',  w:TILE*5, h:TILE*3 },
        { dx: 0,      dy:-TILE*8, type:'stone', w:TILE*7, h:TILE*0.8 },
        { dx: TILE*2, dy:-TILE*8.8, type:'stone', w:TILE*3, h:TILE*2 },
      ],
      pigs: [
        { x: 0,      y:-TILE*8.5, type:'fat',   hp:3 },
        { x: TILE*4, y:-TILE*8.5, type:'fat',   hp:3 },
        { x: TILE*2.5,y:-TILE*10.8,type:'king', hp:5 },
      ]
    }
  ],

  slingshots: [
    { x: 100, y: gy(0) }, { x: 1200, y: gy(0) },
    { x: 2500, y: gy(0) }, { x: 4000, y: gy(0) }, { x: 5600, y: gy(0) }
  ]
});

// ══════════════════════════════════════════════════════
// LEVEL 10 — "King Pig's Lair" (BOSS)
// ══════════════════════════════════════════════════════
const level10 = makeLevel({
  name: "King Pig's Lair", world: 5, sublevel: 1,
  theme: 'castle', difficulty: 'boss',
  width: 7000, timeLimit: 220,
  bgColor: '#0a0018',
  flagX: 6800,

  platforms: [
    { x: 250,  y: gy(4), w: 144, h: TILE, type: 'stone' },
    { x: 600,  y: gy(7), w: 96,  h: TILE, type: 'stone' },
    { x: 950,  y: gy(5), w: 192, h: TILE, type: 'stone' },
    { x: 1400, y: gy(3), w: 96,  h: TILE, type: 'stone' },
    { x: 1800, y: gy(7), w: 192, h: TILE, type: 'stone' },
    { x: 2300, y: gy(4), w: 144, h: TILE, type: 'stone' },
    { x: 2800, y: gy(6), w: 96,  h: TILE, type: 'stone' },
    { x: 3200, y: gy(4), w: 192, h: TILE, type: 'stone' },
    { x: 3700, y: gy(7), w: 144, h: TILE, type: 'stone' },
    { x: 4200, y: gy(5), w: 192, h: TILE, type: 'stone' },
    { x: 4750, y: gy(4), w: 144, h: TILE, type: 'stone' },
    { x: 5300, y: gy(7), w: 96,  h: TILE, type: 'stone' },
    { x: 5700, y: gy(5), w: 192, h: TILE, type: 'stone' },
    { x: 6200, y: gy(4), w: 192, h: TILE, type: 'stone' },
  ],

  blocks: Array.from({length: 16}, (_, i) => ({
    x: 250 + i * 400, y: gy(10),
    type: i % 3 === 1 ? 'question' : 'brick'
  })),

  coins: Array.from({length: 35}, (_, i) => ({
    x: 200 + i * 185, y: gy(14)
  })),

  pigs: [
    { x: 500,  y: gy(0), type: 'fat',    hp: 3 },
    { x: 850,  y: gy(0), type: 'king',   hp: 5 },
    { x: 1300, y: gy(0), type: 'fat',    hp: 3 },
    { x: 1750, y: gy(0), type: 'king',   hp: 5 },
    { x: 2200, y: gy(0), type: 'fat',    hp: 3 },
    { x: 2700, y: gy(0), type: 'king',   hp: 5 },
    { x: 3150, y: gy(0), type: 'fat',    hp: 3 },
    { x: 3650, y: gy(0), type: 'king',   hp: 5 },
    { x: 4150, y: gy(0), type: 'fat',    hp: 3 },
    { x: 4700, y: gy(0), type: 'king',   hp: 5 },
    { x: 5250, y: gy(0), type: 'fat',    hp: 3 },
    { x: 5650, y: gy(0), type: 'fat',    hp: 3 },
    // FINAL BOSS
    { x: 6300, y: gy(0), type: 'king',   hp: 10, isBoss: true },
  ],

  structures: [
    // Entry gates
    {
      x: 600, y: gy(0),
      blocks: [
        { dx: 0,      dy:0,       type:'stone', w:TILE*2, h:TILE*5 },
        { dx: TILE*3, dy:0,       type:'stone', w:TILE*2, h:TILE*5 },
        { dx: 0,      dy:-TILE*5, type:'stone', w:TILE*5, h:TILE },
      ],
      pigs: [
        { x: TILE*0.5, y:-TILE*5.5, type:'fat',  hp:3 },
        { x: TILE*3,   y:-TILE*5.5, type:'king', hp:5 },
      ]
    },
    // Mid fortress
    {
      x: 2000, y: gy(0),
      blocks: Array.from({length: 16}, (_, i) => ({
        dx: (i % 4) * TILE * 2,
        dy: -Math.floor(i / 4) * TILE * 2,
        type: i % 3 === 0 ? 'stone' : 'wood',
        w: TILE * 1.8, h: TILE * 2
      })),
      pigs: [
        { x: 0,      y:-TILE*9,   type:'king', hp:5 },
        { x: TILE*2, y:-TILE*6,   type:'fat',  hp:3 },
        { x: TILE*4, y:-TILE*9,   type:'king', hp:5 },
        { x: TILE*6, y:-TILE*6,   type:'fat',  hp:3 },
        { x: TILE*3, y:-TILE*12,  type:'king', hp:5 },
      ]
    },
    // Pre-boss arena
    {
      x: 4200, y: gy(0),
      blocks: [
        { dx: 0,      dy:0,        type:'stone', w:TILE*3, h:TILE*9 },
        { dx: TILE*5, dy:0,        type:'stone', w:TILE*3, h:TILE*9 },
        { dx: TILE*2, dy:-TILE*6,  type:'wood',  w:TILE*4, h:TILE*3 },
        { dx: 0,      dy:-TILE*9,  type:'stone', w:TILE*8, h:TILE },
        { dx: TILE*2, dy:-TILE*10, type:'stone', w:TILE*4, h:TILE*2 },
        { dx: TILE*3, dy:-TILE*12, type:'stone', w:TILE*2, h:TILE*3 },
      ],
      pigs: [
        { x: 0,      y:-TILE*9.5,  type:'fat',  hp:3 },
        { x: TILE*5, y:-TILE*9.5,  type:'fat',  hp:3 },
        { x: TILE*3, y:-TILE*11.5, type:'king', hp:5 },
        { x: TILE*3.5,y:-TILE*14.5,type:'king', hp:5 },
      ]
    },
    // BOSS THRONE
    {
      x: 5800, y: gy(0),
      blocks: [
        { dx: 0,      dy:0,        type:'stone', w:TILE*4, h:TILE*10 },
        { dx: TILE*7, dy:0,        type:'stone', w:TILE*4, h:TILE*10 },
        { dx: TILE*3, dy:-TILE*7,  type:'wood',  w:TILE*5, h:TILE*3 },
        { dx: 0,      dy:-TILE*10, type:'stone', w:TILE*11, h:TILE },
        { dx: TILE*2, dy:-TILE*11, type:'stone', w:TILE*7, h:TILE*2 },
        { dx: TILE*4, dy:-TILE*13, type:'stone', w:TILE*3, h:TILE*3 },
        { dx: TILE*4.5,dy:-TILE*16,type:'stone', w:TILE*2, h:TILE*2 },
      ],
      pigs: [
        { x: 0,       y:-TILE*10.5, type:'fat',  hp:3 },
        { x: TILE*7,  y:-TILE*10.5, type:'fat',  hp:3 },
        { x: TILE*3,  y:-TILE*12.5, type:'king', hp:5 },
        { x: TILE*7,  y:-TILE*12.5, type:'king', hp:5 },
        { x: TILE*4.5,y:-TILE*14.5, type:'king', hp:5 },
        // THE FINAL KING PIG
        { x: TILE*4.8,y:-TILE*17.5, type:'king', hp:10, isBoss:true },
      ]
    }
  ],

  slingshots: [
    { x: 80,   y: gy(0) }, { x: 900,  y: gy(0) },
    { x: 1800, y: gy(0) }, { x: 3000, y: gy(0) },
    { x: 4500, y: gy(0) }, { x: 5500, y: gy(0) }
  ]
});

// ── EXPORT LEVELS ARRAY ────────────────────────────────
const LEVELS = [level1, level2, level3, level4, level5,
                level6, level7, level8, level9, level10];

const LEVEL_META = [
  { name:'Green Hills',     diff:'easy',   emoji:'🌿' },
  { name:'Pig Valley',      diff:'easy',   emoji:'🐷' },
  { name:'Mushroom Plateau',diff:'easy',   emoji:'🍄' },
  { name:'Desert Dunes',    diff:'medium', emoji:'🏜️' },
  { name:'Icy Caverns',     diff:'medium', emoji:'❄️' },
  { name:'Lava Bridges',    diff:'medium', emoji:'🌋' },
  { name:'Sky Kingdom',     diff:'hard',   emoji:'☁️' },
  { name:'Pig Fortress',    diff:'hard',   emoji:'🏰' },
  { name:'Dark Castle',     diff:'hard',   emoji:'🌑' },
  { name:"King Pig's Lair", diff:'boss',   emoji:'👑' },
];
