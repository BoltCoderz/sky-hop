import { GAME_WIDTH, GAME_HEIGHT } from './config.js';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import MainMenuScene from './scenes/MainMenuScene.js';
import CharacterSelectScene from './scenes/CharacterSelectScene.js';
import ShopScene from './scenes/ShopScene.js';
import SettingsScene from './scenes/SettingsScene.js';
import DailyChallengeScene from './scenes/DailyChallengeScene.js';
import StatisticsScene from './scenes/StatisticsScene.js';
import CreditsScene from './scenes/CreditsScene.js';
import GameScene from './scenes/GameScene.js';
import GameOverScene from './scenes/GameOverScene.js';

// Scale.FIT + autoCenter keeps a single fixed 9:16-ish virtual resolution and
// letterboxes/pillarboxes it to fit ANY aspect ratio YouTube Playables may
// present (9:32 through 32:9) without ever restarting the game or losing
// state - the canvas is simply resized/repositioned by Phaser's ScaleManager.
const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  transparent: false,
  backgroundColor: '#0b0f2e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // set per-scene (menus don't need gravity)
      debug: false,
    },
  },
  scene: [
    BootScene,
    PreloadScene,
    MainMenuScene,
    CharacterSelectScene,
    ShopScene,
    SettingsScene,
    DailyChallengeScene,
    StatisticsScene,
    CreditsScene,
    GameScene,
    GameOverScene,
  ],
};

const game = new Phaser.Game(config);

// Never lock orientation; simply let Scale.FIT re-letterbox on rotate/resize.
window.addEventListener('resize', () => game.scale.refresh());

// Defensive: YouTube Playables sandboxes sometimes fire visibility changes
// instead of blur/focus; pausing/resuming keeps timers and physics sane.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) game.sound?.pauseAll?.();
});
