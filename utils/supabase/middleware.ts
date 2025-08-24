// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/** Public routes (no auth required). Include /confirm and any children. */
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/reset-password",
  "/error",
  "/confirm",
];

/** Prefixes that should be protected behind auth. Adjust for your app. */
const PROTECTED_PREFIXES = ["/home", "/dashboard", "/organization", "/admin"];

/** Helper: is this pathname a public route (exact or child path)? */
function isPublicPath(pathname: string) {
  return PUBLIC_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/")
  );
}

export async function middleware(request: NextRequest) {
  // Set up response we can mutate cookies on
  let supabaseResponse = NextResponse.next({ request });

  // Supabase SSR client with cookie passthrough
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { pathname, search } = request.nextUrl;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1) Public routes are always allowed (e.g., /confirm won't bounce to /login)
  if (isPublicPath(pathname)) {
    return supabaseResponse;
  }

  // 2) Gate protected prefixes behind auth
  if (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname + search); // preserve query
      return NextResponse.redirect(url);
    }
  }

  // 3) (Optional) Admin gating: only allow admins to /admin
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname + search);
      return NextResponse.redirect(url);
    }

    // look up admin flag (keep or remove if you don't need it)
    const { data: adminRow } = await supabase
      .from("admin_users") // you mentioned this table/view
      .select("is_enabled")
      .eq("user_id", user.id)
      .maybeSingle();

    const isAdmin = !!adminRow?.is_enabled;
    if (!isAdmin) {
      const url = new URL("/home", request.url);
      return NextResponse.redirect(url);
    }
  }

  // 4) (Optional) If already logged in, keep users away from auth pages
  if (
    user &&
    (pathname === "/login" || pathname === "/signup" || pathname === "/")
  ) {
    const url = new URL("/home", request.url);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

/** Apply to all routes except static assets/images/icons. */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)",
  ],
};
