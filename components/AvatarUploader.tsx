"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import type { UserProfile } from "@/hooks/useUserProfile";
import Image from "next/image";

type Props = {
  currentUrl?: string;
  onUploaded?: (url: string) => void;
};

export default function AvatarUploader({ currentUrl, onUploaded }: Props) {
  const supabase = createClient();
  const qc = useQueryClient();
  const router = useRouter();

  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => setPreviewUrl(currentUrl), [currentUrl]);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    setErr(null);
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setPreviewUrl(f ? URL.createObjectURL(f) : currentUrl);
  }

  async function onUpload() {
    if (!file) return;
    try {
      setUploading(true);

      // who am I
      const { data: auth, error: authErr } = await supabase.auth.getUser();
      if (authErr) throw authErr;
      const uid = auth?.user?.id;
      if (!uid) throw new Error("You must be logged in.");

      // upload to Storage
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${uid}/avatar-${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, {
          upsert: false,
          contentType: file.type || "image/*",
          cacheControl: "3600",
        });
      if (upErr) throw upErr;

      // get URL (use signed url if bucket is private)
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = pub.publicUrl;

      // persist to INDIVIDUALS (NOT users)
      const { error: dbErr } = await supabase
        .from("individuals")
        .update({ avatar_url: url })
        .eq("user_id", uid)
        .select("avatar_url")
        .single();
      if (dbErr) throw dbErr;

      // update cache so UI reflects immediately
      qc.setQueryData<UserProfile | undefined>(["user-profile"], (prev) =>
        prev ? { ...prev, avatar_url: url } : prev
      );

      onUploaded?.(url);
      router.refresh();
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErr(e?.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {previewUrl ? (
        <Image
          key={previewUrl} // refresh when a new blob URL is set
          src={previewUrl}
          alt="Current avatar preview"
          width={40}
          height={40}
          unoptimized // important for blob: URLs and one-off previews
          className="h-10 w-10 rounded-full object-cover"
        />
      ) : null}

      <label className="text-sm" htmlFor="avatar-input">
        Change avatar:
      </label>
      <input
        id="avatar-input"
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onPick}
        disabled={uploading}
      />

      <Button
        type="button"
        variant="secondary"
        onClick={onUpload}
        disabled={!file || uploading}
      >
        {uploading ? "Uploading..." : "Upload"}
      </Button>

      {err && <span className="text-sm text-red-600">{err}</span>}
    </div>
  );
}
