import { Component, inject } from '@angular/core';
import { profile } from './data/portfolio';
import { PixelService } from './pixel/pixel.service';
import { AboutComponent } from './sections/about.component';
import { AdvancementsComponent } from './sections/advancements.component';
import { BuildsComponent } from './sections/builds.component';
import { InventoryComponent } from './sections/inventory.component';
import { MultiplayerComponent } from './sections/multiplayer.component';
import { QuestsComponent } from './sections/quests.component';
import { HudComponent } from './ui/hud.component';
import { LayerComponent } from './world/layer.component';
import { WorldComponent } from './world/world.component';

@Component({
  selector: 'app-root',
  imports: [
    WorldComponent,
    LayerComponent,
    AboutComponent,
    QuestsComponent,
    BuildsComponent,
    AdvancementsComponent,
    InventoryComponent,
    MultiplayerComponent,
    HudComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  // Generate textures up front so CSS variables exist before any section renders.
  private px = inject(PixelService);
  profile = profile;
  year = new Date().getFullYear();

  respawn(): void {
    window.scrollTo({ top: 0 });
  }
}
