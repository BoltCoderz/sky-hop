import { CHARACTERS } from '../data/CharactersData.js';
import { WORLDS } from '../data/WorldsData.js';

// All visuals in Sky Hop are generated at runtime with Phaser's Graphics API
// and the Canvas texture API. This keeps the project 100% self-contained
// (no binary asset pipeline) while still giving every element a distinct,
// polished, rounded-cartoon look. Swap any of these for hand-authored art
// later by simply replacing the generated texture key with a loaded image.

function roundRect(g, x, y, w, h, r, color, alpha = 1) {
  g.fillStyle(color, alpha);
  g.fillRoundedRect(x, y, w, h, r);
}

/** Draws a cute face (eyes + mouth) centered in a box, per "face" style. */
function drawFace(g, cx, cy, size, style, accent) {
  const eyeY = cy - size * 0.05;
  const eyeDX = size * 0.18;
  const eyeR = size * 0.075;

  if (style === 'visor') {
    g.fillStyle(accent, 1);
    g.fillRoundedRect(cx - size * 0.28, eyeY - size * 0.09, size * 0.56, size * 0.18, size * 0.08);
    g.fillStyle(0xffffff, 0.85);
    g.fillCircle(cx - eyeDX * 0.4, eyeY, eyeR * 0.6);
    return;
  }
  if (style === 'alien') {
    g.fillStyle(0x0d0d1a, 1);
    g.fillEllipse(cx - eyeDX, eyeY, eyeR * 1.4, eyeR * 1.9);
    g.fillEllipse(cx + eyeDX, eyeY, eyeR * 1.4, eyeR * 1.9);
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(cx - eyeDX - 2, eyeY - 3, eyeR * 0.4);
    g.fillCircle(cx + eyeDX - 2, eyeY - 3, eyeR * 0.4);
    return;
  }
  if (style === 'patch') {
    g.fillStyle(0x0d0d1a, 1);
    g.fillCircle(cx + eyeDX, eyeY, eyeR);
    g.fillStyle(0x2b2b2b, 1);
    g.fillRect(cx - eyeDX - eyeR * 1.6, eyeY - eyeR * 0.5, eyeR * 3.2, eyeR);
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(cx + eyeDX - 2, eyeY - 2, eyeR * 0.35);
  } else {
    // 'cute' default
    g.fillStyle(0x0d0d1a, 1);
    g.fillCircle(cx - eyeDX, eyeY, eyeR);
    g.fillCircle(cx + eyeDX, eyeY, eyeR);
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(cx - eyeDX - 2, eyeY - 2, eyeR * 0.35);
    g.fillCircle(cx + eyeDX - 2, eyeY - 2, eyeR * 0.35);
  }
  // blush + smile shared by all
  g.fillStyle(0xff9bb0, 0.55);
  g.fillCircle(cx - size * 0.32, cy + size * 0.12, size * 0.07);
  g.fillCircle(cx + size * 0.32, cy + size * 0.12, size * 0.07);
  g.lineStyle(Math.max(2, size * 0.035), 0x0d0d1a, 1);
  g.beginPath();
  g.arc(cx, cy + size * 0.08, size * 0.16, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(160));
  g.strokePath();
}

function makeCharacterTexture(scene, key, size, body, accent, face) {
  const g = scene.add.graphics();
  const pad = 6;
  const w = size, h = size;
  // soft shadow
  g.fillStyle(0x000000, 0.15);
  g.fillEllipse(w / 2, h - pad, w * 0.55, h * 0.12);
  // body (rounded squarish blob)
  roundRect(g, pad, pad, w - pad * 2, h - pad * 2, size * 0.32, body);
  // belly patch
  g.fillStyle(accent, 0.25);
  g.fillEllipse(w / 2, h * 0.62, w * 0.42, h * 0.3);
  drawFace(g, w / 2, h * 0.42, size, face, accent);
  // little feet
  g.fillStyle(accent, 1);
  g.fillRoundedRect(w * 0.22, h - pad - 6, w * 0.18, 10, 5);
  g.fillRoundedRect(w * 0.60, h - pad - 6, w * 0.18, 10, 5);
  g.generateTexture(key, w, h);
  g.destroy();
}

function makeEyesClosedOverlay(scene, key, size, body) {
  // A thin strip matching the body color used to "blink" over the eyes.
  const g = scene.add.graphics();
  g.fillStyle(body, 1);
  g.fillRoundedRect(0, 0, size * 0.6, size * 0.12, size * 0.06);
  g.generateTexture(key, size * 0.6, size * 0.12);
  g.destroy();
}

