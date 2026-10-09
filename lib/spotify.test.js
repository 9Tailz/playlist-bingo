import test from "node:test";
import assert from "node:assert/strict";
import { parsePlaylistId, parseEmbedHtml, normaliseTracks } from "./spotify.js";

const ID = "37i9dQZF1DXcBWIGoYBM5M";

test("parses the common link shapes", () => {
  assert.equal(parsePlaylistId(`https://open.spotify.com/playlist/${ID}?si=abc123`), ID);
  assert.equal(parsePlaylistId(`https://open.spotify.com/intl-de/playlist/${ID}`), ID);
  assert.equal(parsePlaylistId(`spotify:playlist:${ID}`), ID);
  assert.equal(parsePlaylistId(ID), ID);
});

test("rejects non-Spotify or malformed input", () => {
  assert.equal(parsePlaylistId(""), null);
  assert.equal(parsePlaylistId(`https://evil.example.com/playlist/${ID}`), null);
  assert.equal(parsePlaylistId("https://open.spotify.com/album/" + ID), null);
  assert.equal(parsePlaylistId("not a link"), null);
});

test("parses embed __NEXT_DATA__ and dedupes tracks", () => {
  const data = {
    props: { pageProps: { state: { data: { entity: {
      name: "Road Trip",
      trackList: [
        { uri: "spotify:track:aaa", title: "Africa", subtitle: "Toto" },
        { uri: "spotify:track:bbb", title: "Take On Me", subtitle: "a\u00a0ha" },
        { uri: "spotify:track:aaa", title: "Africa", subtitle: "Toto" },
      ],
    } } } } },
  };
  const html = `<html><script id="__NEXT_DATA__" type="application/json">${JSON.stringify(data)}</script></html>`;
  const parsed = parseEmbedHtml(html);
  assert.equal(parsed.name, "Road Trip");
  assert.equal(parsed.tracks.length, 2);
  assert.equal(parsed.tracks[1].artist, "a ha");
});

test("returns null when the page has no data", () => {
  assert.equal(parseEmbedHtml("<html></html>"), null);
});

test("normaliseTracks drops blanks", () => {
  assert.equal(normaliseTracks([{ id: "1", title: "  ", artist: "x" }]).length, 0);
});
