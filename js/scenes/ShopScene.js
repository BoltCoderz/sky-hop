import Button from '../ui/Button.js';
import { TRAILS } from '../data/TrailsData.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import ComboText from '../ui/ComboText.js';

export default class ShopScene extends Phaser.Scene {
  constructor() { super('Shop'); }

  create() {
    this.saveManager = this.registry.get('saveManager');
    this.audioManager = this.registry.get('audioManager');
    this.cameras.main.setBackgroundColor('#ffd6ec');

    this.add.text(GAME_WIDTH / 2, 70, 'SHOP', {
      fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '48px', fontStyle: 'bold', color: '#1c1c3a',
    }).setOrigin(0.5);

    this.currencyLabel = this.add.text(GAME_WIDTH / 2, 130,
      `Coins: ${this.saveManager.data.coins}   Gems: ${this.saveManager.data.gems}`, {
        fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '26px', color: '#1c1c3a',
      }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 200, 'Trail Colors', {
      fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '30px', fontStyle: 'bold', color: '#1c1c3a',
    }).setOrigin(0.5);

    const cols = 3, cellW = 200, cellH = 190;
    const startX = GAME_WIDTH / 2 - cellW * (cols - 1) / 2;
    const startY = 320;
    TRAILS.forEach((t, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      this._buildTrailCard(t, startX + col * cellW, startY + row * cellH);
    });

    this.add.text(GAME_WIDTH / 2, 740, 'Gem Exchange', {
      fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '30px', fontStyle: 'bold', color: '#1c1c3a',
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 780, '1 gem = 25 coins', {
      fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '22px', color: '#1c1c3a',
    }).setOrigin(0.5);

    new Button(this, GAME_WIDTH / 2, 860, 'Exchange 1 Gem', () => this._exchangeGem(), { width: 320, tint: 0x5ef2ff, textColor: '#1c1c3a' });
    new Button(this, GAME_WIDTH / 2, 970, 'Unlock Characters', () => this.scene.start('CharacterSelect'), { width: 320, tint: 0xff8a3d });
    new Button(this, GAME_WIDTH / 2, GAME_HEIGHT - 90, 'Back', () => this.scene.start('MainMenu'), { width: 220, height: 80 });
  }

  _buildTrailCard(t, x, y) {
    const unlocked = this.saveManager.data.unlockedTrails.includes(t.id);
    const selected = this.saveManager.data.selectedTrail === t.id;

    const panel = this.add.image(x, y, 'ui_panel').setDisplaySize(170, 160);
    if (selected) panel.setTint(0xffe98a);
    const swatch = this.add.circle(x, y - 20, 34, t.color);
    if (!unlocked) swatch.setAlpha(0.4);

    this.add.text(x, y + 25, t.name, {
      fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '18px', fontStyle: 'bold', color: '#1c1c3a',
    }).setOrigin(0.5);
    this.add.text(x, y + 48, unlocked ? (selected ? 'Selected' : 'Tap to select') : t.price + ' coins', {
      fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '15px', color: unlocked ? '#4fae76' : '#ff8a3d',
    }).setOrigin(0.5);

    const hit = this.add.zone(x, y, 170, 160).setInteractive({ useHandCursor: true });
    hit.on('pointerdown', () => {
      if (unlocked) {
        this.saveManager.data.selectedTrail = t.id;
        this.saveManager.persist();
        this.audioManager.play('buttonClick');
        this.scene.restart();
      } else if (this.saveManager.spendCoins(t.price)) {
        this.saveManager.unlockTrail(t.id);
        this.audioManager.play('unlock');
        this.scene.restart();
      } else {
        this.audioManager.play('buttonClick');
        ComboText.popup(this, x, y - 60, 'Not enough coins', '#ff4d4d', '18px');
      }
    });
  }

  _exchangeGem() {
    if (this.saveManager.data.gems < 1) {
      this.audioManager.play('buttonClick');
      ComboText.popup(this, GAME_WIDTH / 2, 800, 'No gems left', '#ff4d4d', '22px');
      return;
    }
    this.saveManager.addGems(-1);
    this.saveManager.addCoins(25);
    this.audioManager.play('coin');
    this.scene.restart();
  }
}
