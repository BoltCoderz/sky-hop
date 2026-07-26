import Button from '../ui/Button.js';
import { CHARACTERS } from '../data/CharactersData.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import ComboText from '../ui/ComboText.js';

export default class CharacterSelectScene extends Phaser.Scene {
  constructor() { super('CharacterSelect'); }

  create() {
    this.saveManager = this.registry.get('saveManager');
    this.audioManager = this.registry.get('audioManager');

    this.cameras.main.setBackgroundColor('#6fa8ff');
    this.add.text(GAME_WIDTH / 2, 70, 'CHARACTERS', {
      fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '48px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#1c1c3a', strokeThickness: 6,
    }).setOrigin(0.5);

    this.coinLabel = this.add.text(GAME_WIDTH / 2, 130, 'Coins: ' + this.saveManager.data.coins, {
      fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '28px', color: '#ffffff',
    }).setOrigin(0.5);

    const cols = 3;
    const cellW = 200, cellH = 230;
    const startX = GAME_WIDTH / 2 - cellW * (cols - 1) / 2;
    const startY = 260;
    this.cards = [];

    CHARACTERS.forEach((c, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const x = startX + col * cellW;
      const y = startY + row * cellH;
      this._buildCard(c, x, y);
    });

    new Button(this, GAME_WIDTH / 2, GAME_HEIGHT - 90, 'Back', () => this.scene.start('MainMenu'), { width: 220, height: 80 });
  }

  _buildCard(c, x, y) {
    const unlocked = this.saveManager.data.unlockedCharacters.includes(c.id);
    const selected = this.saveManager.data.selectedCharacter === c.id;

    const panel = this.add.image(x, y, 'ui_panel').setDisplaySize(170, 200);
    if (selected) panel.setTint(0xffe98a);
    const sprite = this.add.image(x, y - 25, 'char_' + c.id).setScale(0.85);
    if (!unlocked) sprite.setTint(0x555566);

    const label = this.add.text(x, y + 55, c.name, {
      fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '20px', fontStyle: 'bold', color: '#1c1c3a',
    }).setOrigin(0.5);

    const sub = this.add.text(x, y + 78, unlocked ? (selected ? 'Selected' : 'Tap to select') : c.price + ' coins', {
      fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '16px', color: unlocked ? '#4fae76' : '#ff8a3d',
    }).setOrigin(0.5);

    const hit = this.add.zone(x, y, 170, 200).setInteractive({ useHandCursor: true });
    hit.on('pointerdown', () => {
      if (unlocked) {
        this.saveManager.data.selectedCharacter = c.id;
        this.saveManager.persist();
        this.audioManager.play('buttonClick');
        this.scene.restart();
      } else if (this.saveManager.spendCoins(c.price)) {
        this.saveManager.unlockCharacter(c.id);
        this.audioManager.play('unlock');
        ComboText.popup(this, x, y - 60, 'Unlocked!', '#6fcf97', '30px');
        this.time.delayedCall(300, () => this.scene.restart());
      } else {
        this.audioManager.play('buttonClick');
        ComboText.popup(this, x, y - 60, 'Not enough coins', '#ff4d4d', '20px');
      }
    });
  }
}
