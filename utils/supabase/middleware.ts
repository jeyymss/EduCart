import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// paths that don't require authentication
const publicPaths = [
  "/", // Landing page
  "/login",
  "/signup",
  "/confirm",
  "/error",
  "/reset-password",
  "/organization-signup",
  "/api/paymongo/webhook",
];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

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

  // 1) Verify session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const currentPath = request.nextUrl.pathname;

  // 2) Is this a public path?
  const isPublicPath = publicPaths.some((path) => {
    const pattern = path.replace(":id", "[^/]+");
    const regex = new RegExp(`^${pattern}(/)?$`, "i"); // allow trailing slash
    return regex.test(currentPath);
  });

  // 3) If not logged in and not a public path → send to /login
  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", currentPath);
    return NextResponse.redirect(url);
  }

  // 4) If logged in, compute isAdmin
  let isAdmin = false;
  if (user) {
    const { data: adminRow } = await supabase
      .from("admin_users")
      .select("is_enabled")
      .eq("user_id", user.id)
      .maybeSingle();

    isAdmin = !!adminRow?.is_enabled;
  }

  // 4b) Resolve the user's role
  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("public_user_profiles") // or your "users" table
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    role =
      profile?.role ?? (user.user_metadata?.role as string | undefined) ?? null;
  }

  // 5) Protect /admin → only Admins may continue
  if (currentPath.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", currentPath);
      return NextResponse.redirect(url);
    }
    if (!isAdmin) {
      const url = new URL("/home", request.url);
      return NextResponse.redirect(url);
    }
  }

  // 5b) Protect /organization-account → only Organization role
  if (currentPath.startsWith("/organization-account")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", currentPath);
      return NextResponse.redirect(url);
    }
    const isOrg = (role ?? "").toLowerCase() === "organization";
    if (!isOrg) {
      const url = new URL("/home", request.url);
      url.searchParams.set("blocked", "org-only");
      return NextResponse.redirect(url);
    }
  }

  // 5c) Block Organization role from user-only routes
  const userOnlyPrefixes = [
    "/home",
    "/browse",
    "/businesses",
    "/organizations",
  ];
  if ((role ?? "").toLowerCase() === "organization") {
    const isUserOnlyPath = userOnlyPrefixes.some((prefix) =>
      currentPath.startsWith(prefix)
    );
    if (isUserOnlyPath) {
      // bounce orgs away from student/faculty/alumni areas
      const url = new URL("/organization-account/dashboard", request.url);
      url.searchParams.set("blocked", "user-only");
      return NextResponse.redirect(url);
    }
  }

  // 6) Smart redirects away from login/signup/root when already authenticated
  if (
    user &&
    (currentPath === "/login" ||
      currentPath === "/signup" ||
      currentPath === "/")
  ) {
    const url = new URL(
      isAdmin
        ? "/admin/dashboard"
        : (role ?? "").toLowerCase() === "organization"
        ? "/organization-account"
        : "/home",
      request.url
    );
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
