"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Link2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { TextField } from "@/components/ui/Controls";

export default function PlaylistImport({ playlist, onLoaded }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!url.trim()) {
      setError("Paste a Spotify playlist link first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      onLoaded(data);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card title="1 · Playlist" description="Paste the link of a public Spotify playlist.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end" noValidate>
        <TextField
          id="playlist-url"
          label="Spotify playlist link"
          className="flex-1"
          placeholder="https://open.spotify.com/playlist/…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "playlist-error" : undefined}
        />
        <Button type="submit" variant="primary" icon={Link2} loading={loading} className="sm:w-40">
          {loading ? "Loading…" : "Load playlist"}
        </Button>
      </form>

      {error && (
        <p id="playlist-error" role="alert" className="mt-3 flex items-start gap-2 text-sm text-pink">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      {playlist && !error && (
        <div className="mt-4 flex items-start gap-3 rounded-control border border-cyan/20 bg-cyan/[0.06] p-3">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan" aria-hidden />
          <div className="min-w-0 text-sm">
            <p className="truncate font-medium text-foreground">{playlist.name}</p>
            <p className="text-[13px] text-foreground-2">
              {playlist.tracks.length} songs loaded
              {playlist.truncated &&
                " · Spotify only shares the first 100 songs without API credentials (see README to lift this)"}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
