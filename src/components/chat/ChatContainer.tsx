"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import type { InterviewMessage } from "@/lib/types";

interface ChatContainerProps {
  interviewId: string;
  initialMessages: InterviewMessage[];
  interviewStatus: string;
}

interface GeminiHistoryEntry {
  role: "user" | "model";
  parts: { text: string }[];
}

export function ChatContainer({
  interviewId,
  initialMessages,
  interviewStatus,
}: ChatContainerProps) {
  const [messages, setMessages] = useState<
    { role: "user" | "model"; content: string }[]
  >(initialMessages.map((m) => ({ role: m.role, content: m.content })));
  const [isWaiting, setIsWaiting] = useState(false);
  const [started, setStarted] = useState(initialMessages.length > 0);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Build Gemini history format from messages
  function buildHistory(): GeminiHistoryEntry[] {
    return messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    }));
  }

  // Auto-start interview if no messages exist
  useEffect(() => {
    if (!started && interviewStatus === "em_andamento") {
      startInterview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startInterview() {
    setIsWaiting(true);
    setStarted(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Iniciar entrevista",
          history: [],
          interviewId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessages([
        { role: "user", content: "Iniciar entrevista" },
        { role: "model", content: data.reply },
      ]);
    } catch (err) {
      const error = err as Error;
      setMessages([
        { role: "model", content: "Erro ao iniciar: " + error.message },
      ]);
    } finally {
      setIsWaiting(false);
    }
  }

  async function sendMessage(text: string) {
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setIsWaiting(true);

    try {
      const history = buildHistory();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history,
          interviewId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessages((prev) => [...prev, { role: "model", content: data.reply }]);
    } catch (err) {
      const error = err as Error;
      setMessages((prev) => [
        ...prev,
        { role: "model", content: "Erro: " + error.message },
      ]);
    } finally {
      setIsWaiting(false);
    }
  }

  return (
    <div className="chat-layout">
      <div className="chat-area">
        {messages
          .filter((m) => !(m.role === "user" && m.content === "Iniciar entrevista"))
          .map((m, i) => (
            <ChatMessage key={i} role={m.role} content={m.content} />
          ))}
        {isWaiting && (
          <div className="chat-typing">
            Digitando...
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <ChatInput onSend={sendMessage} disabled={isWaiting} />
    </div>
  );
}
