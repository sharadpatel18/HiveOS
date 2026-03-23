import { NextResponse } from "next/server";
import { verifyToken } from "./auth";

type AuthSuccess<T> = { user: T };
type AuthError = { error: NextResponse };
export type AuthResult<T> = AuthSuccess<T> | AuthError;

export async function withAuth(
  request: Request,
): Promise<AuthResult<ReturnType<typeof verifyToken>>> {
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
    const user = verifyToken(token);
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
