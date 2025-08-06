"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { useEffect, useState } from "react";

export function HeaderWrapper() {
  const pathname = usePathname();
  const [showHeader, setShowHeader] = useState(true);

  useEffect(() => {
    const hide =
      pathname === "/login" ||
      pathname === "/signup" ||
      pathname === "/reset-password" ||
      pathname === "/admin/dashboard" ||
      pathname === "/admin/accounts" ||
      pathname === "/admin/wallet" ||
      pathname === "/admin/reports";
    setShowHeader(!hide);
  }, [pathname]);

  return showHeader ? <Header /> : null;
}
