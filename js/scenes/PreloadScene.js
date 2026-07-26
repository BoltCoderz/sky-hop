import { generateAllTextures } from '../utils/TextureGenerator.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

export default class PreloadScene extends Phaser.Scene {
  constructor() { super('Preload'); }

  preload() {
    const cx = GAME_WIDTH / 2, cy = GAME_HEIGHT / 2;
    this.cameras.main.setBackgroundColor('#8fd3ff');

    const title = this.add.text(cx, cy - 80, 'SKY HOP', {
      fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '72px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#1c1c3a', strokeThickness: 8,
    }).setOrigin(0.5);
    this.tweens.add({ targets: title, y: cy - 90, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    const barBg = this.add.rectangle(cx, cy + 60, 360, 24, 0x1c1c3a, 0.3).setOrigin(0.5);
    const bar = this.add.rectangle(cx - 178, cy + 60, 4, 20, 0xff8a3d).setOrigin(0, 0.5);

    // Texture generation happens instantly (it's all vector draws), but we
    // animate the bar briefly for a satisfying loading feel + to guarantee
    // the WebAudio/registry setup from Boot has settled.
    this.tweens.addCounter({
      from: 0, to: 356, duration: 500,
      onUpdate: tw => { bar.width = Math.max(4, tw.getValue()); },
      onComplete: () => this.scene.start('MainMenu'),
    });

    generateAllTextures(this);
  }
}
