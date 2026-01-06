import { NextRequest, NextResponse } from "next/server";

// Public routes that don't require authentication
const publicRoutes = ["/", "/sign-in", "/sign-up", "/invite"];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ["/sign-in", "/sign-up"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for Better Auth session cookie (with or without __Secure- prefix)
  const sessionToken =
    request.cookies.get("__Secure-better-auth.session_token")?.value ||
    request.cookies.get("better-auth.session_token")?.value;
  const isAuthenticated = !!sessionToken;

  // Check if user had a session before (for expired session detection)
  const hadSession = request.cookies.get("gdd_had_session")?.value === "true";

  // Check if this is a public route
  const isPublicRoute = publicRoutes.some((route) =>
    route === "/" ? pathname === "/" : pathname.startsWith(route)
  );

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && authRoutes.some((route) => pathname.startsWith(route))) {
    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    // Set cookie to track that user has had a session
    response.cookies.set("gdd_had_session", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
    return response;
  }

  // For authenticated users on any route, ensure the had_session cookie is set
  if (isAuthenticated && !hadSession) {
    const response = NextResponse.next();
    response.cookies.set("gdd_had_session", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
    return response;
  }

  // Redirect unauthenticated users to sign-in (except for public routes)
  if (!isAuthenticated && !isPublicRoute) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);

    // If user had a session before, mark as expired
    if (hadSession) {
      signInUrl.searchParams.set("expired", "true");
    }

    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)",
  ],
};
