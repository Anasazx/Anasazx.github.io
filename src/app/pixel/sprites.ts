import { createCanvas, ctx2d, mulberry32, pick, shade } from './util';

// Original 16×16 item sprites. In a pixel map, '.' is transparent; 'c', 'C' and 'k'
// are the tint colour plus light and dark variants; 'o' defaults to a dark outline.

export type SpriteName =
  | 'grass'
  | 'book'
  | 'pickaxe'
  | 'chest'
  | 'trophy'
  | 'diamond'
  | 'ingot'
  | 'orb'
  | 'brush'
  | 'dust'
  | 'envelope'
  | 'github'
  | 'linkedin'
  | 'sapling'
  | 'clock'
  | 'star'
  | 'minecart'
  | 'robot';

interface MapSprite {
  rows: string[];
  pal?: Record<string, string>;
  tint?: string;
}

const r = (n: number, ch: string) => ch.repeat(n);

const MAPS: Partial<Record<SpriteName, MapSprite>> = {
  book: {
    tint: '#8b4a2b',
    pal: { p: '#f6eedb', P: '#e3d6b8' },
    rows: [
      '................',
      '...' + r(12, 'o') + '.',
      '..ok' + r(9, 'c') + 'po.',
      '..okc' + r(7, 'C') + 'cpo.',
      '..okcC' + r(5, 'P') + 'Ccpo.',
      '..okc' + r(7, 'C') + 'cpo.',
      ...Array(6).fill('..ok' + r(9, 'c') + 'po.'),
      '..o' + r(10, 'k') + 'po.',
      '..o' + r(10, 'p') + 'Po.',
      '...' + r(11, 'o') + '..',
    ],
  },
  chest: {
    tint: '#a0702c',
    pal: { g: '#d8d8d8', G: '#8e8e8e' },
    rows: [
      '................',
      '................',
      '.' + r(14, 'o') + '.',
      '.o' + r(12, 'C') + 'o.',
      '.o' + r(12, 'c') + 'o.',
      '.o' + r(12, 'k') + 'o.',
      '.' + r(6, 'o') + 'gg' + r(6, 'o') + '.',
      '.o' + r(5, 'c') + 'gG' + r(5, 'c') + 'o.',
      '.o' + r(5, 'C') + 'GG' + r(5, 'C') + 'o.',
      '.o' + r(12, 'c') + 'o.',
      '.o' + r(12, 'c') + 'o.',
      '.o' + r(12, 'k') + 'o.',
      '.o' + r(12, 'c') + 'o.',
      '.o' + r(12, 'k') + 'o.',
      '.' + r(14, 'o') + '.',
    ],
  },
  trophy: {
    tint: '#f2c12e',
    rows: [
      '................',
      '...' + r(10, 'o') + '...',
      '.ooocCCCCCccooo.',
      '.o.ocCCCCCcco.o.',
      '.o.ocCCCCCcco.o.',
      '..oocCCCCCccoo..',
      '....occCCcco....',
      '.....occcco.....',
      '......okko......',
      '......okko......',
      '.....okkkko.....',
      '....occccccco...',
      '....ooooooooo...',
    ],
  },
  diamond: {
    tint: '#4ee6e6',
    rows: [
      '................',
      '................',
      '.....oooooo.....',
      '....oCCcccco....',
      '...oCCcccccCko..',
      '..oCcccccccccko.',
      '..okkcccccckkko.',
      '...okcccccckko..',
      '....okcccckko...',
      '.....okcckko....',
      '......okko......',
      '.......oo.......',
    ],
  },
  ingot: {
    tint: '#d8d8d8',
    rows: [
      '................',
      '................',
      '................',
      '................',
      '................',
      '....' + r(10, 'o') + '..',
      '...o' + r(10, 'C') + 'o.',
      '..oC' + r(9, 'c') + 'ko.',
      '.oC' + r(9, 'c') + 'kko.',
      '.o' + r(12, 'k') + 'o.',
      '.' + r(14, 'o') + '.',
    ],
  },
  brush: {
    tint: '#dd0031',
    pal: { s: '#9a9a9a', S: '#d0d0d0', h: '#8a6a3c', H: '#5e4626' },
    rows: [
      '......oooo......',
      '.....oCccco.....',
      '.....oCccco.....',
      '.....oCckko.....',
      '......oCko......',
      '.....ossSso.....',
      '.....oSSsso.....',
      '.....ossSso.....',
      '......ohho......',
      ...Array(5).fill('......ohHo......'),
      '.......oo.......',
    ],
  },
  dust: {
    tint: '#ff3b3b',
    rows: [
      '................',
      '................',
      '................',
      '.......c........',
      '.....c.cC..c....',
      '....cCc.cc.Cc...',
      '...c.ccCcckcc.c.',
      '....ckcckcCccc..',
      '...cCcckccckcCc.',
      '..ckcckcCccckck.',
      '...kckkckkckkc..',
    ],
  },
  envelope: {
    pal: { o: '#5a4a32', p: '#f3ecd8', f: '#c9bd9c', s: '#d23b3b' },
    rows: [
      '................',
      '................',
      '................',
      '.' + r(14, 'o') + '.',
      '.offppppppppffo.',
      '.opffppppppffpo.',
      '.opppffppffpppo.',
      '.oppppffffppppo.',
      '.opppppsspppppo.',
      '.opppppsspppppo.',
      '.o' + r(12, 'p') + 'o.',
      '.o' + r(12, 'p') + 'o.',
      '.' + r(14, 'o') + '.',
    ],
  },
  github: {
    pal: { o: '#1b1f23', w: '#f5f5f5' },
    rows: [
      '.....oooooo.....',
      '...oooooooooo...',
      '..oowooooooowoo.',
      '.ooowwooooowwooo',
      '.ooowwwwwwwwwoo.',
      'oooowwwwwwwwwooo',
      'ooowwwwwwwwwwwoo',
      'ooowwwwwwwwwwwoo',
      'ooowwwwwwwwwwwoo',
      'oooowwwwwwwwwooo',
      '.oooowwwwwwwooo.',
      '.owwoooowwwooo..',
      '..oowwowwwooo...',
      '...ooowwwooo....',
      '.....owwwo......',
      '......ooo.......',
    ],
  },
  linkedin: {
    pal: { b: '#0a66c2', w: '#ffffff' },
    rows: [
      '.bbbbbbbbbbbbbb.',
      'bbbbbbbbbbbbbbbb',
      'bbbbbbbbbbbbbbbb',
      'bbbwwbbbbbbbbbbb',
      'bbbwwbbbbbbbbbbb',
      'bbbbbbbbbbbbbbbb',
      'bbbwwbbwwbwwwbbb',
      'bbbwwbbwwwwwwwbb',
      'bbbwwbbwwwbbwwbb',
      ...Array(4).fill('bbbwwbbwwbbbwwbb'),
      'bbbbbbbbbbbbbbbb',
      'bbbbbbbbbbbbbbbb',
      '.bbbbbbbbbbbbbb.',
    ],
  },
  sapling: {
    pal: { l: '#4d9a2b', L: '#8bd152', h: '#6b4a26', w: '#3f76e4', W: '#8fb4ff' },
    rows: [
      '................',
      '.........ll.....',
      '....ll..lLLl....',
      '...lLLl.lLll....',
      '...lLlllllll.l..',
      '....lllLlll.lLl.',
      '......llhll.ll..',
      '...ll...h.......',
      '..lLLl..h..ll...',
      '...lll.hh.lLLl..',
      '........h..lll..',
      '........hh......',
      '...wwwwwwwwww...',
      '..wWWwwwwWWwww..',
      '...wwwwwwwwww...',
    ],
  },
  star: {
    tint: '#ffd23f',
    rows: [
      '................',
      '.......oo.......',
      '......oCCo......',
      '......oCco......',
      '.....oCccco.....',
      '.oooooCcccooooo.',
      '.oCCCCcccccccko.',
      '..oCccccccccko..',
      '...oCccccccko...',
      '....occcccco....',
      '...occcookcco...',
      '..occoo....occo.',
      '..ooo......ooo..',
    ],
  },
  minecart: {
    pal: { o: '#2a2a2a', s: '#8b8b8b', S: '#b5b5b5', K: '#3a3a3a' },
    rows: [
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '.' + r(14, 'o') + '.',
      '.os' + r(10, 'S') + 'so.',
      '.o' + r(12, 's') + 'o.',
      '.o' + r(12, 's') + 'o.',
      '..o' + r(10, 's') + 'o..',
      '..' + r(12, 'o') + '..',
      '...oKKo..oKKo...',
      '...oKKo..oKKo...',
      '....oo....oo....',
    ],
  },
  robot: {
    tint: '#2dd4bf',
    pal: { o: '#2a2f35', s: '#b9c0c7', S: '#e3e7ea', t: '#55ffff', K: '#333333', r: '#ff4040', k: '#6b737b' },
    rows: [
      '.......rr.......',
      '.......kk.......',
      '...' + r(10, 'o') + '...',
      '...o' + r(8, 'S') + 'o...',
      '..ooSttSSttSoo..',
      '..ksSttssttSsk..',
      '...o' + r(8, 's') + 'o...',
      '...ossKKKKsso...',
      '...o' + r(8, 's') + 'o...',
      '...' + r(10, 'o') + '...',
      '.....okkkko.....',
      '..' + r(12, 'o') + '..',
      '..ocCCcccccCco..',
      '..occcctccccco..',
      '..o' + r(10, 'c') + 'o..',
      '..' + r(12, 'o') + '..',
    ],
  },
};

