"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { UI_STRINGS } from "@/lib/i18n";

export function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();
  const { locale } = useLanguage();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button onClick={handleSignOut} className="btn-signout">
      {UI_STRINGS[locale].signOut}
    </button>
  );
}
