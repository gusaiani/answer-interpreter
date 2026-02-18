"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { UI_STRINGS } from "@/lib/i18n";

interface NavLinksProps {
  isAdmin: boolean;
}

export function NavLinks({ isAdmin }: NavLinksProps) {
  const { locale } = useLanguage();
  const strings = UI_STRINGS[locale];

  return (
    <div className="nav-links">
      <Link href="/interview" className="nav-link">
        {strings.navInterview}
      </Link>
      <Link href="/processor" className="nav-link">
        {strings.navProcessor}
      </Link>
      <Link href="/history" className="nav-link">
        {strings.navHistory}
      </Link>
      {isAdmin && (
        <Link href="/admin" className="nav-link">
          {strings.navAdmin}
        </Link>
      )}
    </div>
  );
}
