import { createClient } from "@/utils/supabase/server";

export async function uploadImage(
  files: File[],
  folder: string,
  bucket: string,
  email: string
): Promise<string[]> {
  const supabase = await createClient();
  const imageUrls: string[] = [];

  const safeEmail = email.replace(/[@.]/g, "_");

  for (const file of files) {
    const filePath = `${folder}/${safeEmail}_${Date.now()}_${file.name}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);
    if (error) {
      console.error("Image upload failed for:", file.name, error);
      continue;
    }

    const { data: publicURLData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (publicURLData?.publicUrl) {
      imageUrls.push(publicURLData.publicUrl);
    }
  }

  return imageUrls;
}
