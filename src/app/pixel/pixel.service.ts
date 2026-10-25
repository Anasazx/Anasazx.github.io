import { Injectable } from '@angular/core';
import { ChunkName, buildTextures } from './textures';
import { ANAS, SpriteName, randomLook, renderHead, renderPlayer, renderSprite } from './sprites';

/** Generates all textures and sprites once, and exposes the tiling ones to CSS. */
@Injectable({ providedIn: 'root' })
export class PixelService {
  readonly tex = buildTextures();
  readonly player = renderPlayer(ANAS);
  private urls = new Map<string, string>();

  constructor() {
    const root = document.documentElement.style;
    const css = (name: string, canvas: HTMLCanvasElement) => root.setProperty(`--tex-${name}`, `url(${canvas.toDataURL()})`);
    for (const [name, canvas] of Object.entries(this.tex.chunks)) css(name, canvas);
    css('planks', this.tex.planks);
    css('button', this.tex.button);
    css('rail', this.tex.rail);
    css('dirt-block', this.tex.dirts[0]);
  }

  chunk(name: ChunkName): HTMLCanvasElement {
    return this.tex.chunks[name];
  }

  sprite(name: SpriteName, tint?: string): string {
    return this.cached(`${name}|${tint ?? ''}`, () => (name === 'grass' ? this.tex.grassSide : renderSprite(name, tint)));
  }

  /** `'self'` is the portfolio owner; numbers give deterministic random people. */
  head(who: 'self' | number): string {
    return this.cached(`head|${who}`, () => renderHead(who === 'self' ? ANAS : randomLook(who)));
  }

  private cached(key: string, make: () => HTMLCanvasElement): string {
    let url = this.urls.get(key);
    if (!url) {
      url = make().toDataURL();
      this.urls.set(key, url);
    }
    return url;
  }
}
