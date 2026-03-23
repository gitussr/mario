/* ═══════════════════════════════════════════════
   LEVELS — 10 brutal levels
   Rules:
   • Long maps (5000–9000px)
   • Coins placed ABOVE platforms — must jump to collect
   • Tight time limits — must run + jump efficiently
   • Pig gauntlets blocking paths
   • Gaps between platforms — fall = die
   • Coin quota required to unlock flag (enforced in game.js)
═══════════════════════════════════════════════ */

const TILE = 48;
const GH   = 80;

const GY_TAG = '__GY__';
function gy(n) { return { [GY_TAG]: true, n }; }
const gx = n => n * TILE;
function resolveY(val, groundY) {
  return (val && val[GY_TAG]) ? groundY - val.n * TILE : val;
}

function makeLevel(cfg) {
  return {
    name:        cfg.name        || 'Level',
    world:       cfg.world       || 1,
    sublevel:    cfg.sublevel    || 1,
    theme:       cfg.theme       || 'grass',
    width:       cfg.width       || 6000,
    timeLimit:   cfg.timeLimit   || 300,
    coinQuota:   cfg.coinQuota   || 10,  // coins needed before flag unlocks
    platforms:   cfg.platforms   || [],
    pigs:        cfg.pigs        || [],
    blocks:      cfg.blocks      || [],
    coins:       cfg.coins       || [],
    structures:  cfg.structures  || [],
    slingshots:  cfg.slingshots  || [],
    flagX:       cfg.flagX       || cfg.width - 200,
    startX:      cfg.startX      || 80,
    gravity:     cfg.gravity     || 2200,
    difficulty:  cfg.difficulty  || 'easy',
  };
}

// ── coin row helper ─────────────────────────────────────
// drops N coins in a horizontal row at tile height h, starting x
function coinRow(startX, n, h, gap=48) {
  return Array.from({length:n}, (_,i) => ({ x: startX+i*gap, y: gy(h) }));
}
// coin arc above a platform — must jump to collect
function coinArc(cx, n, baseH, peakExtra=2) {
  const out=[];
  for (let i=0;i<n;i++) {
    const t=i/(n-1);
    const h=baseH + Math.round(peakExtra*Math.sin(t*Math.PI));
    out.push({ x: cx - (n/2)*36 + i*36, y: gy(h) });
  }
  return out;
}

