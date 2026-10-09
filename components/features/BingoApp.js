"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Disc3, LayoutGrid, ListMusic, Printer, Sparkles } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { generateGame, simplifyTitle, winPositions } from "@/lib/bingo";
import BingoCard from "./BingoCard";
import GameSettings from "./GameSettings";
import MasterSheet from "./MasterSheet";
import PlaylistImport from "./PlaylistImport";
import PrintSheets from "./PrintSheets";
import TrackList from "./TrackList";

const DEFAULT_SETTINGS = { title: "Music Bingo", count: 20, size: 5, freeSpace: true, showArtist: true, simplify: true };
const PREVIEW_STEP = 6;

const VIEW_TITLES = {
  setup: ["Set up your game", "Load a playlist, choose your sheet options, generate."],
  cards: ["Bingo sheets", "Preview of the generated player sheets."],
  master: ["Master sheet", "The host's play order and win checker."],
};

export default function BingoApp() {
  const [view, setView] = useState("setup");
  const [playlist, setPlaylist] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [game, setGame] = useState(null);
  const [visible, setVisible] = useState(PREVIEW_STEP);
  const [error, setError] = useState("");

  // Clear the print mode once the print dialog closes.
  useEffect(() => {
    const reset = () => delete document.body.dataset.print;
    window.addEventListener("afterprint", reset);
    return () => window.removeEventListener("afterprint", reset);
  }, []);

  function handleLoaded(data) {
    setPlaylist(data);
    setGame(null);
    setError("");
  }

  function handleGenerate() {
    try {
      const tracks = playlist.tracks.map((t) => ({ ...t, title: settings.simplify ? simplifyTitle(t.title) : t.title }));
      const seed = Math.floor(Math.random() * 2 ** 32);
      const size = settings.size;
      const freeSpace = settings.freeSpace && size % 2 === 1;
      const { cards, order } = generateGame({ tracks, count: settings.count, size, freeSpace, seed });
      setGame({
        title: settings.title.trim() || "Music Bingo",
        size,
        freeSpace,
        showArtist: settings.showArtist,
        tracks,
        order,
        cards,
        wins: winPositions(cards, size, order),
      });
      setVisible(PREVIEW_STEP);
      setError("");
      setView("cards");
    } catch (err) {
      setError(err.message || "Couldn't generate the sheets.");
    }
  }

  function print(mode) {
    document.body.dataset.print = mode;
    window.print();
  }

  const nav = [
    { id: "setup", label: "Setup", icon: ListMusic },
    { id: "cards", label: "Sheets", icon: LayoutGrid, disabled: !game },
    { id: "master", label: "Master", icon: ClipboardList, disabled: !game },
  ];

  const [title, subtitle] = VIEW_TITLES[view];

  const header = (
    <>
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">{title}</h1>
        <p className="text-[13px] text-foreground-2">{subtitle}</p>
      </div>
      {game && (
        <div className="flex flex-wrap gap-2">
          <Button icon={Printer} onClick={() => print("master")}>
            Master
          </Button>
          <Button icon={Printer} onClick={() => print("cards")}>
            Sheets
          </Button>
          <Button variant="primary" icon={Printer} onClick={() => print("all")}>
            Print all
          </Button>
        </div>
      )}
    </>
  );

  const status = (
    <div className="flex items-start gap-2.5">
      <Disc3 className="mt-0.5 h-4 w-4 shrink-0 text-cyan" aria-hidden />
      <div className="min-w-0 text-xs">
        <p className="truncate font-medium text-foreground">{playlist ? playlist.name : "No playlist loaded"}</p>
        <p className="text-foreground-2">
          {game ? `${game.cards.length} sheets ready` : playlist ? `${playlist.tracks.length} songs` : "Start on the Setup page"}
        </p>
      </div>
    </div>
  );

  return (
    <>
      <AppShell nav={nav} active={view} onNavigate={setView} header={header} status={status}>
        {view === "setup" && (
          <div className="flex flex-col gap-6">
            <PlaylistImport playlist={playlist} onLoaded={handleLoaded} />
            <GameSettings
              settings={settings}
              onChange={setSettings}
              songCount={playlist ? playlist.tracks.length : 0}
              onGenerate={handleGenerate}
              hasGame={Boolean(game)}
            />
            {error && (
              <p role="alert" className="text-sm text-pink">
                {error}
              </p>
            )}
            <TrackList playlist={playlist} />
          </div>
        )}

        {view === "cards" &&
          (game ? (
            <div className="flex flex-col gap-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {game.cards.slice(0, visible).map((card) => (
                  <BingoCard key={card.number} game={game} card={card} />
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <p className="text-[13px] text-foreground-2">
                  Showing {Math.min(visible, game.cards.length)} of {game.cards.length} sheets
                </p>
                {visible < game.cards.length && (
                  <>
                    <Button onClick={() => setVisible((v) => v + PREVIEW_STEP * 4)}>Show more</Button>
                    <Button variant="ghost" onClick={() => setVisible(game.cards.length)}>
                      Show all
                    </Button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <EmptyGame onSetup={() => setView("setup")} />
          ))}

        {view === "master" && (game ? <MasterSheet game={game} /> : <EmptyGame onSetup={() => setView("setup")} />)}
      </AppShell>

      <PrintSheets game={game} />
    </>
  );
}

function EmptyGame({ onSetup }) {
  return (
    <Card>
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <p className="text-base font-semibold">No sheets yet</p>
        <p className="max-w-sm text-[13px] text-foreground-2">Load a playlist and generate your sheets to see them here.</p>
        <Button variant="primary" icon={Sparkles} onClick={onSetup}>
          Go to setup
        </Button>
      </div>
    </Card>
  );
}
