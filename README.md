# Anas Riadh Azizi — Portfolio

Personal portfolio built with Angular 19.

## Develop

```bash
npm install
npm start        # http://localhost:4200
npm test
```

## How it works

The page is one voxel world you dig down through: each section is a deeper rock layer.
Every texture, sprite and the title lettering are generated in code (`src/app/pixel/`) — the site ships
zero image files.

- `src/app/world/world.component.ts` — the interactive surface: terrain, day/night sky, mining and placing blocks.
  Add `?time=day`, `?time=sunset` or `?time=night` to the URL to force the time of day.
- `src/app/world/layer.component.ts` — a section rendered as a rock layer, with a jagged edge into the one above.
- `src/app/data/world.ts` — the layer order, depth (Y level), texture and darkness of each section.
- `src/app/ui/hud.component.ts` — hotbar navigation (keys 1–9), Y-level readout, F3 debug screen, chat and toasts.

## Editing content

All text, projects, skills and links live in [`src/app/data/portfolio.ts`](src/app/data/portfolio.ts).
Components only render that data, so most updates are a one-file change.

**Project screenshots:** put the image in `public/projects/` (e.g. `public/projects/awa.jpg`) and set
`image: 'projects/awa.jpg'` on the project. It replaces the pixel icon inside the item frame.

**Project links:** set `repoUrl` and/or `liveUrl` on the project; "Source" / "Live demo" buttons appear automatically.

**Icons:** each project, job and skill group picks a sprite by name (`icon`) and an optional `tint` colour.
Available sprites are listed in `SpriteName` in `src/app/pixel/sprites.ts`.

## Deploy

Pushing to `main` (or `master`) runs `.github/workflows/deploy.yml`, which builds the site and publishes it
to GitHub Pages. One-time setup: in the GitHub repo go to **Settings → Pages** and set **Source** to
**GitHub Actions**.

The base path is derived from the repo name: a repo named `anasazx.github.io` is served at
`https://anasazx.github.io/`, any other name at `https://anasazx.github.io/<repo-name>/`.
