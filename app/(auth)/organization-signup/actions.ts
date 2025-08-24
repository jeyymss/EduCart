"use server";

import { createClient } from "@/utils/supabase/server";
import { getOrigin } from "@/lib/getOrigin";

export async function OrgRegister(formData: FormData) {
  const supabase = await createClient();

  const OrgName = ((formData.get("OrgName") as string) || "").trim();
  const OrgEmail = ((formData.get("OrgEmail") as string) || "").trim();
  const OrgDescription = (
    (formData.get("OrgDescription") as string) || ""
  ).trim();
  const OrgPassword = (formData.get("OrgPassword") as string) || "";
  const OrgConfirm = (formData.get("OrgConfirmPassword") as string) || "";
  const universityIdStr = (formData.get("university") as string) || "";
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

  const origin = getOrigin();

  const { data, error: signUpError } = await supabase.auth.signUp({
    email: OrgEmail,
    password: OrgPassword,
    options: {
      emailRedirectTo: `${origin}/confirm?email=${encodeURIComponent(
        OrgEmail
      )}`,
      data: {
        name: OrgName,
        full_name: OrgName,

        role: "organization",
        organization_name: OrgName,
        organization_email: OrgEmail,
        organization_description: OrgDescription,
        university_id,
      },
    },
  });

  if (signUpError) {
    return { error: signUpError.message || "Signup failed." };
  }

  if (!data?.user || data.user.identities?.length === 0) {
    return { error: "Email already registered. Try logging in." };
  }

  return { ok: true, confirmationSent: true };
}
