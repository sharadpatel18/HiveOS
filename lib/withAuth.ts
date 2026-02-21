import { NextResponse } from "next/server";
import { verifyToken } from "./auth";

export async function withAuth(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";

  const token = cookieHeader
    .split("; ")
    .find((c) => c.startsWith("accessToken="))
    ?.split("=")[1];

  if (!token) {
    return {
      error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }

  try {
    const user = verifyToken(token);
    return { user };
  } catch {
    return {
      error: NextResponse.json({ message: "Invalid token" }, { status: 401 }),
    };
  }
}