// ══════════════════════════════════════════════
// LEVEL 1 — "World 1-1  Green Hills"
// Tutorial-hard: gaps appear, pigs guard coins
// Time: 260s  Quota: 15 coins
// ══════════════════════════════════════════════
const level1 = makeLevel({
  name:'Green Hills', world:1, sublevel:1,
  theme:'grass', difficulty:'easy',
  width:5400, timeLimit:260, coinQuota:15,
  flagX:5200,

  platforms:[
    { x:320,  y:gy(3), w:144, h:TILE, type:'grass' },
    { x:560,  y:gy(5), w:96,  h:TILE, type:'grass' },
    { x:720,  y:gy(3), w:96,  h:TILE, type:'grass' },
    { x:960,  y:gy(5), w:144, h:TILE, type:'grass' },
    { x:1200, y:gy(4), w:96,  h:TILE, type:'grass' },
    { x:1450, y:gy(6), w:96,  h:TILE, type:'cloud' },
    { x:1650, y:gy(4), w:144, h:TILE, type:'grass' },
    { x:1900, y:gy(3), w:96,  h:TILE, type:'grass' },
    { x:2150, y:gy(5), w:144, h:TILE, type:'grass' },
    { x:2450, y:gy(4), w:96,  h:TILE, type:'grass' },
    { x:2700, y:gy(6), w:96,  h:TILE, type:'cloud' },
    { x:2900, y:gy(3), w:144, h:TILE, type:'grass' },
    { x:3200, y:gy(5), w:96,  h:TILE, type:'grass' },
    { x:3450, y:gy(4), w:144, h:TILE, type:'grass' },
    { x:3700, y:gy(6), w:96,  h:TILE, type:'cloud' },
    { x:3900, y:gy(3), w:96,  h:TILE, type:'grass' },
    { x:4150, y:gy(5), w:144, h:TILE, type:'grass' },
    { x:4450, y:gy(4), w:96,  h:TILE, type:'grass' },
    { x:4700, y:gy(3), w:144, h:TILE, type:'grass' },
  ],

  blocks:[
    { x:380,  y:gy(6), type:'question' },
    { x:620,  y:gy(8), type:'question' },
    { x:760,  y:gy(6), type:'brick' },
    { x:808,  y:gy(6), type:'question' },
    { x:856,  y:gy(6), type:'brick' },
    { x:1020, y:gy(8), type:'question' },
    { x:1260, y:gy(7), type:'brick' },
    { x:1700, y:gy(7), type:'question' },
    { x:1960, y:gy(6), type:'brick' },
    { x:2210, y:gy(8), type:'question' },
    { x:2510, y:gy(7), type:'brick' },
    { x:2960, y:gy(6), type:'question' },
    { x:3260, y:gy(8), type:'brick' },
    { x:3510, y:gy(7), type:'question' },
    { x:3960, y:gy(6), type:'brick' },
    { x:4210, y:gy(8), type:'question' },
    { x:4510, y:gy(7), type:'brick' },
  ],

  coins:[
    // Coins above platforms — must jump for each
    ...coinArc(390, 5, 8, 2),
    ...coinArc(760, 5, 8, 2),
    ...coinArc(1210, 5, 7, 2),
    ...coinArc(1670, 5, 7, 2),
    ...coinArc(2180, 5, 8, 2),
    ...coinArc(2720, 5, 9, 3),
    ...coinArc(2940, 5, 6, 2),
    ...coinArc(3480, 5, 7, 2),
    ...coinArc(4160, 5, 8, 2),
    ...coinArc(4720, 5, 6, 2),
  ],

  pigs:[
    { x:500,  y:gy(0), type:'normal', hp:1 },
    { x:800,  y:gy(0), type:'normal', hp:1 },
    { x:1150, y:gy(0), type:'normal', hp:1 },
    { x:1550, y:gy(0), type:'helmet', hp:2 },
    { x:1850, y:gy(0), type:'normal', hp:1 },
    { x:2100, y:gy(0), type:'helmet', hp:2 },
    { x:2400, y:gy(0), type:'normal', hp:1 },
    { x:2650, y:gy(0), type:'normal', hp:1 },
    { x:3100, y:gy(0), type:'helmet', hp:2 },
    { x:3400, y:gy(0), type:'normal', hp:1 },
    { x:3650, y:gy(0), type:'helmet', hp:2 },
    { x:4050, y:gy(0), type:'normal', hp:1 },
    { x:4400, y:gy(0), type:'helmet', hp:2 },
    { x:4660, y:gy(0), type:'normal', hp:1 },
  ],

  structures:[
    { x:1300, y:gy(0), blocks:[
      {dx:0,dy:0,type:'wood',w:TILE,h:TILE*2},{dx:TILE,dy:0,type:'wood',w:TILE,h:TILE*2},
      {dx:0,dy:-TILE*2,type:'wood',w:TILE*2,h:TILE*0.5}],
      pigs:[{x:TILE*0.3,y:-TILE*2.4,type:'normal',hp:1}]
    },
    { x:3000, y:gy(0), blocks:[
      {dx:0,dy:0,type:'stone',w:TILE,h:TILE*3},{dx:TILE*2,dy:0,type:'stone',w:TILE,h:TILE*3},
      {dx:0,dy:-TILE*3,type:'stone',w:TILE*3,h:TILE*0.6}],
      pigs:[{x:TILE*0.8,y:-TILE*3.5,type:'helmet',hp:2}]
    },
  ],
  slingshots:[{x:140,y:gy(0)},{x:1050,y:gy(0)},{x:2600,y:gy(0)},{x:4000,y:gy(0)}]
});

