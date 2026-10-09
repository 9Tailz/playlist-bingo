import { Music2 } from "lucide-react";
import Card from "@/components/ui/Card";

export default function TrackList({ playlist }) {
  if (!playlist) {
    return (
      <Card title="Songs">
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <span className="grid h-11 w-11 place-items-center rounded-card bg-surface-2 text-muted">
            <Music2 className="h-5 w-5" aria-hidden />
          </span>
          <p className="text-sm font-medium">No playlist yet</p>
          <p className="max-w-xs text-[13px] text-foreground-2">
            Paste a public Spotify playlist link above to see its songs here.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Songs" description={`${playlist.tracks.length} in “${playlist.name}”`}>
      <ol className="max-h-80 divide-y divide-white/[0.06] overflow-y-auto rounded-control border border-white/[0.07] bg-background-2/60">
        {playlist.tracks.map((t, i) => (
          <li key={t.id} className="flex items-baseline gap-3 px-3 py-2 text-[13px]">
            <span className="w-7 shrink-0 text-right tabular-nums text-muted">{i + 1}</span>
            <span className="min-w-0 flex-1 truncate font-medium">{t.title}</span>
            <span className="hidden min-w-0 max-w-[40%] truncate text-foreground-2 sm:block">{t.artist}</span>
          </li>
        ))}
      </ol>
    </Card>
  );
}
