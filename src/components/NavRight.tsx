"use client";

import { LanguageDropdown } from "@/components/LanguageDropdown";
import { SignOutButton } from "@/components/SignOutButton";

interface NavRightProps {
  displayName: string;
}

export function NavRight({ displayName }: NavRightProps) {
  return (
    <div className="navbar-right">
      <LanguageDropdown />
      <span className="text-text-dim">{displayName}</span>
      <SignOutButton />
    </div>
  );
}
