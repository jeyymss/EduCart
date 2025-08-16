"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function SessionAutoLogout() {
  useEffect(() => {
    const supabase = createClient();

    const onBeforeUnload = () => {
      // best-effort; may be cut short by browser
      supabase.auth.signOut({ scope: "global" }).catch(() => {});
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  return null;
}
