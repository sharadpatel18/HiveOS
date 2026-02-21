import jwt from "jsonwebtoken";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;

export type JwtPayload = {
  id: string;
  fullName: string;
  email: string;
  role: "USER" | "RECRUITER" | "FOUNDER";
};

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, JWT_ACCESS_SECRET) as JwtPayload;
  } catch {
    throw new Error("Invalid token");
  }
}
