// Single source of truth for tunable numbers. Keeping these in one place
// makes balancing the "feel" of the game (and adapting it later) trivial.
export const GAME_WIDTH = 720;
export const GAME_HEIGHT = 1280;

export const PHYSICS = {
  gravityY: 1400,
  jumpVelocity: -960, // tuned so apex height (v^2/2g ≈ 329px) always clears the hardest platform gap
  megaJumpMultiplier: 1.6,
  moveSpeed: 480,
  maxFallSpeed: 1600,
  iceFriction: 0.985,
  normalFriction: 0.82,
};

export const PLATFORM = {
  width: 130,
  height: 34,
  minGapY: 110,
  maxGapY: 190,
  spawnAheadPx: 1800, // how far above the camera platforms are pre-generated
};

export const DIFFICULTY = {
  rampIntervalMs: 20000, // every 20s difficulty ticks up
  maxTier: 12,
};

export const STORAGE_KEY = 'skyhop_save_v1';

export const COLORS = {
  uiPrimary: 0xff8a3d,
  uiSecondary: 0x4fd1ff,
  uiDark: 0x1c1c3a,
  gold: 0xffd23f,
  gem: 0x5ef2ff,
  danger: 0xff4d4d,
  success: 0x6fcf97,
};
