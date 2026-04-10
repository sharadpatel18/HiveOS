"use client";

import { useRef, useState, KeyboardEvent } from "react";

interface MessageInputProps {
    onSend: (content: string) => Promise<void> | void;
    onTyping: () => void;
    isSending: boolean;
    disabled?: boolean;
}

export function MessageInput({
    onSend,
    onTyping,
    isSending,
    disabled,
}: MessageInputProps) {
    const [value, setValue] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = async () => {
        const trimmed = value.trim();
        if (!trimmed || isSending) return;
        setValue("");
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
        await onSend(trimmed);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(e.target.value);
        onTyping();
        // Auto-resize textarea
        e.target.style.height = "auto";
        e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
    };

    return (
        <div className="border-t bg-background px-4 py-3 flex items-end gap-2">
            <textarea
                ref={textareaRef}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a message…"
                rows={1}
                disabled={disabled || isSending}
                className="flex-1 resize-none bg-muted rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 max-h-[120px] overflow-y-auto"
            />
            <button
                onClick={handleSend}
                disabled={!value.trim() || isSending || disabled}
                className="shrink-0 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 transition-opacity hover:bg-primary/90"
                aria-label="Send message"
            >
                {/* Send arrow icon */}
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="rotate-90"
                >
                    <path d="M8 1L14 8H9.5V15H6.5V8H2L8 1Z" />
                </svg>
            </button>
        </div>
    );
}