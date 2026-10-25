import { Component, computed, inject, input } from '@angular/core';
import { PixelService } from '../pixel/pixel.service';
import { SpriteName } from '../pixel/sprites';

@Component({
  selector: 'app-sprite',
  template: `<img [src]="url()" [width]="size()" [height]="size()" alt="" draggable="false" />`,
  styles: `
    :host {
      display: inline-flex;
      flex-shrink: 0;
    }
    img {
      image-rendering: pixelated;
      display: block;
    }
  `,
})
export class SpriteComponent {
  private px = inject(PixelService);
  name = input.required<SpriteName>();
  tint = input<string>();
  size = input(32);
  url = computed(() => this.px.sprite(this.name(), this.tint()));
}
