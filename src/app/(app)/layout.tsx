import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, full_name")
    .eq("id", user.id)
    .single();

  return (
    <div className="app-shell">
      <nav className="navbar">
        <div className="navbar-left">
          <Link href="/interview" className="nav-brand">
            Posicionamento
          </Link>
          <div className="nav-links">
            <Link href="/interview" className="nav-link">
              Entrevista
            </Link>
            <Link href="/processor" className="nav-link">
              Processador
            </Link>
            <Link href="/history" className="nav-link">
              Historico
            </Link>
            {profile?.is_admin && (
              <Link href="/admin" className="nav-link">
                Admin
              </Link>
            )}
          </div>
        </div>
        <div className="navbar-right">
          <span className="text-text-dim">
            {profile?.full_name || user.email}
          </span>
          <SignOutButton />
        </div>
      </nav>
      <main className="main-content">{children}</main>
    </div>
  );
}
