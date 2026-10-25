import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, inject, signal, viewChild } from '@angular/core';
import { profile, splashes } from '../data/portfolio';
import { PixelService } from '../pixel/pixel.service';
import { drawTitle, titleColumns } from '../pixel/title-font';
import { mulberry32 } from '../pixel/util';
import { HudService } from '../ui/hud.service';

const AIR = 0;
const GRASS = 1;
const DIRT = 2;
const LOG = 3;
const LEAVES = 4;
/** Seconds of holding to break each block type. */
const HARDNESS = [0, 0.5, 0.45, 0.9, 0.2];

type Time = 'day' | 'sunset' | 'night';
const SKY: Record<Time, [string, string]> = {
  day: ['#6b9cf0', '#c4dcff'],
  sunset: ['#34477f', '#f2a46a'],
  night: ['#04060f', '#141d3a'],
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

function timeOfDay(): Time {
  const forced = new URLSearchParams(location.search).get('time');
  if (forced === 'day' || forced === 'sunset' || forced === 'night') return forced;
  const h = new Date().getHours();
  if (h >= 7 && h < 17) return 'day';
  if ((h >= 17 && h < 19) || (h >= 5 && h < 7)) return 'sunset';
  return 'night';
}

@Component({
  selector: 'app-world',
  templateUrl: './world.component.html',
  styleUrl: './world.component.css',
})
export class WorldComponent implements AfterViewInit, OnDestroy {
  private px = inject(PixelService);
  private hud = inject(HudService);
  private zone = inject(NgZone);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  private scene = viewChild.required<ElementRef<HTMLCanvasElement>>('scene');
  private title = viewChild.required<ElementRef<HTMLCanvasElement>>('title');

  profile = profile;
  splash = signal(splashes[Math.floor(Math.random() * splashes.length)]);
  touch = matchMedia('(pointer: coarse)').matches;

  private ctx!: CanvasRenderingContext2D;
  private w = 0;
  private h = 0;
  private bs = 64;
  private cols = 0;
  private rows = 0;
  private offY = 0;
  private grid = new Uint8Array(0);
  private wall = new Uint8Array(0);
  private variant = new Uint8Array(0);
  private player = { col: 0, y: 0, vy: 0 };
  private pointer: { c: number; r: number; down: boolean; type: string } | null = null;
  private mining: { c: number; r: number; t: number } | null = null;
  private particles: Particle[] = [];
  private clouds: { x: number; y: number; cells: [number, number][] }[] = [];
  private stars: [number, number][] = [];
  private time: Time = timeOfDay();
  private lastMined = DIRT;
  private colorCache = new Map<HTMLCanvasElement, string[]>();

  private raf = 0;
  private visible = true;
  private last = 0;
  private reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  private cleanup: (() => void)[] = [];

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.setup();
      const ro = new ResizeObserver(() => this.setup());
      ro.observe(this.host.nativeElement);
      const io = new IntersectionObserver(([e]) => {
        this.visible = e.isIntersecting;
        if (this.visible) this.start();
      });
      io.observe(this.host.nativeElement);
      this.bindPointer();
      document.fonts?.ready.then(() => this.renderTitle());
      this.cleanup.push(() => ro.disconnect(), () => io.disconnect());
      this.start();
    });
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.raf);
    this.cleanup.forEach((fn) => fn());
  }

  nextSplash(): void {
    const options = splashes.filter((s) => s !== this.splash());
    this.splash.set(options[Math.floor(Math.random() * options.length)]);
  }

  go(id: string): void {
    document.getElementById(id)?.scrollIntoView();
  }

  // ---------- World generation ----------

  private setup(): void {
    const canvas = this.scene().nativeElement;
    const rect = this.host.nativeElement.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    // Ignore small height changes (mobile URL bar) so mined blocks survive.
    if (rect.width === this.w && Math.abs(rect.height - this.h) < 120) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = rect.width;
    this.h = rect.height;
    canvas.width = Math.round(this.w * dpr);
    canvas.height = Math.round(this.h * dpr);
    this.ctx = canvas.getContext('2d')!;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.imageSmoothingEnabled = false;

    this.bs = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bs')) || 64;
    this.cols = Math.ceil(this.w / this.bs);
    this.rows = Math.ceil(this.h / this.bs);
    // Anchor the grid to the bottom edge so it lines up with the dirt layer below.
    this.offY = this.h - this.rows * this.bs;
    this.generate();
    this.renderTitle();
  }

  private generate(): void {
    const { cols, rows } = this;
    const rand = mulberry32(2027);
    this.grid = new Uint8Array(cols * rows);
    this.wall = new Uint8Array(cols * rows);
    this.variant = new Uint8Array(cols * rows);

    const ground = Math.max(3, Math.round((this.h * 0.24) / this.bs));
    const base = rows - ground;
    const knots = Array.from({ length: Math.ceil(cols / 5) + 2 }, () => rand());
    const surface: number[] = [];
    for (let c = 0; c < cols; c++) {
      const t = c / 5;
      const i = Math.floor(t);
      const s = (1 - Math.cos((t - i) * Math.PI)) / 2;
      const n = knots[i] * (1 - s) + knots[i + 1] * s;
      surface[c] = Math.min(rows - 2, Math.max(3, base + Math.round((n - 0.5) * 3)));
      for (let r = surface[c]; r < rows; r++) {
        this.set(c, r, r === surface[c] ? GRASS : DIRT);
        this.wall[r * cols + c] = 1;
        this.variant[r * cols + c] = Math.floor(rand() * 3);
      }
    }

    this.player.col = Math.max(1, Math.round(cols * 0.12));
    this.player.y = this.offY + surface[this.player.col] * this.bs - this.bs * 1.8;
    this.player.vy = 0;

    let lastTree = -10;
    for (let c = 0; c < cols; c++) {
      const edge = c / cols < 0.26 || c / cols > 0.76;
      if (!edge || c - lastTree < 4 || Math.abs(c - this.player.col) < 2 || rand() > 0.5) continue;
      this.plantTree(c, surface[c], rand);
      lastTree = c;
    }

    this.clouds = Array.from({ length: Math.max(3, Math.round(cols / 5)) }, () => {
      const cells: [number, number][] = [];
      const len = 4 + Math.floor(rand() * 5);
      for (let i = 0; i < len; i++) {
        cells.push([i, 0]);
        if (rand() < 0.5 && i > 0 && i < len - 1) cells.push([i, 1]);
      }
      return { x: rand() * this.w * 1.2, y: this.h * (0.04 + rand() * 0.22), cells };
    });
    this.stars = Array.from({ length: 90 }, () => [rand() * this.w, rand() * this.h * 0.6]);
    this.particles = [];
    this.mining = null;
  }

  private plantTree(c: number, top: number, rand: () => number): void {
    const height = 4 + (rand() < 0.5 ? 1 : 0);
    for (let i = 1; i <= height; i++) this.set(c, top - i, LOG);
    const crown = top - height;
    const layers: [number, number][] = [
      [-1, 1],
      [0, 1],
      [1, 2],
      [2, 2],
    ];
    for (const [dy, span] of layers) {
      for (let dx = -span; dx <= span; dx++) {
        const corner = Math.abs(dx) === span && span === 2 && rand() < 0.4;
        if (!corner && this.get(c + dx, crown + dy) === AIR) this.set(c + dx, crown + dy, LEAVES);
      }
    }
  }

  private get(c: number, r: number): number {
    if (c < 0 || r < 0 || c >= this.cols || r >= this.rows) return -1;
    return this.grid[r * this.cols + c];
  }

  private set(c: number, r: number, v: number): void {
    if (c < 0 || r < 0 || c >= this.cols || r >= this.rows) return;
    this.grid[r * this.cols + c] = v;
  }

  private renderTitle(): void {
    // Use the fewest lines that still keep the lettering a readable size.
    const layouts = [['ANAS RIADH AZIZI'], ['ANAS RIADH', 'AZIZI'], ['ANAS', 'RIADH', 'AZIZI']];
    const maxW = Math.min(this.w - 40, 1100);
    const fit = (lines: string[]) => Math.floor(maxW / titleColumns(lines));
    const lines = layouts.find((l) => fit(l) >= 9) ?? layouts[layouts.length - 1];
    // Stacked titles also shrink on short screens so the menu stays above the ground.
    const rowsTall = lines.length * 7 + (lines.length - 1) * 2;
    const cap = lines.length > 2 ? Math.min(9, Math.floor((this.h * 0.27) / rowsTall)) : 16;
    const bp = Math.max(6, Math.min(cap, fit(lines)));
    drawTitle(this.title().nativeElement, lines, bp, this.px.tex.stones[0]);
  }

  // ---------- Input ----------

  private bindPointer(): void {
    const canvas = this.scene().nativeElement;
    const cell = (e: PointerEvent | MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        c: Math.floor((e.clientX - rect.left) / this.bs),
        r: Math.floor((e.clientY - rect.top - this.offY) / this.bs),
      };
    };
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const rect = canvas.getBoundingClientRect();
      if (this.hitSun(e.clientX - rect.left, e.clientY - rect.top)) {
        this.cycleTime();
        return;
      }
      this.pointer = { ...cell(e), down: true, type: e.pointerType };
      this.startMining();
    };
    const onMove = (e: PointerEvent) => {
      const { c, r } = cell(e);
      const down = this.pointer?.down ?? false;
      if (this.pointer && this.pointer.c === c && this.pointer.r === r) return;
      this.pointer = { c, r, down, type: e.pointerType };
      if (down) this.startMining();
    };
    const onUp = () => {
      if (this.pointer) this.pointer.down = false;
      this.mining = null;
    };
    const onLeave = () => {
      this.pointer = null;
      this.mining = null;
    };
    const onContext = (e: MouseEvent) => {
      e.preventDefault();
      if (this.touch) return;
      const { c, r } = cell(e);
      this.place(c, r);
    };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onLeave);
    canvas.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('contextmenu', onContext);
    this.cleanup.push(() => window.removeEventListener('pointerup', onUp));
  }

  private startMining(): void {
    const p = this.pointer;
    this.mining = p && p.down && this.get(p.c, p.r) > 0 ? { c: p.c, r: p.r, t: 0 } : null;
  }

  private place(c: number, r: number): void {
    if (this.get(c, r) !== AIR) return;
    const pc = this.player.col;
    const pr = Math.floor((this.player.y - this.offY) / this.bs);
    if (c === pc && r >= pr && r <= pr + 2) return;
    const neighbour = [this.get(c - 1, r), this.get(c + 1, r), this.get(c, r - 1), this.get(c, r + 1)].some((v) => v > 0);
    if (!neighbour && !this.wall[r * this.cols + c]) return;
    this.set(c, r, this.lastMined);
    this.variant[r * this.cols + c] = Math.floor(Math.random() * 3);
    this.zone.run(() => this.hud.placed());
  }

  private breakBlock(c: number, r: number): void {
    const type = this.get(c, r);
    this.set(c, r, AIR);
    this.lastMined = type === GRASS ? DIRT : type;
    const tex = this.texture(type, this.variant[r * this.cols + c]);
    const colors = this.colors(tex);
    const n = this.reduced ? 4 : 12;
    for (let i = 0; i < n; i++) {
      this.particles.push({
        x: (c + 0.2 + Math.random() * 0.6) * this.bs,
        y: this.offY + (r + 0.2 + Math.random() * 0.6) * this.bs,
        vx: (Math.random() - 0.5) * 240,
        vy: -80 - Math.random() * 220,
        life: 0.5 + Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: this.bs / 9,
      });
    }
    this.zone.run(() => this.hud.mined());
  }

  private sunBox(): [number, number, number] {
    const size = this.bs * 1.3;
    return [this.w * 0.82, this.h * 0.12, size];
  }

  private hitSun(x: number, y: number): boolean {
    const [sx, sy, s] = this.sunBox();
    return x >= sx - 8 && x <= sx + s + 8 && y >= sy - 8 && y <= sy + s + 8;
  }

  private cycleTime(): void {
    const order: Time[] = ['day', 'sunset', 'night'];
    this.time = order[(order.indexOf(this.time) + 1) % order.length];
    this.zone.run(() => this.hud.say(`Set the time to ${this.time}`, { color: '#aaaaaa' }));
  }

  // ---------- Loop ----------

  private start(): void {
    if (this.raf) return;
    this.last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      this.update(dt);
      this.draw();
      this.raf = this.visible ? requestAnimationFrame(frame) : 0;
    };
    this.raf = requestAnimationFrame(frame);
  }

  private update(dt: number): void {
    if (this.mining) {
      const { c, r } = this.mining;
      const type = this.get(c, r);
      this.mining.t += dt;
      if (type <= 0) this.mining = null;
      else if (this.mining.t >= HARDNESS[type]) {
        this.breakBlock(c, r);
        this.mining = null;
      }
    }

    // Player gravity: fall until the next solid block below the feet.
    const ph = this.bs * 1.8;
    const feetRow = Math.floor((this.player.y + ph - this.offY + 0.5) / this.bs);
    let ground = this.h - ph;
    for (let r = Math.max(0, feetRow); r < this.rows; r++) {
      if (this.get(this.player.col, r) > 0) {
        ground = this.offY + r * this.bs - ph;
        break;
      }
    }
    if (this.player.y < ground - 0.5) {
      this.player.vy += 2600 * dt;
      this.player.y = Math.min(ground, this.player.y + this.player.vy * dt);
    } else {
      this.player.y = ground;
      this.player.vy = 0;
    }

    for (const p of this.particles) {
      p.vy += 900 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);

    if (!this.reduced) {
      for (const cloud of this.clouds) {
        cloud.x += dt * 7 * (this.bs / 64);
        if (cloud.x > this.w + this.bs * 2) cloud.x = -this.bs * 7;
      }
    }
  }

  private texture(type: number, variant: number): HTMLCanvasElement {
    const t = this.px.tex;
    if (type === GRASS) return t.grassSide;
    if (type === LOG) return t.log;
    if (type === LEAVES) return t.leaves;
    return t.dirts[variant % t.dirts.length];
  }

  private colors(tex: HTMLCanvasElement): string[] {
    let list = this.colorCache.get(tex);
    if (!list) {
      const data = tex.getContext('2d')!.getImageData(0, 0, 16, 16).data;
      list = [];
      for (let i = 0; i < data.length; i += 4 * 7) if (data[i + 3]) list.push(`rgb(${data[i]},${data[i + 1]},${data[i + 2]})`);
      this.colorCache.set(tex, list);
    }
    return list;
  }

  private draw(): void {
    const { ctx, w, h, bs } = this;
    if (!ctx) return;
    const [top, bottom] = SKY[this.time];
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.8);
    sky.addColorStop(0, top);
    sky.addColorStop(1, bottom);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    if (this.time === 'night') {
      ctx.fillStyle = '#ffffff';
      for (const [x, y] of this.stars) ctx.fillRect(Math.round(x), Math.round(y), 2, 2);
    }

    // Sun or moon — click it to change the time of day.
    const [sx, sy, s] = this.sunBox();
    if (this.time === 'night') {
      ctx.fillStyle = '#e8ecf5';
      ctx.fillRect(sx, sy, s, s);
      ctx.fillStyle = '#b9c0d0';
      ctx.fillRect(sx + s * 0.2, sy + s * 0.25, s * 0.2, s * 0.2);
      ctx.fillRect(sx + s * 0.6, sy + s * 0.55, s * 0.15, s * 0.15);
    } else {
      ctx.fillStyle = this.time === 'day' ? 'rgba(255,250,200,0.25)' : 'rgba(255,170,90,0.3)';
      ctx.fillRect(sx - s * 0.25, sy - s * 0.25, s * 1.5, s * 1.5);
      ctx.fillStyle = this.time === 'day' ? '#fff6b0' : '#ffb35c';
      ctx.fillRect(sx, sy, s, s);
    }

    const cell = bs * 0.75;
    ctx.fillStyle = this.time === 'night' ? 'rgba(190,200,230,0.07)' : 'rgba(255,255,255,0.88)';
    for (const cloud of this.clouds) {
      for (const [cx, cy] of cloud.cells) ctx.fillRect(Math.round(cloud.x + cx * cell), Math.round(cloud.y + cy * cell * 0.6), cell, cell * 0.6);
    }

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const i = r * this.cols + c;
        const type = this.grid[i];
        const x = c * bs;
        const y = this.offY + r * bs;
        if (type === AIR) {
          if (!this.wall[i]) continue;
          ctx.drawImage(this.texture(DIRT, this.variant[i]), x, y, bs, bs);
          ctx.fillStyle = 'rgba(0,0,0,0.55)';
          ctx.fillRect(x, y, bs, bs);
          continue;
        }
        ctx.drawImage(this.texture(type, this.variant[i]), x, y, bs, bs);
      }
    }

    if (this.time !== 'day') {
      ctx.fillStyle = this.time === 'night' ? 'rgba(8,12,40,0.45)' : 'rgba(120,50,20,0.12)';
      ctx.fillRect(0, 0, w, h);
    }

    if (this.mining) {
      const { c, r, t } = this.mining;
      const stage = Math.min(9, Math.floor((t / HARDNESS[this.get(c, r)]) * 10));
      ctx.drawImage(this.px.tex.cracks[stage], c * bs, this.offY + r * bs, bs, bs);
    }

    const p = this.pointer;
    if (p && !this.touch && this.get(p.c, p.r) > 0) {
      ctx.strokeStyle = 'rgba(0,0,0,0.8)';
      ctx.lineWidth = 2;
      ctx.strokeRect(p.c * bs + 1, this.offY + p.r * bs + 1, bs - 2, bs - 2);
    }

    this.drawPlayer();

    for (const pt of this.particles) {
      ctx.globalAlpha = Math.min(1, pt.life * 2);
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
    }
    ctx.globalAlpha = 1;
  }

  private drawPlayer(): void {
    const { ctx, bs } = this;
    const ph = bs * 1.8;
    const pw = ph / 2;
    const x = this.player.col * bs + (bs - pw) / 2;
    const y = this.player.y;
    ctx.drawImage(this.px.player, x, y, pw, ph);

    const size = Math.max(12, Math.round(bs * 0.26));
    ctx.font = `${size}px "Pixelify Sans", monospace`;
    const label = profile.handle;
    const tw = ctx.measureText(label).width;
    const tx = x + pw / 2 - tw / 2;
    const ty = y - size * 0.9;
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(tx - 5, ty - size, tw + 10, size * 1.3);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(label, tx, ty);
  }
}
