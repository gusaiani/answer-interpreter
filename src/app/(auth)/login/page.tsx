"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/interview");
    router.refresh();
  }

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-4xl mb-2">
          Entrar
        </h1>
        <p className="text-text-dim text-sm mb-8">
          Acesse sua conta para continuar
        </p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-text-dim mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full bg-surface border border-border text-text font-mono text-sm px-4 py-3 rounded-lg outline-none transition-colors focus:border-accent-dim"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-text-dim mb-2">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
              className="w-full bg-surface border border-border text-text font-mono text-sm px-4 py-3 rounded-lg outline-none transition-colors focus:border-accent-dim"
            />
          </div>

          {error && (
            <p className="text-error text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-accent text-bg font-mono text-sm font-medium py-3 px-6 rounded-lg transition-all hover:bg-accent-hover hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-bg px-4 text-text-dim">ou</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-surface2 text-text border border-border font-mono text-sm font-medium py-3 px-6 rounded-lg transition-all hover:border-text-dim"
        >
          Entrar com Google
        </button>

        <p className="text-center text-text-dim text-sm mt-6">
          Nao tem conta?{" "}
          <Link href="/signup" className="text-accent hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
