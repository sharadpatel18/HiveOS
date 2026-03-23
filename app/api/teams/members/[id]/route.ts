import db from "@/db";
import { teamMembers } from "@/db/schemas";
import { withAuth } from "@/lib/withAuth";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const auth: any = await withAuth(request);
    if ("error" in auth) return auth.error as Response;

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { message: "Team Member ID is required", success: false },
        { status: 400 },
      );
    }

    if (auth.user.role !== "FOUNDER" && auth.user.role !== "MANAGER") {
      return NextResponse.json(
        {
          message: "You are not authorized to delete this team member",
          success: false,
        },
        { status: 403 },
      );
    }

    const findTeamMember = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.id, id));

    if (findTeamMember.length === 0) {
      return NextResponse.json(
        { message: "Team Member not found", success: false },
        { status: 404 },
      );
    }
    
    await db.delete(teamMembers).where(eq(teamMembers.id, id));

    return NextResponse.json({ message: "Team Member deleted", success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
