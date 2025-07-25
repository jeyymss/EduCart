import { createClient } from "@/utils/supabase/server";

export async function uploadIdImage(
  file: File,
  email: string
): Promise<string | null> {
  const supabase = await createClient();

  const filePath = `ids/${email}_${Date.now()}`; // Unique path
  const { data, error } = await supabase.storage
    .from("id-verifications")
    .upload(filePath, file);

  if (error) {
    console.error("Image upload failed:", error);
    return null;
  }

  const { data: publicURLData } = supabase.storage
    .from("id-verifications")
    .getPublicUrl(filePath);
  return publicURLData?.publicUrl ?? null;
}
