import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, SignJWT } from "jose";

// ─── Cookie names ─────────────────────────────────────────────────────────────
const ACCESS_TOKEN_COOKIE = "accessToken";
const REFRESH_TOKEN_COOKIE = "refreshToken";

// ─── Secrets — must match what your backend uses to sign tokens ───────────────
const ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);
const REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET!,
);

// ─── Routes ───────────────────────────────────────────────────────────────────
const PUBLIC_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];
const AUTH_ONLY_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/"),
  );
}

function isAuthOnlyRoute(pathname: string) {
  return AUTH_ONLY_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/"),
  );
}

function redirectToLoginHard(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  const fullPath = request.nextUrl.pathname + request.nextUrl.search;
  loginUrl.searchParams.set("redirect", fullPath);
  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
  return response;
}
// ─── Verify a token directly — no fetch, no network call ─────────────────────
async function verifyToken(token: string, secret: Uint8Array) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

// ─── Generate new access token directly in proxy ─────────────────────────────
async function generateAccessToken(payload: Record<string, unknown>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(ACCESS_SECRET);
}

// ─── Proxy ────────────────────────────────────────────────────────────────────
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  // 1. No refresh token → session dead → redirect to login
  if (!refreshToken) {
    if (isPublicRoute(pathname)) return NextResponse.next();
    return redirectToLoginHard(request);
  }

  // 2. Authenticated + visiting login/register → send to dashboard
  if (isAuthOnlyRoute(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 3. Public route → allow
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // 4. Has access token → verify it directly (no fetch)
  if (accessToken) {
    const payload = await verifyToken(accessToken, ACCESS_SECRET);
    if (payload) return NextResponse.next(); // valid token → allow
    // Access token is invalid/expired → fall through to refresh
  }

  // 5. No access token or expired → verify refresh token directly (no fetch)
  const refreshPayload = await verifyToken(refreshToken, REFRESH_SECRET);

  if (!refreshPayload) {
    // Refresh token is also invalid/expired → force login
    return redirectToLoginHard(request);
  }

  // 6. Refresh token valid → generate new access token directly here
  //    Strip jwt-specific fields, keep only your custom payload fields
  const { iat, exp, ...userPayload } = refreshPayload;

  const newAccessToken = await generateAccessToken(userPayload);

  // 7. Set new access token cookie and continue the request
  const response = NextResponse.next();

  response.cookies.set(ACCESS_TOKEN_COOKIE, newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 15, // 15 minutes
    path: "/",
  });

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|otf|css|js)$).*)",
  ],
};
