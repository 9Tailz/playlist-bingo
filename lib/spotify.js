// Server-side only. Loads the tracks of a PUBLIC Spotify playlist.
//
// Strategy:
//   1. If SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET are set, try the official Web API.
//   2. Otherwise (or if that fails) read the public embed page, which needs no credentials
//      but only exposes the first ~100 tracks.

const ID_RE = /^[A-Za-z0-9]{22}$/;
const TIMEOUT_MS = 10000;
const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

export class PlaylistError extends Error {
  constructor(userMessage, status = 502) {
    super(userMessage);
    this.userMessage = userMessage;
    this.status = status;
  }
}

/** Accepts open.spotify.com URLs, spotify:playlist: URIs, or a bare 22-char id. */
export function parsePlaylistId(input) {
  const s = String(input ?? "").trim();
  if (!s) return null;
  if (ID_RE.test(s)) return s;
  const uri = s.match(/^spotify:playlist:([A-Za-z0-9]{22})$/);
  if (uri) return uri[1];
  try {
    const url = new URL(s);
    if (!/(^|\.)spotify\.com$/.test(url.hostname)) return null;
    const m = url.pathname.match(/\/playlist\/([A-Za-z0-9]{22})/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

function clean(text) {
  return String(text ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

/** Drop blanks and duplicate tracks, keep playlist order. */
export function normaliseTracks(list) {
  const seen = new Set();
  const out = [];
  for (const t of list) {
    const title = clean(t.title);
    if (!title) continue;
    const artist = clean(t.artist);
    const key = t.id || `${title.toLowerCase()}|${artist.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ id: String(key), title, artist });
  }
  return out;
}

// ---------- Embed page ----------

function findObjectWithKey(node, key, depth = 0) {
  if (!node || typeof node !== "object" || depth > 12) return null;
  if (Array.isArray(node[key])) return node;
  for (const value of Object.values(node)) {
    const hit = findObjectWithKey(value, key, depth + 1);
    if (hit) return hit;
  }
  return null;
}

/** Exported for tests. Parses the __NEXT_DATA__ blob on open.spotify.com/embed pages. */
export function parseEmbedHtml(html) {
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!match) return null;
  let data;
  try {
    data = JSON.parse(match[1]);
  } catch {
    return null;
  }
  const entity = findObjectWithKey(data, "trackList");
  if (!entity) return null;
  const tracks = normaliseTracks(
    entity.trackList.map((item) => ({
      id: typeof item.uri === "string" ? item.uri.split(":").pop() : "",
      title: item.title,
      artist: item.subtitle,
    })),
  );
  return { name: clean(entity.name || entity.title) || "Spotify playlist", tracks };
}

async function loadViaEmbed(id) {
  const res = await fetch(`https://open.spotify.com/embed/playlist/${id}`, {
    headers: { "User-Agent": BROWSER_UA, "Accept-Language": "en" },
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (res.status === 404) {
    throw new PlaylistError("Playlist not found. Check the link and make sure the playlist is public.", 404);
  }
  if (!res.ok) throw new PlaylistError("Spotify didn't respond as expected. Please try again.");
  const parsed = parseEmbedHtml(await res.text());
  if (!parsed || parsed.tracks.length === 0) {
    throw new PlaylistError("Couldn't read any songs from that playlist. Is it public and not empty?", 422);
  }
  return { ...parsed, source: "embed", truncated: parsed.tracks.length >= 100 };
}

// ---------- Web API (optional) ----------

async function getAppToken() {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) return null;
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`token request failed (${res.status})`);
  return (await res.json()).access_token;
}

async function loadViaApi(id, token) {
  const headers = { Authorization: `Bearer ${token}` };
  const opts = { headers, cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS) };

  const metaRes = await fetch(`https://api.spotify.com/v1/playlists/${id}?fields=name`, opts);
  if (!metaRes.ok) throw new Error(`playlist request failed (${metaRes.status})`);
  const name = clean((await metaRes.json()).name) || "Spotify playlist";

  const rows = [];
  let url = `https://api.spotify.com/v1/playlists/${id}/tracks?limit=100&fields=next,items(track(id,name,type,is_local,artists(name)))`;
  for (let page = 0; url && page < 50; page++) {
    const res = await fetch(url, opts);
    if (!res.ok) throw new Error(`tracks request failed (${res.status})`);
    const json = await res.json();
    for (const row of json.items ?? []) {
      const t = row.track ?? row.item;
      if (!t || t.type === "episode" || t.is_local) continue;
      rows.push({ id: t.id, title: t.name, artist: (t.artists ?? []).map((a) => a.name).join(", ") });
    }
    url = json.next;
  }
  return { name, tracks: normaliseTracks(rows), source: "api", truncated: false };
}

export async function loadPlaylist(id) {
  let token = null;
  try {
    token = await getAppToken();
  } catch (err) {
    console.error("[spotify] token error:", err.message);
  }
  if (token) {
    try {
      const result = await loadViaApi(id, token);
      if (result.tracks.length) return result;
    } catch (err) {
      console.error("[spotify] API failed, falling back to embed:", err.message);
    }
  }
  return loadViaEmbed(id);
}