// ══════════════════════════════════════════════
// LEVEL 2 — "Narrow Cliffs"
// Thin platforms, more pigs, longer gaps
// Time: 240s  Quota: 20 coins
// ══════════════════════════════════════════════
const level2 = makeLevel({
  name:'Narrow Cliffs', world:1, sublevel:2,
  theme:'grass', difficulty:'easy',
  width:5800, timeLimit:240, coinQuota:20,
  flagX:5600,

  platforms:[
    { x:280,  y:gy(4), w:96,  h:TILE, type:'grass' },
    { x:460,  y:gy(6), w:72,  h:TILE, type:'grass' },
    { x:640,  y:gy(4), w:72,  h:TILE, type:'grass' },
    { x:830,  y:gy(6), w:96,  h:TILE, type:'cloud' },
    { x:1050, y:gy(4), w:72,  h:TILE, type:'grass' },
    { x:1250, y:gy(7), w:72,  h:TILE, type:'cloud' },
    { x:1450, y:gy(4), w:96,  h:TILE, type:'grass' },
    { x:1700, y:gy(6), w:72,  h:TILE, type:'grass' },
    { x:1920, y:gy(4), w:96,  h:TILE, type:'grass' },
    { x:2180, y:gy(6), w:72,  h:TILE, type:'cloud' },
    { x:2400, y:gy(4), w:72,  h:TILE, type:'grass' },
    { x:2600, y:gy(7), w:72,  h:TILE, type:'cloud' },
    { x:2820, y:gy(4), w:96,  h:TILE, type:'grass' },
    { x:3050, y:gy(6), w:72,  h:TILE, type:'grass' },
    { x:3280, y:gy(4), w:96,  h:TILE, type:'grass' },
    { x:3530, y:gy(7), w:72,  h:TILE, type:'cloud' },
    { x:3760, y:gy(4), w:96,  h:TILE, type:'grass' },
    { x:4020, y:gy(6), w:72,  h:TILE, type:'grass' },
    { x:4240, y:gy(4), w:96,  h:TILE, type:'grass' },
    { x:4500, y:gy(7), w:72,  h:TILE, type:'cloud' },
    { x:4720, y:gy(4), w:96,  h:TILE, type:'grass' },
    { x:4980, y:gy(6), w:72,  h:TILE, type:'grass' },
    { x:5200, y:gy(4), w:144, h:TILE, type:'grass' },
  ],

  blocks:[
    { x:310,  y:gy(7),  type:'question' },
    { x:490,  y:gy(9),  type:'brick' },
    { x:670,  y:gy(7),  type:'question' },
    { x:870,  y:gy(9),  type:'question' },
    { x:1080, y:gy(7),  type:'brick' },
    { x:1480, y:gy(7),  type:'question' },
    { x:1730, y:gy(9),  type:'brick' },
    { x:1950, y:gy(7),  type:'question' },
    { x:2210, y:gy(9),  type:'question' },
    { x:2430, y:gy(7),  type:'brick' },
    { x:2850, y:gy(7),  type:'question' },
    { x:3080, y:gy(9),  type:'brick' },
    { x:3310, y:gy(7),  type:'question' },
    { x:3790, y:gy(7),  type:'question' },
    { x:4050, y:gy(9),  type:'brick' },
    { x:4270, y:gy(7),  type:'question' },
    { x:4750, y:gy(7),  type:'question' },
    { x:5230, y:gy(7),  type:'brick' },
  ],

  coins:[
    ...coinArc(310,  5, 9, 3),
    ...coinArc(670,  5, 9, 3),
    ...coinArc(1080, 5, 9, 3),
    ...coinArc(1480, 5, 9, 3),
    ...coinArc(1960, 5, 9, 3),
    ...coinArc(2440, 5, 9, 3),
    ...coinArc(2850, 5, 9, 3),
    ...coinArc(3310, 5, 9, 3),
    ...coinArc(3800, 5, 9, 3),
    ...coinArc(4280, 5, 9, 3),
    ...coinArc(4760, 5, 9, 3),
    ...coinArc(5240, 5, 9, 3),
  ],

  pigs:[
    { x:400,  y:gy(0), type:'normal', hp:1 },
    { x:580,  y:gy(0), type:'normal', hp:1 },
    { x:780,  y:gy(0), type:'helmet', hp:2 },
    { x:1000, y:gy(0), type:'normal', hp:1 },
    { x:1200, y:gy(0), type:'helmet', hp:2 },
    { x:1400, y:gy(0), type:'normal', hp:1 },
    { x:1650, y:gy(0), type:'helmet', hp:2 },
    { x:1870, y:gy(0), type:'fat',    hp:3 },
    { x:2130, y:gy(0), type:'normal', hp:1 },
    { x:2360, y:gy(0), type:'helmet', hp:2 },
    { x:2580, y:gy(0), type:'fat',    hp:3 },
    { x:2780, y:gy(0), type:'normal', hp:1 },
    { x:3000, y:gy(0), type:'helmet', hp:2 },
    { x:3230, y:gy(0), type:'fat',    hp:3 },
    { x:3480, y:gy(0), type:'normal', hp:1 },
    { x:3710, y:gy(0), type:'helmet', hp:2 },
    { x:3970, y:gy(0), type:'fat',    hp:3 },
    { x:4190, y:gy(0), type:'normal', hp:1 },
    { x:4450, y:gy(0), type:'helmet', hp:2 },
    { x:4670, y:gy(0), type:'fat',    hp:3 },
    { x:4930, y:gy(0), type:'helmet', hp:2 },
    { x:5150, y:gy(0), type:'fat',    hp:3 },
  ],

  structures:[
    {x:900, y:gy(0), blocks:[
      {dx:0,dy:0,type:'wood',w:TILE,h:TILE*3},{dx:TILE*2,dy:0,type:'wood',w:TILE,h:TILE*3},
      {dx:0,dy:-TILE*3,type:'wood',w:TILE*3,h:TILE*0.5}],
      pigs:[{x:TILE,y:-TILE*3.5,type:'normal',hp:1}]
    },
    {x:2200, y:gy(0), blocks:[
      {dx:0,dy:0,type:'stone',w:TILE,h:TILE*3},{dx:TILE*2,dy:0,type:'stone',w:TILE,h:TILE*3},
      {dx:0,dy:-TILE*3,type:'stone',w:TILE*3,h:TILE*0.6}],
      pigs:[{x:TILE,y:-TILE*3.5,type:'helmet',hp:2}]
    },
    {x:3600, y:gy(0), blocks:[
      {dx:0,dy:0,type:'stone',w:TILE*2,h:TILE*4},{dx:TILE*3,dy:0,type:'stone',w:TILE*2,h:TILE*4},
      {dx:0,dy:-TILE*4,type:'stone',w:TILE*5,h:TILE*0.6}],
      pigs:[{x:0,y:-TILE*4.5,type:'fat',hp:3},{x:TILE*3,y:-TILE*4.5,type:'fat',hp:3}]
    },
  ],
  slingshots:[{x:160,y:gy(0)},{x:1200,y:gy(0)},{x:2800,y:gy(0)},{x:4400,y:gy(0)}]
});

