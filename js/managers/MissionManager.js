export default class MissionManager {
  constructor(save) { this.save = save; }

  getMissions() { return this.save.data.daily.missions; }

  /** Called from GameScene as events happen during a run. */
  report(type, amount = 1) { this.save.progressMission(type, amount); }

  claim(id) { return this.save.claimMission(id); }

  allClaimed() { return this.getMissions().every(m => m.claimed); }
}