const DEFAULT_TINT: Partial<Record<SpriteName, string>> = {
  pickaxe: '#d8d8d8',
  orb: '#2fbfa5',
  clock: '#e8b923',
};

type Px = (x: number, y: number, color: string) => void;

/** Sprites easier to describe with geometry than by hand. */
const DRAWN: Partial<Record<SpriteName, (px: Px, tint: string) => void>> = {
  pickaxe(px, tint) {
    for (let i = 0; i < 10; i++) {
      px(1 + i, 14 - i, '#8a6a3c');
      px(2 + i, 14 - i, '#5e4626');
    }
    // Head: a thick arc around a centre near the bottom-left of the handle.
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const dx = x - 3;
        const dy = y - 12;
        const d = Math.hypot(dx, dy);
        const a = (Math.atan2(dy, dx) * 180) / Math.PI;
        if (a > -84 && a < -6 && d >= 8.6 && d < 11.2) {
          px(x, y, d > 10.3 ? shade(tint, 0.4) : d < 9.4 ? shade(tint, -0.35) : tint);
        }
      }
    }
  },
  orb(px, tint) {
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const d = Math.hypot(x - 7.5, y - 7.5);
        if (d > 6.5) continue;
        const lit = x + y < 12 ? shade(tint, 0.35) : x + y > 19 ? shade(tint, -0.4) : tint;
        const pupil = Math.abs(x - 7.5) < 1.6 && Math.abs(y - 7.5) < 3.2;
        px(x, y, pupil ? '#0b3b36' : lit);
      }
    }
    px(5, 4, '#ffffff');
    px(4, 5, '#ffffff');
  },
  clock(px, tint) {
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const d = Math.hypot(x - 7.5, y - 7.5);
        if (d > 6.8) continue;
        px(x, y, d > 5.3 ? (x + y < 15 ? shade(tint, 0.3) : shade(tint, -0.25)) : '#f3ecd8');
      }
    }
    for (let i = 0; i < 4; i++) px(7, 4 + i, '#3d2c00');
    for (let i = 0; i < 3; i++) px(8 + i, 7, '#3d2c00');
  },
};

