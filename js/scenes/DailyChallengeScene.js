import Button from '../ui/Button.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import ComboText from '../ui/ComboText.js';

export default class DailyChallengeScene extends Phaser.Scene {
  constructor() { super('DailyChallenge'); }

  create() {
    this.saveManager = this.registry.get('saveManager');
    this.audioManager = this.registry.get('audioManager');
    this.cameras.main.setBackgroundColor('#6fcf97');

    this.add.text(GAME_WIDTH / 2, 80, 'DAILY MISSIONS', {
      fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '42px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#1c1c3a', strokeThickness: 6,
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 130, 'Resets daily at midnight', {
      fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '20px', color: '#1c1c3a',
    }).setOrigin(0.5);

    const missions = this.saveManager.data.daily.missions;
    let y = 260;
    missions.forEach(m => { this._buildRow(m, y); y += 220; });

    new Button(this, GAME_WIDTH / 2, GAME_HEIGHT - 90, 'Back', () => this.scene.start('MainMenu'), { width: 220, height: 80 });
  }

  _buildRow(m, y) {
    this.add.image(GAME_WIDTH / 2, y, 'ui_panel').setDisplaySize(600, 190);
    this.add.text(GAME_WIDTH / 2, y - 60, m.desc, {
      fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '24px', fontStyle: 'bold', color: '#1c1c3a',
    }).setOrigin(0.5);

    const pct = Phaser.Math.Clamp(m.progress / m.target, 0, 1);
    this.add.rectangle(GAME_WIDTH / 2, y, 480, 26, 0xe0e0e0).setStrokeStyle(2, 0x1c1c3a);
    const fill = this.add.rectangle(GAME_WIDTH / 2 - 240, y, Math.max(4, 480 * pct), 22, 0x6fcf97).setOrigin(0, 0.5);

    this.add.text(GAME_WIDTH / 2, y + 30, `${Math.min(m.progress, m.target)} / ${m.target}`, {
      fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '18px', color: '#1c1c3a',
    }).setOrigin(0.5);

    const rewardStr = `+${m.coin} coins` + (m.gem ? ` +${m.gem} gems` : '');
    this.add.text(GAME_WIDTH / 2 - 240, y - 60, rewardStr, {
      fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '15px', color: '#4fae76',
    }).setOrigin(0, 0.5);

    const label = m.claimed ? 'Claimed' : (m.progress >= m.target ? 'Claim' : 'In Progress');
    const btn = new Button(this, GAME_WIDTH / 2 + 220, y + 65, label, () => {
      if (m.claimed || m.progress < m.target) return;
      this.saveManager.claimMission(m.id);
      this.audioManager.play('unlock');
      ComboText.popup(this, GAME_WIDTH / 2, y - 90, 'Claimed!', '#ffd23f', '26px');
      this.time.delayedCall(300, () => this.scene.restart());
    }, { width: 160, height: 56, fontSize: '20px', tint: m.claimed ? 0x8fa1b3 : (m.progress >= m.target ? 0xffd23f : 0x8fa1b3) });
    if (m.claimed || m.progress < m.target) btn.setEnabled(false);
  }
}
