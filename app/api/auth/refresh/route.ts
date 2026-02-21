import { NextRequest, NextResponse } from "next/server";
import db from "@/db/index";
import { users } from "@/db/schemas/user";
import { eq } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCESS_TOKEN_COOKIE = "accessToken";
const REFRESH_TOKEN_COOKIE = "refreshToken";

const ACCESS_TOKEN_SECRET = new TextEncoder().encode(
  process.env.ACCESS_TOKEN_SECRET!,
);
const REFRESH_TOKEN_SECRET = new TextEncoder().encode(
  process.env.REFRESH_TOKEN_SECRET!,
);

const ACCESS_TOKEN_MAX_AGE = 60 * 15; // 15 minutes
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clearAuthCookies(response: NextResponse) {
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
  return response;
}

function errorResponse(message: string, status: number, clearCookies = false) {
  const response = NextResponse.json({ success: false, message }, { status });
  if (clearCookies) clearAuthCookies(response);
  return response;
}

async function generateAccessToken(payload: {
  userId: string;
  email: string;
  role: string;
}) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(ACCESS_TOKEN_SECRET);
}

async function generateRefreshToken(payload: { userId: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(REFRESH_TOKEN_SECRET);
}

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // 1. Read refresh token from httpOnly cookie
    const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

    if (!refreshToken) {
      return errorResponse("No refresh token provided", 401);
    }

    // 2. Verify JWT signature + expiry
    //    jose throws if token is expired or signature is invalid
    let userId: string;

    try {
      const { payload } = await jwtVerify(refreshToken, REFRESH_TOKEN_SECRET);
      userId = payload.userId as string;

      if (!userId) throw new Error("Missing userId in token");
    } catch {
      // Expired or tampered token → clear cookies and force login
      return errorResponse("Invalid or expired refresh token", 401, true);
    }

    // 3. Fetch user to make sure account still exists and is active
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return errorResponse("User not found", 401, true);
    }

    // 4. Generate new tokens
    const newAccessToken = await generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role, // adjust to match your user schema
    });

    const newRefreshToken = await generateRefreshToken({ userId: user.id });

    // 5. Set new cookies + return access token in body (middleware reads this)
    const response = NextResponse.json({
      success: true,
      accessToken: newAccessToken,
    });

    response.cookies.set(ACCESS_TOKEN_COOKIE, newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: ACCESS_TOKEN_MAX_AGE,
      path: "/",
    });

    response.cookies.set(REFRESH_TOKEN_COOKIE, newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: REFRESH_TOKEN_MAX_AGE,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[AUTH REFRESH]", error);
    return errorResponse("Internal server error", 500);
  }
}
