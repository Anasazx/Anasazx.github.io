import { Component, ElementRef, HostListener, signal, viewChild } from '@angular/core';
import { experience } from '../data/portfolio';
import { RevealDirective } from '../ui/reveal.directive';
import { SpriteComponent } from '../ui/sprite.component';

@Component({
  selector: 'app-quests',
  imports: [RevealDirective, SpriteComponent],
  templateUrl: './quests.component.html',
  styleUrl: './quests.component.css',
})
export class QuestsComponent {
  experience = experience;
  private rail = viewChild.required<ElementRef<HTMLElement>>('rail');
  /** 0–1: how far the minecart has travelled down the rail. */
  cart = signal(0);

  @HostListener('window:scroll')
  onScroll(): void {
    const rect = this.rail().nativeElement.getBoundingClientRect();
    const t = (window.innerHeight * 0.55 - rect.top) / Math.max(1, rect.height);
    this.cart.set(Math.min(1, Math.max(0, t)));
  }
}
