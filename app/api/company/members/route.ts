import db from "@/db";
import { companyMembers } from "@/db/schemas/company/company-members";
import { withAuth } from "@/lib/withAuth";
import { companyMembersValidation } from "@/validations/company.validation";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const auth: any = await withAuth(request);

    if ("error" in auth) return auth.error as Response;

    const { id: userId } = auth.user;
    const body = await request.json();

    const validateSchema = companyMembersValidation.safeParse(body);
    if (!validateSchema.data) {
      return NextResponse.json(
        {
          message: validateSchema.error.issues[0].message,
          success: false,
        },
        { status: 400 },
      );
    }

    const existedMember = await db
      .select()
      .from(companyMembers)
      .where(eq(companyMembers.userId, userId));

    if (existedMember.length > 0) {
      return NextResponse.json(
        {
          message: "You are already a member of this company",
          success: false,
        },
        { status: 400 },
      );
    }

    const { companyId, role, hiredBy } = validateSchema.data;

    await db
      .insert(companyMembers)
      .values({ userId, companyId, role, hiredBy });

    return NextResponse.json({ message: "Success", success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
