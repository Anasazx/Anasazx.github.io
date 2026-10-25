import { Component, HostListener, signal } from '@angular/core';
import { Skill, SkillGroup, skills } from '../data/portfolio';
import { RevealDirective } from '../ui/reveal.directive';
import { SpriteComponent } from '../ui/sprite.component';

interface Hover {
  skill: Skill;
  group: SkillGroup;
  x: number;
  y: number;
}

const ROW = 9;

@Component({
  selector: 'app-inventory',
  imports: [RevealDirective, SpriteComponent],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css',
})
export class InventoryComponent {
  groups = skills.map((g) => ({ ...g, empty: Array.from({ length: Math.max(0, ROW - g.items.length) }) }));
  list = signal(false);
  hover = signal<Hover | null>(null);
  total = skills.reduce((n, g) => n + g.items.length, 0);

  id(skill: Skill): string {
    return 'anas:' + skill.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  }

  show(event: MouseEvent | FocusEvent, skill: Skill, group: SkillGroup): void {
    let x: number;
    let y: number;
    if (event instanceof MouseEvent && event.type === 'mousemove') {
      x = event.clientX + 16;
      y = event.clientY - 30;
    } else {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      x = rect.right + 6;
      y = rect.top - 6;
    }
    // Keep the tooltip on screen.
    x = Math.min(x, window.innerWidth - 260);
    this.hover.set({ skill, group, x: Math.max(8, x), y: Math.max(8, y) });
  }

  hide(): void {
    this.hover.set(null);
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (this.hover()) this.hide();
  }
}
