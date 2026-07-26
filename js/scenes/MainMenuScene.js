import Button from '../ui/Button.js';
import { ParallaxBackground } from '../utils/Helpers.js';
import { GAME_WIDTH } from '../config.js';

export default class MainMenuScene extends Phaser.Scene {
  constructor() { super('MainMenu'); }

  create() {
    this.saveManager = this.registry.get('saveManager');
    this.audioManager = this.registry.get('audioManager');
    this.audioManager.playMusic('menu');

    this.bg = new ParallaxBackground(this);

    this.add.text(GAME_WIDTH / 2, 150, 'SKY HOP', {
      fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '84px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#1c1c3a', strokeThickness: 10,
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 220, 'Jump. Climb. Never look down.', {
      fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '26px', color: '#1c1c3a',
    }).setOrigin(0.5);

    const charId = this.saveManager.data.selectedCharacter;
    this.charPreview = this.add.image(GAME_WIDTH / 2, 340, 'char_' + charId).setScale(1.4);
    this.tweens.add({ targets: this.charPreview, y: 360, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    this.add.text(GAME_WIDTH / 2, 440, 'Best: ' + this.saveManager.data.bestScore + 'm   Coins: ' + this.saveManager.data.coins, {
      fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '28px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#1c1c3a', strokeThickness: 5,
    }).setOrigin(0.5);

    new Button(this, GAME_WIDTH / 2, 560, '▶  PLAY', () => {
      this.cameras.main.fadeOut(250, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Game'));
    }, { width: 320, height: 100, fontSize: '40px' });

    const row1Y = 700, row2Y = 810, row3Y = 920;
    new Button(this, GAME_WIDTH / 2 - 160, row1Y, 'Characters', () => this.scene.start('CharacterSelect'), { width: 280, tint: 0x4fd1ff });
    new Button(this, GAME_WIDTH / 2 + 160, row1Y, 'Shop', () => this.scene.start('Shop'), { width: 280, tint: 0xffd23f, textColor: '#1c1c3a' });

    new Button(this, GAME_WIDTH / 2 - 160, row2Y, 'Daily Missions', () => this.scene.start('DailyChallenge'), { width: 280, tint: 0x6fcf97 });
    new Button(this, GAME_WIDTH / 2 + 160, row2Y, 'Statistics', () => this.scene.start('Statistics'), { width: 280, tint: 0xa06fff });

    new Button(this, GAME_WIDTH / 2 - 160, row3Y, 'Settings', () => this.scene.start('Settings'), { width: 280, tint: 0x8fa1b3 });
    new Button(this, GAME_WIDTH / 2 + 160, row3Y, 'Credits', () => this.scene.start('Credits'), { width: 280, tint: 0xff8a3d });
  }

  update(time, delta) {
    this.bg.update(0, this.saveManager.data.bestScore);
  }
}
