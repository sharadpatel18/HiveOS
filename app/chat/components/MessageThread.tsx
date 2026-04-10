"use client";

import { useEffect, useRef } from "react";
import type { Message } from "@/db/schemas/chat/chat";

interface MessageThreadProps {
    messages: Message[];
    currentUserId: string;
    isLoading: boolean;
    hasMore: boolean;
    typingUserIds: string[];
    onLoadMore: () => void;
}

export function MessageThread({
    messages,
    currentUserId,
    isLoading,
    hasMore,
    typingUserIds,
    onLoadMore,
}: MessageThreadProps) {
    const bottomRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const prevLengthRef = useRef(0);

    // Auto-scroll to bottom only when new messages arrive (not when loading older)
    useEffect(() => {
        if (messages.length > prevLengthRef.current) {
            const lastMessage = messages[messages.length - 1];
            // Scroll to bottom only if the new message is from the current user
            // or the user is near the bottom
            const container = containerRef.current;
            const isNearBottom =
                container
                    ? container.scrollHeight - container.scrollTop - container.clientHeight < 100
                    : true;

            if (lastMessage?.senderId === currentUserId || isNearBottom) {
                bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            }
        }
        prevLengthRef.current = messages.length;
    }, [messages, currentUserId]);

    // Infinite scroll — detect scroll to top to load older messages
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const onScroll = () => {
            if (container.scrollTop < 60 && !isLoading && hasMore) {
                onLoadMore();
            }
        };

        container.addEventListener("scroll", onScroll, { passive: true });
        return () => container.removeEventListener("scroll", onScroll);
    }, [isLoading, hasMore, onLoadMore]);

    return (
        <div
            ref={containerRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
        >
            {/* Load more trigger */}
            {hasMore && (
                <div className="flex justify-center py-2">
                    <button
                        onClick={onLoadMore}
                        disabled={isLoading}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    >
                        {isLoading ? "Loading…" : "Load earlier messages"}
                    </button>
                </div>
            )}

            {isLoading && messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                    <span className="text-sm text-muted-foreground animate-pulse">
                        Loading messages…
                    </span>
                </div>
            )}

            {/* Message bubbles */}
            {messages.map((msg, idx) => {
                const isMine = msg.senderId === currentUserId;
                const prevMsg = messages[idx - 1];
                const isContinuation =
                    prevMsg?.senderId === msg.senderId &&
                    new Date(msg.createdAt).getTime() -
                    new Date(prevMsg.createdAt).getTime() <
                    60_000;

                return (
                    <div
                        key={msg.id}
                        className={`flex ${isMine ? "justify-end" : "justify-start"} ${isContinuation ? "mt-0.5" : "mt-3"
                            }`}
                    >
                        <div
                            className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm leading-relaxed break-words ${isMine
                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                : "bg-muted text-foreground rounded-bl-sm"
                                } ${isContinuation ? (isMine ? "rounded-tr-sm" : "rounded-tl-sm") : ""}`}
                        >
                            {msg.deletedAt ? (
                                <span className="italic opacity-60">This message was deleted</span>
                            ) : (
                                msg.content
                            )}
                            <span
                                className={`block text-[10px] mt-1 select-none ${isMine ? "text-primary-foreground/60 text-right" : "text-muted-foreground"
                                    }`}
                            >
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                        </div>
                    </div>
                );
            })}

            {/* Typing indicator */}
            {typingUserIds.length > 0 && (
                <div className="flex justify-start mt-2">
                    <div className="bg-muted px-3 py-2 rounded-2xl rounded-bl-sm flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                    </div>
                </div>
            )}

            <div ref={bottomRef} />
        </div>
    );
}