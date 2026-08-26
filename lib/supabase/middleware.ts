import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  getPostAuthRedirect,
  isAuthPath,
  type AuthProfile,
} from "@/lib/auth/redirects";
import { getSupabasePublicConfig } from "@/lib/env";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const { url, anonKey } = getSupabasePublicConfig();
  const pathname = request.nextUrl.pathname;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        supabaseResponse = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtected =
    pathname.startsWith("/citizen") ||
    pathname.startsWith("/authority") ||
    pathname.startsWith("/admin");

  if (!user) {
    if (isProtected) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/auth/login";
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return supabaseResponse;
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
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = homePath;
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (!profile || !isProtected) {
    return supabaseResponse;
  }

  const role = profile.role as AuthProfile["role"];
  const authorityStatus = profile.authority_status as AuthProfile["authority_status"];

  if (pathname.startsWith("/admin") && role !== "admin") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = homePath;
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname.startsWith("/citizen") && role !== "citizen") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = homePath;
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname.startsWith("/authority")) {
    if (role !== "authority" && role !== "admin") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = homePath;
      return NextResponse.redirect(redirectUrl);
    }

    if (role === "admin") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/admin/dashboard";
      return NextResponse.redirect(redirectUrl);
    }

    const isPendingPage = pathname.startsWith("/authority/pending");
    const isRejectedPage = pathname.startsWith("/authority/rejected");
    const isDashboard = pathname.startsWith("/authority/dashboard");

    if (authorityStatus === "pending" && !isPendingPage) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/authority/pending";
      return NextResponse.redirect(redirectUrl);
    }

    if (authorityStatus === "rejected" && !isRejectedPage) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/authority/rejected";
      return NextResponse.redirect(redirectUrl);
    }

    if (
      authorityStatus === "approved" &&
      (isPendingPage || isRejectedPage)
    ) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/authority/dashboard";
      return NextResponse.redirect(redirectUrl);
    }

    if (isDashboard && authorityStatus !== "approved") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = homePath;
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}
