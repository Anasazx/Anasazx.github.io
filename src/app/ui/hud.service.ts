import { Injectable, signal } from '@angular/core';
import { SpriteName } from '../pixel/sprites';

export interface ChatLine {
  id: number;
  text: string;
  from?: string;
  color?: string;
}

export interface Toast {
  id: number;
  kind: 'advancement' | 'challenge';
  title: string;
  icon: SpriteName;
}

let nextId = 1;

/** Game-style overlays shared across the page: chat, advancement toasts, debug screen. */
@Injectable({ providedIn: 'root' })
export class HudService {
  readonly chat = signal<ChatLine[]>([]);
  readonly toasts = signal<Toast[]>([]);
  readonly debug = signal(false);
  readonly blocksMined = signal(0);
  readonly blocksPlaced = signal(0);
  private earned = new Set<string>();

  say(text: string, opts: { from?: string; color?: string } = {}): void {
    const line = { id: nextId++, text, ...opts };
    this.chat.update((lines) => [...lines.slice(-5), line]);
    setTimeout(() => this.chat.update((lines) => lines.filter((l) => l.id !== line.id)), 9000);
  }

  /** Shows an advancement toast, at most once per key per visit. */
  advance(key: string, title: string, icon: SpriteName, kind: Toast['kind'] = 'advancement'): void {
    if (this.earned.has(key)) return;
    this.earned.add(key);
    const toast = { id: nextId++, kind, title, icon };
    this.toasts.update((t) => [...t, toast]);
    setTimeout(() => this.toasts.update((t) => t.filter((x) => x.id !== toast.id)), 5200);
  }

  mined(): void {
    const n = this.blocksMined() + 1;
    this.blocksMined.set(n);
    if (n === 1) this.advance('mine-1', 'Getting Started', 'pickaxe');
    if (n === 15) this.advance('mine-15', 'Terraformer', 'diamond', 'challenge');
  }

  placed(): void {
    this.blocksPlaced.update((n) => n + 1);
    this.advance('place', 'Builder', 'chest');
  }

  toggleDebug(): void {
    this.debug.update((d) => !d);
    this.advance('debug', 'Looking Under the Hood', 'orb');
  }
}
