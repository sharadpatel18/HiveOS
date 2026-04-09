// db/schema/chat.ts
// Add this to your existing Drizzle schema file or import it in your main schema

import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  pgEnum,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const messageStatusEnum = pgEnum("message_status", [
  "sent",
  "delivered",
  "read",
]);

export const conversationTypeEnum = pgEnum("conversation_type", [
  "direct", // 1-on-1
  "group", // future use
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

/**
 * conversations
 * One row per chat thread (direct or group).
 * For direct chats, the two participants are stored in conversation_members.
 */
export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: conversationTypeEnum("type").notNull().default("direct"),
    // For group chats (future): optional display name
    name: text("name"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    // Cache the latest message for quick preview in sidebar
    lastMessageId: uuid("last_message_id"),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
  },
  (t) => ({
    lastMessageAtIdx: index("conversations_last_message_at_idx").on(
      t.lastMessageAt,
    ),
  }),
);

/**
 * conversation_members
 * Junction table — links users to conversations.
 * Also tracks per-user unread count and soft-delete (left_at).
 */
export const conversationMembers = pgTable(
  "conversation_members",
  {
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    // Replace with your actual users table reference
    userId: uuid("user_id").notNull(),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    // When the user soft-deleted / left the conversation
    leftAt: timestamp("left_at", { withTimezone: true }),
    // Used to compute unread badge count
    lastReadAt: timestamp("last_read_at", { withTimezone: true }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.conversationId, t.userId] }),
    userIdx: index("conversation_members_user_id_idx").on(t.userId),
  }),
);

/**
 * messages
 * Individual chat messages.  Supports soft-delete via deletedAt.
 */
export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    // Replace with your actual users table reference
    senderId: uuid("sender_id").notNull(),
    content: text("content").notNull(),
    status: messageStatusEnum("status").notNull().default("sent"),
    // For threaded replies (optional, can leave null for flat chat)
    replyToId: uuid("reply_to_id"),
    // Soft delete — frontend shows "This message was deleted"
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    conversationCreatedAtIdx: index("messages_conversation_created_at_idx").on(
      t.conversationId,
      t.createdAt,
    ),
    senderIdx: index("messages_sender_id_idx").on(t.senderId),
  }),
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const conversationsRelations = relations(
  conversations,
  ({ many, one }) => ({
    members: many(conversationMembers),
    messages: many(messages),
    lastMessage: one(messages, {
      fields: [conversations.lastMessageId],
      references: [messages.id],
    }),
  }),
);

export const conversationMembersRelations = relations(
  conversationMembers,
  ({ one }) => ({
    conversation: one(conversations, {
      fields: [conversationMembers.conversationId],
      references: [conversations.id],
    }),
  }),
);

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  replyTo: one(messages, {
    fields: [messages.replyToId],
    references: [messages.id],
    relationName: "reply",
  }),
}));

// ─── Types ────────────────────────────────────────────────────────────────────

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type ConversationMember = typeof conversationMembers.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
