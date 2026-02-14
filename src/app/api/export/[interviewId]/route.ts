import { createClient } from "@/lib/supabase/server";
import { generateInterviewXLSX } from "@/lib/export";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ interviewId: string }> }
) {
  const { interviewId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: interview } = await supabase
    .from("interviews")
    .select("*")
    .eq("id", interviewId)
    .single();

  if (!interview) {
    return NextResponse.json({ error: "Interview not found" }, { status: 404 });
  }

  // Check access: owner or admin
  if (interview.user_id !== user.id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const { data: messages } = await supabase
    .from("interview_messages")
    .select("*")
    .eq("interview_id", interviewId)
    .order("created_at", { ascending: true });

  const buffer = generateInterviewXLSX(interview, messages || []);

  const filename = `posicionamento-${interview.identifier_value || interview.id}.xlsx`;

  return new Response(buffer.buffer as ArrayBuffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
