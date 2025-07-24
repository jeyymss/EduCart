"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export async function register(formData: FormData) {
  const supabase = await createClient();

  //get the credentials that the user entered from the frontend
  const credentials = {
    role: formData.get("role") as string,
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  // SIGN UP USER TO SUPABASE AUTHENTICATION
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: credentials.email,
    password: credentials.password,
    options: {
      data: {
        display_name: credentials.name, //save user's full name in supabase auth
      },
    },
  });

  //if there is error, show in frontend
  if (signUpError || !signUpData?.user) {
    return { error: signUpError?.message || "Signup failed" };
  }

  const user = signUpData.user!;

  //insert user's data in users table
  const { error: insertError } = await supabase.from("users").insert([
    {
      id: user.id,
      email: user.email,
      role: credentials.role,
      full_name: credentials.name,
    },
  ]);

  //if there is error in inserting data, show error in frontend
  if (insertError) {
    return { error: "Database error: " + insertError.message };
  }

  //if registration successful
  revalidatePath("/", "layout");
  redirect("/login");
}
