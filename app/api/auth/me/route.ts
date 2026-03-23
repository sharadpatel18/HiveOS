import db from "@/db";
import { users } from "@/db/schemas";
import { withAuth } from "@/lib/withAuth";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const results: any = await withAuth(request);
    if ("error" in results) return results.error;

    const findUser = await db
      .select({
        id: users.id,
        fullName: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, results.user.id));

    return NextResponse.json(findUser[0], { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 },
    );
  }
}
