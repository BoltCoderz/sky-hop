# Sky Hop

An endless vertical jumper built with Phaser 3 for YouTube Playables. Pure
HTML/CSS/ES6 — no build step, no backend, no accounts. All progress is saved
locally via `localStorage`.

## Running it

Because the game uses native ES6 modules (`<script type="module">`), it must
be served over HTTP — opening `index.html` directly via `file://` will be
blocked by the browser's module CORS policy. Any static server works:

```bash
# from the project root
python3 -m http.server 8080
# then open http://localhost:8080
```

Any other static host (Vite preview, `npx serve`, nginx, the YouTube
Playables upload pipeline itself, etc.) works identically — there is no
server-side logic anywhere in this project.

## Folder structure

```
sky-hop/
├─ index.html            # entry point, loads Phaser from CDN + js/main.js
├─ css/style.css          # full-bleed, letterboxed canvas container
└─ js/
   ├─ main.js             # Phaser.Game config, Scale.FIT setup, scene list
   ├─ config.js           # tunable constants (physics, difficulty, colors)
   ├─ scenes/             # Boot, Preload, MainMenu, CharacterSelect, Shop,
   │                       Settings, DailyChallenge, Statistics, Credits,
   │                       Game, GameOver
   ├─ managers/           # SaveManager, AudioManager, DifficultyManager,
   │                       AchievementManager, MissionManager
   ├─ entities/           # Player, PlatformManager, CollectibleManager,
   │                       EnemyManager, PowerUp(Manager)
   ├─ ui/                 # Button, HUD, ComboText — shared UI prefabs
   ├─ utils/              # Pool (object pooling), TextureGenerator
   │                       (procedural art), Helpers (parallax bg, haptics)
   └─ data/               # Characters, Worlds, Missions, Achievements,
                            Trails — plain data tables, no logic
```

## Asset list

**Every visual and every sound in this build is generated at runtime** —
there is no binary art or audio pipeline to manage, version, or optimize for
file size. This is intentional: it keeps the whole game inside pure
JS/HTML/CSS as specified, with zero load time and zero broken-asset risk.

### Generated textures (`js/utils/TextureGenerator.js`)
- 10 character sprites + matching "blink" overlays (`char_<id>`, `char_<id>_blink`)
- 9 platform types (`plat_normal`, `plat_wide`, `plat_small`, `plat_moving`,
  `plat_ice`, `plat_cloud`, `plat_spring`, `plat_broken`, `plat_launch`)
- Collectibles: `coin`, `gem`, `star`
- 6 power-up icons (`icon_rocket`, `icon_magnet`, `icon_shield`,
  `icon_slowmo`, `icon_doublecoin`, `icon_megajump`)
- 7 enemy sprites (`enemy_bat`, `enemy_bee`, `enemy_ghost`, `enemy_fireball`,
  `enemy_saw`, `enemy_spikes`, `enemy_robot`)
- 2 hazards (`hazard_rock`, `hazard_lightning`)
- 2 particle textures (`particle_circle`, `particle_star`)
- UI chrome (`ui_panel`, `ui_button`, `ui_pill`, `deco_cloud`, `deco_star`)
- 7 world sky gradients (`sky_grassland`, `sky_skykingdom`, `sky_cloudcity`,
  `sky_nightsky`, `sky_space`, `sky_rainbow`, `sky_candy`)

To swap in hand-authored art later: replace the relevant `generateTexture`
call with a normal `this.load.image()`/atlas load in `PreloadScene`, keeping
the same texture key so nothing else in the codebase needs to change.

### Synthesized audio (`js/managers/AudioManager.js`)
All 15 requested SFX (jump, land, coin, gem, powerup, enemy hit, button
click, unlock, combo, explosion, rocket, shield, countdown, high score,
spring/break) plus 4 generative music beds (menu, gameplay, game over,
victory) are built from Web Audio oscillators with simple envelopes — no
`.mp3`/`.ogg` files, no licensing concerns, no loading time. Swap
`AudioManager.play()`/`playMusic()` internals for `scene.sound.add(key).play()`
once real recorded audio is available; the call sites elsewhere in the game
never change.

## Design decisions & scope notes

A few places where I made a deliberate, documented choice rather than
guessing silently:

- **10 characters, not 20** — each is fully implemented (idle, jump, land,
  blink, death, unlock, coin-priced) and the roster is a plain data table
  (`data/CharactersData.js`), so adding 10 more is a copy-paste-and-tune
  exercise, not new engineering.
- **Worlds unlock automatically by height** rather than being purchasable in
  the shop, matching "Unlock by score" in the brief; the shop instead sells
  cosmetic trail colors and a gem→coin exchange, which is where "unlock
  cosmetics" naturally lives without duplicating the world system.
- **Camera-follow "never move downward"** is implemented as a monotonically
  non-increasing scroll value (see `GameScene.update`), not a hard camera
  lock, so the easing still feels smooth rather than snapping.
- **Difficulty ramp was rebalanced during QA**: the original gap-growth curve
  combined with the initial jump velocity made the hardest tier
  mathematically unreachable (max platform gap exceeded the player's jump
  apex). Jump velocity and the gap-multiplier cap were tuned together so the
  hardest tier always stays clearable — see the comments in `config.js` and
  `DifficultyManager.js`.

## Optimization notes

- **Object pooling everywhere**: platforms, collectibles, enemies, and
  hazards all recycle through `utils/Pool.js` (a thin wrapper over
  `Phaser.GameObjects.Group` with `maxSize`). Nothing is `destroy()`'d during
  normal gameplay — objects are deactivated/hidden and their Arcade physics
  body is reused, not recreated, avoiding both GC churn and repeated
  `physics.add.existing()` calls.
- **One-way platform collisions** use a `processCallback` that only allows
  collision resolution while the player is falling and above the platform,
  so ascending through platforms from below costs nothing extra and never
  needs raycasting.
- **Aggressive despawn radius**: anything more than ~200px below the camera
  is recycled immediately; anything not yet within `PLATFORM.spawnAheadPx`
  of the camera top isn't generated yet — the active object count stays
  roughly constant regardless of run length.
- **No spritesheet animation frames** — character "animation" is entirely
  tween-driven (squash/stretch, blink overlay, tilt, rotation), which avoids
  the draw-call and memory overhead of per-character animation atlases while
  still reading as juicy and responsive.
- **Procedural textures are generated once** in `PreloadScene` and cached in
  the texture manager for the life of the page — there is no per-frame
  texture regeneration anywhere.
- **Scale.FIT** resizes/repositions the canvas without ever tearing down and
  rebuilding the scene graph, so rotating a device or resizing a window
  never causes a hitch or state loss.

## Future expansion suggestions

- Swap procedural textures/audio for hand-authored assets via texture
  atlases (the texture-key contract is already in place, see Asset List).
- Add a lightweight remote leaderboard once a backend is allowed (today it's
  intentionally local-only per the "no accounts / no backend" requirement).
- Expand the character roster to the full 20 and add a second animation
  layer (e.g. a cape/trail cosmetic slot) using the same data-table pattern.
- Add controller/gamepad support for platforms where that's relevant.
- A "ghost replay" of the player's own best run as a visual pacer.
