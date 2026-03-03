import { NextResponse } from "next/server";
import { verifyToken } from "./auth";

export async function withAuth(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";

  const token = cookieHeader
    .split("; ")
    .find((c) => c.startsWith("accessToken="))
    ?.split("=")[1];

  if (!token) {
    return NextResponse.json(
      { message: "Unauthorized", success: false },
      { status: 401 },
    );
  }

  try {
    const user = verifyToken(token);
    return user;
  } catch (err) {
    console.error("[withAuth] Token verification failed:", err);
    throw err;
  }
}
