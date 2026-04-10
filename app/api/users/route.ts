import { NextResponse } from "next/server";
import db from "@/db";
import { users } from "@/db/schemas";
import { ne } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allUsers = await db
    .select({
      id: users.id,
      fullName: users.name, // ← match your actual column name
      email: users.email,
    })
    .from(users)
    .where(ne(users.id, session.user.id)); // exclude current user

  return NextResponse.json(allUsers);
}
