// One bingo sheet. `print` swaps to the black-on-white theme and physical (pt/mm) sizing.

const PRINT_FONT = { 3: [15, 10], 4: [12, 8.5], 5: [10.5, 7.5] }; // [title pt, artist pt]
const SCREEN_FONT = { 3: [13, 11], 4: [11, 10], 5: [10, 9] }; // px

export default function BingoCard({ game, card, print = false }) {
  const { size, tracks, title, showArtist } = game;
  const [titleSize, artistSize] = (print ? PRINT_FONT : SCREEN_FONT)[size];
  const unit = print ? "pt" : "px";
  const number = String(card.number).padStart(3, "0");

  return (
    <article
      className={`bingo-card ${print ? "sheet-theme-print" : "sheet-theme-screen rounded-card border border-white/[0.07] p-4"}`}
      aria-label={`Bingo sheet ${number}`}
    >
      <div className="bingo-card-head">
        <h3 className="bingo-card-title" style={{ fontSize: print ? "22pt" : 15 }}>
          {title}
        </h3>
        <span className="bingo-card-number" style={{ fontSize: print ? "12pt" : 12 }}>
          No. {number}
        </span>
      </div>

      <div className="bingo-grid" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
        {card.cells.map((cell, i) =>
          cell === null ? (
            <div key={i} className="bingo-cell bingo-cell-free" style={{ fontSize: `${titleSize}${unit}` }}>
              <img  src="https://doublevisionbrewing.com/cdn/shop/files/dvb_logo.png" alt="Free space"/>
            </div>
          ) : (
            <div key={i} className="bingo-cell">
              <span className="bingo-cell-title" style={{ fontSize: `${titleSize}${unit}` }}>
                {tracks[cell].title}
              </span>
              {showArtist && tracks[cell].artist && (
                <span className="bingo-cell-artist" style={{ fontSize: `${artistSize}${unit}` }}>
                  {tracks[cell].artist}
                </span>
              )}
            </div>
          ),
        )}
      </div>
    </article>
  );
}
