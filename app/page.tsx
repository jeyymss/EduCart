"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const supabase = createClient();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout Failed: ", error.message);
    } else {
      router.push("/");
      window.location.reload();
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setIsLoggedIn(!!session);
    };

    checkSession();
  }, [supabase]);

  return (
    <div className="h-screen flex flex-col justify-center items-center gap-5">
      <h1 className="font-bold">Landing Page</h1>

      {isLoggedIn === null ? (
        <p>Loading...</p>
      ) : isLoggedIn ? (
        <div>
          <p className="text-green-600 text-lg">✅ User Logged In</p>
          <Button onClick={handleLogout}>Logout</Button>
        </div>
      ) : (
        <div className="flex gap-5">
          <h1>Logged Out</h1>
        </div>
      )}
    </div>
  );
}
