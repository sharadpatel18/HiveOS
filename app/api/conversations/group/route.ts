// app/api/conversations/group/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/db/index";
import { conversations, conversationMembers } from "@/db/schemas/chat/chat";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST /api/conversations/group
// Body: { name: string, memberIds: string[] }
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const { name, memberIds } = (await req.json()) as {
    name: string;
    memberIds: string[];
  };

  if (!name?.trim())
    return NextResponse.json(
      { error: "Group name is required" },
      { status: 400 },
    );

  if (!Array.isArray(memberIds) || memberIds.length < 2)
    return NextResponse.json(
      { error: "A group needs at least 2 other members" },
      { status: 400 },
    );

  // Deduplicate and ensure creator is always included
  const uniqueMembers = [...new Set([userId, ...memberIds])];

  const [newConv] = await db
    .insert(conversations)
    .values({ type: "group", name: name.trim() })
    .returning();

  await db.insert(conversationMembers).values(
    uniqueMembers.map((uid) => ({
      conversationId: newConv.id,
      userId: uid,
    })),
  );

  // Notify all members via socket
  try {
    (global as any).io?.to(uniqueMembers).emit("chat:new-conversation", {
      conversationId: newConv.id,
    });
  } catch (_) {}

  return NextResponse.json(
    { conversationId: newConv.id, created: true },
    { status: 201 },
  );
}
