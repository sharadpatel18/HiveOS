"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/hooks/useSocket";

interface ConversationPreview {
    id: string;
    type: "direct" | "group";
    name: string | null;          // group chat name from DB
    displayName: string;          // computed: other user's name OR group name
    initials: string;             // computed: for avatar
    lastMessage: { content: string; createdAt: string; senderId: string } | null;
    unreadCount: number;
    otherMembers: {
        userId: string;
        name: string;
        email: string;
    }[];
    // keep this if anything else in your app still references it
    otherMemberIds?: string[];
}

interface ConversationListProps {
    currentUserId: string;
    activeConversationId?: string;
    onSelect: (conversationId: string) => void;
    // Provide user details lookup from your own user store/API
    getUserDisplay: (userId: string) => { name: string; avatarUrl?: string };
}

export function ConversationList({
    currentUserId,
    activeConversationId,
    onSelect,
    getUserDisplay,
}: ConversationListProps) {
    const [conversations, setConversations] = useState<ConversationPreview[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadConversations = async () => {
        try {
            const res = await fetch("/api/conversations");
            if (!res.ok) return;
            const data = await res.json();
            setConversations(data);
        } catch (_) {
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadConversations();
    }, []);

    // Listen for new messages to update previews in real-time
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const onNewMessage = (payload: { message: any }) => {
            setConversations((prev) => {
                // check if conversation already exists in list
                const exists = prev.find(c => c.id === payload.message.conversationId);

                // if not exists → fetch fresh list to get the new conversation
                if (!exists) {
                    loadConversations(); // ← re-fetch to get new conversation
                    return prev;
                }

                return prev
                    .map((c) =>
                        c.id === payload.message.conversationId
                            ? {
                                ...c,
                                lastMessage: payload.message,
                                unreadCount:
                                    payload.message.senderId !== currentUserId
                                        ? c.unreadCount + 1
                                        : c.unreadCount,
                            }
                            : c
                    )
                    .sort((a, b) => {
                        const aTime = a.lastMessage?.createdAt ?? "";
                        const bTime = b.lastMessage?.createdAt ?? "";
                        return bTime.localeCompare(aTime);
                    });
            });
        };

        const onNewConversation = () => loadConversations(); // ← re-fetch full list

        const onReadReceipt = (payload: { conversationId: string; userId: string }) => {
            if (payload.userId === currentUserId) {
                setConversations((prev) =>
                    prev.map((c) =>
                        c.id === payload.conversationId ? { ...c, unreadCount: 0 } : c
                    )
                );
            }
        };

        socket.on("chat:new-message", onNewMessage);
        socket.on("chat:new-conversation", onNewConversation);
        socket.on("chat:read-receipt", onReadReceipt);

        return () => {
            socket.off("chat:new-message", onNewMessage);
            socket.off("chat:new-conversation", onNewConversation);
            socket.off("chat:read-receipt", onReadReceipt);
        };
    }, [currentUserId]);

    if (isLoading) {
        return (
            <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                        <div className="w-10 h-10 rounded-full bg-muted" />
                        <div className="flex-1 space-y-1.5">
                            <div className="h-3 bg-muted rounded w-1/2" />
                            <div className="h-2.5 bg-muted rounded w-3/4" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm gap-1">
                <span>No conversations yet</span>
                <span className="text-xs opacity-70">Start a chat with someone</span>
            </div>
        );
    }

    return (
        <ul className="divide-y divide-border">
            {conversations.map((conv) => {
                // After — use new shape from API
                const otherMember = conv.otherMembers?.[0];
                const user = {
                    name: conv.displayName ?? otherMember?.name ?? "Unknown",
                };
                const isActive = conv.id === activeConversationId;
                const lastMsgText = conv.lastMessage
                    ? conv.lastMessage.senderId === currentUserId
                        ? `You: ${conv.lastMessage.content}`
                        : conv.lastMessage.content
                    : "No messages yet";

                return (
                    <li key={conv.id}>
                        <button
                            onClick={() => onSelect(conv.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent ${isActive ? "bg-accent" : ""
                                }`}
                        >
                            {/* Avatar */}
                            <div className="relative shrink-0">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                            </div>

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                    <span className={`text-sm font-medium truncate ${isActive ? "text-foreground" : ""}`}>
                                        {user.name}
                                    </span>
                                    {conv.lastMessage && (
                                        <span className="text-[10px] text-muted-foreground shrink-0">
                                            {new Date(conv.lastMessage.createdAt).toLocaleDateString([], {
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between gap-1 mt-0.5">
                                    <span className="text-xs text-muted-foreground truncate">
                                        {lastMsgText.slice(0, 60)}
                                        {lastMsgText.length > 60 ? "…" : ""}
                                    </span>
                                    {conv.unreadCount > 0 && (
                                        <span className="shrink-0 min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[10px] font-medium flex items-center justify-center px-1">
                                            {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}
