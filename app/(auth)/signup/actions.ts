"use server";

import { createClient } from "@/utils/supabase/server";
import { uploadImage } from "@/app/api/uploadImage/route";

export async function register(formData: FormData) {
  const supabase = await createClient();

  // ---- extract & normalize inputs ----
  const roleRaw = (formData.get("role") as string) ?? "";
  const role = roleRaw.trim(); // "Student" | "Faculty" | "Alumni"

  const name = (formData.get("name") as string)?.trim() ?? "";
  const email = (formData.get("email") as string)?.trim() ?? "";
  const password = (formData.get("password") as string) ?? "";
  const verificationStatus = (
    (formData.get("verificationStatus") as string) ?? "Pending"
  ).trim();

  const universityIdStr = (formData.get("university") as string) ?? "";
  const universityId = Number(universityIdStr || 0); // FK -> universities.id

  // ---- role-specific domain check for Student/Faculty ----
  const roleLower = role.toLowerCase();
  if (roleLower === "student" || roleLower === "faculty") {
    const { data: uni, error } = await supabase
      .from("universities")
      .select("domain")
      .eq("id", universityId)
      .single();

    if (error || !uni) {
      return { error: "Selected university is invalid." };
    }
    if (!email.toLowerCase().endsWith(uni.domain.toLowerCase())) {
      return { error: `Email must end with ${uni.domain}` };
    }
  }

  // ---- upload the ID image (optional) ----
  let idImageUrl: string | null = null;
  const idImage = formData.get("idImage");
  if (idImage instanceof File) {
    const urls = await uploadImage([idImage], "ids", "id-verifications", email);
    idImageUrl = urls?.[0] ?? null;
  }

  // ---- sign up + tell Supabase where to redirect after email click ----
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        full_name: name,
        role, // "Student" | "Faculty" | "Alumni"
        university_id: universityId,
        verification_status: verificationStatus,
        id_verification_url: idImageUrl,
      },
    },
  });

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

  if (!signUpData?.user || signUpData.user.identities?.length === 0) {
    return { error: "Email already registered." };
  }

  return { success: true, confirmationSent: true };
}
