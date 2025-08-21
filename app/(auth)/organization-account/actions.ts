// app/(auth)/org-signup/actions.ts
"use server";

import { createClient } from "@/utils/supabase/server";

export async function OrgRegister(formData: FormData) {
  const supabase = await createClient();

  const OrgName = (formData.get("OrgName") as string)?.trim() ?? "";
  const OrgEmail = (formData.get("OrgEmail") as string)?.trim() ?? "";
  const OrgDescription =
    (formData.get("OrgDescription") as string)?.trim() ?? "";
  const OrgPassword = (formData.get("OrgPassword") as string) ?? "";
  const OrgConfirm = (formData.get("OrgConfirmPassword") as string) ?? "";
  const universityIdStr = (formData.get("university") as string) ?? "";
  const university_id = Number(universityIdStr);

  if (
    !OrgName ||
    !OrgEmail ||
    !OrgPassword ||
    !OrgConfirm ||
    !universityIdStr
  ) {
    return { error: "Please fill out all required fields." };
  }
  if (OrgPassword !== OrgConfirm) {
    return { error: "Passwords do not match." };
  }
  if (!Number.isInteger(university_id)) {
    return { error: "Invalid university." };
  }

  // 1) Sign up org owner account (no email verification flow here)
  const { error: signUpError } = await supabase.auth.signUp({
    email: OrgEmail,
    password: OrgPassword,
    options: {
      // remove emailRedirectTo to keep it simple for now
      data: { display_name: OrgName },
    },
  });
  if (signUpError) {
    return { error: signUpError.message || "Signup failed." };
  }

  // 2) Manually insert org row with Pending status (service-role bypasses RLS)
  const { error: insertError } = await supabase.from("organizations").insert({
    university_id,
    organization_name: OrgName,
    organization_email: OrgEmail,
    organization_description: OrgDescription,
    verification_status: "Pending", // explicitly set, or rely on default
    // post_credits_balance will take your default (5) from the table
  });

  if (insertError) {
    return { error: insertError.message || "Inserting organization failed." };
  }

  return { ok: true };
}