function makePlatformTextures(scene) {
  const w = 130, h = 34;
  const defs = [
    { key: 'plat_normal',  color: 0x6fcf97, edge: 0x4fae76 },
    { key: 'plat_wide',    color: 0x6fcf97, edge: 0x4fae76, wMul: 1.6 },
    { key: 'plat_small',   color: 0x6fcf97, edge: 0x4fae76, wMul: 0.6 },
    { key: 'plat_moving',  color: 0xffb84f, edge: 0xdb922c },
    { key: 'plat_ice',     color: 0xaee9ff, edge: 0x7cc9e8 },
    { key: 'plat_cloud',   color: 0xffffff, edge: 0xe3ecf5 },
    { key: 'plat_spring',  color: 0xff6f91, edge: 0xd1476a },
    { key: 'plat_broken',  color: 0xc98b5e, edge: 0x9c6238 },
    { key: 'plat_launch',  color: 0xa06fff, edge: 0x7c4fd1 },
  ];
  for (const d of defs) {
    const pw = w * (d.wMul || 1);
    const g = scene.add.graphics();
    g.fillStyle(0x000000, 0.12);
    g.fillEllipse(pw / 2, h + 4, pw * 0.8, 10);
    roundRect(g, 0, 0, pw, h, 14, d.edge);
    roundRect(g, 0, 0, pw, h - 8, 14, d.color);
    // texture accents
    if (d.key === 'plat_ice') {
      g.fillStyle(0xffffff, 0.5);
      g.fillRoundedRect(6, 4, pw - 12, 5, 3);
    } else if (d.key === 'plat_cloud') {
      g.fillStyle(0xffffff, 1);
      g.fillCircle(pw * 0.25, h * 0.3, 12);
      g.fillCircle(pw * 0.5, h * 0.22, 14);
      g.fillCircle(pw * 0.75, h * 0.3, 12);
    } else if (d.key === 'plat_broken') {
      g.lineStyle(2, 0x7a4a2a, 0.8);
      g.beginPath();
      g.moveTo(pw * 0.3, 2); g.lineTo(pw * 0.4, h * 0.5); g.lineTo(pw * 0.25, h - 10);
      g.moveTo(pw * 0.65, 0); g.lineTo(pw * 0.6, h * 0.6); g.lineTo(pw * 0.75, h - 8);
      g.strokePath();
    } else if (d.key === 'plat_spring') {
      g.fillStyle(0xffd23f, 1);
      g.fillRoundedRect(pw / 2 - 14, -6, 28, 14, 6);
    } else if (d.key === 'plat_launch') {
      g.fillStyle(0xffd23f, 1);
      g.fillTriangle(pw / 2, -14, pw / 2 - 16, 4, pw / 2 + 16, 4);
    }
    g.generateTexture(d.key, pw, h + 10);
    g.destroy();
  }
}

function makeCollectibleTextures(scene) {
  // coin
  let g = scene.add.graphics();
  g.fillStyle(0xffd23f, 1); g.fillCircle(16, 16, 16);
  g.fillStyle(0xffe98a, 1); g.fillCircle(13, 13, 9);
  g.lineStyle(2, 0xd1a10f, 1); g.strokeCircle(16, 16, 15);
  g.generateTexture('coin', 32, 32); g.destroy();

  // gem
  g = scene.add.graphics();
  g.fillStyle(0x5ef2ff, 1);
  g.fillTriangle(16, 2, 30, 13, 16, 30);
  g.fillTriangle(16, 2, 2, 13, 16, 30);
  g.fillStyle(0xffffff, 0.55);
  g.fillTriangle(16, 4, 22, 13, 16, 18);
  g.generateTexture('gem', 32, 32); g.destroy();

  // star (bonus)
  g = scene.add.graphics();
  g.fillStyle(0xffffff, 1);
  drawStar(g, 16, 16, 5, 16, 7);
  g.generateTexture('star', 32, 32); g.destroy();

  // power-up icons: rocket, magnet, shield, slowmo, doublecoin, megajump
  const icons = {
    rocket: 0xff6f4f, magnet: 0xff8a3d,
    shield: 0x4fd1ff, slowmo: 0xa06fff, doublecoin: 0xffd23f, megajump: 0x6fcf97,
  };
  for (const [name, color] of Object.entries(icons)) {
    g = scene.add.graphics();
    g.fillStyle(0xffffff, 1); g.fillCircle(20, 20, 20);
    g.lineStyle(3, color, 1); g.strokeCircle(20, 20, 19);
    g.fillStyle(color, 1);
    if (name === 'rocket') {
      g.fillTriangle(20, 6, 12, 30, 28, 30);
      g.fillStyle(0xffffff, 1); g.fillCircle(20, 18, 4);
    } else if (name === 'magnet') {
      g.fillRoundedRect(12, 10, 6, 18, 3);
      g.fillRoundedRect(22, 10, 6, 18, 3);
      g.fillRoundedRect(12, 10, 16, 6, 3);
    } else if (name === 'shield') {
      g.fillTriangle(20, 8, 30, 14, 20, 32);
      g.fillTriangle(20, 8, 10, 14, 20, 32);
    } else if (name === 'slowmo') {
      g.fillCircle(20, 20, 9);
      g.fillStyle(0xffffff, 1);
      g.fillRect(19, 12, 2, 8);
      g.fillRect(20, 19, 7, 2);
    } else if (name === 'doublecoin') {
      g.fillCircle(16, 20, 8);
      g.fillCircle(24, 20, 8);
    } else if (name === 'megajump') {
      g.fillTriangle(20, 8, 12, 22, 28, 22);
      g.fillRect(16, 22, 8, 8);
    }
    g.generateTexture('icon_' + name, 40, 40); g.destroy();
  }

  // particles
  g = scene.add.graphics();
  g.fillStyle(0xffffff, 1); g.fillCircle(6, 6, 6);
  g.generateTexture('particle_circle', 12, 12); g.destroy();

  g = scene.add.graphics();
  g.fillStyle(0xffffff, 1); drawStar(g, 8, 8, 4, 8, 3);
  g.generateTexture('particle_star', 16, 16); g.destroy();
}

