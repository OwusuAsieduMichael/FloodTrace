import { Droplets } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-brand-from/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -bottom-24 size-72 rounded-full bg-brand-to/20 blur-3xl"
      />

      <div className="relative flex w-full max-w-sm flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-from to-brand-to text-primary-foreground shadow-md shadow-primary/20">
            <Droplets className="size-6" />
          </span>
          <span className="font-heading text-lg font-semibold tracking-tight">
            FloodTrace
          </span>
        </div>

        {children}
      </div>
    </div>
  );
}
