"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLoading } from "./LoadingOverlay";

export default function RouteLoading() {
  const pathname = usePathname();
  const search = useSearchParams();
  const { show, hide } = useLoading();

  useEffect(() => {
    show("Updating results…");
    const id = setTimeout(hide, 700);
    return () => clearTimeout(id);
  }, [pathname, search]);

  return null;
}
