import { ctx2d } from './util';

// A tiny 7-row bitmap font: only the letters the title needs.
const GLYPHS: Record<string, string[]> = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  N: ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
  I: ['###', '.#.', '.#.', '.#.', '.#.', '.#.', '###'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  ' ': ['..', '..', '..', '..', '..', '..', '..'],
};

const ROWS = 7;
const LINE_GAP = 2;

function lineWidth(text: string): number {
  return [...text].reduce((w, ch, i) => w + (GLYPHS[ch]?.[0].length ?? 0) + (i ? 1 : 0), 0);
}

/** Width of the widest line, in font pixels. */
export function titleColumns(lines: string[]): number {
  return Math.max(...lines.map(lineWidth));
}

/**
 * Draws the title as extruded, stone-textured blocks, in the spirit of a game logo.
 * `bp` is the size of one font pixel in CSS pixels.
 */
export function drawTitle(canvas: HTMLCanvasElement, lines: string[], bp: number, stone: HTMLCanvasElement): void {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const depth = Math.max(3, Math.round(bp * 0.55));
  const pad = 3;
  const cols = titleColumns(lines);
  const w = cols * bp + depth + pad * 2;
  const h = (lines.length * ROWS + (lines.length - 1) * LINE_GAP) * bp + depth + pad * 2;

  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  const ctx = ctx2d(canvas);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;

  // Collect lit cells (in font-pixel units), each line centred.
  const lit = new Set<string>();
  const cells: [number, number][] = [];
  lines.forEach((line, li) => {
    let x = Math.floor((cols - lineWidth(line)) / 2);
    const y0 = li * (ROWS + LINE_GAP);
    for (const ch of line) {
      const g = GLYPHS[ch];
      if (!g) continue;
      g.forEach((row, gy) =>
        [...row].forEach((v, gx) => {
          if (v !== '#') return;
          cells.push([x + gx, y0 + gy]);
          lit.add(`${x + gx},${y0 + gy}`);
        }),
      );
      x += g[0].length + 1;
    }
  });
  const on = (x: number, y: number) => lit.has(`${x},${y}`);
  const X = (cx: number) => pad + cx * bp;
  const Y = (cy: number) => pad + cy * bp;

  // 1. Black outline around face and extrusion.
  ctx.fillStyle = '#000';
  for (const [cx, cy] of cells) {
    ctx.fillRect(X(cx) - 2, Y(cy) - 2, bp + 4, bp + 4);
    ctx.fillRect(X(cx) + depth - 2, Y(cy) + depth - 2, bp + 4, bp + 4);
  }
  // 2. Extrusion toward the bottom-right.
  for (let d = depth; d > 0; d--) {
    ctx.fillStyle = d === depth ? '#262626' : '#3b3b3b';
    for (const [cx, cy] of cells) ctx.fillRect(X(cx) + d, Y(cy) + d, bp, bp);
  }
  // 3. Stone-textured face; one texture pixel = a quarter of a font pixel.
  const pattern = ctx.createPattern(stone, 'repeat')!;
  pattern.setTransform(new DOMMatrix().scale(bp / 4));
  ctx.fillStyle = pattern;
  for (const [cx, cy] of cells) ctx.fillRect(X(cx), Y(cy), bp, bp);
  // 4. Edge lighting where the letter has an open side.
  const edge = Math.max(2, Math.round(bp / 6));
  for (const [cx, cy] of cells) {
    if (!on(cx, cy - 1)) {
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(X(cx), Y(cy), bp, edge);
    }
    if (!on(cx - 1, cy)) {
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fillRect(X(cx), Y(cy), edge, bp);
    }
    if (!on(cx, cy + 1)) {
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(X(cx), Y(cy) + bp - edge, bp, edge);
    }
  }
}
