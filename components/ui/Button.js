import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary:
    "bg-cyan text-background hover:bg-cyan/90 disabled:bg-cyan/30 disabled:text-background/60 font-semibold",
  secondary:
    "bg-surface-2 text-foreground hover:bg-surface-2/70 border border-white/10 disabled:opacity-40",
  ghost: "text-foreground-2 hover:text-foreground hover:bg-white/5 disabled:opacity-40",
};

export default function Button({
  variant = "secondary",
  loading = false,
  icon: Icon,
  className = "",
  children,
  disabled,
  ...props
}) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-control px-4 text-sm transition-colors disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : Icon ? <Icon className="h-4 w-4" aria-hidden /> : null}
      {children}
    </button>
  );
}
