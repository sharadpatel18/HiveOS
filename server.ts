// server.ts  (project root — replaces default Next.js server)
// Run with:  npx ts-node --project tsconfig.server.json server.ts
// Or add to package.json:  "dev": "ts-node server.ts"

import { config } from "dotenv";
config({ path: ".env" });

console.log("DATABASE_URL:", process.env.DATABASE_URL);

import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer, Socket } from "socket.io";
// import db from "./db/index"; // your Drizzle db instance
import {
  messages,
  conversations,
  conversationMembers,
} from "./db/schemas/chat/chat";
import * as schema from "./db/schemas/index";
import { eq, and, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// ← Create pool HERE after dotenv has already loaded
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool, { schema });

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT ?? "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// ─── In-memory online users map  userId → socketId ───────────────────────────
const onlineUsers = new Map<string, string>();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    // Attach io to the httpServer so API routes can emit events too
    path: "/api/socket",
  });

  // Make io accessible in Next.js API routes via (global as any).io
  (global as any).io = io;

  // ─── Socket middleware: authenticate ───────────────────────────────────────
  io.use(async (socket, next) => {
    const userId = socket.handshake.auth?.userId as string | undefined;
    if (!userId) return next(new Error("Unauthorized: no userId in handshake"));
    // TODO: verify JWT / session here if needed
    socket.data.userId = userId;
    next();
  });

  // ─── Connection handler ────────────────────────────────────────────────────
  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId as string;
    onlineUsers.set(userId, socket.id);
    socket.broadcast.emit("user:online", { userId });

    console.log(`[socket] connected  userId=${userId}  id=${socket.id}`);

    // ── Join all conversation rooms for this user ──────────────────────────
    socket.on("chat:join-rooms", async () => {
      const memberships = await db
        .select({ conversationId: conversationMembers.conversationId })
        .from(conversationMembers)
        .where(
          and(
            eq(conversationMembers.userId, userId),
            isNull(conversationMembers.leftAt),
          ),
        );

      const roomIds = memberships.map((m) => m.conversationId);
      socket.join(roomIds);
      socket.emit("chat:rooms-joined", { rooms: roomIds });
    });

    // ── Send a message ─────────────────────────────────────────────────────
    socket.on(
      "chat:send-message",
      async (
        payload: {
          conversationId: string;
          content: string;
          replyToId?: string;
        },
        ack?: (res: {
          ok: boolean;
          messageId?: string;
          error?: string;
        }) => void,
      ) => {
        try {
          const { conversationId, content, replyToId } = payload;

          // Verify sender is a member
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

          if (!membership) throw new Error("Not a member of this conversation");

          // Insert message
          const [newMessage] = await db
            .insert(messages)
            .values({
              conversationId,
              senderId: userId,
              content: content.trim(),
              replyToId: replyToId ?? null,
              status: "sent",
            })
            .returning();

          // Update conversation cache
          await db
            .update(conversations)
            .set({
              lastMessageId: newMessage.id,
              lastMessageAt: newMessage.createdAt,
              updatedAt: new Date(),
            })
            .where(eq(conversations.id, conversationId));

          // Broadcast to everyone in the room (including sender)
          io.to(conversationId).emit("chat:new-message", {
            message: newMessage,
          });

          ack?.({ ok: true, messageId: newMessage.id });
        } catch (err: any) {
          console.error("[socket] chat:send-message error", err);
          ack?.({ ok: false, error: err.message });
        }
      },
    );

    // ── Typing indicators ──────────────────────────────────────────────────
    socket.on(
      "chat:typing",
      (payload: { conversationId: string; isTyping: boolean }) => {
        socket
          .to(payload.conversationId)
          .emit("chat:typing", { userId, isTyping: payload.isTyping });
      },
    );

    // ── Mark messages as read ──────────────────────────────────────────────
    socket.on("chat:mark-read", async (payload: { conversationId: string }) => {
      const now = new Date();
      await db
        .update(conversationMembers)
        .set({ lastReadAt: now })
        .where(
          and(
            eq(conversationMembers.conversationId, payload.conversationId),
            eq(conversationMembers.userId, userId),
          ),
        );

      // Notify other members the user read the chat
      socket.to(payload.conversationId).emit("chat:read-receipt", {
        userId,
        conversationId: payload.conversationId,
        readAt: now,
      });
    });

    // ── Disconnect ─────────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      socket.broadcast.emit("user:offline", { userId });
      console.log(`[socket] disconnected  userId=${userId}`);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
