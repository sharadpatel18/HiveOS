// components/chat/NewChatModal.tsx
"use client";

import { useEffect, useState } from "react";

interface User {
    id: string;
    fullName: string;
    email: string;
}

interface NewChatModalProps {
    onClose: () => void;
    onConversationCreated: (conversationId: string) => void;
}

export function NewChatModal({ onClose, onConversationCreated }: NewChatModalProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [creating, setCreating] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/users")
            .then(r => r.json())
            .then(data => {
                setUsers(data);
                setIsLoading(false);
            });
    }, []);

    const startChat = async (otherUserId: string) => {
        setCreating(otherUserId);
        const res = await fetch("/api/conversations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ otherUserId }),
        });
        const data = await res.json();
        setCreating(null);
        onConversationCreated(data.conversationId);
        onClose();
    };

    return (
        // Backdrop
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={onClose}
        >
            {/* Modal */}
            <div
                className="bg-background border rounded-xl shadow-lg w-80 p-4"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold">New Chat</h2>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground text-lg leading-none"
                    >
                        ×
                    </button>
                </div>

                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 animate-pulse">
                                <div className="w-8 h-8 rounded-full bg-muted" />
                                <div className="flex-1 h-3 bg-muted rounded" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <ul className="space-y-1">
                        {users.map(user => (
                            <li key={user.id}>
                                <button
                                    onClick={() => startChat(user.id)}
                                    disabled={!!creating}
                                    className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-accent transition-colors disabled:opacity-50 text-left"
                                >
                                    {/* Avatar */}
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary shrink-0">
                                        {user.fullName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{user.fullName}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                    </div>
                                    {creating === user.id && (
                                        <span className="text-xs text-muted-foreground shrink-0">
                                            Starting…
                                        </span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}