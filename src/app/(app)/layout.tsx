import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LanguageProvider } from "@/context/LanguageContext";
import { NavLinks } from "@/components/NavLinks";
import { NavRight } from "@/components/NavRight";

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
    <LanguageProvider>
      <div className="app-shell">
        <nav className="navbar">
          <div className="navbar-left">
            <Link href="/interview" className="nav-brand">
              Posicionamento
            </Link>
            <NavLinks isAdmin={profile?.is_admin ?? false} />
          </div>
          <NavRight displayName={profile?.full_name || user.email || ""} />
        </nav>
        <main className="main-content">{children}</main>
      </div>
    </LanguageProvider>
  );
}
