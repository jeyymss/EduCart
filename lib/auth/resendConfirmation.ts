import { createClient } from "@/utils/supabase/client";
import { getOrigin } from "../getOrigin";

export async function resendConfirmation(email: string) {
  const supabase = createClient();

  const origin = getOrigin();

  const { error } = await supabase.auth.resend({
    type: "signup", // resend the email-confirmation link
    email,
    options: { emailRedirectTo: `${origin}/(auth)/confirm` },
  });

  if (error) throw new Error(error.message);
}
