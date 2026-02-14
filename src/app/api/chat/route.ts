import { createClient } from "@/lib/supabase/server";
import { interviewModel } from "@/lib/gemini";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message, history, interviewId } = await request.json();
  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  try {
    const chat = interviewModel.startChat({
      history: history || [],
    });

    const result = await chat.sendMessage(message);
    const reply = result.response.text() || "";

    // Persist messages if interviewId is provided
    if (interviewId) {
      await supabase.from("interview_messages").insert([
        { interview_id: interviewId, role: "user", content: message },
        { interview_id: interviewId, role: "model", content: reply },
      ]);
    }

    return NextResponse.json({ reply });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Chat error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
