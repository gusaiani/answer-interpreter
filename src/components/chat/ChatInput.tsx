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
    <div className="chat-input-bar">
      <div className="chat-input-inner">
        <textarea
          ref={textareaRef}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua resposta..."
          rows={1}
          disabled={disabled}
          className="chat-textarea"
        />
        <button
          onClick={handleSend}
          disabled={disabled}
          className="btn-primary"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
