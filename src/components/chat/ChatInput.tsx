"use client";

import { useRef, useCallback } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 160) + "px";
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [disabled]
  );

  function handleSend() {
    if (disabled) return;
    const textarea = textareaRef.current;
    if (!textarea) return;
    const text = textarea.value.trim();
    if (!text) return;
    textarea.value = "";
    textarea.style.height = "auto";
    onSend(text);
  }

  return (
    <div className="border-t border-border px-6 py-4 flex-shrink-0">
      <div className="max-w-[860px] mx-auto flex gap-3 items-end">
        <textarea
          ref={textareaRef}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua resposta..."
          rows={1}
          disabled={disabled}
          className="flex-1 bg-surface border border-border text-text font-mono text-sm px-4 py-3 rounded-lg outline-none resize-none min-h-[48px] max-h-[160px] leading-relaxed transition-colors focus:border-accent-dim disabled:opacity-40"
        />
        <button
          onClick={handleSend}
          disabled={disabled}
          className="bg-accent text-bg font-mono text-sm font-medium px-6 py-3 rounded-lg transition-all hover:bg-accent-hover hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
