"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import type { InterviewMessage } from "@/lib/types";
import { LOCALES, UI_STRINGS, type Locale } from "@/lib/i18n";
import { useLanguage } from "@/context/LanguageContext";

interface ChatContainerProps {
  interviewId: string;
  initialMessages: InterviewMessage[];
  interviewStatus: string;
  language: string | null;
}

interface GeminiHistoryEntry {
  role: "user" | "model";
  parts: { text: string }[];
}

function toLocale(lang: string | null | undefined): Locale {
  if (lang && (LOCALES as readonly string[]).includes(lang)) return lang as Locale;
  return "pt";
}

export function ChatContainer({
  interviewId,
  initialMessages,
  interviewStatus,
  language,
}: ChatContainerProps) {
  const hasMessages = initialMessages.length > 0;
  const { locale: globalLocale } = useLanguage();

  const [messages, setMessages] = useState<
    { role: "user" | "model"; content: string }[]
  >(initialMessages.map((m) => ({ role: m.role, content: m.content })));
  const [isWaiting, setIsWaiting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Resumed interviews use the saved DB language; new interviews use global locale
  const activeLocale: Locale = language ? toLocale(language) : globalLocale;

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  function buildHistory(): GeminiHistoryEntry[] {
    return messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    }));
  }

  // Auto-start when there are no messages and interview is in progress
  useEffect(() => {
    if (!hasMessages && interviewStatus === "em_andamento") {
      handleStart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleStart() {
    setIsWaiting(true);
    const startLocale = activeLocale;
    const strings = UI_STRINGS[startLocale];

    try {
      await fetch(`/api/interview/${interviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: startLocale }),
      });

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: strings.startTrigger,
          history: [],
          interviewId,
          language: startLocale,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessages([
        { role: "user", content: strings.startTrigger },
        { role: "model", content: data.reply },
      ]);
    } catch (err) {
      const error = err as Error;
      setMessages([
        { role: "model", content: strings.errorStart + error.message },
      ]);
    } finally {
      setIsWaiting(false);
    }
  }

  async function sendMessage(text: string) {
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setIsWaiting(true);

    const strings = UI_STRINGS[activeLocale];

    try {
      const history = buildHistory();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history,
          interviewId,
          language: activeLocale,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessages((prev) => [...prev, { role: "model", content: data.reply }]);
    } catch (err) {
      const error = err as Error;
      setMessages((prev) => [
        ...prev,
        { role: "model", content: strings.errorSend + error.message },
      ]);
    } finally {
      setIsWaiting(false);
    }
  }

  const strings = UI_STRINGS[activeLocale];

  return (
    <div className="chat-layout">
      <div className="chat-area">
        {messages
          .filter(
            (m) =>
              !(
                m.role === "user" &&
                LOCALES.some((loc) => m.content === UI_STRINGS[loc].startTrigger)
              )
          )
          .map((m, i) => (
            <ChatMessage key={i} role={m.role} content={m.content} />
          ))}
        {isWaiting && (
          <div className="chat-typing">{strings.typing}</div>
        )}
        <div ref={bottomRef} />
      </div>
      <ChatInput
        onSend={sendMessage}
        disabled={isWaiting}
        placeholder={strings.placeholder}
        sendLabel={strings.send}
      />
    </div>
  );
}
