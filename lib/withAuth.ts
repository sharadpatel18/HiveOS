import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

type AuthSuccess = {
  user: {
    id: string;
    email: string;
    name?: string;
    role?: string;
  };
};
type AuthError = { error: NextResponse };
export type AuthResult = AuthSuccess | AuthError;

export async function withAuth(): Promise<AuthResult> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return {
      error: NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 401 },
      ),
    };
  }

  return { user: session.user };
}
