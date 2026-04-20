// components/chat/NewGroupModal.tsx
"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface User {
    id: string;
    fullName: string;
    email: string;
}

interface NewGroupModalProps {
    onClose: () => void;
    onGroupCreated: (conversationId: string) => void;
}

export function NewGroupModal({ onClose, onGroupCreated }: NewGroupModalProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [groupName, setGroupName] = useState("");
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("/api/users")
            .then((r) => r.json())
            .then((data) => {
                setUsers(data);
                setIsLoading(false);
            });
    }, []);

    const toggle = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const createGroup = async () => {
        if (!groupName.trim()) return setError("Group name is required");
        if (selected.size < 2) return setError("Select at least 2 members");

        setError("");
        setCreating(true);
        const res = await fetch("/api/conversations/group", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: groupName.trim(),
                memberIds: [...selected],
            }),
        });
        const data = await res.json();
        setCreating(false);
        onGroupCreated(data.conversationId);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={onClose}
        >
            <div
                className="bg-background border rounded-xl shadow-lg w-80 p-4 flex flex-col gap-4"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold">New Group</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground text-lg leading-none"
                    >
                        ×
                    </button>
                </div>

                {/* Group name input */}
                <input
                    type="text"
                    placeholder="Group name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border bg-transparent focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
                />

                {/* Member list */}
                <div>
                    <p className="text-xs text-muted-foreground mb-2">
                        Select members{" "}
                        {selected.size > 0 && (
                            <span className="text-primary font-medium">({selected.size} selected)</span>
                        )}
                    </p>

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
                        <ul className="space-y-1 max-h-48 overflow-y-auto">
                            {users.map((user) => (
                                <li key={user.id}>
                                    <button
                                        type="button"
                                        onClick={() => toggle(user.id)}
                                        className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-accent transition-colors text-left"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary shrink-0">
                                            {user.fullName
                                                .split(" ")
                                                .map((w) => w[0])
                                                .join("")
                                                .toUpperCase()
                                                .slice(0, 2)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{user.fullName}</p>
                                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                        </div>
                                        {/* Checkmark */}
                                        <div
                                            className={cn(
                                                "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                                                selected.has(user.id)
                                                    ? "bg-primary border-primary"
                                                    : "border-muted-foreground",
                                            )}
                                        >
                                            {selected.has(user.id) && (
                                                <Check className="w-2.5 h-2.5 text-primary-foreground" />
                                            )}
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Error */}
                {error && <p className="text-xs text-destructive">{error}</p>}

                {/* Create button */}
                <button
                    type="button"
                    onClick={createGroup}
                    disabled={creating}
                    className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    {creating ? "Creating…" : "Create Group"}
                </button>
            </div>
        </div>
    );
}