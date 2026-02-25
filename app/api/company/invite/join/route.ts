import { withAuth } from "@/lib/withAuth";
import { NextResponse } from "next/server";
import db from "@/db/index";
import { companyInvites, companyMembers } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { companyJoinValidation } from "@/validations/company.validation";

export async function POST(request: Request) {
  try {
    const auth = await withAuth(request);
    if ("error" in auth) return auth.error;

    const body = await request.json();
    // console.log(token, id, role);

    const validateSchema = companyJoinValidation.safeParse(body);

    if (!validateSchema.data) {
      return NextResponse.json(
        {
          message: validateSchema.error.issues[0].message,
          success: false,
        },
        { status: 400 },
      );
    }

    const { token, id, role } = validateSchema.data;

    const requestInvite = await db
      .select()
      .from(companyInvites)
      .where(eq(companyInvites.id, id));

    if (requestInvite.length === 0) {
      return NextResponse.json(
        { message: "Invite not found", success: false },
        { status: 404 },
      );
    }

    if (requestInvite[0].token !== token) {
      return NextResponse.json(
        { message: "Invalid invite token", success: false },
        { status: 401 },
      );
    }

    await db
      .update(companyInvites)
      .set({ status: "accepted" })
      .where(eq(companyInvites.id, id));

    await db.insert(companyMembers).values({
      userId: auth.user.id,
      companyId: requestInvite[0].companyId,
      role,
      hiredBy: requestInvite[0].invitedBy,
    });

    return NextResponse.json({ message: "Invite accepted", success: true });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 },
    );
  }
}
