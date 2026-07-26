import { POWERUPS } from './PowerUp.js';

export default class PowerUpManager {
  constructor(scene, player, collectibles, enemies) {
    this.scene = scene;
    this.player = player;
    this.collectibles = collectibles;
    this.enemies = enemies;
    this.active = {}; // id -> { endsAt }
    this.rocketBoosting = false;
  }

  activate(id) {
    const def = POWERUPS[id];
    if (!def) return;
    this.scene.audioManager.play('powerup');
    this.scene.missionManager.report('rockets', id === 'rocket' ? 1 : 0);

    if (id === 'shield') {
      this.player.activateShield();
      this.active.shield = { endsAt: Infinity };
      return;
    }
    if (id === 'magnet') this.collectibles.magnetActive = true;
    if (id === 'doublecoin') this.collectibles.doubleCoinsActive = true;
    if (id === 'slowmo') this.enemies.slowMoActive = true;
    if (id === 'rocket') {
      this.rocketBoosting = true;
      this.player.sprite.body.setAllowGravity(false);
      this.player.sprite.body.setVelocityY(-900);
      this.player.trail.emitting = true;
    }
    if (id === 'megajump') this.player.megaJumpTimer = def.duration;

    this.active[id] = { endsAt: this.scene.time.now + def.duration };
  }

  update() {
    const now = this.scene.time.now;
    for (const id of Object.keys(this.active)) {
      if (id === 'shield') continue; // handled by hit consumption
      if (now >= this.active[id].endsAt) {
        this._deactivate(id);
        delete this.active[id];
      }
    }
    if (this.rocketBoosting) {
      this.player.sprite.body.setVelocityY(-900);
    }
  }

  _deactivate(id) {
    if (id === 'magnet') this.collectibles.magnetActive = false;
    if (id === 'doublecoin') this.collectibles.doubleCoinsActive = false;
    if (id === 'slowmo') this.enemies.slowMoActive = false;
    if (id === 'rocket') {
      this.rocketBoosting = false;
      this.player.sprite.body.setAllowGravity(true);
    }
  }

  consumeShieldIfActive() {
    if (this.active.shield) {
      delete this.active.shield;
      this.player.consumeShield();
      this.scene.audioManager.play('shield');
      return true;
    }
    return false;
  }

  /** For HUD icon list: [{id, remainingPct}] */
  getStatuses() {
    const now = this.scene.time.now;
    return Object.entries(this.active).map(([id, v]) => {
      const def = POWERUPS[id];
      const pct = v.endsAt === Infinity ? 1 : Phaser.Math.Clamp((v.endsAt - now) / def.duration, 0, 1);
      return { id, icon: def.icon, pct };
    });
  }

  reset() {
    for (const id of Object.keys(this.active)) this._deactivate(id);
    this.active = {};
    this.rocketBoosting = false;
  }
}
