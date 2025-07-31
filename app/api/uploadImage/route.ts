import { createClient } from "@/utils/supabase/server";

export async function uploadImage(
  file: File,
  folder: string,
  bucket: string,
  email: string
): Promise<string | null> {
  const supabase = await createClient();

  const safeEmail = email.replace(/[@.]/g, "_"); // clean for path
  const filePath = `${folder}/${safeEmail}_${Date.now()}_${file.name}`;

  const { error } = await supabase.storage.from(bucket).upload(filePath, file);

  if (error) {
    console.error("Image upload failed:", error);
    return null;
  }

  const { data: publicURLData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicURLData?.publicUrl ?? null;
}
