import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ChatContainer } from "@/components/chat/ChatContainer";

export default async function InterviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: interview } = await supabase
    .from("interviews")
    .select("*")
    .eq("id", id)
    .single();

  if (!interview) redirect("/interview");

  const { data: messages } = await supabase
    .from("interview_messages")
    .select("*")
    .eq("interview_id", id)
    .order("created_at", { ascending: true });

  return (
    <ChatContainer
      interviewId={id}
      initialMessages={messages || []}
      interviewStatus={interview.status}
    />
  );
}
