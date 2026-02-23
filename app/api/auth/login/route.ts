import db from "@/db";
import { users } from "@/db/schemas";
import { loginValidation } from "@/validations/auth.validation";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validateLogin = loginValidation.safeParse(body);
    if (!validateLogin.success) {
      return NextResponse.json(
        {
          message: validateLogin.error.issues[0].message,
          success: false,
        },
        { status: 400 },
      );
    }

    const { email, password } = validateLogin.data;

    const existedUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existedUser.length === 0) {
      return NextResponse.json(
        { message: "Invalid email or password", success: false },
        { status: 401 },
      );
    }

    const user = existedUser[0];

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return NextResponse.json(
        { message: "Invalid email or password", success: false },
        { status: 401 },
      );
    }

    const payload = {
      id: user.id,
      fullName: user.name,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(
      payload,
      process.env.JWT_ACCESS_SECRET as string,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: "7d" },
    );

    const response = NextResponse.json(
      { message: "Login successful", success: true },
      { status: 200 },
    );

    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 15,
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 },
    );
  }
}
