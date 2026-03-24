import db from "@/db";
import { teamMembers, teams, users } from "@/db/schemas";
import { withAuth } from "@/lib/withAuth";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth: any = await withAuth();
    if ("error" in auth) return auth.error as Response;

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "Team ID is required", success: false },
        { status: 400 },
      );
    }

    const findTeam = await db.select().from(teams).where(eq(teams.id, id));

    if (findTeam.length === 0) {
      return NextResponse.json(
        { message: "Team not found", success: false },
        { status: 404 },
      );
    }

    const teamMembersList = await db
      .select({
        id: teamMembers.id,
        name: users.name,
        email: users.email,
        role: teamMembers.role,
      })
      .from(teamMembers)
      .leftJoin(users, eq(users.id, teamMembers.userId))
      .where(eq(teamMembers.teamId, id));

    return NextResponse.json(
      { ...findTeam[0], members: teamMembersList, success: true },
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth: any = await withAuth();
    if ("error" in auth) return auth.error;

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { message: "Team ID is required", success: false },
        { status: 400 },
      );
    }

    if (auth.user.role !== "FOUNDER" && auth.user.role !== "MANAGER") {
      return NextResponse.json(
        {
          message: "You are not authorized to delete this team",
          success: false,
        },
        { status: 403 },
      );
    }

    const findTeam = await db.select().from(teams).where(eq(teams.id, id));

    if (findTeam.length === 0) {
      return NextResponse.json(
        { message: "Team not found", success: false },
        { status: 404 },
      );
    }

    await db.delete(teamMembers).where(eq(teamMembers.teamId, id));
    await db.delete(teams).where(eq(teams.id, id));

    return NextResponse.json(
      { message: "Team deleted successfully", success: true },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to delete team:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 },
    );
  }
}
