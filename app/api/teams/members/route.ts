import db from "@/db";
import { companyMembers, teamMembers, teams, users } from "@/db/schemas";
import { withAuth } from "@/lib/withAuth";
import { teamMembersValidation } from "@/validations/teams.validation";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// ─── POST /api/teams/members ──────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const auth: any = await withAuth(request);
    if ("error" in auth) return auth.error as Response;

    // Resolve requester's companyId from DB
    const requesterCompany = await db
      .select()
      .from(companyMembers)
      .where(eq(companyMembers.userId, auth.user.userId));

    if (requesterCompany.length === 0) {
      return NextResponse.json(
        {
          message: "this user are not a member of any company",
          success: false,
        },
        { status: 403 },
      );
    }

    const companyId = requesterCompany[0].companyId;

    const body = await request.json();
    const validateSchema = teamMembersValidation.safeParse(body);

    if (!validateSchema.success) {
      return NextResponse.json(
        { message: validateSchema.error.issues[0].message, success: false },
        { status: 400 },
      );
    }

    const { teamId, userId, role } = validateSchema.data;

    // 1. Team must exist AND belong to requester's company
    const findTeam = await db
      .select()
      .from(teams)
      .where(and(eq(teams.id, teamId), eq(teams.companyId, companyId)));

    if (findTeam.length === 0) {
      return NextResponse.json(
        { message: "Team not found", success: false },
        { status: 404 },
      );
    }

    // 2. Target user must exist
    const findUser = await db.select().from(users).where(eq(users.id, userId));

    if (findUser.length === 0) {
      return NextResponse.json(
        { message: "User not found", success: false },
        { status: 404 },
      );
    }

    // 3. Recruiters cannot be team members
    if (findUser[0].role === "RECRUITER") {
      return NextResponse.json(
        { message: "Recruiters cannot be added to teams", success: false },
        { status: 400 },
      );
    }

    // 4. Target user must belong to the same company
    const isCompanyMember = await db
      .select()
      .from(companyMembers)
      .where(
        and(
          eq(companyMembers.userId, userId),
          eq(companyMembers.companyId, companyId),
        ),
      );

    if (isCompanyMember.length === 0) {
      return NextResponse.json(
        { message: "User is not a member of your company", success: false },
        { status: 400 },
      );
    }

    // 5. User must not already be in this specific team
    const isTeamMember = await db
      .select()
      .from(teamMembers)
      .where(
        and(eq(teamMembers.userId, userId), eq(teamMembers.teamId, teamId)),
      );

    if (isTeamMember.length > 0) {
      return NextResponse.json(
        { message: "User is already a member of this team", success: false },
        { status: 400 },
      );
    }

    // 6. Insert
    const teamMember = await db
      .insert(teamMembers)
      .values({ teamId, userId, role })
      .returning({ id: teamMembers.id });

    return NextResponse.json(
      { id: teamMember[0].id, success: true },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/teams/members]", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 },
    );
  }
}

// ─── GET /api/teams/members ───────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const auth: any = await withAuth(request);
    if ("error" in auth) return auth.error;

    // Resolve requester's companyId from DB
    const requesterCompany = await db
      .select()
      .from(companyMembers)
      .where(eq(companyMembers.userId, auth.user.userId));

    if (requesterCompany.length === 0) {
      return NextResponse.json(
        { message: "You are not a member of any company", success: false },
        { status: 403 },
      );
    }

    const companyId = requesterCompany[0].companyId;

    const email = request.nextUrl.searchParams.get("email");
    const teamId = request.nextUrl.searchParams.get("teamId");

    if (email) {
      if (!teamId) {
        return NextResponse.json(
          { message: "teamId is required", success: false },
          { status: 400 },
        );
      }

      // 1. Find user by email
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

      // 2. Recruiters cannot be invited
      if (findUser[0].role === "RECRUITER") {
        return NextResponse.json(
          { message: "Recruiters cannot be invited to teams", success: false },
          { status: 400 },
        );
      }

      // 3. User must belong to the same company as requester
      const isCompanyMember = await db
        .select()
        .from(companyMembers)
        .where(
          and(
            eq(companyMembers.userId, findUser[0].id),
            eq(companyMembers.companyId, companyId),
          ),
        );

      if (isCompanyMember.length === 0) {
        return NextResponse.json(
          { message: "User is not a member of your company", success: false },
          { status: 400 },
        );
      }

      // 4. User must not already be in this specific team
      const isTeamMember = await db
        .select()
        .from(teamMembers)
        .where(
          and(
            eq(teamMembers.userId, findUser[0].id),
            eq(teamMembers.teamId, teamId),
          ),
        );

      if (isTeamMember.length > 0) {
        return NextResponse.json(
          { message: "User is already a member of this team", success: false },
          { status: 400 },
        );
      }

      return NextResponse.json(findUser, { status: 200 });
    }

    return NextResponse.json(
      { message: "email query param is required", success: false },
      { status: 400 },
    );
  } catch (error) {
    console.error("[GET /api/teams/members]", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 },
    );
  }
}
