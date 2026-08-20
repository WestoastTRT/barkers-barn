import { cn } from "@/lib/utils";

export function BarnMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-8 shrink-0", className)}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="5" fill="currentColor" className="text-barn" />
      <polygon points="2,18 16,4 30,18" fill="currentColor" className="text-cream" />
      <rect x="14" y="7" width="2" height="7" fill="#161210" />
      <rect x="16" y="7" width="2" height="7" fill="#ffffff" />
    </svg>
  );
}

export function Wordmark({
  invert = false,
  compact = false,
  className,
}: {
  invert?: boolean;
  compact?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <BarnMark />
      <span className={cn("leading-none", compact && "hidden md:block")}>
        <span
          className={cn(
            "font-display block text-xl tracking-[0.12em]",
            invert ? "text-cream" : "text-ink",
          )}
        >
          Classic Car Sisters
        </span>
        <span
          className={cn(
            "block text-[10px] tracking-[0.22em] uppercase",
            invert ? "text-chrome" : "text-muted",
          )}
        >
          A Barker's Barn original
        </span>
      </span>
    </span>
  );
}
