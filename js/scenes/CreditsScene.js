import Button from '../ui/Button.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

export default class CreditsScene extends Phaser.Scene {
  constructor() { super('Credits'); }

  create() {
    this.cameras.main.setBackgroundColor('#1b1b4d');
    this.add.text(GAME_WIDTH / 2, 200, 'SKY HOP', {
      fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '56px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 280, 'An original endless climbing game', {
      fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '22px', color: '#c9c9d8',
    }).setOrigin(0.5);

    const lines = [
      'Game Design & Engineering', 'Art Direction & Illustration',
      'Music & Sound Design', 'UI / UX Design', 'Playtesting',
    ];
    let y = 420;
    lines.forEach(l => {
      this.add.text(GAME_WIDTH / 2, y, l, {
        fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '22px', color: '#ffffff',
      }).setOrigin(0.5);
      y += 60;
    });

    this.add.text(GAME_WIDTH / 2, y + 60, 'Thanks for playing!', {
      fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '26px', fontStyle: 'bold', color: '#ffd23f',
    }).setOrigin(0.5);

    new Button(this, GAME_WIDTH / 2, GAME_HEIGHT - 90, 'Back', () => this.scene.start('MainMenu'), { width: 220, height: 80 });

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 20, 'Powered By Bolt Coderz', {
      fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '24px', fontStyle: 'italic', color: '#ffd23f',
    }).setOrigin(0.5);
  }
}
