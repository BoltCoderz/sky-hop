import Pool from '../utils/Pool.js';

const POWERUP_ICONS = ['rocket', 'magnet', 'shield', 'slowmo', 'doublecoin', 'megajump'];

export default class CollectibleManager {
  constructor(scene) {
    this.scene = scene;
    this.pool = new Pool(scene, 'coin', 50);
    this.active = [];
    this.magnetActive = false;
    this.doubleCoinsActive = false;
  }

  /** Called once per newly spawned platform to decide what floats above it. */
  maybeSpawnAbove(platform) {
    const roll = Math.random();
    let kind = null, texture = null, value = 0;
    if (roll < 0.45) { kind = 'coin'; texture = 'coin'; value = 1; }
    else if (roll < 0.55) { kind = 'gem'; texture = 'gem'; value = 1; }
    else if (roll < 0.62) { kind = 'star'; texture = 'star'; value = 5; }
    else if (roll < 0.70) {
      kind = 'powerup';
      const p = Phaser.Utils.Array.GetRandom(POWERUP_ICONS);
      texture = 'icon_' + p;
      value = p;
    } else {
      return; // nothing this platform
    }
    const x = platform.x + Phaser.Math.Between(-20, 20);
    const y = platform.y - 60;
    const obj = this.pool.spawn(x, y, texture);
    if (!obj) return;
    obj.kind = kind;
    obj.value = value;
    obj.setDepth(30);
    obj.collected = false;
    if (!obj.body) this.scene.physics.add.existing(obj, false);
    obj.body.setAllowGravity(false);
    obj.body.setCircle(obj.width * 0.4);
    this.scene.tweens.add({ targets: obj, y: y - 10, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    if (kind === 'gem' || kind === 'star') {
      this.scene.tweens.add({ targets: obj, angle: 360, duration: 1600, repeat: -1 });
    }
    this.active.push(obj);
  }

  update(playerSprite, cameraBottomY) {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const c = this.active[i];
      if (c.y > cameraBottomY + 200) {
        this.active.splice(i, 1);
        this.scene.tweens.killTweensOf(c);
        this.pool.despawn(c);
        continue;
      }
      if (this.magnetActive && !c.collected && (c.kind === 'coin' || c.kind === 'gem')) {
        const d = Phaser.Math.Distance.Between(c.x, c.y, playerSprite.x, playerSprite.y);
        if (d < 260) {
          this.scene.physics.moveToObject(c, playerSprite, 620);
        }
      }
    }
  }

  collect(obj) {
    if (obj.collected) return null;
    obj.collected = true;
    const info = { kind: obj.kind, value: obj.value };
    this.scene.tweens.killTweensOf(obj);
    this.scene.tweens.add({
      targets: obj, scale: 0, alpha: 0, duration: 160, ease: 'Back.easeIn',
      onComplete: () => {
        const idx = this.active.indexOf(obj);
        if (idx >= 0) this.active.splice(idx, 1);
        this.pool.despawn(obj);
      },
    });
    return info;
  }

  reset() {
    this.pool.clear();
    this.active = [];
    this.magnetActive = false;
    this.doubleCoinsActive = false;
  }
}
