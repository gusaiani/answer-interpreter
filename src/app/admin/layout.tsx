import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, full_name")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/interview");

  return (
    <div className="app-shell">
      <nav className="navbar">
        <div className="navbar-left">
          <Link href="/admin" className="nav-brand">
            Admin
          </Link>
          <div className="nav-links">
            <Link href="/admin" className="nav-link">
              Dashboard
            </Link>
            <Link href="/admin/users" className="nav-link">
              Usuarios
            </Link>
            <Link href="/interview" className="nav-link">
              Voltar ao app
            </Link>
          </div>
        </div>
        <div className="navbar-right">
          <span className="text-text-dim">
            {profile.full_name || user.email}
          </span>
          <SignOutButton />
        </div>
      </nav>
      <main className="flex-1">{children}</main>
    </div>
  );
}