// ══════════════════════════════════════════════
// LEVEL 3 — "Underground Maze"
// Low ceilings, many pigs, coins require hitting blocks
// Time: 220s  Quota: 25 coins
// ══════════════════════════════════════════════
const level3 = makeLevel({
  name:'Underground Maze', world:1, sublevel:3,
  theme:'castle', difficulty:'easy',
  width:6200, timeLimit:220, coinQuota:25,
  flagX:6000,

  platforms:[
    { x:300,  y:gy(2), w:192, h:TILE, type:'stone' },
    { x:600,  y:gy(4), w:96,  h:TILE, type:'stone' },
    { x:800,  y:gy(2), w:192, h:TILE, type:'stone' },
    { x:1100, y:gy(5), w:96,  h:TILE, type:'stone' },
    { x:1300, y:gy(2), w:96,  h:TILE, type:'stone' },
    { x:1550, y:gy(4), w:144, h:TILE, type:'stone' },
    { x:1800, y:gy(2), w:192, h:TILE, type:'stone' },
    { x:2100, y:gy(5), w:96,  h:TILE, type:'stone' },
    { x:2350, y:gy(3), w:144, h:TILE, type:'stone' },
    { x:2600, y:gy(5), w:96,  h:TILE, type:'stone' },
    { x:2850, y:gy(2), w:192, h:TILE, type:'stone' },
    { x:3150, y:gy(4), w:96,  h:TILE, type:'stone' },
    { x:3400, y:gy(2), w:192, h:TILE, type:'stone' },
    { x:3700, y:gy(5), w:96,  h:TILE, type:'stone' },
    { x:3950, y:gy(3), w:144, h:TILE, type:'stone' },
    { x:4250, y:gy(5), w:96,  h:TILE, type:'stone' },
    { x:4500, y:gy(2), w:192, h:TILE, type:'stone' },
    { x:4800, y:gy(4), w:96,  h:TILE, type:'stone' },
    { x:5050, y:gy(2), w:192, h:TILE, type:'stone' },
    { x:5350, y:gy(4), w:144, h:TILE, type:'stone' },
    { x:5600, y:gy(2), w:192, h:TILE, type:'stone' },
  ],

  blocks:[
    ...Array.from({length:16},(_, i)=>({ x:350+i*380, y:gy(5+i%2), type:i%3===0?'question':'brick'})),
  ],

  coins:[
    ...coinArc(380,  5, 8, 3),
    ...coinArc(820,  5, 8, 3),
    ...coinArc(1330, 5, 8, 3),
    ...coinArc(1820, 5, 8, 3),
    ...coinArc(2380, 5, 8, 3),
    ...coinArc(2880, 5, 8, 3),
    ...coinArc(3430, 5, 8, 3),
    ...coinArc(3980, 5, 8, 3),
    ...coinArc(4530, 5, 8, 3),
    ...coinArc(5080, 5, 8, 3),
    ...coinArc(5640, 5, 8, 3),
  ],

  pigs:[
    ...Array.from({length:28},(_, i)=>({
      x: 420+i*200, y:gy(0),
      type: i%4===0?'fat':i%3===0?'helmet':'normal',
      hp: i%4===0?3:i%3===0?2:1
    }))
  ],

  structures:[
    {x:700,  y:gy(0), blocks:[{dx:0,dy:0,type:'stone',w:TILE,h:TILE*3},{dx:TILE*2,dy:0,type:'stone',w:TILE,h:TILE*3},{dx:0,dy:-TILE*3,type:'stone',w:TILE*3,h:TILE*0.5}],pigs:[{x:TILE,y:-TILE*3.5,type:'helmet',hp:2}]},
    {x:1900, y:gy(0), blocks:[{dx:0,dy:0,type:'stone',w:TILE*2,h:TILE*4},{dx:TILE*3,dy:0,type:'stone',w:TILE*2,h:TILE*4},{dx:0,dy:-TILE*4,type:'stone',w:TILE*5,h:TILE*0.6}],pigs:[{x:TILE,y:-TILE*4.5,type:'fat',hp:3},{x:TILE*3,y:-TILE*4.5,type:'fat',hp:3}]},
    {x:3300, y:gy(0), blocks:[{dx:0,dy:0,type:'stone',w:TILE,h:TILE*4},{dx:TILE*2,dy:0,type:'stone',w:TILE,h:TILE*4},{dx:0,dy:-TILE*4,type:'stone',w:TILE*3,h:TILE*0.6}],pigs:[{x:TILE,y:-TILE*4.5,type:'helmet',hp:2}]},
    {x:4600, y:gy(0), blocks:[{dx:0,dy:0,type:'stone',w:TILE*2,h:TILE*5},{dx:TILE*3,dy:0,type:'stone',w:TILE*2,h:TILE*5},{dx:0,dy:-TILE*5,type:'stone',w:TILE*5,h:TILE*0.6}],pigs:[{x:0,y:-TILE*5.5,type:'king',hp:5},{x:TILE*3,y:-TILE*5.5,type:'fat',hp:3}]},
  ],
  slingshots:[{x:140,y:gy(0)},{x:1100,y:gy(0)},{x:2500,y:gy(0)},{x:3900,y:gy(0)},{x:5200,y:gy(0)}]
});

