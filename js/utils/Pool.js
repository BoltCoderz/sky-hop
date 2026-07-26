// A thin convenience wrapper around Phaser.GameObjects.Group configured for
// object pooling: sprites are recycled (deactivated + hidden) instead of
// destroyed, and the pool grows lazily up to `maxSize`. This is the backbone
// of "never leak memory" for platforms/enemies/collectibles which are
// spawned and despawned constantly during an endless run.
export default class Pool {
  constructor(scene, textureKey, maxSize = 60) {
    this.scene = scene;
    this.group = scene.add.group({
      defaultKey: textureKey,
      maxSize,
      runChildUpdate: false,
    });
  }

  spawn(x, y, texture) {
    let obj = this.group.get(x, y, texture || this.group.defaultKey);
    if (!obj) return null;
    obj.setTexture(texture || this.group.defaultKey);
    obj.setActive(true).setVisible(true);
    obj.setPosition(x, y);
    // Recycled sprites may carry stale alpha/scale/angle from whatever death
    // tween last ran on them (e.g. a collected coin fading to alpha 0, or a
    // broken platform crumbling away) - reset to a clean default every spawn.
    obj.setAlpha(1);
    obj.setScale(1);
    obj.setAngle(0);
    if (obj.body) {
      obj.body.enable = true;
      obj.body.reset(x, y);
    }
    return obj;
  }

  despawn(obj) {
    if (!obj) return;
    obj.setActive(false).setVisible(false);
    if (obj.body) obj.body.enable = false;
    this.group.killAndHide(obj);
  }

  get children() { return this.group.getChildren(); }

  clear() {
    this.group.clear(true, true);
  }
}
