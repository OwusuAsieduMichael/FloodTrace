import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  getPostAuthRedirect,
  isAuthPath,
  type AuthProfile,
} from "@/lib/auth/redirects";

function isProtectedPath(pathname: string) {
  return (
    pathname.startsWith("/citizen") ||
    pathname.startsWith("/authority") ||
    pathname.startsWith("/admin")
  );
}

function copySessionCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach(({ name, value }) => {
    to.cookies.set(name, value);
  });
  return to;
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

  return copySessionCookies(sessionResponse, NextResponse.redirect(redirectUrl));
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

    return supabaseResponse;
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

    if (!user) {
      if (isProtectedPath(pathname)) {
        return redirectTo(request, sessionResponse, "/auth/login", {
          redirect: pathname,
        });
      }

      return sessionResponse;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, authority_status")
      .eq("id", user.id)
      .maybeSingle();

    const homePath = profile
      ? getPostAuthRedirect(profile as AuthProfile)
      : "/auth/login";

    const isCallback = pathname.startsWith("/auth/callback");
    const isResetPassword = pathname.startsWith("/auth/reset-password");

    if (isAuthPath(pathname) && !isCallback && !isResetPassword) {
      return redirectTo(request, sessionResponse, homePath);
    }

    if (!profile || !isProtectedPath(pathname)) {
      return sessionResponse;
    }

    const role = profile.role as AuthProfile["role"];
    const authorityStatus = profile.authority_status as AuthProfile["authority_status"];

    if (pathname.startsWith("/admin") && role !== "admin") {
      return redirectTo(request, sessionResponse, homePath);
    }

    if (pathname.startsWith("/citizen") && role !== "citizen") {
      return redirectTo(request, sessionResponse, homePath);
    }

    if (pathname.startsWith("/authority")) {
      if (role !== "authority" && role !== "admin") {
        return redirectTo(request, sessionResponse, homePath);
      }

      if (role === "admin") {
        return redirectTo(request, sessionResponse, "/admin/dashboard");
      }

      const isPendingPage = pathname.startsWith("/authority/pending");
      const isRejectedPage = pathname.startsWith("/authority/rejected");
      const isDashboard = pathname.startsWith("/authority/dashboard");

      if (authorityStatus === "pending" && !isPendingPage) {
        return redirectTo(request, sessionResponse, "/authority/pending");
      }

      if (authorityStatus === "rejected" && !isRejectedPage) {
        return redirectTo(request, sessionResponse, "/authority/rejected");
      }

      if (authorityStatus === "approved" && (isPendingPage || isRejectedPage)) {
        return redirectTo(request, sessionResponse, "/authority/dashboard");
      }

      if (isDashboard && authorityStatus !== "approved") {
        return redirectTo(request, sessionResponse, homePath);
      }
    }

    return sessionResponse;
  } catch (error) {
    console.error("Proxy session update failed:", error);

    if (isProtectedPath(pathname)) {
      return redirectTo(request, supabaseResponse, "/auth/login", {
        redirect: pathname,
      });
    }

    return supabaseResponse;
  }
}
