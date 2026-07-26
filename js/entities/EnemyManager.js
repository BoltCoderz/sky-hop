import Pool from '../utils/Pool.js';

const ENEMY_DEFS = {
  bat:    { texture: 'enemy_bat',    pattern: 'horizontal', speed: 90 },
  bee:    { texture: 'enemy_bee',    pattern: 'random',     speed: 70 },
  ghost:  { texture: 'enemy_ghost',  pattern: 'vertical',   speed: 60 },
  fireball:{ texture: 'enemy_fireball', pattern: 'circular', speed: 110 },
  saw:    { texture: 'enemy_saw',    pattern: 'horizontal', speed: 140 },
  robot:  { texture: 'enemy_robot',  pattern: 'random',     speed: 80 },
};
const ENEMY_KEYS = Object.keys(ENEMY_DEFS);

export default class EnemyManager {
  constructor(scene, difficulty) {
    this.scene = scene;
    this.difficulty = difficulty;
    this.pool = new Pool(scene, 'enemy_bat', 30);
    this.hazardPool = new Pool(scene, 'hazard_rock', 20);
    this.active = [];
    this.hazards = [];
    this.slowMoActive = false;
  }

  /** Chance-gated spawn tied to platform generation so enemies feel placed, not random noise. */
  maybeSpawnNear(platform) {
    if (Math.random() > this.difficulty.enemyChance) return;
    const key = Phaser.Utils.Array.GetRandom(ENEMY_KEYS);
    const def = ENEMY_DEFS[key];
    const x = Phaser.Math.Clamp(platform.x + Phaser.Math.Between(-160, 160), 60, this.scene.cameras.main.width - 60);
    const y = platform.y - Phaser.Math.Between(140, 220);
    const e = this.pool.spawn(x, y, def.texture);
    if (!e) return;
    if (!e.body) this.scene.physics.add.existing(e, false);
    e.body.setAllowGravity(false);
    e.body.setCircle(e.width * 0.38);
    e.enemyKey = key;
    e.pattern = def.pattern;
    e.baseSpeed = def.speed * (1 + this.difficulty.t * 0.6);
    e.origin = { x, y };
    e.phase = Math.random() * Math.PI * 2;
    e.dir = Math.random() < 0.5 ? 1 : -1;
    e.setDepth(35);
    this.active.push(e);

    // occasional hazard alongside tougher enemies
    if (this.difficulty.t > 0.3 && Math.random() < 0.15) this._spawnHazard(platform.y - 300);
  }

  _spawnHazard(y) {
    const roll = Math.random();
    const kind = roll < 0.4 ? 'hazard_rock' : (roll < 0.7 ? 'hazard_lightning' : 'enemy_spikes');
    const x = Phaser.Math.Between(60, this.scene.cameras.main.width - 60);
    const h = this.hazardPool.spawn(x, y, kind);
    if (!h) return;
    if (!h.body) this.scene.physics.add.existing(h, false);
    h.body.setAllowGravity(false);
    h.body.setVelocityY(220 + this.difficulty.t * 140);
    h.body.setVelocityX(kind === 'enemy_spikes' ? Phaser.Math.Between(-60, 60) : 0);
    h.body.setCircle(h.width * 0.4);
    h.setDepth(36);
    this.hazards.push(h);
  }

  update(dt, cameraTopY, cameraBottomY) {
    const speedMul = this.slowMoActive ? 0.3 : 1;
    const t = this.scene.time.now / 1000;

    for (let i = this.active.length - 1; i >= 0; i--) {
      const e = this.active[i];
      if (e.y > cameraBottomY + 200 || e.y < cameraTopY - 600) {
        const idx = this.active.indexOf(e);
        this.active.splice(idx, 1);
        this.pool.despawn(e);
        continue;
      }
      const spd = e.baseSpeed * speedMul;
      if (e.pattern === 'horizontal') {
        e.x += e.dir * spd * dt / 1000;
        if (Math.abs(e.x - e.origin.x) > 180) e.dir *= -1;
      } else if (e.pattern === 'vertical') {
        e.y = e.origin.y + Math.sin(t * 1.5 + e.phase) * 90;
      } else if (e.pattern === 'circular') {
        e.x = e.origin.x + Math.cos(t * 1.6 + e.phase) * 70;
        e.y = e.origin.y + Math.sin(t * 1.6 + e.phase) * 70;
      } else { // random wander
        e.x = e.origin.x + Math.sin(t * 0.8 + e.phase) * 120;
        e.y = e.origin.y + Math.cos(t * 1.1 + e.phase) * 60;
      }
      e.body.updateFromGameObject();
      e.angle = e.pattern === 'circular' ? e.angle + 3 : e.angle;
    }

    for (let i = this.hazards.length - 1; i >= 0; i--) {
      const h = this.hazards[i];
      if (h.y > cameraBottomY + 200) {
        this.hazards.splice(i, 1);
        this.hazardPool.despawn(h);
        continue;
      }
      h.angle += 4;
    }
  }

  destroyEnemy(e) {
    const idx = this.active.indexOf(e);
    if (idx >= 0) this.active.splice(idx, 1);
    this.pool.despawn(e);
  }

  reset() {
    this.pool.clear();
    this.hazardPool.clear();
    this.active = [];
    this.hazards = [];
    this.slowMoActive = false;
  }
}
