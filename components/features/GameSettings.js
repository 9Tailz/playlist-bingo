"use client";

import { Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Segmented, TextField, Toggle } from "@/components/ui/Controls";
import { GRID_SIZES, MAX_CARDS, cellsNeeded } from "@/lib/bingo";

export default function GameSettings({ settings, onChange, songCount, onGenerate, hasGame }) {
  const set = (patch) => onChange({ ...settings, ...patch });
  const needed = cellsNeeded(settings.size, settings.freeSpace);
  const countValid = Number.isInteger(settings.count) && settings.count >= 1 && settings.count <= MAX_CARDS;
  const enoughSongs = songCount >= needed;
  const canGenerate = songCount > 0 && countValid && enoughSongs;
  const oddGrid = settings.size % 2 === 1;

  let problem = "";
  if (songCount === 0) problem = "Load a playlist to continue.";
  else if (!enoughSongs) problem = `A ${settings.size}×${settings.size} sheet needs ${needed} songs; the playlist has ${songCount}. Pick a smaller grid.`;
  else if (!countValid) problem = `Choose between 1 and ${MAX_CARDS} sheets.`;

  return (
    <Card title="2 · Sheets" description="Choose how the sheets should look. A master sheet is always included.">
      <div className="grid gap-5 md:grid-cols-2">
        <TextField
          id="game-title"
          label="Sheet title"
          value={settings.title}
          maxLength={40}
          onChange={(e) => set({ title: e.target.value })}
        />
        <TextField
          id="sheet-count"
          label="Number of sheets"
          type="number"
          inputMode="numeric"
          min={1}
          max={MAX_CARDS}
          value={Number.isNaN(settings.count) ? "" : settings.count}
          onChange={(e) => set({ count: e.target.value === "" ? NaN : Number(e.target.value) })}
          hint={`1 – ${MAX_CARDS}. Every sheet is different.`}
        />

        <div>
          <span id="grid-label" className="mb-1.5 block text-[13px] font-medium text-foreground-2">
            Grid size
          </span>
          <Segmented
            label="Grid size"
            value={settings.size}
            onChange={(size) => set({ size })}
            options={GRID_SIZES.map((n) => ({ value: n, label: `${n}×${n}` }))}
          />
          <p className="mt-1.5 text-xs text-muted">
            Needs {needed} songs per sheet. Playlists with more songs than that give more variety.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Toggle
            id="free-space"
            label="Free centre space"
            description={oddGrid ? "Centre square is pre-marked." : "Only available on 3×3 and 5×5."}
            checked={settings.freeSpace && oddGrid}
            disabled={!oddGrid}
            onChange={(freeSpace) => set({ freeSpace })}
          />
          <Toggle
            id="show-artist"
            label="Show artist names"
            description="Off makes it harder: players only see song titles."
            checked={settings.showArtist}
            onChange={(showArtist) => set({ showArtist })}
          />
          <Toggle
            id="simplify"
            label="Tidy song titles"
            description="Removes “– Remastered 2011”, “(Radio Edit)” and similar."
            checked={settings.simplify}
            onChange={(simplify) => set({ simplify })}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Button variant="primary" icon={Sparkles} disabled={!canGenerate} onClick={onGenerate}>
          {hasGame ? "Regenerate sheets" : "Generate sheets"}
        </Button>
        {problem && (
          <p className="text-[13px] text-foreground-2" role="status">
            {problem}
          </p>
        )}
      </div>
    </Card>
  );
}
