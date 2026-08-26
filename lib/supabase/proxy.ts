import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { AuthProfile } from "@/lib/auth/redirects";
import {
  getProxyRedirect,
  isProtectedPath,
} from "@/lib/auth/session-redirect";

function copySessionCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach(({ name, value }) => {
    to.cookies.set({ name, value, path: "/" });
  });
  return to;
}

function applyPrivateCacheHeaders(response: NextResponse) {
  response.headers.set(
    "Cache-Control",
    "private, no-cache, no-store, must-revalidate, max-age=0",
  );
  response.headers.set("Expires", "0");
  response.headers.set("Pragma", "no-cache");
  return response;
}

function redirectTo(
  request: NextRequest,
  sessionResponse: NextResponse,
  pathname: string,
  search?: Record<string, string>,
) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = pathname;
  redirectUrl.search = "";

  if (search) {
    for (const [key, value] of Object.entries(search)) {
      redirectUrl.searchParams.set(key, value);
    }
  }

  return applyPrivateCacheHeaders(
    copySessionCookies(sessionResponse, NextResponse.redirect(redirectUrl)),
  );
}

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Set them in the Vercel project environment variables.",
    );

    if (isProtectedPath(pathname)) {
      return redirectTo(request, supabaseResponse, "/auth/login", {
        redirect: pathname,
      });
    }

    return applyPrivateCacheHeaders(supabaseResponse);
  }

  try {
    let sessionResponse = supabaseResponse;

    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          sessionResponse = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            sessionResponse.cookies.set(name, value, options);
          });

          Object.entries(headers).forEach(([key, value]) => {
            sessionResponse.headers.set(key, value);
          });
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: profile, error: profileError } = user
      ? await supabase
          .from("profiles")
          .select("role, authority_status")
          .eq("id", user.id)
          .maybeSingle()
      : { data: null, error: null };

    if (profileError) {
      console.error("Proxy profile lookup failed:", profileError);
    }

    const destination = getProxyRedirect(
      pathname,
      Boolean(user),
      (profile as AuthProfile | null) ?? null,
    );

    if (destination) {
      return redirectTo(
        request,
        sessionResponse,
        destination,
        destination === "/auth/login" && !user
          ? { redirect: pathname }
          : undefined,
      );
    }

    return applyPrivateCacheHeaders(sessionResponse);
  } catch (error) {
    console.error("Proxy session update failed:", error);

    if (isProtectedPath(pathname)) {
      return redirectTo(request, supabaseResponse, "/auth/login", {
        redirect: pathname,
      });
    }

    return applyPrivateCacheHeaders(supabaseResponse);
  }
}
