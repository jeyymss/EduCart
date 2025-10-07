import { createClient } from "@/utils/supabase/server";

export async function checkIfAdmin() {
  const supabase = await createClient();

  //Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { isAdmin: false, user: null };
  }

  // Check if user is in admin.admin_users and enabled
  const { data: adminRecord, error } = await supabase
    .from("admin_users")
    .select("user_id, is_enabled")
    .eq("user_id", user.id)
    .eq("is_enabled", true)
    .maybeSingle();

  if (error) {
    console.error("Error checking admin:", error);
    return { isAdmin: false, user };
  }

  return { isAdmin: !!adminRecord, user };
}
