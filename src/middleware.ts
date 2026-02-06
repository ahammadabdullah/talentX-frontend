import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  // Public routes that don't require authentication
  const isPublicRoute = ["/", "/jobs", "/login", "/api/auth"].some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  // Job detail pages are public
  const isJobDetailRoute = /^\/jobs\/[^/]+$/.test(nextUrl.pathname);

  if (isJobDetailRoute) {
    return NextResponse.next();
  }

  if (isPublicRoute) {
    // Redirect logged-in users away from login page
    if (isLoggedIn && nextUrl.pathname === "/login") {
      const dashboardUrl =
        userRole === "EMPLOYER" ? "/employer/dashboard" : "/talent/dashboard";
      return NextResponse.redirect(new URL(dashboardUrl, nextUrl));
    }
    return NextResponse.next();
  }

  // Require authentication for protected routes
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Role-based route protection
  if (nextUrl.pathname.startsWith("/employer") && userRole !== "EMPLOYER") {
    return NextResponse.redirect(new URL("/talent/dashboard", nextUrl));
  }

  if (nextUrl.pathname.startsWith("/talent") && userRole !== "TALENT") {
    return NextResponse.redirect(new URL("/employer/dashboard", nextUrl));
  }

  // Redirect to appropriate dashboard for onboarding
  if (nextUrl.pathname === "/onboarding" && userRole) {
    const dashboardUrl =
      userRole === "EMPLOYER" ? "/employer/dashboard" : "/talent/dashboard";
    return NextResponse.redirect(new URL(dashboardUrl, nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
