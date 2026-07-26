import Button from '../ui/Button.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

export default class SettingsScene extends Phaser.Scene {
  constructor() { super('Settings'); }

  create() {
    this.saveManager = this.registry.get('saveManager');
    this.audioManager = this.registry.get('audioManager');
    this.cameras.main.setBackgroundColor('#8fa1b3');

    this.add.text(GAME_WIDTH / 2, 80, 'SETTINGS', {
      fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '48px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);

    const s = this.saveManager.data.settings;
    let y = 240;
    this._toggleRow('Music', s.musicOn, v => { s.musicOn = v; this.saveManager.persist(); this.audioManager.setMusicOn(v); }, y); y += 130;
    this._toggleRow('Sound Effects', s.sfxOn, v => { s.sfxOn = v; this.saveManager.persist(); this.audioManager.setSfxOn(v); }, y); y += 130;
    this._toggleRow('Haptics', s.hapticOn, v => { s.hapticOn = v; this.saveManager.persist(); }, y); y += 130;
    this._toggleRow('High Quality Graphics', s.graphicsQuality === 'high',
      v => { s.graphicsQuality = v ? 'high' : 'low'; this.saveManager.persist(); }, y); y += 160;

    new Button(this, GAME_WIDTH / 2, y, 'Reset Save Data', () => this._confirmReset(), { width: 340, tint: 0xff4d4d });
    y += 120;
    new Button(this, GAME_WIDTH / 2, y, 'Back', () => this.scene.start('MainMenu'), { width: 220, height: 80 });

    this.confirmGroup = null;
  }

  _toggleRow(label, initialOn, onChange, y) {
    this.add.text(GAME_WIDTH / 2 - 160, y, label, {
      fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '28px', fontStyle: 'bold', color: '#1c1c3a',
    }).setOrigin(0, 0.5);

    const track = this.add.rectangle(GAME_WIDTH / 2 + 140, y, 100, 46, 0xffffff, 0.4).setStrokeStyle(3, 0x1c1c3a);
    const knob = this.add.circle(GAME_WIDTH / 2 + (initialOn ? 165 : 115), y, 20, initialOn ? 0x6fcf97 : 0xff4d4d);
    let on = initialOn;
    const zone = this.add.zone(GAME_WIDTH / 2 + 140, y, 110, 56).setInteractive({ useHandCursor: true });
    zone.on('pointerdown', () => {
      on = !on;
      this.audioManager.play('buttonClick');
      this.tweens.add({ targets: knob, x: GAME_WIDTH / 2 + (on ? 165 : 115), duration: 120 });
      knob.setFillStyle(on ? 0x6fcf97 : 0xff4d4d);
      onChange(on);
    });
  }

  _confirmReset() {
    if (this.confirmGroup) return;
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6).setDepth(400);
    const panel = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'ui_panel').setDisplaySize(500, 320).setDepth(401);
    const text = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, 'Erase all progress?\nThis cannot be undone.', {
      fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '26px', color: '#1c1c3a', align: 'center',
    }).setOrigin(0.5).setDepth(402);
    const yes = new Button(this, GAME_WIDTH / 2 - 100, GAME_HEIGHT / 2 + 60, 'Erase', () => {
      this.saveManager.resetAll();
      this.scene.restart();
    }, { width: 180, height: 70, tint: 0xff4d4d });
    yes.container.setDepth(402);
    const no = new Button(this, GAME_WIDTH / 2 + 100, GAME_HEIGHT / 2 + 60, 'Cancel', () => {
      [overlay, panel, text, yes.container, no.container].forEach(o => o.destroy());
      this.confirmGroup = null;
    }, { width: 180, height: 70, tint: 0x6fcf97 });
    no.container.setDepth(402);
    this.confirmGroup = { overlay, panel, text, yes, no };
  }
}
