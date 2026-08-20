import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-md bg-paper px-3 text-sm text-ink ring-1 ring-line placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-barn",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-md bg-paper px-3 py-2 text-sm text-ink ring-1 ring-line placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-barn",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn("text-sm font-medium text-ink", className)}
      {...props}
    />
  );
}
