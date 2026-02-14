import { createClient } from "@/lib/supabase/server";
import { generateWithRetry } from "@/lib/gemini";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, prompt, rows } = await request.json();

  if (!prompt || !rows?.length) {
    return NextResponse.json(
      { error: "prompt and rows are required" },
      { status: 400 }
    );
  }

  // Create batch job
  const { data: job, error: jobError } = await supabase
    .from("batch_jobs")
    .insert({
      user_id: user.id,
      title: title || "Batch " + new Date().toISOString().slice(0, 10),
      prompt,
      status: "processing",
    })
    .select()
    .single();

  if (jobError) {
    return NextResponse.json({ error: jobError.message }, { status: 500 });
  }

  // Create batch items
  const items = rows.map((row: { question: string; answer: string }, i: number) => ({
    batch_job_id: job.id,
    row_index: i,
    question: row.question,
    answer: row.answer,
    status: "pending",
  }));

  await supabase.from("batch_items").insert(items);

  // Stream processing via SSE
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: unknown) {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      }

      try {
        for (let i = 0; i < rows.length; i++) {
          const { question, answer } = rows[i];
          send("progress", { current: i + 1, total: rows.length, question });

          const processed = await generateWithRetry(
            `${prompt}\n\n---\nQuestion: ${question}\nAnswer: ${answer}`
          );

          // Update item in DB
          const { data: batchItems } = await supabase
            .from("batch_items")
            .select("id")
            .eq("batch_job_id", job.id)
            .eq("row_index", i);

          if (batchItems?.[0]) {
            await supabase
              .from("batch_items")
              .update({
                processed_answer: processed,
                status: "completed",
              })
              .eq("id", batchItems[0].id);
          }

          send("result", {
            index: i,
            question,
            answer,
            processed,
          });
        }

        // Mark job as completed
        await supabase
          .from("batch_jobs")
          .update({ status: "completed", updated_at: new Date().toISOString() })
          .eq("id", job.id);

        send("done", { jobId: job.id, totalProcessed: rows.length });
      } catch (err: unknown) {
        const error = err as Error;
        await supabase
          .from("batch_jobs")
          .update({ status: "failed", updated_at: new Date().toISOString() })
          .eq("id", job.id);

        send("error", { error: error.message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
