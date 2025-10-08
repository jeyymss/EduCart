"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { OrganizationPostsTable } from "@/components/organization/products/productTable";

export default function OrgMyProducts() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const supabase = createClient();
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error fetching session:", error.message);
      } else if (session?.user?.id) {
        setUserId(session.user.id);
      }

      setLoading(false);
    };

    fetchSession();
  }, []);

  if (loading) return <p>Loading your products...</p>;
  if (!userId) return <p>No session found. Please log in again.</p>;

  return <OrganizationPostsTable userId={userId} />;
}
