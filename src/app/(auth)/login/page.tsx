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
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="heading-xl mb-2">Entrar</h1>
        <p className="text-muted mb-8">
          Acesse sua conta para continuar
        </p>

        <form onSubmit={handleLogin} className="form-stack">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="input"
            />
          </div>

          <div>
            <label className="label">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
              className="input"
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="divider">
          <div className="divider-line">
            <div className="w-full border-t border-border" />
          </div>
          <div className="divider-text">
            <span className="bg-bg px-4 text-text-dim">ou</span>
          </div>
        </div>

        <button onClick={handleGoogleLogin} className="btn-secondary w-full">
          Entrar com Google
        </button>

        <p className="text-center text-muted mt-6">
          Nao tem conta?{" "}
          <Link href="/signup" className="link">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
