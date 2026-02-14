"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function InterviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function createInterview() {
      try {
        const res = await fetch("/api/interview", { method: "POST" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        router.replace(`/interview/${data.id}`);
      } catch (err) {
        console.error("Failed to create interview:", err);
        setLoading(false);
      }
    }
    createInterview();
  }, [router]);

  if (!loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-error">Erro ao criar entrevista. Tente novamente.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-text-dim">Criando entrevista...</p>
    </div>
  );
}