function outline(ctx: CanvasRenderingContext2D, color: string): void {
  const img = ctx.getImageData(0, 0, 16, 16);
  const a = (x: number, y: number) => (x < 0 || y < 0 || x > 15 || y > 15 ? 0 : img.data[(y * 16 + x) * 4 + 3]);
  ctx.fillStyle = color;
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      if (a(x, y)) continue;
      if (a(x - 1, y) || a(x + 1, y) || a(x, y - 1) || a(x, y + 1)) ctx.fillRect(x, y, 1, 1);
    }
  }
}

export function renderSprite(name: SpriteName, tint?: string): HTMLCanvasElement {
  const canvas = createCanvas(16, 16);
  const ctx = ctx2d(canvas);
  const px: Px = (x, y, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
  };

  const drawn = DRAWN[name];
  if (drawn) {
    const t = tint ?? DEFAULT_TINT[name] ?? '#cccccc';
    drawn(px, t);
    outline(ctx, shade(t, -0.78));
    return canvas;
  }

  const def = MAPS[name];
  if (!def) return canvas;
  const t = tint ?? def.tint ?? '#cccccc';
  const colors: Record<string, string> = { c: t, C: shade(t, 0.38), k: shade(t, -0.35), o: shade(t, -0.78), ...def.pal };
  def.rows.forEach((row, y) => {
    for (let x = 0; x < Math.min(16, row.length); x++) {
      const color = colors[row[x]];
      if (color) px(x, y, color);
    }
  });
  return canvas;
}

