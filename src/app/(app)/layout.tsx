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
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-8">
          <Link href="/interview" className="font-serif text-xl">
            Posicionamento
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/interview"
              className="text-text-dim hover:text-accent transition-colors"
            >
              Entrevista
            </Link>
            <Link
              href="/processor"
              className="text-text-dim hover:text-accent transition-colors"
            >
              Processador
            </Link>
            <Link
              href="/history"
              className="text-text-dim hover:text-accent transition-colors"
            >
              Historico
            </Link>
            {profile?.is_admin && (
              <Link
                href="/admin"
                className="text-text-dim hover:text-accent transition-colors"
              >
                Admin
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-text-dim">
            {profile?.full_name || user.email}
          </span>
          <SignOutButton />
        </div>
      </nav>
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
