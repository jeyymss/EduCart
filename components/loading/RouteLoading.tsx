"use client";
import { useEffect, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLoading } from "./LoadingOverlay";


export default function RouteLoading() {
  const pathname = usePathname();
  const search = useSearchParams();
  const { withLoading } = useLoading();

  const ALLOWLIST = useMemo<string[]>(
    () => ["/browse", "/search", "/giveaways"],
    []
  );

  const relevantKeyString = useMemo(() => {
    const keys = ["q", "category", "sort", "min", "max", "page", "campus"];
    return keys.map(k => `${k}=${search.get(k) ?? ""}`).join("&");
  }, [search]);

  useEffect(() => {
    if (!ALLOWLIST.includes(pathname)) return;

    const pseudoWork = new Promise<void>((resolve) => {
      const t = setTimeout(() => resolve(), 450);
      return () => clearTimeout(t);
    });

    withLoading(pseudoWork, { delay: 250, minDuration: 300, message: "Updating results…" })
      .catch(() => {}); 
  }, [pathname, relevantKeyString, withLoading]);

  return null;
}
