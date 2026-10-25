import { createCanvas, ctx2d, hexToRgb, mulberry32, pick } from './util';

// Every texture here is generated procedurally — no external image assets.

const S = 16;
type Painter = (x: number, y: number, rand: () => number) => string | null;

function paint(seed: number, fn: Painter): HTMLCanvasElement {
  const canvas = createCanvas(S, S);
  const ctx = ctx2d(canvas);
  const img = ctx.createImageData(S, S);
  const rand = mulberry32(seed);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const color = fn(x, y, rand);
      if (!color) continue;
      const [r, g, b] = hexToRgb(color);
      const i = (y * S + x) * 4;
      img.data.set([r, g, b, 255], i);
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

const DIRT = ['#866043', '#866043', '#79553a', '#79553a', '#9b7653', '#593d29', '#6c4a30'];
const STONE = ['#7f7f7f', '#7f7f7f', '#747474', '#888888', '#6b6b6b', '#8f8f8f'];
const DEEPSLATE = ['#4d4d52', '#47474b', '#55555a', '#404044', '#4a4a4f'];
const DEEP = ['#2c2c31', '#26262b', '#323238', '#1f1f24'];
const BEDROCK = ['#575757', '#333333', '#7b7b7b', '#1f1f1f', '#454545', '#666666'];
const GRASS = ['#5d9c3a', '#6fae40', '#4e8a2f', '#7cbf4a', '#5a9636'];
const LEAVES = ['#3f7d23', '#4d9a2b', '#2f6119', '#5aa832', '#468e27'];
const PLANKS = ['#b8945f', '#ad8a55', '#a07d4b', '#bf9b66'];
const BARK = ['#6b5232', '#55402a', '#7a5f3b', '#5f4830'];

export const dirt = (seed: number) => paint(seed, (_x, _y, r) => pick(r, DIRT));

export const stone = (seed: number) =>
  paint(seed, (_x, _y, r) => (r() < 0.06 ? '#5f5f5f' : pick(r, STONE)));

export const deepslate = (seed: number, palette = DEEPSLATE) =>
  paint(seed, (_x, y, r) => (y % 4 === 3 && r() < 0.7 ? '#36363a' : pick(r, palette)));

export const bedrock = (seed: number) => paint(seed, (_x, _y, r) => pick(r, BEDROCK));

export const sculk = (seed: number) =>
  paint(seed, (_x, _y, r) => {
    const v = r();
    if (v < 0.1) return '#29dfeb';
    if (v < 0.2) return '#0f6e76';
    return pick(r, ['#0b1a1f', '#0d2027', '#09151a', '#112a31']);
  });

export function grassSide(seed: number): HTMLCanvasElement {
  const rand = mulberry32(seed * 7);
  const depth = Array.from({ length: S }, () => 2 + (rand() < 0.65 ? 1 : 0) + (rand() < 0.3 ? 1 : 0));
  return paint(seed, (x, y, r) => (y < depth[x] ? pick(r, GRASS) : pick(r, DIRT)));
}

export const leaves = (seed: number) => paint(seed, (_x, _y, r) => (r() < 0.12 ? null : pick(r, LEAVES)));

export function log(seed: number): HTMLCanvasElement {
  const rand = mulberry32(seed);
  const offsets = Array.from({ length: S }, () => Math.floor(rand() * 4));
  return paint(seed, (x, y, r) => {
    if (x === 0 || x === 15) return '#3f2f1c';
    if ((y + offsets[x]) % 5 === 0 && r() < 0.6) return '#47361f';
    return pick(r, BARK);
  });
}

export const planks = (seed: number) =>
  paint(seed, (x, y, r) => {
    const board = Math.floor(y / 4);
    if (y % 4 === 3) return '#5e4526';
    if (x === (board * 7 + 3) % 16) return '#6b5230';
    return pick(r, PLANKS);
  });

/** Noisy grey used behind GUI buttons. */
export const buttonStone = (seed: number) =>
  paint(seed, (_x, _y, r) => pick(r, ['#6f6f6f', '#737373', '#6a6a6a', '#777777', '#6c6c6c']));

export const rail = () =>
  paint(1, (x, y) => {
    if (x === 4 || x === 10) return '#c8c8c8';
    if (x === 5 || x === 11) return '#8a8a8a';
    if ((y % 8 === 1 || y % 8 === 2) && x >= 2 && x <= 13) return y % 8 === 1 ? '#8a6a3c' : '#6b4a26';
    return null;
  });

/** Copies a base texture and sprinkles ore clusters over it. */
function ore(base: HTMLCanvasElement, colors: [string, string, string], seed: number): HTMLCanvasElement {
  const canvas = createCanvas(S, S);
  const ctx = ctx2d(canvas);
  ctx.drawImage(base, 0, 0);
  const rand = mulberry32(seed);
  const [main, light, dark] = colors;
  // 2–3 compact veins, each a 3×3-ish blob with a lit top-left and shaded bottom-right.
  const veins = 2 + Math.floor(rand() * 2);
  for (let k = 0; k < veins; k++) {
    const cx = 2 + Math.floor(rand() * 11);
    const cy = 2 + Math.floor(rand() * 11);
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (Math.abs(dx) + Math.abs(dy) === 2 && rand() < 0.6) continue;
        ctx.fillStyle = dx + dy < 0 ? light : dx + dy > 0 ? dark : main;
        ctx.fillRect(cx + dx, cy + dy, 1, 1);
      }
    }
  }
  return canvas;
}

