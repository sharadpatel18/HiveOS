"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { getSocket, useSocket } from "@/hooks/useSocket";
import { useChat } from "@/hooks/useChat";
import { ConversationList } from "@/app/chat/components/ConversationList";
import { MessageThread } from "@/app/chat/components/MessageThread";
import { MessageInput } from "@/app/chat/components/MessageInput";
import { NewChatModal } from "./components/NewChatModal";
import { NewGroupModal } from "./components/NewGroupModal";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MessageSquare, Plus, Wifi, WifiOff, Users } from "lucide-react";
import { cn } from "@/lib/utils";

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
    const [showNewGroup, setShowNewGroup] = useState(false);
    const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
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

    const handleConversationSelect = (id: string) => {
        setActiveConversationId(id);
        setMobileSheetOpen(false);
    };

    const handleConversationCreated = async (conversationId: string) => {
        setActiveConversationId(conversationId);
        setMobileSheetOpen(false);
        const socket = getSocket();
        socket?.emit("chat:join-rooms");
    };

    if (!userId) {
        return (
            <div className="flex items-center justify-center h-screen text-muted-foreground text-sm">
                Loading…
            </div>
        );
    }

    // ── Reusable conversations panel content ──────────────────────────────────
    const ConversationsPanel = () => (
        <div className="flex flex-col h-full">
            {/* Panel header */}
            <div className="px-3 py-3 flex items-center justify-between shrink-0">
                <h2 className="text-sm font-semibold tracking-tight">Messages</h2>
                <TooltipProvider delayDuration={200}>
                    <div className="flex items-center gap-1">
                        {/* New group */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    onClick={() => setShowNewGroup(true)}
                                    aria-label="New group"
                                >
                                    <Users className="h-3.5 w-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">New group</TooltipContent>
                        </Tooltip>

                        {/* New direct chat */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="default"
                                    className="h-7 w-7 rounded-full"
                                    onClick={() => setShowNewChat(true)}
                                    aria-label="New conversation"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">New chat</TooltipContent>
                        </Tooltip>
                    </div>
                </TooltipProvider>
            </div>

            <Separator />

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto">
                <ConversationList
                    currentUserId={userId}
                    activeConversationId={activeConversationId ?? undefined}
                    onSelect={handleConversationSelect}
                    getUserDisplay={getUserDisplay}
                />
            </div>
        </div>
    );

    return (
        <SidebarProvider
            style={{
                "--sidebar-width": "calc(var(--spacing) * 72)",
                "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties}
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                {/* ── Site header ───────────────────────────────────────────── */}
                <SiteHeader />

                {/* ── Chat body ─────────────────────────────────────────────── */}
                <div className="flex h-full overflow-hidden">

                    {/* ── Desktop conversations aside (md+) ─────────────────── */}
                    <aside className="hidden md:flex md:w-64 lg:w-72 shrink-0 border-r flex-col">
                        <ConversationsPanel />
                    </aside>

                    {/* ── Main area ──────────────────────────────────────────── */}
                    <main className="flex-1 flex flex-col min-w-0 h-full">
                        {activeConversationId ? (
                            <>
                                {/* Conversation header */}
                                <div className="px-4 py-3 border-b shrink-0 flex items-center gap-2">

                                    {/* Mobile: open sheet */}
                                    <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
                                        <SheetTrigger asChild>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="md:hidden h-7 w-7 shrink-0"
                                                aria-label="Show conversations"
                                            >
                                                <MessageSquare className="h-4 w-4" />
                                            </Button>
                                        </SheetTrigger>
                                        <SheetContent side="left" className="w-72 p-0">
                                            <ConversationsPanel />
                                        </SheetContent>
                                    </Sheet>

                                    <p className="text-sm font-medium truncate">
                                        {/* TODO: replace with displayName from conversation */}
                                        Conversation
                                    </p>
                                </div>

                                {/* Error banner */}
                                {error && (
                                    <div className="bg-destructive/10 text-destructive text-xs px-4 py-2 text-center shrink-0">
                                        {error}
                                    </div>
                                )}

                                {/* Messages */}
                                <div className="flex-1 overflow-hidden">
                                    <MessageThread
                                        messages={messages}
                                        currentUserId={userId}
                                        isLoading={isLoading}
                                        hasMore={hasMore}
                                        typingUserIds={typingUserIds}
                                        onLoadMore={loadMore}
                                    />
                                </div>

                                {/* Input */}
                                <div className="shrink-0">
                                    <MessageInput
                                        onSend={sendMessage}
                                        onTyping={notifyTyping}
                                        isSending={isSending}
                                        disabled={!isConnected}
                                    />
                                </div>
                            </>
                        ) : (
                            /* ── Empty state ─────────────────────────────────── */
                            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground px-6">
                                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                                    <MessageSquare className="h-6 w-6 opacity-40" />
                                </div>
                                <div className="text-center space-y-1">
                                    <p className="text-sm font-medium text-foreground">
                                        No conversation selected
                                    </p>
                                    <p className="text-xs">
                                        Choose one from the list or start a new one
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center justify-center gap-2">
                                    {/* Mobile only: open sheet */}
                                    <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
                                        <SheetTrigger asChild>
                                            <Button variant="outline" size="sm" className="md:hidden">
                                                <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                                                View conversations
                                            </Button>
                                        </SheetTrigger>
                                        <SheetContent side="left" className="w-72 p-0">
                                            <ConversationsPanel />
                                        </SheetContent>
                                    </Sheet>

                                    <Button size="sm" variant="outline" onClick={() => setShowNewGroup(true)}>
                                        <Users className="h-3.5 w-3.5 mr-1.5" />
                                        New group
                                    </Button>

                                    <Button size="sm" onClick={() => setShowNewChat(true)}>
                                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                                        Start a chat
                                    </Button>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </SidebarInset>

            {/* ── Modals (outside SidebarInset to avoid stacking context issues) ── */}
            {showNewChat && (
                <NewChatModal
                    onClose={() => setShowNewChat(false)}
                    onConversationCreated={handleConversationCreated}
                />
            )}
            {showNewGroup && (
                <NewGroupModal
                    onClose={() => setShowNewGroup(false)}
                    onGroupCreated={handleConversationCreated}
                />
            )}
        </SidebarProvider>
    );
}