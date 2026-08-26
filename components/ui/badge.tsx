import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        outline: "text-foreground",
        success:
          "border-transparent bg-success/15 text-success",
        destructive:
          "border-transparent bg-destructive/15 text-destructive",
        critical:
          "border-transparent bg-severity-critical/15 text-severity-critical",
        high:
          "border-transparent bg-severity-high/15 text-severity-high",
        medium:
          "border-transparent bg-severity-medium/15 text-severity-medium",
        low:
          "border-transparent bg-severity-low/15 text-severity-low",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
