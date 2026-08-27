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
            "linear-gradient(180deg, rgba(12, 14, 18, 0.28) 0%, rgba(12, 14, 18, 0.18) 42%, rgba(12, 14, 18, 0.4) 100%)",
        }}
      />
    </div>
  );
}
