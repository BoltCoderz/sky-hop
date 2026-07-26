export const ACHIEVEMENTS = [
  { id: 'first_jump',    name: 'First Jump',    desc: 'Make your very first jump',        check: s => s.totalJumps >= 1 },
  { id: 'coins_100',     name: '100 Coins',     desc: 'Collect 100 coins lifetime',       check: s => s.totalCoins >= 100 },
  { id: 'coins_1000',    name: '1000 Coins',    desc: 'Collect 1000 coins lifetime',      check: s => s.totalCoins >= 1000 },
  { id: 'reach_sky',     name: 'Reach the Sky', desc: 'Reach 2000m height in one run',     check: s => s.bestScore >= 2000 },
  { id: 'combo_master',  name: 'Combo Master',  desc: 'Reach a 20x combo',                 check: s => s.bestCombo >= 20 },
  { id: 'gem_hunter',    name: 'Gem Hunter',    desc: 'Collect 50 gems lifetime',          check: s => s.totalGems >= 50 },
  { id: 'explorer',      name: 'Explorer',      desc: 'Unlock 4 different worlds',         check: s => s.worldsUnlocked >= 4 },
  { id: 'champion',      name: 'Champion',      desc: 'Reach 5000m height in one run',     check: s => s.bestScore >= 5000 },
];
