import test from "node:test";
import assert from "node:assert/strict";
import { generateGame, winPositions, cellsNeeded, simplifyTitle } from "./bingo.js";

const tracks = Array.from({ length: 40 }, (_, i) => ({ id: `t${i}`, title: `Song ${i}`, artist: "A" }));

test("cells needed accounts for free space only on odd grids", () => {
  assert.equal(cellsNeeded(5, true), 24);
  assert.equal(cellsNeeded(5, false), 25);
  assert.equal(cellsNeeded(4, true), 16);
});

test("cards have unique songs, a centre free space, and are all distinct", () => {
  const { cards, order } = generateGame({ tracks, count: 200, size: 5, freeSpace: true, seed: 7 });
  assert.equal(cards.length, 200);
  assert.equal(order.length, tracks.length);
  const keys = new Set();
  for (const card of cards) {
    assert.equal(card.cells.length, 25);
    assert.equal(card.cells[12], null);
    const songs = card.cells.filter((c) => c !== null);
    assert.equal(new Set(songs).size, 24);
    keys.add(card.cells.join(","));
  }
  assert.equal(keys.size, 200);
});

test("same seed reproduces the same game", () => {
  const a = generateGame({ tracks, count: 5, size: 4, freeSpace: false, seed: 99 });
  const b = generateGame({ tracks, count: 5, size: 4, freeSpace: false, seed: 99 });
  assert.deepEqual(a, b);
});

test("rejects playlists that are too small", () => {
  assert.throws(() => generateGame({ tracks: tracks.slice(0, 10), count: 1, size: 5, freeSpace: true, seed: 1 }));
});

test("win positions: line <= full, and a known card resolves correctly", () => {
  const order = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  const cards = [{ number: 1, cells: [0, 1, 2, 3, 4, 5, 6, 7, 8] }];
  const [w] = winPositions(cards, 3, order);
  assert.equal(w.line, 3); // first row done on song 3
  assert.equal(w.full, 9);
  const { cards: many, order: o } = generateGame({ tracks, count: 50, size: 5, freeSpace: true, seed: 3 });
  for (const r of winPositions(many, 5, o)) assert.ok(r.line <= r.full && r.line >= 5);
});

test("simplifyTitle strips remaster/edit noise", () => {
  assert.equal(simplifyTitle("Africa - Remastered 2014"), "Africa");
  assert.equal(simplifyTitle("Song (Radio Edit)"), "Song");
  assert.equal(simplifyTitle("Don't Stop Believin'"), "Don't Stop Believin'");
});
