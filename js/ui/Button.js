// A single reusable button "prefab" used across every menu scene so styling,
// press feedback, and sound stay consistent throughout the whole game.
export default class Button {
  constructor(scene, x, y, label, onClick, opts = {}) {
    this.scene = scene;
    const width = opts.width || 300;
    const height = opts.height || 90;
    this.container = scene.add.container(x, y);

    this.bg = scene.add.image(0, 0, 'ui_button');
    this.bg.setDisplaySize(width, height);
    if (opts.tint) this.bg.setTint(opts.tint);

    this.label = scene.add.text(0, 0, label, {
      fontFamily: 'Segoe UI, Arial, sans-serif',
      fontSize: opts.fontSize || '34px',
      fontStyle: 'bold',
      color: opts.textColor || '#ffffff',
    }).setOrigin(0.5);

    this.container.add([this.bg, this.label]);
    this.container.setSize(width, height);
    this.container.setInteractive({ useHandCursor: true });

    this.container.on('pointerover', () => {
      scene.tweens.add({ targets: this.container, scale: 1.04, duration: 100 });
    });
    this.container.on('pointerout', () => {
      scene.tweens.add({ targets: this.container, scale: 1, duration: 100 });
    });
    this.container.on('pointerdown', () => {
      scene.tweens.add({ targets: this.container, scale: 0.94, duration: 60, yoyo: true });
      scene.audioManager?.play('buttonClick');
      scene.game.registry.get('haptic')?.();
      if (onClick) onClick();
    });
  }

  setEnabled(enabled) {
    this.container.disableInteractive();
    if (enabled) this.container.setInteractive({ useHandCursor: true });
    this.bg.setAlpha(enabled ? 1 : 0.45);
    this.label.setAlpha(enabled ? 1 : 0.6);
  }

  destroy() { this.container.destroy(); }
}
