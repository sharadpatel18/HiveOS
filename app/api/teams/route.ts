import db from "@/db";
import {
  company,
  companyMembers,
  teamMembers,
  teams,
  users,
} from "@/db/schemas";
import { withAuth } from "@/lib/withAuth";
import { teamValidation } from "@/validations/teams.validation";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const auth: any = await withAuth(request);
    if ("error" in auth) return auth.error as Response;

    const body = await request.json();

    const validateSchema = teamValidation.safeParse({
      ...body,
      slug: body.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
    });

    if (!validateSchema.success) {
      return NextResponse.json(
        {
          message: validateSchema.error.issues[0].message,
          success: false,
        },
        { status: 400 },
      );
    }

    const { name, slug, description, teamleadId, personalTeam, companyId } =
      validateSchema.data;

    // Check teamlead exists
    const [findTeamlead] = await db
      .select({
        id: users.id,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, teamleadId))
      .limit(1);

    if (!findTeamlead) {
      return NextResponse.json(
        { message: "Team lead not found", success: false },
        { status: 404 },
      );
    }

    // Check duplicate slug
    const [duplicateSlug] = await db
      .select()
      .from(teams)
      .where(eq(teams.slug, slug))
      .limit(1);

    if (duplicateSlug) {
      return NextResponse.json(
        { message: "Slug already exists", success: false },
        { status: 400 },
      );
    }

    // Insert team and return the created row
    const [team] = await db
      .insert(teams)
      .values({
        name,
        slug,
        description: description ?? null,
        teamleadId,
        personalTeam,
        companyId,
      })
      .returning();

    // Insert teamlead as first member
    await db.insert(teamMembers).values({
      teamId: team.id,
      userId: teamleadId,
      role: findTeamlead.role,
    });

    return NextResponse.json(
      { message: "Team created successfully", success: true },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create team:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const auth: any = await withAuth(request);
    if ("error" in auth) return auth.error;

    // console.log(companyId);

    const findCompanyId = await db
      .select({
        companyId: companyMembers.companyId,
      })
      .from(companyMembers)
      .where(eq(companyMembers.userId, auth.id));

    const companyId = findCompanyId[0]?.companyId ?? null;

    if (!companyId) {
      return NextResponse.json(
        { message: "Company not found", success: false },
        { status: 404 },
      );
    }

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
    console.log("TEAM DETAILS", teamDetails);

    return NextResponse.json(teamDetails, { status: 200 });
  } catch (error) {
    console.error("Failed to get teams:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 },
    );
  }
}