function drawStar(g, cx, cy, points, outerR, innerR) {
  const step = Math.PI / points;
  g.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = i * step - Math.PI / 2;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
  }
  g.closePath();
  g.fillPath();
}

function makeEnemyTextures(scene) {
  const defs = [
    { key: 'enemy_bat',    color: 0x6a4fd1, size: 44 },
    { key: 'enemy_bee',    color: 0xffd23f, size: 40 },
    { key: 'enemy_ghost',  color: 0xe8e8ff, size: 44 },
    { key: 'enemy_fireball', color: 0xff6f3d, size: 40 },
    { key: 'enemy_saw',    color: 0xb0b0b0, size: 46 },
    { key: 'enemy_spikes', color: 0xff4d4d, size: 60 },
    { key: 'enemy_robot',  color: 0x8fa1b3, size: 46 },
  ];
  for (const d of defs) {
    const g = scene.add.graphics();
    const s = d.size;
    if (d.key === 'enemy_bat') {
      g.fillStyle(d.color, 1);
      g.fillTriangle(2, s * 0.3, s * 0.35, s * 0.15, s * 0.35, s * 0.55);
      g.fillTriangle(s - 2, s * 0.3, s * 0.65, s * 0.15, s * 0.65, s * 0.55);
      g.fillEllipse(s / 2, s * 0.45, s * 0.32, s * 0.3);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(s * 0.42, s * 0.42, 3); g.fillCircle(s * 0.58, s * 0.42, 3);
    } else if (d.key === 'enemy_bee') {
      g.fillStyle(0xffffff, 0.6); g.fillEllipse(s * 0.25, s * 0.3, s * 0.3, s * 0.18);
      g.fillEllipse(s * 0.75, s * 0.3, s * 0.3, s * 0.18);
      g.fillStyle(d.color, 1); g.fillEllipse(s / 2, s * 0.55, s * 0.4, s * 0.34);
      g.fillStyle(0x2b2b2b, 1);
      g.fillRect(s * 0.3, s * 0.42, s * 0.4, 6);
      g.fillRect(s * 0.3, s * 0.58, s * 0.4, 6);
      g.fillCircle(s * 0.44, s * 0.48, 3); g.fillCircle(s * 0.58, s * 0.48, 3);
    } else if (d.key === 'enemy_ghost') {
      g.fillStyle(d.color, 0.9);
      g.fillEllipse(s / 2, s * 0.42, s * 0.5, s * 0.5);
      g.fillRect(s * 0.14, s * 0.42, s * 0.72, s * 0.35);
      for (let i = 0; i < 4; i++) {
        g.fillTriangle(s * 0.14 + i * (s * 0.18), s * 0.77, s * 0.14 + i * (s * 0.18) + s * 0.09, s * 0.9, s * 0.14 + (i + 1) * (s * 0.18), s * 0.77);
      }
      g.fillStyle(0x333366, 1);
      g.fillCircle(s * 0.4, s * 0.42, 3); g.fillCircle(s * 0.6, s * 0.42, 3);
    } else if (d.key === 'enemy_fireball') {
      g.fillStyle(0xffd23f, 1); g.fillCircle(s / 2, s / 2, s * 0.42);
      g.fillStyle(d.color, 1); g.fillCircle(s / 2, s * 0.55, s * 0.3);
      g.fillStyle(0xffffff, 1); g.fillCircle(s / 2, s * 0.55, s * 0.12);
    } else if (d.key === 'enemy_saw') {
      g.fillStyle(d.color, 1);
      drawStar(g, s / 2, s / 2, 8, s * 0.48, s * 0.32);
      g.fillStyle(0x5a5a5a, 1); g.fillCircle(s / 2, s / 2, s * 0.16);
    } else if (d.key === 'enemy_spikes') {
      g.fillStyle(d.color, 1);
      for (let i = 0; i < 5; i++) {
        g.fillTriangle(i * (s / 5), s, i * (s / 5) + s / 10, s * 0.15, (i + 1) * (s / 5), s);
      }
    } else if (d.key === 'enemy_robot') {
      g.fillStyle(d.color, 1); g.fillRoundedRect(s * 0.15, s * 0.2, s * 0.7, s * 0.6, 8);
      g.fillStyle(0xff4d4d, 1); g.fillCircle(s * 0.36, s * 0.45, 5); g.fillCircle(s * 0.64, s * 0.45, 5);
      g.fillStyle(0x5a6b7a, 1); g.fillRect(s * 0.4, s * 0.05, s * 0.2, s * 0.15);
    }
    g.generateTexture(d.key, s, s);
    g.destroy();
  }
}

