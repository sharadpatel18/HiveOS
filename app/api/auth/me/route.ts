import { withAuth } from "@/lib/withAuth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const results = await withAuth(request);

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 },
    );
  }
}