// ---------- Characters ----------

export interface Look {
  hair: string;
  skin: string;
  eyes: string;
  shirt: string;
  pants: string;
}

export const ANAS: Look = { hair: '#2b1d14', skin: '#c68a5b', eyes: '#3b2414', shirt: '#1fa39a', pants: '#2f3e66' };

function drawFace(px: Px, look: Look, ox: number): void {
  const skinDark = shade(look.skin, -0.15);
  const rows = ['HHHHHHHH', 'HHHHHHHH', 'HsHHsssH', 'ssssssss', 'swessews', 'ssssssss', 'sssmmsss', 'SSSSSSSS'];
  const pal: Record<string, string> = {
    H: look.hair,
    s: look.skin,
    S: skinDark,
    w: '#ffffff',
    e: look.eyes,
    m: shade(look.skin, -0.4),
  };
  rows.forEach((row, y) => [...row].forEach((ch, x) => px(ox + x, y, pal[ch])));
}

/** 8×8 face, used for the server icon and the club-member crowd. */
export function renderHead(look: Look): HTMLCanvasElement {
  const canvas = createCanvas(8, 8);
  const ctx = ctx2d(canvas);
  drawFace((x, y, c) => ((ctx.fillStyle = c), ctx.fillRect(x, y, 1, 1)), look, 0);
  return canvas;
}

/** 16×32 front-facing player. */
export function renderPlayer(look: Look): HTMLCanvasElement {
  const canvas = createCanvas(16, 32);
  const ctx = ctx2d(canvas);
  const px: Px = (x, y, c) => ((ctx.fillStyle = c), ctx.fillRect(x, y, 1, 1));
  const rect = (x: number, y: number, w: number, h: number, c: string) => ((ctx.fillStyle = c), ctx.fillRect(x, y, w, h));

  drawFace(px, look, 4);
  const shirtDark = shade(look.shirt, -0.25);
  rect(4, 8, 8, 12, look.shirt);
  rect(7, 9, 2, 11, shirtDark); // zip
  rect(5, 8, 6, 1, shirtDark); // hood edge
  rect(5, 15, 6, 2, shirtDark); // pocket
  for (const ax of [0, 12]) {
    rect(ax, 8, 4, 9, look.shirt);
    rect(ax + (ax ? 3 : 0), 8, 1, 9, shirtDark);
    rect(ax, 17, 4, 3, look.skin);
  }
  const pantsDark = shade(look.pants, -0.25);
  rect(4, 20, 4, 10, look.pants);
  rect(8, 20, 4, 10, pantsDark);
  rect(4, 30, 8, 2, '#3a3a3a');
  return canvas;
}

export function randomLook(seed: number): Look {
  const rand = mulberry32(seed);
  return {
    hair: pick(rand, ['#2b1d14', '#4a2f1b', '#1a1a1a', '#6b4423', '#a8762e', '#3a2a20']),
    skin: pick(rand, ['#c68a5b', '#e0b48c', '#8d5a3b', '#f1c7a1', '#a8714a', '#6e4630']),
    eyes: pick(rand, ['#3b2414', '#2a4b8d', '#2f6b3a', '#1a1a1a']),
    shirt: pick(rand, ['#1fa39a', '#c94a4a', '#3d6fd1', '#e0a82e', '#7a4fc2', '#4a9a3a']),
    pants: '#2f3e66',
  };
}
