"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header"; // site header (named export)
import HeaderLogin from "@/components/auth/header"; // auth header (default export)

export function HeaderWrapper() {
  const pathname = usePathname() || "";

  // pages that should show NO header at all
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/organization-account")
  ) {
    return null;
  }

  // pages that should use the AUTH header
  const onAuth =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/organization-signup") ||
    pathname.startsWith("/confirm");

  return onAuth ? <HeaderLogin /> : <Header />;
}
