"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
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

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card text-center">
          <h1 className="heading-xl mb-4">Verifique seu email</h1>
          <p className="text-muted mb-6">
            Enviamos um link de confirmacao para <strong className="text-text">{email}</strong>.
            Clique no link para ativar sua conta.
          </p>
          <Link href="/login" className="link-sm">
            Voltar ao login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="heading-xl mb-2">Criar conta</h1>
        <p className="text-muted mb-8">
          Crie sua conta para comecar
        </p>

        <form onSubmit={handleSignUp} className="form-stack">
          <div>
            <label className="label">Nome completo</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Seu nome"
              required
              className="input"
            />
          </div>

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
              placeholder="Minimo 6 caracteres"
              required
              minLength={6}
              className="input"
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Criando..." : "Criar conta"}
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
          Ja tem conta?{" "}
          <Link href="/login" className="link">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
