import Player from '../entities/Player.js';
import PlatformManager from '../entities/PlatformManager.js';
import CollectibleManager from '../entities/CollectibleManager.js';
import EnemyManager from '../entities/EnemyManager.js';
import PowerUpManager from '../entities/PowerUpManager.js';
import DifficultyManager from '../managers/DifficultyManager.js';
import AchievementManager from '../managers/AchievementManager.js';
import MissionManager from '../managers/MissionManager.js';
import HUD from '../ui/HUD.js';
import Button from '../ui/Button.js';
import ComboText, { comboLabelFor } from '../ui/ComboText.js';
import { ParallaxBackground } from '../utils/Helpers.js';
import { getTrail } from '../data/TrailsData.js';
import { GAME_WIDTH, GAME_HEIGHT, PHYSICS } from '../config.js';

const PIXELS_PER_METER = 8;

export default class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  create() {
    this.saveManager = this.registry.get('saveManager');
    this.audioManager = this.registry.get('audioManager');
    this.missionManager = new MissionManager(this.saveManager);
    this.achievementManager = new AchievementManager(this.saveManager);
    this.audioManager.playMusic('gameplay');

    this.physics.world.gravity.y = PHYSICS.gravityY;
    this.physics.world.setBounds(0, -1e9, GAME_WIDTH, 1e9 + GAME_HEIGHT);

    this.bg = new ParallaxBackground(this);
    this.difficulty = new DifficultyManager();

    const startX = GAME_WIDTH / 2;
    const startY = GAME_HEIGHT - 220;
    this.startY = startY;
    this.minPlayerY = startY;

    const charId = this.saveManager.data.selectedCharacter;
    const trail = getTrail(this.saveManager.data.selectedTrail);
    this.player = new Player(this, startX, startY, charId, trail.color);

    this.platforms = new PlatformManager(this, this.difficulty);
    this.collectibles = new CollectibleManager(this);
    this.enemies = new EnemyManager(this, this.difficulty);
    this.powerups = new PowerUpManager(this, this.player, this.collectibles, this.enemies);

    // seed collectibles/enemies above the initial platforms
    this.platforms.active.forEach(p => {
      this.collectibles.maybeSpawnAbove(p);
      this.enemies.maybeSpawnNear(p);
    });

    this.cameraY = startY - GAME_HEIGHT * 0.55;
    this.cameras.main.scrollY = this.cameraY;
    this.cameras.main.setBackgroundColor(0x00000000);

    this._setupInput();
    this._setupCollisions();

    this.hud = new HUD(this);
    this.combo = 0;
    this.bestComboThisRun = 0;
    this.gameOver = false;
    this.paused = false;
    this.pauseOverlayNodes = [];
    this.elapsedMs = 0;
    this.enemiesAvoidedThisRun = 0;

    this.saveManager.updateStats({ gamesPlayed: 1 });

    this._weatherTimer = this.time.addEvent({
      delay: Phaser.Math.Between(14000, 22000), loop: true, callback: () => this._rollWeather(),
    });

    // brief countdown before control begins, matching the "countdown" SFX
    this.audioManager.play('countdown');

