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
  "/organization-account",
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
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(currentPath);
  });

  // 3) If not logged in and not a public path → send to /login
  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", currentPath);
    return NextResponse.redirect(url);
  }

  // 4) If logged in, compute isAdmin using admin_users view/table
  //    (A row with is_enabled=true means the user is an Admin.)
  let isAdmin = false;
  if (user) {
    const { data: adminRow } = await supabase
      .from("admin_users") // <-- public view recommended
      .select("is_enabled")
      .eq("user_id", user.id)
      .maybeSingle();

    isAdmin = !!adminRow?.is_enabled;
  }

  // 5) Protect /admin routes → only Admins may continue
  if (currentPath.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", currentPath);
      return NextResponse.redirect(url);
    }
    if (!isAdmin) {
      // Non-admin trying to access /admin → bounce to user home (or your user dashboard)
      const url = new URL("/home", request.url);
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
    const url = new URL(isAdmin ? "/admin/dashboard" : "/home", request.url);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
