import { NextResponse } from "next/server";
import { verifyToken, VerifiedUser } from "./auth"; // ✅ import VerifiedUser directly

type AuthSuccess = { user: VerifiedUser };
type AuthError = { error: NextResponse };
export type AuthResult = AuthSuccess | AuthError; // ✅ no generic needed

export async function withAuth(request: Request): Promise<AuthResult> {
  const cookieHeader = request.headers.get("cookie") || "";

  const token = cookieHeader
    .split("; ")
    .find((c) => c.startsWith("accessToken="))
    ?.split("=")[1];

  if (!token) {
    return {
      error: NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 401 },
      ),
    };
  }

  try {
    const user = await verifyToken(token); // ✅ await added
    return { user };
  } catch (err) {
    console.error("[withAuth] Token verification failed:", err);
    return {
      error: NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 401 },
      ),
    };
  }
}
