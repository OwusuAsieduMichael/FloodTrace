import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold">FloodTrace</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Camera-verified flood &amp; drainage reporting for communities.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link href="/map" className="hover:text-foreground">
            Live Map
          </Link>
          <Link href="/auth/signup" className="hover:text-foreground">
            Report an incident
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} FloodTrace. Civic technology platform.
        </p>
      </div>
    </footer>
  );
}
