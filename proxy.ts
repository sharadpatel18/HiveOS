import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const AUTH_ONLY_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

const PROTECTED_ROUTES = ["/dashboard", "/company", "/profile", "/settings"];

function isAuthOnlyRoute(pathname: string) {
  return AUTH_ONLY_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/"),
  );
}

function isProtectedRoute(pathname: string) {
  return PROTECTED_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/"),
  );
}

export default async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET!,
  });

  const isLoggedIn = !!token;

  // ✅ 1. If user is logged in and tries to access login/signup
  // → redirect to redirect param OR dashboard
  if (isLoggedIn && isAuthOnlyRoute(pathname)) {
    const redirect = searchParams.get("redirect");

    if (redirect) {
      return NextResponse.redirect(new URL(redirect, request.url));
    }

    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ✅ 2. If NOT logged in and accessing protected route
  // → redirect to login with FULL path (including ?token=...)
  if (!isLoggedIn && isProtectedRoute(pathname)) {
    const loginUrl = new URL("/login", request.url);

    const fullPath = pathname + request.nextUrl.search;

    loginUrl.searchParams.set("redirect", fullPath);

    return NextResponse.redirect(loginUrl);
  }

  // ✅ 3. Allow request
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|api/auth|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|otf|css|js)$).*)",
  ],
};
