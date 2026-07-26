import Pool from '../utils/Pool.js';
import { PLATFORM } from '../config.js';

const TYPE_TEXTURES = {
  normal: 'plat_normal',
  wide: 'plat_wide',
  small: 'plat_small',
  moving_h: 'plat_moving',
  moving_v: 'plat_moving',
  ice: 'plat_ice',
  cloud: 'plat_cloud',
  spring: 'plat_spring',
  broken: 'plat_broken',
  launch: 'plat_launch',
};

export default class PlatformManager {
  constructor(scene, difficulty) {
    this.scene = scene;
    this.difficulty = difficulty;
    this.pool = new Pool(scene, 'plat_normal', 40);
    this.highestY = scene.cameras.main.height - 120; // world-space y of last spawned platform (lower = further down)
    this.active = [];
    this._seedInitial();
  }

  _seedInitial() {
    // guaranteed safe starting platform directly under the player
    this._spawnAt(this.scene.cameras.main.width / 2, this.highestY, 'wide');
    let y = this.highestY;
    for (let i = 0; i < 10; i++) {
      y -= Phaser.Math.Between(PLATFORM.minGapY, PLATFORM.maxGapY);
      this._spawnRandom(y);
    }
    this.highestY = y;
  }

  _pickType() {
    const d = this.difficulty;
    const r = Math.random();
    if (r < 0.06) return 'launch';
    if (r < 0.06 + d.iceChance) return 'ice';
    if (r < 0.06 + d.iceChance + d.brokenChance) return 'broken';
    if (r < 0.06 + d.iceChance + d.brokenChance + d.movingChance * 0.5) return 'moving_h';
    if (r < 0.06 + d.iceChance + d.brokenChance + d.movingChance) return 'moving_v';
    if (r < 0.75) return Math.random() < 0.5 ? 'normal' : 'cloud';
    if (r < 0.9) return 'wide';
    return 'small';
  }

  _spawnAt(x, y, type) {
    const tex = TYPE_TEXTURES[type];
    const p = this.pool.spawn(x, y, tex);
    if (!p) return null;
    if (!p.body) this.scene.physics.add.existing(p, false);
    p.body.setAllowGravity(false);
    p.body.setImmovable(true);
    p.body.setSize(p.width * 0.9, 16).setOffset(p.width * 0.05, 4);
    p.platformType = type;
    p.brokenTimer = null;
    p.moveRange = Phaser.Math.Between(80, 160);
    p.moveSpeed = Phaser.Math.FloatBetween(0.6, 1.3);
    p.moveOrigin = { x, y };
    p.moveDir = Math.random() < 0.5 ? 1 : -1;
    p.hasSpring = type === 'spring';
    p.consumed = false;
    p.setDepth(20);
    this.active.push(p);
    return p;
  }

  _spawnRandom(y) {
    const width = this.scene.cameras.main.width;
    const type = this._pickType();
    const margin = 90;
    const x = Phaser.Math.Between(margin, width - margin);
    return this._spawnAt(x, y, type);
  }

  /** Call every frame: spawns new platforms above the camera, recycles old ones below. */
  update(cameraTopY, cameraBottomY) {
    while (this.highestY > cameraTopY - PLATFORM.spawnAheadPx) {
      const gap = Phaser.Math.Between(PLATFORM.minGapY, PLATFORM.maxGapY) * this.difficulty.gapMultiplier;
      this.highestY -= gap;
      this._spawnRandom(this.highestY);
    }
    // recycle platforms well below the visible camera
    for (let i = this.active.length - 1; i >= 0; i--) {
      const p = this.active[i];
      if (p.y > cameraBottomY + 200) {
        this.pool.despawn(p);
        this.active.splice(i, 1);
        continue;
      }
      this._updateBehavior(p);
    }
  }

  _updateBehavior(p) {
    if (p.platformType === 'moving_h') {
      p.x += p.moveDir * p.moveSpeed * 2;
      if (Math.abs(p.x - p.moveOrigin.x) > p.moveRange) p.moveDir *= -1;
      p.body.updateFromGameObject();
    } else if (p.platformType === 'moving_v') {
      p.y += p.moveDir * p.moveSpeed * 1.4;
      if (Math.abs(p.y - p.moveOrigin.y) > p.moveRange * 0.6) p.moveDir *= -1;
      p.body.updateFromGameObject();
    }
  }

  /** Called by GameScene's collider callback when player lands on a platform. */
  onLand(platform, onBreak) {
    if (platform.platformType === 'broken' && !platform.consumed) {
      platform.consumed = true;
      this.scene.tweens.add({
        targets: platform, alpha: 0, y: platform.y + 20, duration: 260, delay: 120,
        onComplete: () => {
          const idx = this.active.indexOf(platform);
          if (idx >= 0) this.active.splice(idx, 1);
          this.pool.despawn(platform);
        },
      });
      if (onBreak) onBreak();
    }
  }

  isIce(platform) { return platform.platformType === 'ice'; }
  isSpring(platform) { return platform.platformType === 'spring' || platform.platformType === 'launch'; }
  isLaunch(platform) { return platform.platformType === 'launch'; }

  reset() {
    this.pool.clear();
    this.active = [];
    this.highestY = this.scene.cameras.main.height - 120;
    this._seedInitial();
  }
}
