import jwt from "jsonwebtoken";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;

export function verifyToken(token: string): {
  id: string;
  role: string;
  fullName: string;
  email: string;
  exp: number;
  iat: number;
} {
  try {
    const result = jwt.verify(token, JWT_ACCESS_SECRET) as {
      id: string;
      role: string;
      fullName: string;
      email: string;
      exp: number;
      iat: number;
    };
    return result;
  } catch (err) {
    console.error(err);
    throw new Error("Invalid token");
  }
}
