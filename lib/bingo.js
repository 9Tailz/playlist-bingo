// Pure bingo logic: no React, no I/O. Safe to unit test with `node --test`.

export const GRID_SIZES = [3, 4, 5];
export const MAX_CARDS = 500;

/** Small deterministic PRNG so a game can be reproduced from its seed. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(items, rand) {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function hasFreeCell(size, freeSpace) {
  return Boolean(freeSpace) && size % 2 === 1;
}

/** How many distinct songs one card needs. */
export function cellsNeeded(size, freeSpace) {
  return size * size - (hasFreeCell(size, freeSpace) ? 1 : 0);
}

/** Strip "- Remastered 2011", "(Radio Edit)", "[Live]" style noise for cleaner cells. */
export function simplifyTitle(title) {
  const noise = "remaster|version|edit|mix|live|mono|stereo|feat|from|deluxe|radio|single|bonus";
  const cleaned = String(title)
    .replace(new RegExp(`\\s*[\\(\\[][^\\)\\]]*(${noise})[^\\)\\]]*[\\)\\]]`, "gi"), "")
    .replace(new RegExp(`\\s+-\\s+.*(${noise}).*$`, "i"), "")
    .trim();
  return cleaned || String(title).trim();
}

/**
 * Generate the play order and `count` unique cards.
 * A card cell is an index into `tracks`, or null for the free space.
 */
export function generateGame({ tracks, count, size, freeSpace, seed }) {
  const need = cellsNeeded(size, freeSpace);
  if (!GRID_SIZES.includes(size)) throw new Error("Unsupported grid size.");
  if (!Number.isInteger(count) || count < 1 || count > MAX_CARDS) {
    throw new Error(`Choose between 1 and ${MAX_CARDS} sheets.`);
  }
  if (tracks.length < need) {
    throw new Error(`A ${size}×${size} card needs at least ${need} songs; this playlist has ${tracks.length}.`);
  }

  const rand = mulberry32(seed);
  const indices = tracks.map((_, i) => i);
  const order = shuffle(indices, rand);
  const free = hasFreeCell(size, freeSpace);
  const center = (size * size - 1) / 2;

  const seen = new Set();
  const cards = [];
  for (let n = 0; n < count; n++) {
    let cells;
    let key;
    let tries = 0;
    do {
      const picked = shuffle(indices, rand).slice(0, need);
      cells = free ? [...picked.slice(0, center), null, ...picked.slice(center)] : picked;
      key = cells.join(",");
      tries++;
    } while (seen.has(key) && tries < 20);
    seen.add(key);
    cards.push({ number: n + 1, cells });
  }
  return { order, cards };
}

function lineIndices(size) {
  const lines = [];
  for (let r = 0; r < size; r++) lines.push(Array.from({ length: size }, (_, c) => r * size + c));
  for (let c = 0; c < size; c++) lines.push(Array.from({ length: size }, (_, r) => r * size + c));
  lines.push(Array.from({ length: size }, (_, i) => i * size + i));
  lines.push(Array.from({ length: size }, (_, i) => i * size + (size - 1 - i)));
  return lines;
}

/**
 * For each card, the song number (1-based position in the play order) at which
 * it first has a line, and at which it is completely filled.
 * The free space counts as already marked.
 */
export function winPositions(cards, size, order) {
  const position = new Map(order.map((trackIndex, i) => [trackIndex, i + 1]));
  const lines = lineIndices(size);
  return cards.map((card) => {
    const p = card.cells.map((c) => (c === null ? 0 : position.get(c)));
    const line = Math.min(...lines.map((l) => Math.max(...l.map((i) => p[i]))));
    const full = Math.max(...p);
    return { number: card.number, line, full };
  });
}
