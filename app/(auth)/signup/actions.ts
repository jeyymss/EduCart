"use server";

import { createClient } from "@/utils/supabase/server";
import { uploadImage } from "@/app/api/uploadImage/route";

export async function register(formData: FormData) {
  const supabase = await createClient();

  // Extract credentials first
  const credentials = {
    role: formData.get("role") as string,
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    verificationStatus:
      (formData.get("verificationStatus") as string) || "Pending",
    university: formData.get("university") as string,
  };

  if (credentials.role === "student" || credentials.role === "faculty") {
    const { data: university, error } = await supabase
      .from("universities")
      .select("domain")
      .eq("id", Number(credentials.university))
      .single();

    if (error || !university) {
      throw new Error("Selected university is invalid.");
    }

    if (!credentials.email.endsWith(university.domain)) {
      throw new Error(`Email must end with ${university.domain}`);
    }
  }

  // Get the file from formData
  const rawFile = formData.get("idImage");
  const idImageFile = rawFile instanceof File ? rawFile : null;

  // Upload image
  let idImageUrl: string | null = null;

  if (idImageFile) {
    const urls = await uploadImage(
      [idImageFile],
      "ids",
      "id-verifications",
      credentials.email
    );

    idImageUrl = urls[0] || null;
  }

  // 1. Sign up user to Supabase Auth
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: credentials.email,
    password: credentials.password,
    options: {
      data: {
        display_name: credentials.name,
      },
    },
  });

  // Real auth error
  if (signUpError) {
    const msg = signUpError.message?.toLowerCase?.() ?? "";
    if (
      msg.includes("already") &&
      (msg.includes("exist") || msg.includes("registered"))
    ) {
      return { error: "Email already registered. Try logging in." };
    }
    return { error: signUpError.message || "Signup failed." };
  }

  // Supabase quirk: already-registered email -> user.identities = []
  if (!signUpData?.user || signUpData.user.identities?.length === 0) {
    return {
      error: "Email already registered.",
    };
  }

  const authUser = signUpData.user;

  // 2) Insert into your public.users (works because you granted INSERT to anon/authenticated)
  const { error: insertError } = await supabase.from("users").insert([
    {
      id: authUser.id, // FK -> auth.users.id
      email: authUser.email ?? credentials.email,
      role: credentials.role,
      full_name: credentials.name,
      id_verification_url: idImageUrl,
      verification_status: credentials.verificationStatus,
      university_id: credentials.university, // must be number
    },
  ]);

  if (insertError) {
    // Common causes: invalid university_id, constraints, etc.
    return { error: insertError.message };
  }

  return { success: true };
}
