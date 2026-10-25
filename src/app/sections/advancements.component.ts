import { Component, inject } from '@angular/core';
import { awards, leadership } from '../data/portfolio';
import { PixelService } from '../pixel/pixel.service';
import { RevealDirective } from '../ui/reveal.directive';
import { SpriteComponent } from '../ui/sprite.component';

@Component({
  selector: 'app-advancements',
  imports: [RevealDirective, SpriteComponent],
  templateUrl: './advancements.component.html',
  styleUrl: './advancements.component.css',
})
export class AdvancementsComponent {
  private px = inject(PixelService);
  awards = awards;
  leadership = leadership;
  /** One generated face per club member. */
  members = Array.from({ length: leadership.members }, (_, i) => this.px.head(i === 0 ? 'self' : i * 977));
}
