import BingoCard from "./BingoCard";
import MasterSheet from "./MasterSheet";

// Hidden on screen; shown only when printing. One bingo sheet per page.
export default function PrintSheets({ game }) {
  if (!game) return null;
  return (
    <div className="print-root" aria-hidden="true">
      <section className="print-master print-page">
        <MasterSheet game={game} print />
      </section>
      <section className="print-cards">
        {game.cards.map((card) => (
          <div key={card.number} className="print-page">
            <BingoCard game={game} card={card} print />
          </div>
        ))}
      </section>
    </div>
  );
}
