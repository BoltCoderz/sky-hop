import { PHYSICS, GAME_WIDTH } from '../config.js';

export default class Player {
  constructor(scene, x, y, characterKey, trailColor = 0xffffff) {
    this.scene = scene;
    this.characterKey = characterKey;
    this.alive = true;
    this.facing = 1;
    this.moveDir = 0; // -1, 0, 1 from input
    this.friction = PHYSICS.normalFriction;
    this.invulnerable = false;
    this.megaJumpTimer = 0;
    this.shieldActive = false;

    this.sprite = scene.physics.add.sprite(x, y, 'char_' + characterKey);
    this.sprite.setDepth(50);
    this.sprite.setScale(0.85);
    this.sprite.body.setSize(70, 78).setOffset(13, 12);
    this.sprite.body.setMaxVelocity(PHYSICS.moveSpeed * 1.4, PHYSICS.maxFallSpeed);
    this.sprite.body.setAllowGravity(true);

    // trailing particles while ascending
    this.trail = scene.add.particles(0, 0, 'particle_circle', {
      lifespan: 260,
      speed: { min: 10, max: 40 },
      scale: { start: 0.55, end: 0 },
      alpha: { start: 0.5, end: 0 },
      tint: trailColor,
      frequency: 40,
      emitting: false,
    });
    this.trail.setDepth(49);

    this._blinkEvent = scene.time.addEvent({
      delay: Phaser.Math.Between(2200, 4200),
      callback: () => this._blink(),
      loop: true,
    });

    this.shieldGlow = scene.add.circle(x, y, 46, 0x4fd1ff, 0.0);
    this.shieldGlow.setStrokeStyle(3, 0x4fd1ff, 0.9);
    this.shieldGlow.setDepth(51);
    this.shieldGlow.setVisible(false);
  }

  setCharacter(characterKey) {
    this.characterKey = characterKey;
    this.sprite.setTexture('char_' + characterKey);
  }

  _blink() {
    if (!this.alive) return;
    const overlay = this.scene.add.image(this.sprite.x, this.sprite.y - 6, 'char_' + this.characterKey + '_blink');
    overlay.setDepth(52);
    overlay.setScale(this.sprite.scaleX);
    this.scene.tweens.add({
      targets: overlay, alpha: { from: 1, to: 1 }, duration: 90, yoyo: true,
      onComplete: () => overlay.destroy(),
    });
    this._blinkEvent.delay = Phaser.Math.Between(2200, 4200);
  }

  setMoveDir(dir) { this.moveDir = dir; }

  bounce(velocityMultiplier = 1) {
    const v = PHYSICS.jumpVelocity * velocityMultiplier;
    this.sprite.body.setVelocityY(v);
    this.trail.emitting = true;
    this.scene.time.delayedCall(260, () => { if (this.alive) this.trail.emitting = false; });
    // squash on takeoff -> stretch mid-air
    this.scene.tweens.add({
      targets: this.sprite, scaleX: 1.05, scaleY: 0.65, duration: 70, yoyo: true,
      onComplete: () => {
        this.scene.tweens.add({ targets: this.sprite, scaleX: 0.78, scaleY: 0.95, duration: 140, yoyo: true, ease: 'Sine.easeOut' });
      },
    });
  }

  landSquash() {
    this.scene.tweens.add({
      targets: this.sprite, scaleX: 1.15, scaleY: 0.6, duration: 90, yoyo: true, ease: 'Quad.easeOut',
    });
  }

  collectPop() {
    this.scene.tweens.add({ targets: this.sprite, scale: this.sprite.scale * 1.12, duration: 90, yoyo: true });
  }

  activateShield() {
    this.shieldActive = true;
    this.shieldGlow.setVisible(true);
    this.scene.tweens.add({ targets: this.shieldGlow, alpha: 0.35, duration: 200 });
  }

  consumeShield() {
    this.shieldActive = false;
    this.scene.tweens.add({
      targets: this.shieldGlow, alpha: 0, duration: 200,
      onComplete: () => this.shieldGlow.setVisible(false),
    });
  }

  update(dt) {
    if (!this.alive) return;
    const body = this.sprite.body;

    // horizontal movement from input, with ice/friction feel
    const accel = PHYSICS.moveSpeed * 6;
    if (this.moveDir !== 0) {
      body.velocity.x = Phaser.Math.Linear(body.velocity.x, this.moveDir * PHYSICS.moveSpeed, Math.min(1, accel * dt / 1000));
      this.facing = this.moveDir;
      this.sprite.setFlipX(this.facing < 0);
    } else {
      body.velocity.x *= this.friction;
    }

    // screen wrap (classic vertical-jumper feel)
    const half = this.sprite.displayWidth / 2;
    if (this.sprite.x < -half) this.sprite.x = GAME_WIDTH + half;
    if (this.sprite.x > GAME_WIDTH + half) this.sprite.x = -half;

    // subtle tilt while airborne for "juice"
    const vy = body.velocity.y;
    const targetAngle = Phaser.Math.Clamp(body.velocity.x / PHYSICS.moveSpeed * 8, -10, 10);
    this.sprite.angle = Phaser.Math.Linear(this.sprite.angle, targetAngle, 0.15);

    this.trail.setPosition(this.sprite.x, this.sprite.y + 30);
    if (vy < -50) this.trail.emitting = true; else if (vy > 50) this.trail.emitting = false;

    this.shieldGlow.setPosition(this.sprite.x, this.sprite.y);
  }

  die() {
    if (!this.alive) return;
    this.alive = false;
    this.trail.emitting = false;
    this.sprite.body.setVelocity(0, -300);
    this.sprite.body.setAllowGravity(true);
    this.scene.tweens.add({
      targets: this.sprite,
      angle: this.sprite.angle + 360 * (Phaser.Math.Between(0, 1) ? 1 : -1),
      duration: 900,
      ease: 'Cubic.easeIn',
    });
  }

  destroy() {
    this._blinkEvent.remove();
    this.trail.destroy();
    this.shieldGlow.destroy();
    this.sprite.destroy();
  }
}
