// Pool of possible daily missions. Three are rolled each day (seeded by the
// date string so they stay stable all day and change at local midnight).
export const MISSION_POOL = [
  { id: 'coins_100',   desc: 'Collect 100 coins',        type: 'coins',    target: 100,  coin: 50,  gem: 0 },
  { id: 'coins_200',   desc: 'Collect 200 coins',        type: 'coins',    target: 200,  coin: 90,  gem: 1 },
  { id: 'height_500',  desc: 'Reach 500m height',        type: 'height',   target: 500,  coin: 60,  gem: 0 },
  { id: 'height_1000', desc: 'Reach 1000m height',       type: 'height',   target: 1000, coin: 100, gem: 1 },
  { id: 'gems_5',      desc: 'Collect 5 gems',           type: 'gems',     target: 5,    coin: 40,  gem: 2 },
  { id: 'gems_10',     desc: 'Collect 10 gems',          type: 'gems',     target: 10,   coin: 80,  gem: 3 },
  { id: 'rockets_2',   desc: 'Use Rocket Boost twice',   type: 'rockets',  target: 2,    coin: 50,  gem: 1 },
  { id: 'combo_10',    desc: 'Reach a 10x combo',        type: 'combo',    target: 10,   coin: 70,  gem: 1 },
  { id: 'jumps_150',   desc: 'Make 150 jumps',           type: 'jumps',    target: 150,  coin: 55,  gem: 0 },
  { id: 'enemies_10',  desc: 'Dodge 10 enemies safely',  type: 'enemies',  target: 10,   coin: 65,  gem: 1 },
  { id: 'runs_3',      desc: 'Play 3 runs',              type: 'runs',     target: 3,    coin: 45,  gem: 0 },
  { id: 'perfect_5',   desc: 'Land 5 perfect landings',  type: 'perfect',  target: 5,    coin: 60,  gem: 1 },
];

function seededPick(seed, count, pool) {
  // Simple deterministic PRNG (mulberry32) seeded by the date so all players
  // get a stable, repeatable set of missions for the day.
  let a = seed;
  function rand() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

export function getDailyMissions(dateStr) {
  let seed = 0;
  for (let i = 0; i < dateStr.length; i++) seed = (seed * 31 + dateStr.charCodeAt(i)) | 0;
  return seededPick(seed, 3, MISSION_POOL).map(m => ({ ...m, progress: 0, claimed: false }));
}
