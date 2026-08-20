import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[transform,background-color,color,box-shadow,opacity] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-barn disabled:pointer-events-none disabled:opacity-40 active:not-disabled:scale-[0.96] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-barn text-cream shadow-[var(--shadow-border)] hover:bg-barn-deep",
        asphalt:
          "bg-asphalt text-cream hover:bg-asphalt-soft",
        cream:
          "bg-cream text-ink hover:bg-cream-deep",
        outline:
          "bg-transparent text-ink ring-1 ring-line hover:bg-cream-deep",
        ghost: "bg-transparent text-ink hover:bg-cream-deep",
        link: "bg-transparent text-barn underline-offset-4 hover:underline",
        pine: "bg-pine text-cream hover:bg-pine-soft",
        onDark:
          "bg-transparent text-cream ring-1 ring-chrome/40 hover:bg-asphalt-soft",
      },
      size: {
        default: "h-11 rounded-md px-4 text-sm",
        sm: "h-9 rounded-sm px-3 text-sm",
        lg: "h-12 rounded-md px-6 text-base",
        icon: "size-11 rounded-md",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