    this.cameras.main.fadeIn(250, 0, 0, 0);
  }

  _setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D');

    this.pointerDir = 0;
    this.input.on('pointerdown', p => {
      this.audioManager.unlock();
      if (this.paused || this.gameOver) return;
      this.pointerDir = p.x < GAME_WIDTH / 2 ? -1 : 1;
    });
    this.input.on('pointermove', p => {
      if (!p.isDown || this.paused || this.gameOver) return;
      this.pointerDir = p.x < GAME_WIDTH / 2 ? -1 : 1;
    });
    this.input.on('pointerup', () => { this.pointerDir = 0; });

    // ESC must never be preventDefault()'d and should only close dialogs
    this.input.keyboard.on('keydown-ESC', () => {
      if (this.paused) this._resume(); else this.togglePause();
    });
    this.input.keyboard.on('keydown-P', () => this.togglePause());
  }

  _setupCollisions() {
    this.physics.add.collider(this.player.sprite, this.platforms.pool.group, this._onLandPlatform, this._landProcess, this);
    this.physics.add.overlap(this.player.sprite, this.collectibles.pool.group, this._onCollect, null, this);
    this.physics.add.overlap(this.player.sprite, this.enemies.pool.group, this._onEnemyHit, null, this);
    this.physics.add.overlap(this.player.sprite, this.enemies.hazardPool.group, this._onEnemyHit, null, this);
  }

  _landProcess(playerSprite, platform) {
    // one-way platform: only collide while falling and while above the platform
    return playerSprite.body.velocity.y >= 0 && playerSprite.y < platform.y - 4 && platform.active;
  }

  _onLandPlatform(playerSprite, platform) {
    if (this.gameOver || !this.player.alive) return;

    const wasSteering = this.player.moveDir !== 0;
    let multiplier = 1;

    if (this.platforms.isIce(platform)) this.player.friction = PHYSICS.iceFriction;
    else this.player.friction = PHYSICS.normalFriction;

    if (this.player.megaJumpTimer > 0) multiplier *= PHYSICS.megaJumpMultiplier;

    if (this.platforms.isLaunch(platform)) {
      multiplier *= 1.9;
      this.audioManager.play('spring');
    } else if (platform.hasSpring) {
      multiplier *= 1.5;
      this.audioManager.play('spring');
    } else {
      this.audioManager.play('land');
    }

    this.player.bounce(multiplier);
    this.player.landSquash();
    this.game.registry.get('haptic')?.();

    this.saveManager.updateStats({ totalJumps: 1, platformsLanded: 1 });
    this.missionManager.report('jumps', 1);

    if (this.platforms.isSpring(platform) === false && platform.platformType !== 'broken') {
      // perfect landing = pressed no steering input at the moment of contact
      if (!wasSteering) {
        this.combo++;
        this.bestComboThisRun = Math.max(this.bestComboThisRun, this.combo);
        this.missionManager.report('combo', this.combo);
        this.missionManager.report('perfect', 1);
        const tier = comboLabelFor(this.combo);
        if (tier) {
          ComboText.popup(this, playerSprite.x, playerSprite.y - 60, tier.label, tier.color);
          this.audioManager.play('combo');
        }
      } else {
        this.combo = Math.max(0, this.combo - 1);
      }
    }

    this.platforms.onLand(platform, () => this.audioManager.play('break'));
  }

  _onCollect(playerSprite, obj) {
    const info = this.collectibles.collect(obj);
    if (!info) return;
    this.player.collectPop();
    if (info.kind === 'coin') {
      const amount = this.collectibles.doubleCoinsActive ? 2 : 1;
      this.saveManager.addCoins(amount);
      this.missionManager.report('coins', amount);
      this.audioManager.play('coin');
    } else if (info.kind === 'gem') {
      this.saveManager.addGems(1);
      this.missionManager.report('gems', 1);
      this.audioManager.play('gem');
    } else if (info.kind === 'star') {
      this.bonusScore = (this.bonusScore || 0) + info.value;
      this.audioManager.play('perfect');
      ComboText.popup(this, playerSprite.x, playerSprite.y - 50, '+' + info.value, '#ffd23f', '28px');
    } else if (info.kind === 'powerup') {
      this.powerups.activate(info.value);
    }
  }

  _onEnemyHit(playerSprite, enemyOrHazard) {
    if (this.gameOver || !this.player.alive) return;
    if (this.powerups.consumeShieldIfActive()) {
      this._removeThreat(enemyOrHazard);
      return;
    }
    this.audioManager.play('enemyHit');
    this.audioManager.play('explosion');
    this.game.registry.get('haptic')?.(60);
    this.combo = 0;
    this._removeThreat(enemyOrHazard);
    this._killPlayer();
  }

  _removeThreat(obj) {
    if (this.enemies.active.includes(obj)) this.enemies.destroyEnemy(obj);
    else {
      const idx = this.enemies.hazards.indexOf(obj);
      if (idx >= 0) { this.enemies.hazards.splice(idx, 1); this.enemies.hazardPool.despawn(obj); }
    }
  }

  togglePause() {
    if (this.gameOver) return;
    if (this.paused) this._resume(); else this._pause();
  }

  _pause() {
    this.paused = true;
    this.physics.world.pause();
    this.audioManager.play('buttonClick');
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.55).setScrollFactor(0).setDepth(500);
    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 180, 'PAUSED', {
      fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '48px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(501);
    const resume = new Button(this, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, 'Resume', () => this._resume(), { width: 300, tint: 0x6fcf97 });
    const restart = new Button(this, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80, 'Restart', () => { this.scene.restart(); }, { width: 300, tint: 0xffd23f, textColor: '#1c1c3a' });
    const menu = new Button(this, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 200, 'Main Menu', () => { this.scene.start('MainMenu'); }, { width: 300, tint: 0x8fa1b3 });
    [resume, restart, menu].forEach(b => b.container.setScrollFactor(0).setDepth(501));
    this.pauseOverlayNodes = [overlay, title, resume.container, restart.container, menu.container];
  }

  _resume() {
    this.paused = false;
    this.physics.world.resume();
    this.pauseOverlayNodes.forEach(n => n.destroy());
    this.pauseOverlayNodes = [];
  }

  _rollWeather() {
    const kinds = ['none', 'none', 'rain', 'snow', 'meteor'];
    this.bg.setWeather(this, Phaser.Utils.Array.GetRandom(kinds));
  }

  _killPlayer() {
    this.player.die();
    this.cameras.main.shake(220, 0.01);
    this.time.delayedCall(700, () => this._endGame());
  }

  _endGame() {
    if (this.gameOver) return;
    this.gameOver = true;
    this.audioManager.stopMusic();
    this.audioManager.playMusic('gameover');

    const heightScore = Math.max(0, Math.floor((this.startY - this.minPlayerY) / PIXELS_PER_METER)) + Math.floor(this.bonusScore || 0);
    const isNewBest = this.saveManager.setBestScore(heightScore);
    if (isNewBest) this.audioManager.play('highscore');
    this.saveManager.setBestCombo(this.bestComboThisRun);
    this.saveManager.updateStats({ enemiesAvoided: this.enemiesAvoidedThisRun, timePlayedMs: this.elapsedMs });
    this.missionManager.report('runs', 1);

    const unlockedAchievements = this.achievementManager.checkAll();

    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameOver', {
        heightScore,
        isNewBest,
        bestScore: this.saveManager.data.bestScore,
        unlockedAchievements,
      });
    });
  }

  update(time, delta) {
    if (this.paused || this.gameOver) return;
    this.elapsedMs += delta;
    this.difficulty.update(delta);

    let dir = 0;
    if (this.cursors.left.isDown || this.keys.A.isDown) dir = -1;
    else if (this.cursors.right.isDown || this.keys.D.isDown) dir = 1;
    else if (this.pointerDir !== 0) dir = this.pointerDir;
    this.player.setMoveDir(dir);

    this.player.update(delta);
    if (this.player.megaJumpTimer > 0) this.player.megaJumpTimer -= delta;

    this.minPlayerY = Math.min(this.minPlayerY, this.player.sprite.y);

    const desiredCameraY = this.player.sprite.y - GAME_HEIGHT * 0.55;
    const lerped = Phaser.Math.Linear(this.cameraY, desiredCameraY, 0.1);
    this.cameraY = Math.min(this.cameraY, lerped);
    this.cameras.main.scrollY = this.cameraY;

    const camTop = this.cameraY;
    const camBottom = this.cameraY + GAME_HEIGHT;

    // spawn platforms first, then decide collectibles/enemies for any new ones
    const beforeCount = this.platforms.active.length;
    this.platforms.update(camTop, camBottom);
    if (this.platforms.active.length > beforeCount) {
      for (let i = beforeCount; i < this.platforms.active.length; i++) {
        const p = this.platforms.active[i];
        this.collectibles.maybeSpawnAbove(p);
        this.enemies.maybeSpawnNear(p);
      }
    }

    this.collectibles.update(this.player.sprite, camBottom);

    const enemiesBefore = this.enemies.active.length;
    this.enemies.update(delta, camTop, camBottom);
    // enemies that scrolled safely off the bottom without hitting the player count as avoided
    this.enemiesAvoidedThisRun += Math.max(0, enemiesBefore - this.enemies.active.length);

    this.powerups.update();
    this.bg.update(this.cameraY, this._currentHeightMeters());
    this.saveManager.unlockWorld(this.bg.currentWorld.id);

    this.hud.update(this._currentHeightMeters(), this.saveManager.data.bestScore, this.saveManager.data.coins, this.saveManager.data.gems, this.combo);
    this.hud.updatePowerups(this.powerups.getStatuses());

    // fell below the camera -> death
    if (this.player.alive && this.player.sprite.y > camBottom + 140) {
      this.combo = 0;
      this._killPlayer();
    }
  }

  _currentHeightMeters() {
    return Math.max(0, Math.floor((this.startY - this.minPlayerY) / PIXELS_PER_METER)) + Math.floor(this.bonusScore || 0);
  }

  shutdown() {
    this.audioManager?.stopMusic();
  }
}
