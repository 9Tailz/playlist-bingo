import { NextResponse } from "next/server";
import { loadPlaylist, parsePlaylistId, PlaylistError } from "@/lib/spotify";

export const dynamic = "force-dynamic";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const id = parsePlaylistId(body?.url);
  if (!id) {
    return NextResponse.json(
      { error: "That doesn't look like a Spotify playlist link. Use a link like open.spotify.com/playlist/…" },
      { status: 400 },
    );
  }

  try {
    const playlist = await loadPlaylist(id);
    return NextResponse.json(playlist);
  } catch (err) {
    console.error("[api/playlist]", id, err?.message);
    if (err instanceof PlaylistError) {
      return NextResponse.json({ error: err.userMessage }, { status: err.status });
    }
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
