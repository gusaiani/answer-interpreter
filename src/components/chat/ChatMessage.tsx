interface ChatMessageProps {
  role: "user" | "model";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <div className={role === "user" ? "chat-bubble-user" : "chat-bubble-model"}>
      {content}
    </div>
  );
}
