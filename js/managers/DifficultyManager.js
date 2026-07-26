import { DIFFICULTY } from '../config.js';

export default class DifficultyManager {
  constructor() {
    this.elapsedMs = 0;
    this.tier = 0;
  }

  update(deltaMs) {
    this.elapsedMs += deltaMs;
    this.tier = Math.min(DIFFICULTY.maxTier, Math.floor(this.elapsedMs / DIFFICULTY.rampIntervalMs));
  }

  /** Normalized 0..1 progress used to lerp every gameplay parameter. */
  get t() { return this.tier / DIFFICULTY.maxTier; }

  get gapMultiplier() { return 1 + this.t * 0.35; }               // platforms spread out (kept under the player's max jump apex)
  get enemyChance() { return 0.08 + this.t * 0.30; }               // per-platform spawn chance
  get movingChance() { return 0.15 + this.t * 0.35; }
  get brokenChance() { return 0.08 + this.t * 0.30; }
  get iceChance() { return 0.05 + this.t * 0.20; }
  get windStrength() { return this.t * 220; }                       // px/s horizontal drift
  get scoreMultiplier() { return 1 + this.t * 0.5; }

  reset() { this.elapsedMs = 0; this.tier = 0; }
}
