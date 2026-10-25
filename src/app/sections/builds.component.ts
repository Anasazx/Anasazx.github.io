import { Component, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Project, projects } from '../data/portfolio';
import { PixelService } from '../pixel/pixel.service';
import { RevealDirective } from '../ui/reveal.directive';
import { SpriteComponent } from '../ui/sprite.component';

@Component({
  selector: 'app-builds',
  imports: [NgTemplateOutlet, RevealDirective, SpriteComponent],
  templateUrl: './builds.component.html',
  styleUrl: './builds.component.css',
})
export class BuildsComponent {
  private px = inject(PixelService);
  featured = projects.filter((p) => p.featured);
  others = projects.filter((p) => !p.featured);

  /** Used as a CSS mask so the enchantment glint only covers the sprite's pixels. */
  mask(p: Project): string {
    return `url(${this.px.sprite(p.icon, p.tint)})`;
  }
}
