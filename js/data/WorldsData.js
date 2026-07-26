// Worlds swap the parallax background palette as the player climbs higher.
// unlockScore = cumulative best-score height required to have ever seen it
// (worlds unlock permanently once reached, then simply appear during runs
// once the player's current height passes their threshold).
export const WORLDS = [
  { id: 'grassland',  name: 'Grassland',   unlockScore: 0,    sky: [0x8fd3ff, 0xcdf5ff], accent: 0x6fcf97 },
  { id: 'skykingdom', name: 'Sky Kingdom', unlockScore: 800,  sky: [0x6fa8ff, 0xb9ddff], accent: 0xffffff },
  { id: 'cloudcity',  name: 'Cloud City',  unlockScore: 1800, sky: [0xffd6ec, 0xffe9d6], accent: 0xffffff },
  { id: 'nightsky',   name: 'Night Sky',   unlockScore: 3200, sky: [0x1b1b4d, 0x3a2f6b], accent: 0xffd23f },
  { id: 'space',      name: 'Space',       unlockScore: 5000, sky: [0x05040f, 0x1a1240], accent: 0x8fd3ff },
  { id: 'rainbow',    name: 'Rainbow',     unlockScore: 7200, sky: [0xff8ac4, 0xffe08a], accent: 0x8affc1 },
  { id: 'candy',      name: 'Candy Land',  unlockScore: 9800, sky: [0xffc2e2, 0xfff2c2], accent: 0xff6fa5 },
];

export function worldForScore(score) {
  let w = WORLDS[0];
  for (const world of WORLDS) {
    if (score >= world.unlockScore) w = world;
  }
  return w;
}

export function nextWorld(currentWorld) {
  const idx = WORLDS.findIndex(w => w.id === currentWorld.id);
  return WORLDS[Math.min(idx + 1, WORLDS.length - 1)];
}
