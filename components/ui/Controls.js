"use client";

export function TextField({ id, label, hint, className = "", ...props }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-foreground-2">
        {label}
      </label>
      <input
        id={id}
        className="h-10 w-full rounded-control border border-white/10 bg-background-2 px-3 text-sm text-foreground placeholder:text-muted"
        {...props}
      />
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function Segmented({ label, value, options, onChange }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-control border border-white/10 bg-background-2 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={`h-8 min-w-14 rounded-md px-3 text-sm transition-colors ${
            value === opt.value ? "bg-surface-2 text-cyan" : "text-foreground-2 hover:text-foreground"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ id, label, description, checked, onChange, disabled = false }) {
  return (
    <div className={`flex items-start justify-between gap-4 ${disabled ? "opacity-50" : ""}`}>
      <div>
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
        {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition-colors ${
          checked ? "border-cyan/60 bg-cyan/30" : "border-white/10 bg-background-2"
        }`}
      >
        <span
          className={`absolute top-0.5 rounded-full transition-all ${
            checked ? "left-[22px] bg-cyan" : "left-0.5 bg-foreground-2"
          }`}
          style={{ height: 18, width: 18 }}
        />
      </button>
    </div>
  );
}
