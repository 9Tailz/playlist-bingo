# Playlist Bingo

Paste a **public Spotify playlist link** and generate any number (1–500) of unique, printable
music bingo sheets, plus a **master sheet** for the host.

Next.js (App Router, JavaScript) · Tailwind CSS · Lucide icons · deployable on Vercel.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unit tests for bingo logic + Spotify parsing
npm run lint && npm run build
```

## Use

1. **Setup**: paste a playlist link (`open.spotify.com/playlist/…` or `spotify:playlist:…`) and load it.
2. Choose title, number of sheets, grid size (3×3 / 4×4 / 5×5), free centre, artist names, tidy titles.
3. **Generate**. Preview the sheets and the master sheet.
4. **Print**: Master / Sheets / Print all. Choose "Save as PDF" in the print dialog for a PDF.
   Each player sheet prints on its own page; the master sheet comes first.

## Master sheet

- Songs in a randomised play order with a "Played" tick box.
- **Win checker**: for that play order, the song number at which every sheet first has a line and when it is
  completely filled, so you can verify a "Bingo!" call quickly.

## Spotify data

No credentials are needed: the server route (`/api/playlist`) reads the playlist's public embed data.
Spotify only exposes the **first 100 songs** that way. To try longer playlists, create an app at
https://developer.spotify.com/dashboard and set `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET`
(see `.env.example`; in Vercel use Project Settings → Environment Variables). The official API is tried first
and the embed route is the fallback. Spotify's API rules for playlists change often, so verify this with your own app.
Private playlists, and Spotify-owned editorial playlists that the embed does not expose, will return an error.

## Structure

```
app/api/playlist/route.js   POST {url} → {name, tracks}
lib/spotify.js              link parsing + playlist loading (server only)
lib/bingo.js                seeded card generation, play order, win checker
components/{ui,layout,features}
```

## Assumptions

- No accounts or database: nothing needs to be stored, so Supabase (from the harness) is not wired in.
  Add it later if you want saved games.
- Sheets are one-per-page, black-on-white for printing.
