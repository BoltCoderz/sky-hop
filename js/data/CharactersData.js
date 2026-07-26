// Each character is drawn procedurally (see utils/TextureGenerator.js) from a
// small palette + "face" descriptor, so no external art assets are required.
// body/accent = fill colors, face = which facial preset to draw, unlock =
// coin cost (0 means unlocked by default).
export const CHARACTERS = [
  { id: 'robot',   name: 'Robo',     body: 0x9aa5b1, accent: 0x4fd1ff, face: 'visor',  price: 0    },
  { id: 'fox',     name: 'Foxy',     body: 0xff8a3d, accent: 0xffffff, face: 'cute',   price: 150  },
  { id: 'panda',   name: 'Panda',    body: 0xf5f5f5, accent: 0x2b2b2b, face: 'cute',   price: 200  },
  { id: 'knight',  name: 'Knight',   body: 0x8c9aab, accent: 0xffd23f, face: 'visor',  price: 300  },
  { id: 'wizard',  name: 'Wizard',   body: 0x7b4de0, accent: 0xffd23f, face: 'cute',   price: 350  },
  { id: 'alien',   name: 'Zorp',     body: 0x5ef2a6, accent: 0x1c1c3a, face: 'alien',  price: 400  },
  { id: 'pirate',  name: 'Pirate',   body: 0xb5651d, accent: 0x2b2b2b, face: 'patch',  price: 450  },
  { id: 'ninja',   name: 'Ninja',    body: 0x2b2b3a, accent: 0xff3b3b, face: 'visor',  price: 500  },
  { id: 'dragon',  name: 'Dragon',   body: 0xff5c5c, accent: 0xffd23f, face: 'alien',  price: 600  },
  { id: 'astro',   name: 'Astro',    body: 0xffffff, accent: 0xff8a3d, face: 'visor',  price: 750  },
];

export function getCharacter(id) {
  return CHARACTERS.find(c => c.id === id) || CHARACTERS[0];
}
