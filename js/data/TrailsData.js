export const TRAILS = [
  { id: 'white',  name: 'Classic',  color: 0xffffff, price: 0 },
  { id: 'blue',   name: 'Ice Blue', color: 0x4fd1ff, price: 80 },
  { id: 'gold',   name: 'Golden',   color: 0xffd23f, price: 120 },
  { id: 'pink',   name: 'Bubblegum', color: 0xff6f91, price: 150 },
  { id: 'green',  name: 'Toxic',    color: 0x6fff8a, price: 150 },
  { id: 'purple', name: 'Cosmic',   color: 0xa06fff, price: 200 },
];

export function getTrail(id) {
  return TRAILS.find(t => t.id === id) || TRAILS[0];
}
