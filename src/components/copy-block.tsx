import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useEngine } from "@/lib/store";
import { cn } from "@/lib/utils";

export function CopyBlock({
  id,
  label,
  text,
  invert = false,
}: {
  id: string;
  label: string;
  text: string;
  invert?: boolean;
}) {
  const copiedAt = useEngine((s) => s.copied[id]);
  const mark = useEngine((s) => s.markCopied);
  const copied = copiedAt && Date.now() - copiedAt < 4000;

  async function copy() {
    await navigator.clipboard.writeText(text);
    mark(id);
    toast.success("Copied — paste into YouTube Studio");
  }

  return (
    <div
      className={cn(
        "rounded-lg p-4",
        invert ? "bg-asphalt-soft ring-1 ring-line-dark" : "bg-cream-deep/60 ring-1 ring-line",
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p
          className={cn(
            "text-[11px] tracking-[0.18em] uppercase",
            invert ? "text-chrome" : "text-muted",
          )}
        >
          {label}
        </p>
        <Button size="sm" variant={invert ? "cream" : "outline"} onClick={copy}>
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <p className={cn("text-sm leading-relaxed", invert ? "text-cream" : "text-ink")}>{text}</p>
    </div>
  );
}
