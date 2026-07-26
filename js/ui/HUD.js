import { GAME_WIDTH } from '../config.js';

export default class HUD {
  constructor(scene) {
    this.scene = scene;
    const pad = 24;

    this.scoreText = scene.add.text(GAME_WIDTH / 2, 50, '0m', {
      fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '54px', fontStyle: 'bold',
      color: '#ffffff', stroke: '#1c1c3a', strokeThickness: 6,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(300);

    this.bestText = scene.add.text(GAME_WIDTH / 2, 100, 'Best 0m', {
      fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '24px', color: '#ffe98a',
      stroke: '#1c1c3a', strokeThickness: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(300);

    this.coinIcon = scene.add.image(pad + 20, pad + 20, 'coin').setScrollFactor(0).setDepth(300).setScale(0.7);
    this.coinText = this._chip(pad + 44, pad + 20, '0');

    this.gemIcon = scene.add.image(pad + 20, pad + 70, 'gem').setScrollFactor(0).setDepth(300).setScale(0.7);
    this.gemText = this._chip(pad + 44, pad + 70, '0');

    this.comboText = scene.add.text(GAME_WIDTH - pad, pad + 20, '', {
      fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '30px', fontStyle: 'bold', color: '#ffd23f',
      stroke: '#1c1c3a', strokeThickness: 5,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(300);

    this.pauseBtn = scene.add.text(GAME_WIDTH - pad, pad + 70, '⏸', {
      fontSize: '40px', color: '#ffffff',
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(300).setInteractive({ useHandCursor: true });
    this.pauseBtn.on('pointerdown', () => scene.togglePause());

    this.muteBtn = scene.add.text(GAME_WIDTH - pad - 60, pad + 70, '🔊', {
      fontSize: '34px',
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(300).setInteractive({ useHandCursor: true });
    this.muteBtn.setText(scene.saveManager.data.settings.sfxOn ? '🔊' : '🔇');
    this.muteBtn.on('pointerdown', () => {
      const on = !scene.saveManager.data.settings.sfxOn;
      scene.saveManager.data.settings.sfxOn = on;
      scene.saveManager.data.settings.musicOn = on;
      scene.saveManager.persist();
      scene.audioManager.setSfxOn(on);
      scene.audioManager.setMusicOn(on);
      this.muteBtn.setText(on ? '🔊' : '🔇');
    });

    this.powerupIcons = [];
  }

  _chip(x, y, initial) {
    return this.scene.add.text(x, y, initial, {
      fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '28px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#1c1c3a', strokeThickness: 4,
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(300);
  }

  update(height, best, coins, gems, combo) {
    this.scoreText.setText(Math.floor(height) + 'm');
    this.bestText.setText('Best ' + Math.floor(best) + 'm');
    this.coinText.setText(String(coins));
    this.gemText.setText(String(gems));
    this.comboText.setText(combo > 1 ? combo + 'x COMBO' : '');
  }

  updatePowerups(statuses) {
    // rebuild icon row cheaply; the list is tiny (<=6) so this is fine per-frame
    while (this.powerupIcons.length > statuses.length) this.powerupIcons.pop().destroy();
    statuses.forEach((s, i) => {
      let icon = this.powerupIcons[i];
      const x = GAME_WIDTH / 2 - (statuses.length - 1) * 30 + i * 60;
      const y = 150;
      if (!icon) {
        icon = this.scene.add.image(x, y, s.icon).setScrollFactor(0).setDepth(300).setScale(0.65);
        this.powerupIcons[i] = icon;
      }
      icon.setTexture(s.icon);
      icon.setPosition(x, y);
      icon.setAlpha(0.4 + s.pct * 0.6);
    });
  }

  destroy() {
    [this.scoreText, this.bestText, this.coinIcon, this.coinText, this.gemIcon, this.gemText,
      this.comboText, this.pauseBtn, this.muteBtn, ...this.powerupIcons].forEach(o => o && o.destroy());
  }
}
