import db from "@/db";
import { company } from "@/db/schemas/company";
import { withAuth } from "@/lib/withAuth";
import { companyValidation } from "@/validations/company.validation";
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

    const doublicateSlug = await db
      .select()
      .from(company)
      .where(eq(company.slug, slug));

    if (doublicateSlug.length > 0) {
      return NextResponse.json(
        {
          message: "Slug is already existed",
          success: false,
        },
        { status: 400 },
      );
    }

    const checkMultipleUserCompany = await db
      .select()
      .from(company)
      .where(eq(company.userId, userId));

    if (checkMultipleUserCompany.length > 0) {
      return NextResponse.json(
        {
          message: "You already have a company",
          success: false,
        },
        { status: 400 },
      );
    }

    const response = await db.insert(company).values({
      name,
      slug,
      description,
      size,
      founder,
      website,
      industry,
      userId,
    });

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

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const checkMultipleUserCompany = await db
      .select()
      .from(company)
      .where(eq(company.userId, userId));

    if (checkMultipleUserCompany.length === 0) {
      return NextResponse.json(
        {
          message: "You don't have a company",
          success: false,
        },
        { status: 400 },
      );
    }

    const response = await db
      .select()
      .from(company)
      .where(eq(company.userId, userId));

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
