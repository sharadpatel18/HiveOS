import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export type JwtPayload = {
  userId: string;
  email: string;
};

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    throw new Error("Invalid token");
  }
}
