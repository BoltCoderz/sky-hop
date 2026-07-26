const TIER_LABELS = [
  { min: 3, label: 'Nice!', color: '#6fcf97' },
  { min: 6, label: 'Awesome!', color: '#4fd1ff' },
  { min: 10, label: 'Great!', color: '#ffd23f' },
  { min: 15, label: 'Amazing!', color: '#ff8a3d' },
  { min: 20, label: 'Legendary!', color: '#ff4d9b' },
];

export function comboLabelFor(combo) {
  let best = null;
  for (const t of TIER_LABELS) if (combo >= t.min) best = t;
  return best;
}

export default class ComboText {
  static popup(scene, x, y, text, color = '#ffffff', size = '40px') {
    const t = scene.add.text(x, y, text, {
      fontFamily: 'Segoe UI, Arial, sans-serif',
      fontSize: size,
      fontStyle: 'bold',
      color,
      stroke: '#1c1c3a',
      strokeThickness: 5,
    }).setOrigin(0.5).setDepth(200);
    scene.tweens.add({
      targets: t,
      y: y - 70,
      alpha: 0,
      scale: 1.3,
      duration: 750,
      ease: 'Cubic.easeOut',
      onComplete: () => t.destroy(),
    });
    return t;
  }
}
