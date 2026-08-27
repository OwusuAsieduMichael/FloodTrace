import Image from "next/image";

/** Shared photo backdrop for citizen and authority portals. */
export function PortalBackdrop() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <Image
        src="/DASHBOARD.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(255, 255, 255, 0.46) 0%, rgba(255, 255, 255, 0.38) 48%, rgba(255, 255, 255, 0.52) 100%)",
        }}
      />
    </div>
  );
}
