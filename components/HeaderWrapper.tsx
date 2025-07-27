"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import { useEffect, useState } from "react";

export default function HeaderWrapper() {
  const pathname = usePathname();
  const [showHeader, setShowHeader] = useState(true);

  useEffect(() => {
    const hide =
      pathname === "/login" ||
      pathname === "/signup" ||
      pathname === "/reset-password";
    setShowHeader(!hide);
  }, [pathname]); // ✅ Only primitive (string) dependency here

  return showHeader ? <Header /> : null;
}
