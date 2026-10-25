import { Component, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { education, languages, profile, stats } from '../data/portfolio';
import { RevealDirective } from '../ui/reveal.directive';
import { SpriteComponent } from '../ui/sprite.component';

@Component({
  selector: 'app-about',
  imports: [DecimalPipe, RevealDirective, SpriteComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
})
export class AboutComponent {
  pages = profile.about;
  page = signal(0);
  education = education;
  languages = languages;
  stats = stats;

  // Degree progress, shown as an XP bar.
  private start = new Date(education.start).getTime();
  private end = new Date(education.end).getTime();
  progress = Math.min(1, Math.max(0, (Date.now() - this.start) / (this.end - this.start)));
  year = Math.min(3, Math.floor((Date.now() - this.start) / (365.25 * 864e5)) + 1);
  xpSegments = Array.from({ length: 18 });

  turn(delta: number): void {
    this.page.update((p) => Math.min(this.pages.length - 1, Math.max(0, p + delta)));
  }
}
