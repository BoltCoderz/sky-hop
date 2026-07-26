import { ACHIEVEMENTS } from '../data/AchievementsData.js';

export default class AchievementManager {
  constructor(save) {
    this.save = save;
  }

  /** Returns array of newly-unlocked achievement defs (for toast display). */
  checkAll() {
    const s = this.save.data;
    const statSnapshot = {
      ...s.stats,
      bestScore: s.bestScore,
      worldsUnlocked: s.unlockedWorlds.length,
    };
    const unlocked = [];
    for (const a of ACHIEVEMENTS) {
      if (!s.achievements[a.id] && a.check(statSnapshot)) {
        s.achievements[a.id] = true;
        unlocked.push(a);
      }
    }
    if (unlocked.length) this.save.persist();
    return unlocked;
  }

  isUnlocked(id) { return !!this.save.data.achievements[id]; }
  list() { return ACHIEVEMENTS; }
}
