import db from "@/db";
import { companyMembers, users } from "@/db/schemas";
import { withAuth } from "@/lib/withAuth";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const results = await withAuth(request);
    if ("error" in results) return results.error; // ✅ no cast needed anymore

    const email = request.nextUrl.searchParams.get("email");

    if (!email)
      return NextResponse.json(
        { message: "Email is required", success: false },
        { status: 400 },
      );

    const findUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (findUser.length === 0) {
      return NextResponse.json(
        { message: "User not found", success: false },
        { status: 404 },
      );
    }

    const isMember = await db
      .select()
      .from(companyMembers)
      .where(eq(companyMembers.userId, findUser[0].id));

    if (isMember.length > 0) {
      return NextResponse.json(
        { message: "User is already a member", success: false },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        id: findUser[0].id,
        fullName: findUser[0].name,
        email: findUser[0].email,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 },
    );
  }
}
