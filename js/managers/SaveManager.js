import { STORAGE_KEY } from '../config.js';
import { getDailyMissions } from '../data/MissionsData.js';

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function defaultSave() {
  return {
    version: 1,
    coins: 0,
    gems: 0,
    bestScore: 0,
    unlockedCharacters: ['robot'],
    selectedCharacter: 'robot',
    unlockedWorlds: ['grassland'],
    unlockedTrails: ['white'],
    selectedTrail: 'white',
    achievements: {}, // id -> true
    stats: {
      gamesPlayed: 0,
      totalJumps: 0,
      totalCoins: 0,
      totalGems: 0,
      enemiesAvoided: 0,
      platformsLanded: 0,
      timePlayedMs: 0,
      bestCombo: 0,
    },
    daily: {
      date: todayKey(),
      missions: getDailyMissions(todayKey()),
    },
    settings: {
      musicOn: true,
      sfxOn: true,
      hapticOn: true,
      graphicsQuality: 'high', // 'high' | 'low'
    },
  };
}

export default class SaveManager {
  constructor() {
    this.data = this.load();
    this._refreshDailyIfNeeded();
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultSave();
      const parsed = JSON.parse(raw);
      // shallow-merge with defaults so new fields added in later versions
      // don't crash on an older save blob
      const def = defaultSave();
      return {
        ...def, ...parsed,
        stats: { ...def.stats, ...(parsed.stats || {}) },
        settings: { ...def.settings, ...(parsed.settings || {}) },
        daily: parsed.daily || def.daily,
      };
    } catch (e) {
      console.warn('Save load failed, using defaults', e);
      return defaultSave();
    }
  }

  persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Save persist failed', e);
    }
  }

  _refreshDailyIfNeeded() {
    const tk = todayKey();
    if (this.data.daily.date !== tk) {
      this.data.daily = { date: tk, missions: getDailyMissions(tk) };
      this.persist();
    }
  }

  resetAll() {
    this.data = defaultSave();
    this.persist();
  }

  addCoins(n) {
    this.data.coins += n;
    this.data.stats.totalCoins += Math.max(0, n);
    this.persist();
  }

  addGems(n) {
    this.data.gems += n;
    this.data.stats.totalGems += Math.max(0, n);
    this.persist();
  }

  spendCoins(n) {
    if (this.data.coins < n) return false;
    this.data.coins -= n;
    this.persist();
    return true;
  }

  unlockCharacter(id) {
    if (!this.data.unlockedCharacters.includes(id)) {
      this.data.unlockedCharacters.push(id);
      this.persist();
    }
  }

  unlockTrail(id) {
    if (!this.data.unlockedTrails.includes(id)) {
      this.data.unlockedTrails.push(id);
      this.persist();
    }
  }

  unlockWorld(id) {
    if (!this.data.unlockedWorlds.includes(id)) {
      this.data.unlockedWorlds.push(id);
      this.persist();
    }
  }

  setBestScore(score) {
    if (score > this.data.bestScore) {
      this.data.bestScore = Math.floor(score);
      this.persist();
      return true;
    }
    return false;
  }

  updateStats(patch) {
    Object.entries(patch).forEach(([k, v]) => {
      if (typeof this.data.stats[k] === 'number') this.data.stats[k] += v;
    });
    this.persist();
  }

  setBestCombo(combo) {
    if (combo > this.data.stats.bestCombo) {
      this.data.stats.bestCombo = combo;
      this.persist();
    }
  }

  progressMission(type, amount) {
    let changed = false;
    for (const m of this.data.daily.missions) {
      if (m.type === type && !m.claimed) {
        m.progress = type === 'combo' ? Math.max(m.progress, amount) : m.progress + amount;
        changed = true;
      }
    }
    if (changed) this.persist();
  }

  claimMission(id) {
    const m = this.data.daily.missions.find(x => x.id === id);
    if (!m || m.claimed || m.progress < m.target) return null;
    m.claimed = true;
    this.addCoins(m.coin);
    if (m.gem) this.addGems(m.gem);
    this.persist();
    return m;
  }
}
