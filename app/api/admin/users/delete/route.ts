import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/utils/supabase/admin";

export async function DELETE(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Delete from individuals table
    const { error: indError } = await supabase
      .from("individuals")
      .delete()
      .eq("user_id", userId);

    if (indError) {
      // Try organizations table if not found in individuals
      const { error: orgError } = await supabase
        .from("organizations")
        .delete()
        .eq("user_id", userId);

      if (orgError) {
        console.error("Error deleting user:", orgError);
        return NextResponse.json({ error: orgError.message }, { status: 500 });
      }
    }

    // Delete the auth user using admin client
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      console.error("Error deleting auth user:", authError);
      // Continue even if auth deletion fails
    }

    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (err: any) {
    console.error("Server error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
