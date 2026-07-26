import { WORLDS, worldForScore } from '../data/WorldsData.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

/** Scrolling sky + decorative parallax layer that smoothly swaps world theme
 *  as the player's height crosses each world's unlock threshold. */
export class ParallaxBackground {
  constructor(scene) {
    this.scene = scene;
    this.currentWorld = WORLDS[0];
    this.sky = scene.add.tileSprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 'sky_' + this.currentWorld.id);
    this.sky.setScrollFactor(0).setDepth(-10);

    this.decor = scene.add.group();
    for (let i = 0; i < 8; i++) {
      const deco = scene.add.image(
        Phaser.Math.Between(40, GAME_WIDTH - 40),
        Phaser.Math.Between(-GAME_HEIGHT, GAME_HEIGHT),
        Math.random() < 0.6 ? 'deco_cloud' : 'deco_star',
      );
      deco.setAlpha(0.7).setScale(Phaser.Math.FloatBetween(0.5, 1.1)).setDepth(-5);
      deco.parallax = Phaser.Math.FloatBetween(0.2, 0.5);
      this.decor.add(deco);
    }
    this.weatherEmitter = null;
  }

  setWeather(scene, kind) {
    if (this.weatherEmitter) { this.weatherEmitter.destroy(); this.weatherEmitter = null; }
    if (kind === 'none') return;
    const cfg = {
      rain: { texture: 'particle_circle', speedY: [500, 700], scale: 0.25, tint: 0x8fd3ff, freq: 20 },
      snow: { texture: 'particle_circle', speedY: [80, 160], scale: 0.4, tint: 0xffffff, freq: 60 },
      meteor: { texture: 'particle_star', speedY: [700, 900], scale: 0.6, tint: 0xffd23f, freq: 300 },
    }[kind];
    if (!cfg) return;
    this.weatherEmitter = scene.add.particles(0, 0, cfg.texture, {
      x: { min: 0, max: GAME_WIDTH },
      y: -20,
      speedY: { min: cfg.speedY[0], max: cfg.speedY[1] },
      speedX: kind === 'rain' ? { min: -40, max: -10 } : { min: -20, max: 20 },
      scale: cfg.scale,
      tint: cfg.tint,
      alpha: { start: 0.8, end: 0.1 },
      lifespan: 2200,
      frequency: cfg.freq,
      scrollFactorX: 0,
      scrollFactorY: 0,
    });
    this.weatherEmitter.setDepth(-3);
  }

  /** cameraY = current scroll (negative as camera rises); heightScore = climbed height */
  update(cameraY, heightScore) {
    this.sky.tilePositionY = cameraY * 0.15;
    this.sky.y = GAME_HEIGHT / 2 + cameraY;

    this.decor.getChildren().forEach(d => {
      d.y = ((d.y - cameraY * d.parallax) % (GAME_HEIGHT * 2) + GAME_HEIGHT * 2) % (GAME_HEIGHT * 2) - GAME_HEIGHT / 2 + cameraY;
    });

    const w = worldForScore(heightScore);
    if (w.id !== this.currentWorld.id) {
      this.currentWorld = w;
      this.scene.tweens.add({
        targets: this.sky, alpha: 0, duration: 400,
        onComplete: () => { this.sky.setTexture('sky_' + w.id); this.sky.setAlpha(1); },
      });
    }
  }

  destroy() {
    this.sky.destroy();
    this.decor.clear(true, true);
    if (this.weatherEmitter) this.weatherEmitter.destroy();
  }
}

export function vibrate(save, pattern = 20) {
  if (save.data.settings.hapticOn && navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch (e) { /* ignore unsupported */ }
  }
}

export function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(Math.floor(n));
}
