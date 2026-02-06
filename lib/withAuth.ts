import { NextResponse } from "next/server";
import { verifyToken } from "./auth";

export async function withAuth(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }

  const token = authHeader.split(" ")[1];

  try {
    const user = verifyToken(token);
    return { user };
  } catch {
    return {
      error: NextResponse.json({ message: "Invalid token" }, { status: 401 }),
    };
  }
}
