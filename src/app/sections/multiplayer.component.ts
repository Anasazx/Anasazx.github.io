import { Component, inject } from '@angular/core';
import { profile } from '../data/portfolio';
import { PixelService } from '../pixel/pixel.service';
import { HudService } from '../ui/hud.service';
import { RevealDirective } from '../ui/reveal.directive';

@Component({
  selector: 'app-multiplayer',
  imports: [RevealDirective],
  templateUrl: './multiplayer.component.html',
  styleUrl: './multiplayer.component.css',
})
export class MultiplayerComponent {
  private hud = inject(HudService);
  profile = profile;
  icon = inject(PixelService).head('self');

  async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(profile.email);
      this.hud.say(`Copied ${profile.email} to clipboard`, { color: '#55ff55' });
    } catch {
      this.hud.say(`Couldn't copy — the address is ${profile.email}`, { color: '#ff5555' });
    }
  }

  joined(): void {
    this.hud.advance('contact', 'Multiplayer: say hello', 'envelope');
  }
}
