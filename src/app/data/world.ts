import { ChunkName } from '../pixel/textures';
import { SpriteName } from '../pixel/sprites';

/** Each page section is a layer of the world, from the surface down to bedrock. */
export interface Layer {
  id: string;
  y: number;
  name: string;
  texture: ChunkName;
  /** Darkness over the texture, 0–1. Deeper layers are darker. */
  shade: number;
  hotbar?: { label: string; icon: SpriteName; tint?: string };
}

export const layers: Layer[] = [
  { id: 'surface', y: 72, name: 'Surface', texture: 'dirt', shade: 0, hotbar: { label: 'Surface', icon: 'grass' } },
  { id: 'about', y: 62, name: 'Dirt layer', texture: 'dirt', shade: 0.42, hotbar: { label: 'About', icon: 'book' } },
  {
    id: 'experience',
    y: 40,
    name: 'Stone layer',
    texture: 'stone',
    shade: 0.5,
    hotbar: { label: 'Experience', icon: 'pickaxe' },
  },
  { id: 'projects', y: 12, name: 'Ore veins', texture: 'stone-rich', shade: 0.55, hotbar: { label: 'Projects', icon: 'chest' } },
  { id: 'awards', y: -16, name: 'Deepslate', texture: 'deepslate', shade: 0.5, hotbar: { label: 'Awards', icon: 'trophy' } },
  {
    id: 'skills',
    y: -40,
    name: 'Diamond level',
    texture: 'deepslate-rich',
    shade: 0.55,
    hotbar: { label: 'Skills', icon: 'diamond' },
  },
  { id: 'contact', y: -56, name: 'Deep dark', texture: 'deep-dark', shade: 0.45, hotbar: { label: 'Contact', icon: 'envelope' } },
  { id: 'bedrock', y: -64, name: 'Bedrock', texture: 'bedrock', shade: 0.3 },
];
