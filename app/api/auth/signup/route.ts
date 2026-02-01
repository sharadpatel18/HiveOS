import db from "@/db";
import { users } from "@/db/schemas";
import { signupValidation } from "@/validations/auth.validation";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validateSignup = signupValidation.safeParse(body);
    if (!validateSignup.success) {
      return NextResponse.json(
        {
          message: validateSignup.error.issues[0].message,
          success: false,
        },
        { status: 400 },
      );
    }
    const { name, email, password, role } = validateSignup.data;

    const existedUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existedUser.length > 0) {
      NextResponse.json(
        {
          message: "user is already existed",
          success: false,
        },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.insert(users).values({
      name: name,
      email,
      role,
      password: hashedPassword,
    });

    return NextResponse.json(
      { message: "User created successfully", success: true },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    NextResponse.json(
      { messahe: "Internal server error", success: false },
      { status: 500 },
    );
  }
}
