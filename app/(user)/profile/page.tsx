"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const supabase = createClient();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setIsLoggedIn(!!session);

      if (session) {
        setLoading(true);
        const userId = session.user.id;

        const { data, error } = await supabase
          .from("users")
          .select(
            `full_name, email, role, university_id, universities(abbreviation), verification_status, created_at `
          )
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Failed to fetch user details: ", error.message);
        } else {
          setUser(data);
        }
      }
      setLoading(false);
    };

    checkSession();
  }, [supabase]);

  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="flex flex-col">
        <h1>Profile Page</h1>
        {isLoggedIn ? (
          <div>
            <p>Name: {user?.full_name}</p>
            <p>University: {user?.universities.abbreviation}</p>
            <p>Email: {user?.email}</p>
            <p>Role: {user?.role}</p>
            <p>Status: {user?.verification_status}</p>
            <p>
              Joined:{" "}
              {new Date(user?.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
              })}
            </p>
          </div>
        ) : (
          <div>
            <h1>Error Fetching: User Logged Out</h1>
          </div>
        )}
      </div>
    </div>
  );
}