// ══════════════════════════════════════════════
// LEVEL 4 — "Desert Storm"
// Fast pigs, floating coin islands, tight timer
// Time: 200s  Quota: 30 coins
// ══════════════════════════════════════════════
const level4 = makeLevel({
  name:'Desert Storm', world:2, sublevel:1,
  theme:'desert', difficulty:'medium',
  width:6600, timeLimit:200, coinQuota:30,
  flagX:6400,

  platforms:[
    { x:300,  y:gy(3), w:96,  h:TILE, type:'stone' },
    { x:500,  y:gy(5), w:72,  h:TILE, type:'stone' },
    { x:680,  y:gy(3), w:72,  h:TILE, type:'stone' },
    { x:860,  y:gy(6), w:72,  h:TILE, type:'stone' },
    { x:1060, y:gy(4), w:96,  h:TILE, type:'stone' },
    { x:1280, y:gy(6), w:72,  h:TILE, type:'stone' },
    { x:1480, y:gy(3), w:96,  h:TILE, type:'stone' },
    { x:1700, y:gy(5), w:72,  h:TILE, type:'stone' },
    { x:1900, y:gy(3), w:96,  h:TILE, type:'stone' },
    { x:2120, y:gy(6), w:72,  h:TILE, type:'stone' },
    { x:2340, y:gy(4), w:96,  h:TILE, type:'stone' },
    { x:2560, y:gy(6), w:72,  h:TILE, type:'stone' },
    { x:2780, y:gy(3), w:96,  h:TILE, type:'stone' },
    { x:3000, y:gy(5), w:72,  h:TILE, type:'stone' },
    { x:3220, y:gy(3), w:96,  h:TILE, type:'stone' },
    { x:3460, y:gy(6), w:72,  h:TILE, type:'stone' },
    { x:3680, y:gy(4), w:96,  h:TILE, type:'stone' },
    { x:3920, y:gy(6), w:72,  h:TILE, type:'stone' },
    { x:4140, y:gy(3), w:96,  h:TILE, type:'stone' },
    { x:4380, y:gy(5), w:72,  h:TILE, type:'stone' },
    { x:4600, y:gy(3), w:96,  h:TILE, type:'stone' },
    { x:4840, y:gy(6), w:72,  h:TILE, type:'stone' },
    { x:5060, y:gy(4), w:96,  h:TILE, type:'stone' },
    { x:5300, y:gy(6), w:72,  h:TILE, type:'stone' },
    { x:5520, y:gy(3), w:96,  h:TILE, type:'stone' },
    { x:5760, y:gy(5), w:72,  h:TILE, type:'stone' },
    { x:5980, y:gy(3), w:144, h:TILE, type:'stone' },
  ],

  blocks: Array.from({length:20},(_, i)=>({ x:330+i*320, y:gy(7+i%2), type:i%3===0?'question':'brick' })),

  coins:[
    ...coinArc(330,  5, 9, 3),
    ...coinArc(700,  5, 9, 3),
    ...coinArc(1080, 5, 9, 3),
    ...coinArc(1500, 5, 9, 3),
    ...coinArc(1920, 5, 9, 3),
    ...coinArc(2360, 5, 9, 3),
    ...coinArc(2800, 5, 9, 3),
    ...coinArc(3240, 5, 9, 3),
    ...coinArc(3700, 5, 9, 3),
    ...coinArc(4160, 5, 9, 3),
    ...coinArc(4620, 5, 9, 3),
    ...coinArc(5080, 5, 9, 3),
    ...coinArc(5540, 5, 9, 3),
    ...coinArc(6000, 5, 9, 3),
  ],

  pigs: Array.from({length:32},(_, i)=>({
    x:400+i*195, y:gy(0),
    type: i%5===0?'fat':i%3===0?'helmet':'normal',
    hp: i%5===0?3:i%3===0?2:1
  })),

  structures:[
    {x:850,  y:gy(0), blocks:[{dx:0,dy:0,type:'wood',w:TILE,h:TILE*3},{dx:TILE*2,dy:0,type:'wood',w:TILE,h:TILE*3},{dx:0,dy:-TILE*3,type:'wood',w:TILE*3,h:TILE*0.5}],pigs:[{x:TILE,y:-TILE*3.5,type:'helmet',hp:2}]},
    {x:2000, y:gy(0), blocks:[{dx:0,dy:0,type:'stone',w:TILE*2,h:TILE*4},{dx:TILE*3,dy:0,type:'stone',w:TILE*2,h:TILE*4},{dx:0,dy:-TILE*4,type:'stone',w:TILE*5,h:TILE*0.6}],pigs:[{x:TILE,y:-TILE*4.5,type:'fat',hp:3},{x:TILE*3,y:-TILE*4.5,type:'helmet',hp:2}]},
    {x:3300, y:gy(0), blocks:[{dx:0,dy:0,type:'stone',w:TILE,h:TILE*4},{dx:TILE*2,dy:0,type:'stone',w:TILE,h:TILE*4},{dx:TILE*4,dy:0,type:'stone',w:TILE,h:TILE*4},{dx:0,dy:-TILE*4,type:'stone',w:TILE*5,h:TILE*0.6}],pigs:[{x:0,y:-TILE*4.5,type:'fat',hp:3},{x:TILE*4,y:-TILE*4.5,type:'fat',hp:3}]},
    {x:4700, y:gy(0), blocks:[{dx:0,dy:0,type:'stone',w:TILE*2,h:TILE*5},{dx:TILE*3,dy:0,type:'stone',w:TILE*2,h:TILE*5},{dx:0,dy:-TILE*5,type:'stone',w:TILE*5,h:TILE*0.6},{dx:TILE,dy:-TILE*5.6,type:'wood',w:TILE*3,h:TILE}],pigs:[{x:0,y:-TILE*5.5,type:'king',hp:5},{x:TILE*3,y:-TILE*5.5,type:'fat',hp:3},{x:TILE*1.5,y:-TILE*7,type:'king',hp:5}]},
  ],
  slingshots:[{x:160,y:gy(0)},{x:1200,y:gy(0)},{x:2600,y:gy(0)},{x:4000,y:gy(0)},{x:5400,y:gy(0)}]
});

