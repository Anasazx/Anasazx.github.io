import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, computed, inject, input, viewChild } from '@angular/core';
import { layers } from '../data/world';
import { PixelService } from '../pixel/pixel.service';
import { mulberry32 } from '../pixel/util';
import { RevealDirective } from '../ui/reveal.directive';

/** A page section rendered as one layer of rock, with a jagged edge into the layer above. */
@Component({
  selector: 'app-layer',
  imports: [RevealDirective],
  template: `
    <section
      class="layer"
      [id]="layer()"
      [style.--layer-tex]="'var(--tex-' + info().texture + ')'"
      [style.--layer-shade]="info().shade"
    >
      <canvas #edge class="layer__edge" aria-hidden="true"></canvas>
      <div class="container layer__inner">
        @if (heading()) {
          <header class="layer__header" appReveal>
            <p class="layer__kicker">
              <span class="layer__y">Y {{ info().y }}</span> {{ kicker() }}
            </p>
            <h2 class="layer__title sh">{{ heading() }}</h2>
            @if (lead()) {
              <p class="layer__lead sh">{{ lead() }}</p>
            }
          </header>
        }
        <ng-content />
      </div>
    </section>
  `,
  styleUrl: './layer.component.css',
})
export class LayerComponent implements AfterViewInit, OnDestroy {
  private px = inject(PixelService);
  private zone = inject(NgZone);
  private edge = viewChild.required<ElementRef<HTMLCanvasElement>>('edge');

  layer = input.required<string>();
  kicker = input('');
  heading = input('');
  lead = input('');

  info = computed(() => layers.find((l) => l.id === this.layer())!);
  private above = computed(() => layers[layers.findIndex((l) => l.id === this.layer()) - 1]);
  private ro?: ResizeObserver;

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.ro = new ResizeObserver(() => this.drawEdge());
      this.ro.observe(this.edge().nativeElement.parentElement!);
    });
  }

  ngOnDestroy(): void {
    this.ro?.disconnect();
  }

  /** Paints a ragged row of blocks from the layer above over the top of this one. */
  private drawEdge(): void {
    const above = this.above();
    if (!above) return;
    const canvas = this.edge().nativeElement;
    const width = canvas.parentElement!.clientWidth;
    const bs = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bs')) || 64;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cols = Math.ceil(width / bs);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(bs * 2 * dpr);
    canvas.style.height = `${bs * 2}px`;
    const ctx = canvas.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    const chunk = this.px.chunk(above.texture);
    const rand = mulberry32(above.y * 31 + 7);
    for (let c = 0; c < cols; c++) {
      const depth = [0, 1, 1, 1, 2][Math.floor(rand() * 5)];
      for (let r = 0; r < depth; r++) {
        ctx.drawImage(chunk, (c % 8) * 16, (r % 8) * 16, 16, 16, c * bs, r * bs, bs, bs);
        ctx.fillStyle = `rgba(0,0,0,${above.shade})`;
        ctx.fillRect(c * bs, r * bs, bs, bs);
      }
    }
  }
}
