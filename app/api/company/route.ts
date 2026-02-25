import db from "@/db";
import { companyMembers, users } from "@/db/schemas";
import { company } from "@/db/schemas/company";
import { withAuth } from "@/lib/withAuth";
import {
  companyMembersValidation,
  companyValidation,
} from "@/validations/company.validation";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const auth = await withAuth(request);
    if ("error" in auth) return auth.error;

    const { id: userId } = auth.user;
    const body = await request.json();

    const validateSchema = companyValidation.safeParse(body);
    if (!validateSchema.data) {
      return NextResponse.json(
        {
          message: validateSchema.error.issues[0].message,
          success: false,
        },
        { status: 400 },
      );
    }

    const { name, slug, description, size, founder, website, industry } =
      validateSchema.data;

    const duplicateSlug = await db
      .select()
      .from(company)
      .where(eq(company.slug, slug));

    if (duplicateSlug.length > 0) {
      return NextResponse.json(
        { message: "Slug is already existed", success: false },
        { status: 400 },
      );
    }

    const existingCompany = await db
      .select()
      .from(company)
      .where(eq(company.userId, userId));

    if (existingCompany.length > 0) {
      return NextResponse.json(
        { message: "You already have a company", success: false },
        { status: 400 },
      );
    }

    const response = await db
      .insert(company)
      .values({
        name,
        slug,
        description,
        size,
        founder,
        website,
        industry,
        userId,
      })
      .returning();

    await db.update(users).set({ role: "FOUNDER" }).where(eq(users.id, userId));

    const payload = {
      userId,
      companyId: response[0].id,
      role: "FOUNDER",
      hiredBy: userId,
    };

    const validateCompanyMember = companyMembersValidation.safeParse(payload);
    if (!validateCompanyMember.data) {
      return NextResponse.json(
        {
          message: validateCompanyMember.error.issues[0].message,
          success: false,
        },
        { status: 400 },
      );
    }

    await db.insert(companyMembers).values(validateCompanyMember.data);

    return NextResponse.json({ message: "Success" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const auth = await withAuth(request);
    if ("error" in auth) return auth.error;

    const { id: userId } = auth.user;

    // Find the company where this user is a member (any role)
    // companyMembers links userId → companyId, so we join company on that
    const result = await db
      .select({
        // Company fields
        id: company.id,
        name: company.name,
        slug: company.slug,
        description: company.description,
        size: company.size,
        founder: company.founder,
        website: company.website,
        industry: company.industry,
        isActive: company.isActive,
        userId: company.userId,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
        // Member's role in this company
        memberRole: companyMembers.role,
      })
      .from(companyMembers)
      .innerJoin(company, eq(company.id, companyMembers.companyId)) // ✅ correct join
      .where(eq(companyMembers.userId, userId)) // ✅ filter by logged-in user
      .limit(1); // one company per user for now

    if (result.length === 0) {
      return NextResponse.json(null, { status: 200 });
      // returning null (not 404) so the frontend can show the "create company" state
    }

    return NextResponse.json(result[0], { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
