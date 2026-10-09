export default function Card({ title, description, actions, className = "", children }) {
  return (
    <section className={`rounded-card border border-white/[0.07] bg-surface/90 shadow-lg shadow-black/20 ${className}`}>
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
          <div>
            {title && <h2 className="text-base font-semibold text-foreground">{title}</h2>}
            {description && <p className="mt-1 text-[13px] text-foreground-2">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}
