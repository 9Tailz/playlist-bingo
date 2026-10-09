// Host's master sheet: the play order (tick off as played) and the win checker.

export default function MasterSheet({ game, print = false }) {
  const { tracks, order, wins, title, size, cards } = game;
  const fs = print ? { body: "9.5pt", head: "20pt", sub: "10pt", h2: "13pt" } : { body: "13px", head: "18px", sub: "12px", h2: "14px" };

  return (
    <div
      className={`master ${print ? "sheet-theme-print" : "sheet-theme-screen rounded-card border border-white/[0.07] p-5"}`}
      style={{ fontSize: fs.body }}
    >
      <div>
        <h2 style={{ fontSize: fs.head, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {title} — Master Sheet
        </h2>
        <p style={{ fontSize: fs.sub, color: "var(--sh-fg-2)", marginTop: 4 }}>
          {cards.length} sheets · {size}×{size} grid · {tracks.length} songs · play in the order below
        </p>
      </div>

      <table className="master-table" style={{ marginTop: 14 }}>
        <thead>
          <tr>
            <th style={{ width: 44 }}>#</th>
            <th>Song</th>
            <th>Artist</th>
            <th style={{ width: 44, textAlign: "center" }}>Played</th>
          </tr>
        </thead>
        <tbody>
          {order.map((trackIndex, i) => (
            <tr key={trackIndex}>
              <td style={{ color: "var(--sh-fg-2)", fontVariantNumeric: "tabular-nums" }}>{i + 1}</td>
              <td style={{ fontWeight: 600 }}>{tracks[trackIndex].title}</td>
              <td style={{ color: "var(--sh-fg-2)" }}>{tracks[trackIndex].artist}</td>
              <td style={{ textAlign: "center" }}>
                <span className="master-box" aria-hidden />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ fontSize: fs.h2, fontWeight: 700, marginTop: 28 }}>Win checker</h3>
      <p style={{ fontSize: fs.sub, color: "var(--sh-fg-2)", margin: "4px 0 10px" }}>
        If you play in the order above, this is the song number by which each sheet first has a line,
        and by which it is completely filled{size % 2 === 1 && game.freeSpace ? " (free space counts as marked)" : ""}.
        Use it to verify a caller&apos;s claim.
      </p>
      <div className="win-grid">
        {wins.map((w) => (
          <div key={w.number} className="win-item">
            <strong>No. {String(w.number).padStart(3, "0")}</strong>
            <span>
              Line <strong>{w.line}</strong> · Full <strong>{w.full}</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
