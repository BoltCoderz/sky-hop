import Button from '../ui/Button.js';
import AchievementManager from '../managers/AchievementManager.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

export default class StatisticsScene extends Phaser.Scene {
  constructor() { super('Statistics'); }

  create() {
    this.saveManager = this.registry.get('saveManager');
    this.audioManager = this.registry.get('audioManager');
    this.achievements = new AchievementManager(this.saveManager);
    this.cameras.main.setBackgroundColor('#a06fff');

    this.add.text(GAME_WIDTH / 2, 70, 'STATISTICS', {
      fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '44px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#1c1c3a', strokeThickness: 6,
    }).setOrigin(0.5);

    const s = this.saveManager.data.stats;
    const rows = [
      ['Games Played', s.gamesPlayed],
      ['Best Score', this.saveManager.data.bestScore + 'm'],
      ['Total Jumps', s.totalJumps],
      ['Total Coins Collected', s.totalCoins],
      ['Total Gems Collected', s.totalGems],
      ['Enemies Avoided', s.enemiesAvoided],
      ['Platforms Landed', s.platformsLanded],
      ['Time Played', Math.floor(s.timePlayedMs / 60000) + ' min'],
      ['Best Combo', s.bestCombo + 'x'],
    ];

    let y = 150;
    rows.forEach(([label, val]) => {
      this.add.text(GAME_WIDTH / 2 - 260, y, label, {
        fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '20px', color: '#ffffff',
      }).setOrigin(0, 0.5);
      this.add.text(GAME_WIDTH / 2 + 260, y, String(val), {
        fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '20px', fontStyle: 'bold', color: '#ffd23f',
      }).setOrigin(1, 0.5);
      y += 42;
    });

    y += 20;
    this.add.text(GAME_WIDTH / 2, y, 'ACHIEVEMENTS', {
      fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '28px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    y += 50;

    for (const a of this.achievements.list()) {
      const unlocked = this.achievements.isUnlocked(a.id);
      this.add.circle(GAME_WIDTH / 2 - 260, y, 10, unlocked ? 0x6fcf97 : 0x4a4a5a);
      this.add.text(GAME_WIDTH / 2 - 235, y, `${a.name} — ${a.desc}`, {
        fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '16px', color: unlocked ? '#ffffff' : '#c9c9d8',
      }).setOrigin(0, 0.5);
      y += 36;
    }

    new Button(this, GAME_WIDTH / 2, GAME_HEIGHT - 90, 'Back', () => this.scene.start('MainMenu'), { width: 220, height: 80 });
  }
}
