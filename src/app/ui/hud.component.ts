import { Component, HostListener, OnDestroy, OnInit, effect, inject, signal } from '@angular/core';
import { profile } from '../data/portfolio';
import { layers } from '../data/world';
import { SpriteName } from '../pixel/sprites';
import { HudService } from './hud.service';
import { SpriteComponent } from './sprite.component';

interface Slot {
  label: string;
  icon: SpriteName;
  tint?: string;
  href: string;
  external?: boolean;
  /** Index into `layers` this slot jumps to. */
  layer?: number;
}

@Component({
  selector: 'app-hud',
  imports: [SpriteComponent],
  templateUrl: './hud.component.html',
  styleUrl: './hud.component.css',
})
export class HudComponent implements OnInit, OnDestroy {
  hud = inject(HudService);

  slots: Slot[] = [
    ...layers.flatMap((l, i) => (l.hotbar ? [{ ...l.hotbar, href: `#${l.id}`, layer: i }] : [])),
    { label: 'GitHub', icon: 'github', href: profile.github, external: true },
    { label: 'LinkedIn', icon: 'linkedin', href: profile.linkedin, external: true },
  ];

  active = signal(0);
  y = signal(layers[0].y);
  layerName = signal(layers[0].name);
  label = signal<{ text: string; id: number } | null>(null);
  fps = signal(0);
  viewport = signal('');

  private labelTimer = 0;
  private frame = 0;
  private fpsRaf = 0;

  constructor() {
    effect(() => (this.hud.debug() ? this.startFps() : this.stopFps()));
  }

  ngOnInit(): void {
    this.measure();
    const touch = matchMedia('(pointer: coarse)').matches;
    setTimeout(() => this.hud.say('Welcome to my world!', { from: profile.handle }), 900);
    setTimeout(
      () =>
        this.hud.say(
          touch
            ? 'Tip: press and hold a block to mine it. Tap the hotbar to travel.'
            : 'Tip: hold click on a block to mine it. Keys 1–9 travel between layers. F3 for debug.',
          { color: '#aaaaaa' },
        ),
      2200,
    );
  }

  ngOnDestroy(): void {
    this.stopFps();
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onScroll(): void {
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => this.measure());
  }

  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'F3') {
      e.preventDefault();
      this.hud.toggleDebug();
      return;
    }
    const n = Number(e.key);
    if (n >= 1 && n <= this.slots.length) this.activate(n - 1);
  }

  select(event: Event, i: number): void {
    if (this.slots[i].external) return; // let the link open normally
    event.preventDefault();
    this.activate(i);
  }

  private activate(i: number): void {
    const slot = this.slots[i];
    if (slot.external) {
      window.open(slot.href, '_blank', 'noopener');
      return;
    }
    if (slot.layer === 0) window.scrollTo({ top: 0 });
    else document.querySelector(slot.href)?.scrollIntoView();
    this.showLabel(slot.label);
  }

  private measure(): void {
    const probe = window.scrollY + window.innerHeight * 0.4;
    const tops = layers.map((l) => {
      const el = document.getElementById(l.id);
      return el ? el.getBoundingClientRect().top + window.scrollY : Infinity;
    });
    let idx = 0;
    tops.forEach((t, i) => t <= probe && (idx = i));
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (atBottom) idx = layers.length - 1;

    const cur = layers[idx];
    const next = layers[idx + 1];
    let y = cur.y;
    if (next && !atBottom && Number.isFinite(tops[idx + 1])) {
      const frac = Math.min(1, Math.max(0, (probe - tops[idx]) / (tops[idx + 1] - tops[idx])));
      y = Math.round(cur.y + (next.y - cur.y) * frac);
    }
    this.y.set(y);
    this.layerName.set(cur.name);
    this.viewport.set(`${window.innerWidth}×${window.innerHeight}`);

    let slot = 0;
    this.slots.forEach((s, i) => s.layer !== undefined && s.layer <= idx && (slot = i));
    if (slot !== this.active()) {
      this.active.set(slot);
      this.showLabel(this.slots[slot].label);
    }
    if (cur.id === 'bedrock') this.hud.advance('bedrock', 'Deep Dive: reached bedrock', 'diamond', 'challenge');
  }

  private showLabel(text: string): void {
    this.label.set({ text, id: Date.now() });
    clearTimeout(this.labelTimer);
    this.labelTimer = window.setTimeout(() => this.label.set(null), 1800);
  }

  private startFps(): void {
    let frames = 0;
    let since = performance.now();
    const tick = (now: number) => {
      frames++;
      if (now - since >= 500) {
        this.fps.set(Math.round((frames * 1000) / (now - since)));
        frames = 0;
        since = now;
      }
      this.fpsRaf = requestAnimationFrame(tick);
    };
    this.fpsRaf = requestAnimationFrame(tick);
  }

  private stopFps(): void {
    cancelAnimationFrame(this.fpsRaf);
  }
}
