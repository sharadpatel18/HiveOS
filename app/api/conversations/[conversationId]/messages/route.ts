// app/api/conversations/[conversationId]/messages/route.ts
// GET  /api/conversations/:id/messages?cursor=<uuid>&limit=30
// Returns paginated messages (newest first unless you flip it in UI)

import { NextRequest, NextResponse } from "next/server";
import db from "@/db/index";
import { messages, conversationMembers } from "@/db/schemas/chat/chat";
import { and, eq, isNull, lt, desc } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { conversationId } = await params;

  // Verify membership
  const [membership] = await db
    .select()
    .from(conversationMembers)
    .where(
      and(
        eq(conversationMembers.conversationId, conversationId),
        eq(conversationMembers.userId, userId),
        isNull(conversationMembers.leftAt),
      ),
    )
    .limit(1);

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const searchParams = req.nextUrl.searchParams;
  const cursor = searchParams.get("cursor"); // ISO timestamp of the oldest loaded message
  const limitParam = parseInt(
    searchParams.get("limit") ?? String(DEFAULT_LIMIT),
    10,
  );
  const limit = Math.min(
    isNaN(limitParam) ? DEFAULT_LIMIT : limitParam,
    MAX_LIMIT,
  );

  const conditions = [
    eq(messages.conversationId, conversationId),
    isNull(messages.deletedAt),
  ];

  if (cursor) {
    conditions.push(lt(messages.createdAt, new Date(cursor)));
  }

  const rows = await db
    .select()
    .from(messages)
    .where(and(...conditions))
    .orderBy(desc(messages.createdAt))
    .limit(limit + 1); // fetch one extra to know if there's a next page

  const hasMore = rows.length > limit;
  const pageMessages = hasMore ? rows.slice(0, limit) : rows;

  return NextResponse.json({
    messages: pageMessages.reverse(), // return in chronological order
    hasMore,
    nextCursor: hasMore ? pageMessages[0].createdAt.toISOString() : null,
  });
}
