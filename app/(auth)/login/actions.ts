"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  // get the data that the user entered from the frontend
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  // sign in user
  const { data: authData, error } = await supabase.auth.signInWithPassword(
    data
  );

  if (error) {
    return { error: error.message };
  }

  // fetch the role from users table
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  if (userError || !userData) {
    return { error: "Unable to fetch user role." };
  }

  // revalidate layout cache
  revalidatePath("/", "layout");

  return {
    success: true,
    role: userData.role as "Admin" | "Student" | "Faculty" | "Alumni",
  };
}
