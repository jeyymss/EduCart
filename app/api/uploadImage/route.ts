import { createClient } from "@/utils/supabase/server";

function sanitizeFileName(fileName: string) {
  return fileName
    .trim()
    .replace(/\s+/g, "_")       // replace spaces with underscores
    .replace(/[^\w\-.]/g, "_")  // replace invalid chars except word, dash, dot
    .toLowerCase();
}

export async function uploadImage(
  files: File[],
  folder: string,
  bucket: string,
  email: string
): Promise<string[]> {
  const supabase = await createClient();
  const imageUrls: string[] = [];

  // normalize email so it's safe
  const safeEmail = email.replace(/[@.]/g, "_");

  for (const file of files) {
    const sanitizedName = sanitizeFileName(file.name);

    // add timestamp so names are unique
    const filePath = `${folder}/${safeEmail}_${Date.now()}_${sanitizedName}`;

    const { error } = await supabase.storage.from(bucket).upload(filePath, file);

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
