import type { NextConfig } from "next";

function supabaseOrigins() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    return { https: "", wss: "" };
  }

  try {
    const parsed = new URL(url);
    return {
      https: parsed.origin,
      wss: `wss://${parsed.host}`,
    };
  } catch {
    return { https: "", wss: "" };
  }
}

function serverActionOrigins() {
  const origins = new Set<string>(["localhost:3000"]);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const vercelUrl = process.env.VERCEL_URL;

  if (appUrl) {
    try {
      origins.add(new URL(appUrl).host);
    } catch {
      // Ignore malformed app URL at build time.
    }
  }

  if (vercelUrl) {
    origins.add(vercelUrl);
  }

  return [...origins];
}

const supabase = supabaseOrigins();
const isDev = process.env.NODE_ENV !== "production";

const connectSrc = [
  "'self'",
  supabase.https,
  supabase.wss,
  isDev ? "ws:" : "",
  isDev ? "wss:" : "",
]
  .filter(Boolean)
  .join(" ");

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://openweathermap.org https://*.supabase.co",
  "media-src 'self' blob:",
  "font-src 'self'",
  `connect-src ${connectSrc}`,
  "worker-src 'self' blob:",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  {
    key: "Permissions-Policy",
    value: "camera=(self), geolocation=(self), microphone=(), payment=(), usb=()",
  },
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains; preload",
        },
      ]),
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
];

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Camera evidence can be up to 10 MB; leave headroom for multipart overhead.
      bodySizeLimit: "12mb",
      allowedOrigins: serverActionOrigins(),
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
