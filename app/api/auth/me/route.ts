import db from "@/db";
import { users } from "@/db/schemas";
import { withAuth } from "@/lib/withAuth";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request): Promise<Response> {
  try {
    const results = await withAuth(request); // ✅ no "any" needed now
    if ("error" in results) return results.error;

    const [user] = await db
      .select({
        id: users.id,
        fullName: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, results.user.id));

    if (!user) {
      return NextResponse.json(
        { message: "User not found", success: false },
        { status: 404 },
      );
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 },
    );
  }
}
