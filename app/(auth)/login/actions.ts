"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

type LoginSuccess = {
  success: true;
  isAdmin: boolean;
  role: "Student" | "Faculty" | "Alumni" | "Organization" | null;
  redirect: "/admin/dashboard" | "/home" | "/organization-account/dashboard";
};

type LoginError = {
  success: false;
  error: string;
};

export type LoginResult = LoginSuccess | LoginError;

export async function login(formData: FormData): Promise<LoginResult> {
  const supabase = await createClient();

  const email = (formData.get("email") as string) ?? "";
  const password = (formData.get("password") as string) ?? "";

  const { data: auth, error: authError } =
    await supabase.auth.signInWithPassword({ email, password });

  if (authError || !auth?.user) {
    return {
      success: false,
      error: authError?.message ?? "Invalid credentials.",
    };
  }

  const userId = auth.user.id;

  // Check admin
  let isAdmin = false;
  {
    const { data: adminRow } = await supabase
      .from("admin_users")
      .select("is_enabled")
      .eq("user_id", userId)
      .maybeSingle();
    isAdmin = !!adminRow?.is_enabled;
  }

  // Get role
  let role: LoginSuccess["role"] = null;
  {
    const { data: userRow } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .maybeSingle();
    role = (userRow?.role as typeof role) ?? null;
  }

  revalidatePath("/", "layout");

  // Redirect logic
  let redirect: LoginSuccess["redirect"] = "/home";
  if (isAdmin) {
    redirect = "/admin/dashboard";
  } else if (role === "Organization") {
    redirect = "/organization-account/dashboard";
  }

  return {
    success: true,
    isAdmin,
    role,
    redirect,
  };
}
