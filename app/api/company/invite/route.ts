import { NextResponse } from "next/server";
import crypto from "crypto";
import db from "@/db/index";
import { companyMembers, companyInvites, company, users } from "@/db/schemas";
import { eq, and } from "drizzle-orm";
import { withAuth } from "@/lib/withAuth";
import { ROLE_GROUPS } from "@/types/role";
import { sendEmail } from "@/lib/email/sendEmail";
import { companyInviteTemplate } from "@/lib/email/templates";

export async function POST(req: Request) {
  try {
    const auth: any = await withAuth(req);
    if ("error" in auth) return auth.error;

    const { companyId, email, role } = await req.json();

    const invitedUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    const member = await db
      .select()
      .from(companyMembers)
      .where(
        eq(companyMembers.userId, auth.id) &&
          eq(companyMembers.companyId, companyId),
      );

    if (member.length === 0)
      return NextResponse.json(
        { error: "Not a company member" },
        { status: 403 },
      );

    if (!ROLE_GROUPS.CAN_INVITE_EMPLOYEES.includes(role.toUpperCase())) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }
    // 3️⃣ Prevent duplicate invite
    const existingInvite = await db
      .select()
      .from(companyInvites)
      .where(
        and(
          eq(companyInvites.companyId, companyId),
          eq(companyInvites.email, email),
          eq(companyInvites.role, role),
        ),
      );

    if (existingInvite.length > 0)
      return NextResponse.json(
        { error: "Invite already sent" },
        { status: 409 },
      );

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    await db.insert(companyInvites).values({
      companyId,
      userId: invitedUser[0].id,
      email,
      role,
      token,
      invitedBy: auth.id,
      expiresAt,
    });

    const companyData = await db
      .select()
      .from(company)
      .where(eq(company.id, companyId));

    const inviteLink = `${process.env.NEXT_PUBLIC_API_URL}/company/invite?token=${token}`;

    // 6️⃣ Send email (do NOT block DB success if email fails)
    const result = await sendEmail({
      to: email,
      subject: `You're invited to join ${companyData[0].name}`,
      html: companyInviteTemplate({
        companyName: companyData[0].name || "Company",
        role,
        inviteLink,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    const auth: any = await withAuth(req);
    if ("error" in auth) return auth.error;

    const invites = await db
      .select({
        id: companyInvites.id,
        email: companyInvites.email,
        role: companyInvites.role,
        company: {
          id: company.id,
          name: company.name,
          slug: company.slug,
          size: company.size,
          founder: company.founder,
          website: company.website,
          industry: company.industry,
          description: company.description,
        },
        invitedBy: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(companyInvites)
      .leftJoin(users, eq(users.id, companyInvites.invitedBy))
      .leftJoin(company, eq(company.id, companyInvites.companyId))
      .where(eq(companyInvites.userId, auth.id));

    return NextResponse.json(invites);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 },
    );
  }
}
