"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";

export default function BackgroundUploader({
  userId,
  role,
  currentUrl,
}: {
  userId: string;
  role: "individual" | "organization";
  currentUrl?: string | null;
}) {
  const supabase = createClient();

  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [tempPreview, setTempPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setPreview(currentUrl ?? null);
  }, [currentUrl]);

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setErr(null);
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setTempPreview(f ? URL.createObjectURL(f) : null);
  }

  async function handleSave() {
    if (!file) return;

    setErr(null);
    setUploading(true);

    try {
      //get session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      
      if (sessionError) throw new Error(`Auth failed: ${sessionError.message}`);

      const uid = session?.user.id;
      if (!uid) throw new Error("You must be logged in.");

      const ext = file.name.split(".").pop() || "jpg";
      const path = `${uid}/background-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-backgrounds")
        .upload(path, file, {
          upsert: false,
          contentType: file.type || "image/*",
          cacheControl: "3600",
          metadata: { owner: uid }, // add metadata
        });

      if (uploadError)
        throw new Error(`Storage upload failed: ${uploadError.message}`);

      const { data: pub } = supabase.storage
        .from("profile-backgrounds")
        .getPublicUrl(path);
      const publicUrl = pub.publicUrl;
      if (!publicUrl) throw new Error("Failed to generate public URL.");

      const { error: dbError } =
        role === "individual"
          ? await supabase
              .from("individuals")
              .update({ background_url: publicUrl })
              .eq("user_id", uid)
          : await supabase
              .from("organizations")
              .update({ background_url: publicUrl })
              .eq("user_id", uid);

      if (dbError)
        throw new Error(`Database update failed: ${dbError.message}`);

      console.log("✅ Background uploaded successfully:", publicUrl);
      setPreview(publicUrl);
      setTempPreview(null);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (e: any) {
      console.error("❌ Error saving background:", e);
      setErr(e?.message ?? "Unexpected error while saving background");
    } finally {
      setUploading(false);
    }
  }

  function handleCancel() {
    setTempPreview(null);
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-gray-200">
      {/* 🔹 Show preview or saved background */}
      {tempPreview ? (
        <Image
          key={tempPreview}
          src={tempPreview}
          alt="Background preview"
          fill
          unoptimized
          className="object-cover"
        />
      ) : preview ? (
        <Image
          key={preview}
          src={preview}
          alt="Profile background"
          fill
          unoptimized
          className="object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-gray-500">
          No background
        </div>
      )}

      {/* 🔹 Hidden input */}
      <input
        id="bg-upload"
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleSelect}
      />

      {/* 🔹 Action buttons */}
      <div className="absolute top-2 right-2 flex gap-2">
        {tempPreview ? (
          <>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleSave}
              disabled={uploading}
            >
              {uploading ? "Saving..." : "Save"}
            </Button>
            <Button size="sm" variant="destructive" onClick={handleCancel}>
              Cancel
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => inputRef.current?.click()}
          >
            Change Background
          </Button>
        )}
      </div>

      {/* 🔹 Error message */}
      {err && (
        <div className="absolute bottom-2 left-2 text-sm text-red-600 bg-white/70 px-2 py-1 rounded">
          {err}
        </div>
      )}
    </div>
  );
}
