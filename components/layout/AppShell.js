"use client";

import { Disc3 } from "lucide-react";

export default function AppShell({ nav, active, onNavigate, header, status, children }) {
  return (
    <div className="app-shell min-h-screen md:grid md:grid-cols-[240px_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-white/[0.07] bg-background-2/80 p-4 md:flex">
        <div className="flex items-center gap-2.5 px-2 py-3">
          <span className="grid h-9 w-9 place-items-center rounded-control bg-cyan/15 text-cyan">
            <Disc3 className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">Playlist Bingo</span>
        </div>

        <nav aria-label="Main" className="mt-6 flex flex-col gap-1">
          {nav.map(({ id, label, icon: Icon, disabled }) => (
            <button
              key={id}
              type="button"
              disabled={disabled}
              aria-current={active === id ? "page" : undefined}
              onClick={() => onNavigate(id)}
              className={`flex h-10 items-center gap-3 rounded-control px-3 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                active === id ? "bg-surface text-foreground" : "text-foreground-2 hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <Icon className={`h-4 w-4 ${active === id ? "text-cyan" : ""}`} aria-hidden />
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-auto rounded-card border border-white/[0.07] bg-surface/70 p-3">{status}</div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] bg-background/80 px-4 py-4 backdrop-blur md:px-8">
          {header}
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-6 pb-28 md:px-8 md:pb-10">{children}</main>
      </div>

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-3 border-t border-white/[0.07] bg-background-2/95 backdrop-blur md:hidden"
      >
        {nav.map(({ id, label, icon: Icon, disabled }) => (
          <button
            key={id}
            type="button"
            disabled={disabled}
            aria-current={active === id ? "page" : undefined}
            onClick={() => onNavigate(id)}
            className={`flex flex-col items-center gap-1 py-3 text-[11px] disabled:opacity-40 ${
              active === id ? "text-cyan" : "text-foreground-2"
            }`}
          >
            <Icon className="h-5 w-5" aria-hidden />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
