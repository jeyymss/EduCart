"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";

type Props = {
  userId: string;
  role: "individual" | "organization";
  currentAvatar?: string | null;
  currentBackground?: string | null;
  currentBio?: string | null;
  onDone?: (updated?: {
    avatar_url?: string | null;
    background_url?: string | null;
    bio?: string;
  }) => void;
};

const AVATAR_DIM = 128;

export default function EditProfile({
  userId,
  role,
  currentAvatar,
  currentBackground,
  currentBio,
  onDone,
}: Props) {
  const supabase = createClient();
  const router = useRouter();

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(currentAvatar ?? null);

  const bgInputRef = useRef<HTMLInputElement>(null);
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [bgPreview, setBgPreview] = useState<string | null>(currentBackground ?? null);

  const [bio, setBio] = useState<string>(currentBio ?? "");
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function onPickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setAvatarFile(f);
    setAvatarPreview(f ? URL.createObjectURL(f) : currentAvatar ?? null);
  }

  function onPickBackground(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setBgFile(f);
    setBgPreview(f ? URL.createObjectURL(f) : currentBackground ?? null);
  }

  async function onSave() {
    setUploading(true);
    setErr(null);

    try {
      const { data: auth, error: authErr } = await supabase.auth.getUser();
      if (authErr) throw authErr;
      const uid = auth?.user?.id;
      if (!uid) throw new Error("You must be logged in.");

      let avatarUrl = currentAvatar ?? null;
      let bgUrl = currentBackground ?? null;

      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop() || "jpg";
        const path = `${uid}/avatar-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("avatars").upload(path, avatarFile, { upsert: false });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("avatars").getPublicUrl(path);
        avatarUrl = data.publicUrl;
      }

      if (bgFile) {
        const ext = bgFile.name.split(".").pop() || "jpg";
        const path = `${uid}/background-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("profile-backgrounds").upload(path, bgFile, { upsert: false });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("profile-backgrounds").getPublicUrl(path);
        bgUrl = data.publicUrl;
      }

      if (role === "individual") {
        await supabase.from("individuals").update({ avatar_url: avatarUrl, background_url: bgUrl, bio }).eq("user_id", uid);
      } else {
        await supabase.from("organizations").update({ avatar_url: avatarUrl, background_url: bgUrl, bio }).eq("user_id", uid);
      }

      // Return updated values so parent can optimistically update UI
      if (onDone) {
        onDone({
          avatar_url: avatarUrl,
          background_url: bgUrl,
          bio,
        });
      } else {
        router.refresh();
      }
    } catch (e: any) {
      setErr(e?.message ?? "Unexpected error");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="relative w-full">
      {/* Cover */}
      <div className="relative w-full h-40 md:h-60">
        {bgPreview ? (
          <Image
            key={bgPreview}
            src={bgPreview}
            alt="Background preview"
            fill
            unoptimized
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-200 text-gray-500">
            No background
          </div>
        )}

        <Input ref={bgInputRef} type="file" accept="image/*" className="hidden" onChange={onPickBackground} />

        {/* Camera icon centered on cover */}
        <button
          onClick={() => bgInputRef.current?.click()}
          className="absolute inset-0 flex items-center justify-center bg-black/30 text-white opacity-0 hover:opacity-100 transition"
          aria-label="Change cover photo"
          type="button"
        >
          <Camera className="h-8 w-8" />
        </button>

        {/* Save / Cancel top-right */}
        <div className="absolute top-3 right-3 flex gap-2">
          <Button onClick={onSave} disabled={uploading} className="bg-[#E59E2C] text-white hover:bg-[#d4881f]">
            {uploading ? "Saving…" : "Save"}
          </Button>
          <Button variant="outline" onClick={() => onDone?.()}>
            Cancel
          </Button>
        </div>
      </div>

      {/* Avatar + Bio section — matches view-mode structure/offsets */}
      <div className="bg-white shadow-sm px-6 pb-6">
        <div className="flex items-start gap-4">
          {/* Avatar positioned exactly like view mode */}
          <div
            className="relative -mt-16 rounded-full ring-4 ring-white shadow-md overflow-hidden shrink-0"
            style={{ width: AVATAR_DIM, height: AVATAR_DIM }}
          >
            {avatarPreview ? (
              <Image
                key={avatarPreview}
                src={avatarPreview}
                alt="Avatar preview"
                width={AVATAR_DIM}
                height={AVATAR_DIM}
                unoptimized
                className="h-full w-full object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gray-200" />
            )}

            <Input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={onPickAvatar} />

            {/* Camera overlay centered on avatar */}
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 hover:opacity-100 transition"
              aria-label="Change avatar"
              type="button"
            >
              <Camera className="h-5 w-5" />
            </button>
          </div>

          {/* Bio editor */}
          <div className="flex-1 mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write your bio..."
              className="w-full text-base resize-y min-h-[140px]"
            />
          </div>
        </div>
      </div>

      {err && <p className="text-sm text-red-600 mt-2">{err}</p>}
    </div>
  );
}
