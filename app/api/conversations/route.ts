// app/api/conversations/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/db/index";
import {
  conversations,
  conversationMembers,
  messages,
} from "@/db/schemas/chat/chat";
import { users } from "@/db/schemas/user/user";
import { and, eq, isNull, desc, sql, ne } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const rows = await db
    .select({
      conversation: conversations,
      lastMessage: messages,
      unreadCount: sql<number>`
        (
          SELECT COUNT(*)::int FROM messages m
          WHERE m.conversation_id = ${conversations.id}
            AND m.created_at > COALESCE(
              (SELECT last_read_at FROM conversation_members cm2
               WHERE cm2.conversation_id = ${conversations.id}
                 AND cm2.user_id = ${userId}),
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

  const result = await Promise.all(
    rows.map(async (row) => {
      // Fetch all OTHER members with their user info
      const otherMembers = await db
        .select({
          userId: conversationMembers.userId,
          name: users.name,
          email: users.email,
        })
        .from(conversationMembers)
        .innerJoin(users, eq(users.id, conversationMembers.userId))
        .where(
          and(
            eq(conversationMembers.conversationId, row.conversation.id),
            ne(conversationMembers.userId, userId),
            isNull(conversationMembers.leftAt),
          ),
        );

      // For direct chats: use the other person's name
      // For group chats: use the conversation name field
      const displayName =
        row.conversation.type === "direct"
          ? (otherMembers[0]?.name ?? "Unknown")
          : (row.conversation.name ?? "Unnamed Group");

      // Initials for avatar
      const initials =
        row.conversation.type === "direct"
          ? (otherMembers[0]?.name ?? "?")
              .split(" ")
              .map((w) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
          : (row.conversation.name ?? "G")[0].toUpperCase();

      return {
        ...row.conversation,
        displayName,
        initials,
        lastMessage: row.lastMessage,
        unreadCount: row.unreadCount,
        otherMembers,
      };
    }),
  );

  return NextResponse.json(result);
}

// ── POST /api/conversations  (direct chat only) ───────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const { otherUserId } = await req.json();

  if (!otherUserId || otherUserId === userId)
    return NextResponse.json({ error: "Invalid otherUserId" }, { status: 400 });

  // Check if direct conversation already exists
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

  if (existing)
    return NextResponse.json({ conversationId: existing.id, created: false });

  const [newConv] = await db
    .insert(conversations)
    .values({ type: "direct" })
    .returning();

  await db.insert(conversationMembers).values([
    { conversationId: newConv.id, userId },
    { conversationId: newConv.id, userId: otherUserId },
  ]);

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