const ORES = {
  coal: ['#2b2b2b', '#454545', '#151515'],
  iron: ['#d8af93', '#ecd2bd', '#a8806a'],
  gold: ['#fcee4b', '#fff9b0', '#c9a116'],
  redstone: ['#ff1f1f', '#ff7a7a', '#a80000'],
  lapis: ['#2d5bd1', '#6b8ff0', '#1b3a8f'],
  diamond: ['#4ee6e6', '#b5fff8', '#1aa6a6'],
  emerald: ['#17dd62', '#8dffbd', '#0a8a3a'],
} satisfies Record<string, [string, string, string]>;

/** Crack overlays for the 10 stages of breaking a block. */
function cracks(): HTMLCanvasElement[] {
  const rand = mulberry32(99);
  const points: [number, number][] = [];
  for (let s = 0; s < 4; s++) {
    let x = 6 + Math.floor(rand() * 4);
    let y = 6 + Math.floor(rand() * 4);
    for (let i = 0; i < 18; i++) {
      points.push([x, y]);
      x = Math.max(0, Math.min(15, x + Math.floor(rand() * 3) - 1));
      y = Math.max(0, Math.min(15, y + Math.floor(rand() * 3) - 1));
    }
  }
  // Interleave the walks so cracks grow outward from the centre in every stage.
  points.sort((a, b) => Math.hypot(a[0] - 7.5, a[1] - 7.5) - Math.hypot(b[0] - 7.5, b[1] - 7.5));
  return Array.from({ length: 10 }, (_, stage) => {
    const canvas = createCanvas(S, S);
    const ctx = ctx2d(canvas);
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    for (const [x, y] of points.slice(0, Math.ceil(((stage + 1) / 10) * points.length))) ctx.fillRect(x, y, 1, 1);
    return canvas;
  });
}

/** An 8×8 block mosaic, so tiled backgrounds don't visibly repeat every block. */
function chunk(seed: number, variants: HTMLCanvasElement[], ores: [HTMLCanvasElement, number][]): HTMLCanvasElement {
  const canvas = createCanvas(S * 8, S * 8);
  const ctx = ctx2d(canvas);
  const rand = mulberry32(seed);
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      let tile = pick(rand, variants);
      let roll = rand();
      for (const [oreTex, chance] of ores) {
        if (roll < chance) {
          tile = oreTex;
          break;
        }
        roll -= chance;
      }
      ctx.drawImage(tile, x * S, y * S);
    }
  }
  return canvas;
}

export type ChunkName = 'dirt' | 'stone' | 'stone-rich' | 'deepslate' | 'deepslate-rich' | 'deep-dark' | 'bedrock';

export function buildTextures() {
  const dirts = [dirt(1), dirt(2), dirt(3)];
  const stones = [stone(4), stone(5), stone(6)];
  const slates = [deepslate(7), deepslate(8), deepslate(9)];
  const deeps = [deepslate(10, DEEP), deepslate(11, DEEP)];

  const chunks: Record<ChunkName, HTMLCanvasElement> = {
    dirt: chunk(20, dirts, []),
    stone: chunk(21, stones, [
      [ore(stones[0], ORES.coal, 1), 0.06],
      [ore(stones[1], ORES.iron, 2), 0.03],
    ]),
    'stone-rich': chunk(22, stones, [
      [ore(stones[0], ORES.iron, 3), 0.04],
      [ore(stones[1], ORES.gold, 4), 0.03],
      [ore(stones[2], ORES.redstone, 5), 0.03],
      [ore(stones[0], ORES.lapis, 6), 0.02],
    ]),
    deepslate: chunk(23, slates, [
      [ore(slates[0], ORES.gold, 7), 0.03],
      [ore(slates[1], ORES.diamond, 8), 0.02],
    ]),
    'deepslate-rich': chunk(24, slates, [
      [ore(slates[0], ORES.diamond, 9), 0.05],
      [ore(slates[1], ORES.emerald, 10), 0.02],
      [ore(slates[2], ORES.redstone, 11), 0.04],
    ]),
    'deep-dark': chunk(25, deeps, [[sculk(12), 0.07], [ore(deeps[0], ORES.diamond, 13), 0.02]]),
    bedrock: chunk(26, [bedrock(14), bedrock(15), bedrock(16)], []),
  };

  return {
    dirts,
    stones,
    grassSide: grassSide(30),
    log: log(31),
    leaves: leaves(32),
    planks: planks(33),
    button: buttonStone(34),
    rail: rail(),
    cracks: cracks(),
    chunks,
  };
}

export type Textures = ReturnType<typeof buildTextures>;
