import Button from '../ui/Button.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOver'); }

  init(data) {
    this.heightScore = data.heightScore || 0;
    this.isNewBest = !!data.isNewBest;
    this.bestScore = data.bestScore || 0;
    this.unlockedAchievements = data.unlockedAchievements || [];
  }

  create() {
    this.saveManager = this.registry.get('saveManager');
    this.audioManager = this.registry.get('audioManager');
    this.cameras.main.setBackgroundColor('#1b1b4d');
    this.cameras.main.fadeIn(300, 0, 0, 0);

    this.add.text(GAME_WIDTH / 2, 160, this.isNewBest ? 'NEW BEST!' : 'GAME OVER', {
      fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '52px', fontStyle: 'bold',
      color: this.isNewBest ? '#ffd23f' : '#ffffff',
      stroke: '#0b0f2e', strokeThickness: 8,
    }).setOrigin(0.5);

    if (this.isNewBest) this._confetti();

    this.add.text(GAME_WIDTH / 2, 280, this.heightScore + 'm', {
      fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '80px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 350, 'Best: ' + this.bestScore + 'm', {
      fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '26px', color: '#c9c9d8',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 410, `Coins: ${this.saveManager.data.coins}   Gems: ${this.saveManager.data.gems}`, {
      fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '24px', color: '#ffffff',
    }).setOrigin(0.5);

    let y = 480;
    this.unlockedAchievements.forEach(a => {
      this.add.text(GAME_WIDTH / 2, y, '🏆 ' + a.name + ' unlocked!', {
        fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '20px', fontStyle: 'bold', color: '#6fcf97',
      }).setOrigin(0.5);
      y += 34;
    });

    new Button(this, GAME_WIDTH / 2, GAME_HEIGHT - 260, '🔁  RETRY', () => {
      this.cameras.main.fadeOut(200, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Game'));
    }, { width: 320, height: 100, fontSize: '38px', tint: 0xff8a3d });

    new Button(this, GAME_WIDTH / 2, GAME_HEIGHT - 130, 'Main Menu', () => this.scene.start('MainMenu'), { width: 320, tint: 0x8fa1b3 });
  }

  _confetti() {
    const emitter = this.add.particles(GAME_WIDTH / 2, 0, 'particle_star', {
      x: { min: 0, max: GAME_WIDTH },
      y: -20,
      speedY: { min: 200, max: 400 },
      speedX: { min: -80, max: 80 },
      scale: { start: 0.8, end: 0.2 },
      tint: [0xffd23f, 0xff8a3d, 0x6fcf97, 0x4fd1ff, 0xff6f91],
      lifespan: 2200,
      quantity: 3,
      frequency: 40,
    });
    this.time.delayedCall(2200, () => emitter.destroy());
  }
}
