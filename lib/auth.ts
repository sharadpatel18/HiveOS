import db from "@/db";
import { users } from "@/db/schemas";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;

export type VerifiedUser = {
  id: string;
  role: string;
  fullName: string;
  email: string;
  exp: number;
  iat: number;
};

type JwtPayload = VerifiedUser;

export async function verifyToken(token: string): Promise<VerifiedUser> {
  let payload: JwtPayload;

  try {
    payload = jwt.verify(token, JWT_ACCESS_SECRET) as JwtPayload;
  } catch (err) {
    console.error(err);
    throw new Error("Invalid or expired token");
  }

  const [user] = await db.select().from(users).where(eq(users.id, payload.id));

  if (!user) {
    console.error("User not found");
    throw new Error("User not found");
  }

  return {
    id: payload.id,
    exp: payload.exp,
    iat: payload.iat,
    role: user.role,
    fullName: user.name,
    email: user.email,
  };
}
