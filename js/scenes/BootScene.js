import SaveManager from '../managers/SaveManager.js';
import AudioManager from '../managers/AudioManager.js';
import { vibrate } from '../utils/Helpers.js';

export default class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  create() {
    const save = new SaveManager();
    const audio = new AudioManager(save);
    this.game.registry.set('saveManager', save);
    this.game.registry.set('audioManager', audio);
    this.game.registry.set('haptic', () => vibrate(save));

    // Unlock WebAudio + haptics on first user gesture (required by mobile browsers)
    this.input.once('pointerdown', () => audio.unlock());

    this.scale.on('resize', () => {}); // Scale.FIT handles layout; hook kept for future custom logic

    this.scene.start('Preload');
  }
}
