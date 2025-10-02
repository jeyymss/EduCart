import { createClient } from "@/utils/supabase/server";

function sanitizeFileName(fileName: string) {
  return fileName
    .trim()
    .replace(/\s+/g, "_") // spaces → underscore
    .replace(/[^\w\-.]/g, "_") // remove unsafe chars
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

  const safeEmail = email.replace(/[@.]/g, "_");

  for (const file of files) {
    const sanitizedName = sanitizeFileName(file.name);
    const filePath = `${folder}/${safeEmail}_${Date.now()}_${sanitizedName}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "image/jpeg",
      });

    if (error) {
      console.error("Image upload failed for:", file.name, error);
      continue;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    if (data?.publicUrl) {
      imageUrls.push(data.publicUrl);
    }
  }

  return imageUrls;
}