// ══════════════════════════════════════════════
// LEVELS 5-10: progressively harder
// Short-form definitions — same pattern, scaling difficulty
// ══════════════════════════════════════════════

function hardLevel(n, cfg) {
  const pigCount = 20 + n*6;
  const coinCount = 25 + n*5;
  const w = 6000 + n*400;
  return makeLevel({
    name: cfg.name, world: cfg.world||3, sublevel: cfg.sublevel||1,
    theme: cfg.theme||'grass', difficulty: cfg.diff||'hard',
    width: w, timeLimit: 190 - n*5, coinQuota: 30+n*8,
    flagX: w-200,

    platforms: cfg.platforms,
    blocks:    cfg.blocks,
    coins:     cfg.coins,
    pigs:      cfg.pigs,
    structures: cfg.structures||[],
    slingshots: cfg.slingshots||[{x:140,y:gy(0)},{x:Math.floor(w*0.3),y:gy(0)},{x:Math.floor(w*0.6),y:gy(0)},{x:Math.floor(w*0.85),y:gy(0)}],
  });
}

// ── LEVELS 5–10 shared builder ─────────────────────────
function buildAutoLevel(idx) {
  const themes  = ['snow','lava','sky','castle','castle','castle'];
  const names   = ['Icy Peaks','Lava Gorge','Cloud Kingdom','Pig Fortress','Dark Keep',"King Pig's Lair"];
  const worlds  = [2,3,3,4,4,5];
  const theme   = themes[idx];
  const w       = 7000 + idx*500;
  const tl      = 185 - idx*8;
  const quota   = 35 + idx*8;

  // Alternating platform heights
  const plats = [];
  for (let i=0; i<30+idx*3; i++) {
    const h = 3 + (i%4);
    plats.push({ x: 300+i*220, y:gy(h), w: 60+Math.floor(i%3)*24, h:TILE, type:theme==='sky'?'cloud':'stone' });
  }

  // Blocks row
  const blks = Array.from({length:20+idx*2},(_,i)=>({
    x: 280+i*330, y:gy(6+i%2), type:i%3===0?'question':'brick'
  }));

  // Coins above platforms
  const coins2 = [];
  for (let i=0;i<plats.length;i+=2) {
    coins2.push(...coinArc(plats[i].x+plats[i].w/2, 5, 8+i%3, 3));
  }

  // Pigs — dense
  const pigTypes = ['normal','normal','helmet','helmet','fat','fat','king'];
  const pigs2 = Array.from({length:30+idx*5},(_,i)=>({
    x: 380+i*190, y:gy(0),
    type: pigTypes[i%pigTypes.length],
    hp: [1,1,2,2,3,3,5][i%7],
    isBoss: idx===5 && i===30+idx*5-1
  }));

  // Structure gauntlets every ~800px
  const structs = [];
  for (let i=0; i<5+idx; i++) {
    const sx = 600 + i*1100;
    const layers = 2+idx;
    const blocks2 = [];
    for (let c=0;c<=layers;c++) {
      blocks2.push({dx:c*TILE*2,dy:0,type:c%2===0?'stone':'wood',w:TILE,h:TILE*(3+idx)});
    }
    blocks2.push({dx:0,dy:-TILE*(3+idx),type:'stone',w:TILE*(layers*2+3),h:TILE*0.6});
    const spigs=[];
    for (let c=0;c<=layers;c+=2) spigs.push({x:c*TILE*2,y:-TILE*(3+idx+0.5),type:c%3===0?'king':c%2===0?'fat':'helmet',hp:c%3===0?5:c%2===0?3:2,isBoss:idx===5&&c===layers});
    structs.push({x:sx,y:gy(0),blocks:blocks2,pigs:spigs});
  }

  return makeLevel({
    name: names[idx], world: worlds[idx], sublevel: idx%2+1,
    theme, difficulty: idx<2?'hard':'boss',
    width: w, timeLimit: tl, coinQuota: quota,
    flagX: w-200,
    platforms: plats,
    blocks: blks,
    coins: coins2,
    pigs: pigs2,
    structures: structs,
    slingshots: [{x:140,y:gy(0)},{x:Math.floor(w*0.25),y:gy(0)},{x:Math.floor(w*0.5),y:gy(0)},{x:Math.floor(w*0.75),y:gy(0)},{x:Math.floor(w*0.9),y:gy(0)}],
  });
}

const level5  = buildAutoLevel(0);
const level6  = buildAutoLevel(1);
const level7  = buildAutoLevel(2);
const level8  = buildAutoLevel(3);
const level9  = buildAutoLevel(4);
const level10 = buildAutoLevel(5);

const LEVELS = [level1,level2,level3,level4,level5,level6,level7,level8,level9,level10];

const LEVEL_META = [
  { name:'Green Hills',       diff:'easy',   emoji:'🌿' },
  { name:'Narrow Cliffs',     diff:'easy',   emoji:'🪨' },
  { name:'Underground Maze',  diff:'easy',   emoji:'🕳️' },
  { name:'Desert Storm',      diff:'medium', emoji:'🏜️' },
  { name:'Icy Peaks',         diff:'medium', emoji:'❄️' },
  { name:'Lava Gorge',        diff:'hard',   emoji:'🌋' },
  { name:'Cloud Kingdom',     diff:'hard',   emoji:'☁️' },
  { name:'Pig Fortress',      diff:'hard',   emoji:'🏰' },
  { name:'Dark Keep',         diff:'hard',   emoji:'🌑' },
  { name:"King Pig's Lair",   diff:'boss',   emoji:'👑' },
];
