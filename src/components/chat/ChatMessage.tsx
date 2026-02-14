interface ChatMessageProps {
  role: "user" | "model";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={`max-w-[80%] px-4 py-3 rounded-xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
        isUser
          ? "self-end bg-accent text-bg rounded-br-sm"
          : "self-start bg-surface2 border border-border rounded-bl-sm"
      }`}
    >
      {content}
    </div>
  );
}
