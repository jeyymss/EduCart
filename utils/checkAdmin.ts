import { createClient } from "@/utils/supabase/server";

export async function checkIfAdmin() {
  const supabase = await createClient();

  //Get current user
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError || !session) {
    return { isAdmin: false, user: null };
  }

  const userId = session.user.id

  // Check if user is in admin.admin_users and enabled
  const { data: adminRecord, error } = await supabase
    .from("admin_users")
    .select("user_id, is_enabled")
    .eq("user_id", userId)
    .eq("is_enabled", true)
    .maybeSingle();

  if (error) {
    console.error("Error checking admin:", error);
    return { isAdmin: false, session };
  }

  return { isAdmin: !!adminRecord, session };
}
