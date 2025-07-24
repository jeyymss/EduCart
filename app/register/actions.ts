"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export async function register(formData: FormData) {
  const supabase = await createClient();
  // type-casting here for convenience
  // in practice, you should validate your inputs
  const credentials = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
    credentials
  );

  if (signUpError || !signUpData?.user) {
    redirect("/error");
  }

  const user = signUpData.user!;

  const { error: insertError } = await supabase.from("users").insert([
    {
      id: user.id,
      email: user.email,
    },
  ]);

  if (insertError) {
    console.error("Insert failed:", insertError);
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/login");
}
