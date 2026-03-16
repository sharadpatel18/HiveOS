import db from "@/db";
import { teamMembers, teams, users } from "@/db/schemas";
import { withAuth } from "@/lib/withAuth";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params: { companyId } }: { params: { companyId: string } },
) {
  try {
    const auth: any = await withAuth(request);
    if ("error" in auth) return auth.error;

    // console.log(companyId);

    const teamDetails = await db
      .select({
        id: teams.id,
        name: teams.name,
        slug: teams.slug,
        description: teams.description,
        teamleadId: teams.teamleadId,
        personalTeam: teams.personalTeam,
        companyId: teams.companyId,
      })
      .from(teams)
      .where(eq(teams.companyId, companyId));
    // console.log("TEAM DETAILS", teamDetails);
    if (teamDetails.length === 0) {
      return NextResponse.json(
        { message: "Team not found", success: false },
        { status: 404 },
      );
    }
    const teamMemberList = await db
      .select({
        id: teamMembers.id,
        name: users.name,
        email: users.email,
        userId: teamMembers.userId,
        role: teamMembers.role,
      })
      .from(teamMembers)
      .innerJoin(users, eq(users.id, teamMembers.userId))
      .where(eq(teamMembers.teamId, teamDetails[0].id));

    return NextResponse.json(
      { ...teamDetails, teamMembers: teamMemberList },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to get teams:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 },
    );
  }
}
