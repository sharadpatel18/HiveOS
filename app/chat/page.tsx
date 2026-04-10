"use client";

import { useState } from "react";
import { useSession } from "next-auth/react"; // replace with your auth hook
import { useSocket } from "@/hooks/useSocket";
import { useChat } from "@/hooks/useChat";
import { ConversationList } from "@/app/chat/components/ConversationList";
import { MessageThread } from "@/app/chat/components/MessageThread";
import { MessageInput } from "@/app/chat/components/MessageInput";
import { NewChatModal } from "./components/NewChatModal";

// TODO: Replace with your real user-store / SWR / React Query lookup
function useUserDisplay() {
    return (userId: string) => ({
        name: `User ${userId.slice(0, 6)}`,
        avatarUrl: undefined,
    });
}

export default function ChatPage() {
    const { data: session } = useSession();
    const userId = session?.user?.id ?? "";
    const { isConnected } = useSocket(userId || null);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [showNewChat, setShowNewChat] = useState(false);
    const getUserDisplay = useUserDisplay();

    const {
        messages,
        hasMore,
        isLoading,
        isSending,
        typingUserIds,
        error,
        sendMessage,
        notifyTyping,
        loadMore,
    } = useChat({
        conversationId: activeConversationId ?? "",
        userId,
        enabled: !!activeConversationId,
    });

    // Guard: if no session yet
    if (!userId) {
        return (
            <div className="flex items-center justify-center h-screen text-muted-foreground text-sm">
                Loading…
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            {/* ── Sidebar ─────────────────────────────────────────────────────── */}
            <aside className="w-80 shrink-0 border-r flex flex-col">
                <div className="px-4 py-4 border-b flex items-center justify-between">
                    <h1 className="text-base font-semibold">Messages</h1>
                    <div className="flex items-center gap-2">
                        {/* New chat button */}
                        <button
                            onClick={() => setShowNewChat(true)}
                            className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                            aria-label="New chat"
                        >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                                <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                            </svg>
                        </button>
                        {/* Online indicator */}
                        <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-muted-foreground"}`} />
                            <span className="text-xs text-muted-foreground">
                                {isConnected ? "Connected" : "Connecting…"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Modal */}
                {showNewChat && (
                    <NewChatModal
                        onClose={() => setShowNewChat(false)}
                        onConversationCreated={(conversationId) => {
                            setActiveConversationId(conversationId);
                        }}
                    />
                )}

                <div className="flex-1 overflow-y-auto">
                    <ConversationList
                        currentUserId={userId}
                        activeConversationId={activeConversationId ?? undefined}
                        onSelect={setActiveConversationId}
                        getUserDisplay={getUserDisplay}
                    />
                </div>
            </aside>

            {/* ── Main chat area ───────────────────────────────────────────────── */}
            <main className="flex-1 flex flex-col min-w-0">
                {activeConversationId ? (
                    <>
                        {/* Header */}
                        <div className="px-4 py-3 border-b shrink-0">
                            <p className="text-sm font-medium">
                                {/* TODO: show the other user's name here */}
                                Conversation
                            </p>
                        </div>

                        {/* Error banner */}
                        {error && (
                            <div className="bg-destructive/10 text-destructive text-xs px-4 py-2 text-center">
                                {error}
                            </div>
                        )}

                        {/* Messages */}
                        <MessageThread
                            messages={messages}
                            currentUserId={userId}
                            isLoading={isLoading}
                            hasMore={hasMore}
                            typingUserIds={typingUserIds}
                            onLoadMore={loadMore}
                        />

                        {/* Input */}
                        <MessageInput
                            onSend={sendMessage}
                            onTyping={notifyTyping}
                            isSending={isSending}
                            disabled={!isConnected}
                        />
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <svg
                            width="40"
                            height="40"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            opacity="0.4"
                        >
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        <p className="text-sm">Select a conversation to start chatting</p>
                    </div>
                )}
            </main>
        </div>
    );
}