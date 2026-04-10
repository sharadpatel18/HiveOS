import { NextRequest, NextResponse } from "next/server";
import db from "@/db/index";
import {
  conversations,
  conversationMembers,
  messages,
} from "@/db/schemas/chat/chat";
import { and, eq, isNull, desc, sql } from "drizzle-orm";
import { getServerSession } from "next-auth"; // replace with your auth util
import { authOptions } from "@/lib/auth"; // replace with your auth options

// ── GET /api/conversations ────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  // All conversations where the user is an active member,
  // with the other member's info and unread count
  const rows = await db
    .select({
      conversation: conversations,
      lastMessage: messages,
      unreadCount: sql<number>`
        (
          SELECT COUNT(*)::int
          FROM messages m
          WHERE m.conversation_id = ${conversations.id}
            AND m.created_at > COALESCE(
              (
                SELECT last_read_at FROM conversation_members cm2
                WHERE cm2.conversation_id = ${conversations.id}
                  AND cm2.user_id = ${userId}
              ),
              '1970-01-01'::timestamptz
            )
            AND m.sender_id != ${userId}
            AND m.deleted_at IS NULL
        )
      `.as("unread_count"),
    })
    .from(conversationMembers)
    .innerJoin(
      conversations,
      eq(conversations.id, conversationMembers.conversationId),
    )
    .leftJoin(messages, eq(messages.id, conversations.lastMessageId))
    .where(
      and(
        eq(conversationMembers.userId, userId),
        isNull(conversationMembers.leftAt),
      ),
    )
    .orderBy(desc(conversations.lastMessageAt));

  // For each conversation, also fetch the OTHER member(s)
  const result = await Promise.all(
    rows.map(async (row: any) => {
      const otherMembers = await db
        .select({ userId: conversationMembers.userId })
        .from(conversationMembers)
        .where(
          and(
            eq(conversationMembers.conversationId, row.conversation.id),
            sql`${conversationMembers.userId} != ${userId}`,
          ),
        );

      return {
        ...row.conversation,
        lastMessage: row.lastMessage,
        unreadCount: row.unreadCount,
        otherMemberIds: otherMembers.map((m: any) => m.userId),
      };
    }),
  );

  return NextResponse.json(result);
}

// ── POST /api/conversations ───────────────────────────────────────────────────
// Body: { otherUserId: string }
// Returns existing conversation if one already exists, otherwise creates it.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { otherUserId } = await req.json();

  if (!otherUserId || otherUserId === userId) {
    return NextResponse.json({ error: "Invalid otherUserId" }, { status: 400 });
  }

  // Check if a direct conversation already exists between the two users
  const [existing] = await db
    .select({ id: conversations.id })
    .from(conversations)
    .innerJoin(
      conversationMembers,
      eq(conversationMembers.conversationId, conversations.id),
    )
    .where(
      and(
        eq(conversations.type, "direct"),
        sql`
          (
            SELECT COUNT(DISTINCT user_id) FROM conversation_members
            WHERE conversation_id = ${conversations.id}
              AND user_id IN (${userId}, ${otherUserId})
              AND left_at IS NULL
          ) = 2
        `,
      ),
    )
    .limit(1);

  if (existing) {
    return NextResponse.json({ conversationId: existing.id, created: false });
  }

  // Create new conversation + two member rows
  const [newConv] = await db
    .insert(conversations)
    .values({ type: "direct" })
    .returning();

  await db.insert(conversationMembers).values([
    { conversationId: newConv.id, userId },
    { conversationId: newConv.id, userId: otherUserId },
  ]);

  // Notify both users via socket (if connected)
  try {
    (global as any).io
      ?.to([userId, otherUserId])
      .emit("chat:new-conversation", {
        conversationId: newConv.id,
      });
  } catch (_) {}

  return NextResponse.json(
    { conversationId: newConv.id, created: true },
    { status: 201 },
  );
}
