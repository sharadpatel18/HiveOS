import { useCallback, useEffect, useRef, useState } from "react";
import type { Message } from "@/db/schemas/chat/chat";
import { getSocket } from "./useSocket";

interface UseChatOptions {
  conversationId: string;
  userId: string;
  enabled?: boolean;
}

interface ChatState {
  messages: Message[];
  hasMore: boolean;
  isLoading: boolean;
  isSending: boolean;
  typingUserIds: string[];
  error: string | null;
}

export function useChat({ conversationId, userId, enabled }: UseChatOptions) {
  const [state, setState] = useState<ChatState>({
    messages: [],
    hasMore: false,
    isLoading: true,
    isSending: false,
    typingUserIds: [],
    error: null,
  });

  const cursorRef = useRef<string | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  // ── Load message history ──────────────────────────────────────────────────
  const loadMessages = useCallback(
    async (cursor?: string) => {
      setState((s) => ({ ...s, isLoading: true, error: null }));
      try {
        const params = new URLSearchParams({ limit: "30" });
        if (cursor) params.set("cursor", cursor);

        const res = await fetch(
          `/api/conversations/${conversationId}/messages?${params}`,
        );
        if (!res.ok) throw new Error("Failed to load messages");

        const data: {
          messages: Message[];
          hasMore: boolean;
          nextCursor: string | null;
        } = await res.json();

        cursorRef.current = data.nextCursor;

        setState((s) => ({
          ...s,
          isLoading: false,
          hasMore: data.hasMore,
          messages: cursor
            ? [...data.messages, ...s.messages] // prepend older messages
            : data.messages,
        }));
      } catch (err: any) {
        setState((s) => ({ ...s, isLoading: false, error: err.message }));
      }
    },
    [conversationId],
  );

  // Load on mount & when conversationId changes
  useEffect(() => {
    if (!enabled || !conversationId) return;
    cursorRef.current = null;
    setState({
      messages: [],
      hasMore: false,
      isLoading: true,
      isSending: false,
      typingUserIds: [],
      error: null,
    });
    loadMessages();
  }, [conversationId, loadMessages]);

  // ── Socket listeners ──────────────────────────────────────────────────────
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Capture as non-null so TypeScript trusts it inside nested functions
    const s = socket!;

    function onNewMessage(payload: { message: Message }) {
      if (payload.message.conversationId !== conversationId) return;
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, payload.message],
        typingUserIds: prev.typingUserIds.filter(
          (id) => id !== payload.message.senderId,
        ),
      }));
      if (!document.hidden) {
        s.emit("chat:mark-read", { conversationId });
      }
    }

    function onTyping(payload: {
      userId: string;
      conversationId: string;
      isTyping: boolean;
    }) {
      if (payload.conversationId !== conversationId) return;
      setState((prev) => {
        const without = prev.typingUserIds.filter(
          (id) => id !== payload.userId,
        );
        return {
          ...prev,
          typingUserIds: payload.isTyping
            ? [...without, payload.userId]
            : without,
        };
      });
    }

    s.on("chat:new-message", onNewMessage);
    s.on("chat:typing", onTyping);

    const onVisibilityChange = () => {
      if (!document.hidden) {
        s.emit("chat:mark-read", { conversationId });
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      s.off("chat:new-message", onNewMessage);
      s.off("chat:typing", onTyping);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [conversationId]);

  // ── Send a message ────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (content: string, replyToId?: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;

      const socket = getSocket();
      if (!socket?.connected) {
        setState((s) => ({ ...s, error: "Not connected" }));
        return;
      }

      setState((s) => ({ ...s, isSending: true, error: null }));

      return new Promise<void>((resolve, reject) => {
        socket.emit(
          "chat:send-message",
          { conversationId, content: trimmed, replyToId },
          (res: { ok: boolean; error?: string }) => {
            setState((s) => ({ ...s, isSending: false }));
            if (res.ok) {
              resolve();
            } else {
              setState((s) => ({ ...s, error: res.error ?? "Send failed" }));
              reject(new Error(res.error));
            }
          },
        );
      });
    },
    [conversationId],
  );

  // ── Typing indicator ──────────────────────────────────────────────────────
  const notifyTyping = useCallback(() => {
    const socket = getSocket();
    if (!socket) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit("chat:typing", { conversationId, isTyping: true });
    }

    // Auto-stop after 2 s of inactivity
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit("chat:typing", { conversationId, isTyping: false });
    }, 2000);
  }, [conversationId]);

  const loadMore = useCallback(() => {
    if (!state.isLoading && state.hasMore && cursorRef.current) {
      loadMessages(cursorRef.current);
    }
  }, [state.isLoading, state.hasMore, loadMessages]);

  return { ...state, sendMessage, notifyTyping, loadMore };
}
