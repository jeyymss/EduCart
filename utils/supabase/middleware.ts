import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// paths that don't require authentication
const publicPaths = [
  "/", // Landing page
  "/login", // login user
  "/signup", // sign up user
  "/callback", // When user clicks confirm email
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
          cookiesToSet.forEach(({ name, value, options }) =>
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

  // ✅ Secure way: verify session via Auth server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const currentPath = request.nextUrl.pathname;

  const isPublicPath = publicPaths.some((path) => {
    const pattern = path.replace(":id", "[^/]+");
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(currentPath);
  });

  // If not logged in and not a public path → redirect to login
  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", currentPath);
    return NextResponse.redirect(url);
  }

  // If logged in, fetch role from DB
  let userRole: string | null = null;
  if (user) {
    const { data: userData, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!error && userData) {
      userRole = userData.role;
    }
  }

  // Admin-only route protection
  if (user && currentPath.startsWith("/admin")) {
    if (userRole !== "Admin") {
      const url = new URL("/admin/dashboard", request.url);
      return NextResponse.redirect(url);
    }
  }

  // Redirect logged-in users away from login/signup/root
  if (
    user &&
    (currentPath === "/login" ||
      currentPath === "/signup" ||
      currentPath === "/")
  ) {
    const url = new URL(
      userRole === "Admin" ? "/admin/dashboard" : "/home",
      request.url
    );
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
