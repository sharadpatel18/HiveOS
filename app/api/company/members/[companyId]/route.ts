import { NextResponse } from "next/server";
import db from "@/db";
import { companyMembers, users } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { withAuth } from "@/lib/withAuth";

export async function GET(
  request: Request,
  context: { params: Promise<{ companyId: string }> },
) {
  try {
    const auth = await withAuth(request);
    if ("error" in auth) return auth.error;

    // ✅ unwrap params
    const { companyId } = await context.params;

    if (!companyId) {
      return NextResponse.json(
        { error: "Company ID missing" },
        { status: 400 },
      );
    }

    const members = await db
      .select({
        id: companyMembers.id,
        name: users.name,
        email: users.email,
        role: companyMembers.role,
        joinedAt: companyMembers.createdAt,
        hiredBy: companyMembers.hiredBy,
        users: {
          id: users.id,
          name: users.name,
          email: users.email,
          role: companyMembers.role,
        },
      })
      .from(companyMembers)
      .leftJoin(users, eq(companyMembers.userId, users.id))
      .where(eq(companyMembers.companyId, companyId));

    return NextResponse.json(members, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
