"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { useEffect, useState } from "react";

export function HeaderWrapper() {
  const pathname = usePathname();
  const [showHeader, setShowHeader] = useState(true);

  useEffect(() => {
    if (!pathname) return;

    const hiddenPrefixes = ["/admin", "/organization-account"];
    const hiddenExact = ["/login", "/signup", "/reset-password"];

    const shouldHide =
      hiddenExact.includes(pathname) ||
      hiddenPrefixes.some((prefix) => pathname.startsWith(prefix));

    setShowHeader(!shouldHide);
  }, [pathname]);

  return showHeader ? <Header /> : null;
}