function makeHazardTextures(scene) {
  let g = scene.add.graphics();
  g.fillStyle(0x8a7a6a, 1);
  drawStar(g, 20, 20, 6, 18, 10);
  g.generateTexture('hazard_rock', 40, 40); g.destroy();

  g = scene.add.graphics();
  g.fillStyle(0xffd23f, 1);
  g.fillTriangle(20, 0, 10, 24, 22, 24);
  g.fillTriangle(22, 20, 14, 44, 30, 22);
  g.generateTexture('hazard_lightning', 40, 44); g.destroy();
}

/** Vertical gradient sky texture for a world, drawn on an offscreen canvas. */
function makeSkyTexture(scene, world) {
  const key = 'sky_' + world.id;
  if (scene.textures.exists(key)) return;
  const w = 64, h = 512;
  const tex = scene.textures.createCanvas(key, w, h);
  const ctx = tex.getContext();
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, Phaser.Display.Color.IntegerToColor(world.sky[0]).rgba);
  grad.addColorStop(1, Phaser.Display.Color.IntegerToColor(world.sky[1]).rgba);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  tex.refresh();
}

function makeUiTextures(scene) {
  // rounded button base + panel
  let g = scene.add.graphics();
  roundRect(g, 0, 0, 400, 100, 26, 0xffffff);
  g.generateTexture('ui_panel', 400, 100); g.destroy();

  g = scene.add.graphics();
  g.fillStyle(0x000000, 0.25);
  g.fillRoundedRect(0, 6, 300, 90, 24);
  g.fillStyle(0xff8a3d, 1);
  g.fillRoundedRect(0, 0, 300, 90, 24);
  g.fillStyle(0xffffff, 0.18);
  g.fillRoundedRect(10, 8, 280, 30, 16);
  g.generateTexture('ui_button', 300, 90); g.destroy();

  g = scene.add.graphics();
  g.fillStyle(0xffffff, 0.9);
  g.fillRoundedRect(0, 0, 220, 60, 18);
  g.generateTexture('ui_pill', 220, 60); g.destroy();

  // cloud decoration for parallax
  g = scene.add.graphics();
  g.fillStyle(0xffffff, 0.9);
  g.fillEllipse(30, 24, 34, 20);
  g.fillEllipse(60, 20, 30, 18);
  g.fillEllipse(90, 26, 34, 18);
  g.generateTexture('deco_cloud', 120, 44); g.destroy();

  g = scene.add.graphics();
  g.fillStyle(0xffffff, 0.9);
  drawStar(g, 8, 8, 4, 7, 3);
  g.generateTexture('deco_star', 16, 16); g.destroy();
}

/** Call once from PreloadScene. Generates every texture the game needs. */
export function generateAllTextures(scene) {
  for (const c of CHARACTERS) {
    makeCharacterTexture(scene, 'char_' + c.id, 96, c.body, c.accent, c.face);
    makeEyesClosedOverlay(scene, 'char_' + c.id + '_blink', 96, c.body);
  }
  makePlatformTextures(scene);
  makeCollectibleTextures(scene);
  makeEnemyTextures(scene);
  makeHazardTextures(scene);
  makeUiTextures(scene);
  for (const w of WORLDS) makeSkyTexture(scene, w);
}
