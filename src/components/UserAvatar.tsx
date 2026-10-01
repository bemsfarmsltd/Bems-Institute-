"use client";

import React, { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { useLMS } from "@/context/LMSContext";
import type { User } from "@/types/lms";

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface UserAvatarProps {
  user: Pick<User, "name" | "avatarUrl"> | null | undefined;
  size?: number;
  editable?: boolean;
  className?: string;
}

// Shows the user's uploaded photo/GIF when set, falling back to a gradient
// initials circle otherwise. A plain <img>, not next/image — Next's image
// optimizer strips animation from GIFs, which would defeat the point of
// letting people upload one, and the source is an arbitrary Cloudinary URL
// that isn't worth adding to next.config's remote image allowlist.
export function UserAvatar({ user, size = 40, editable = false, className = "" }: UserAvatarProps) {
  const { uploadAvatar } = useLMS();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    setIsUploading(true);
    const result = await uploadAvatar(file);
    setIsUploading(false);
    if (!result.ok) setError(result.error || "Upload failed.");
  };

  return (
    <div className={`relative inline-flex shrink-0 rounded-full ${className}`} style={{ width: size, height: size }}>
      <div
        className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-[#AE54C6] to-[#303654] text-white flex items-center justify-center font-extrabold shadow-xs"
        style={{ fontSize: size * 0.38 }}
      >
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
        ) : (
          initials(user.name)
        )}
      </div>

      {editable && (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            aria-label="Change profile picture"
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-[#AE54C6] hover:bg-[#F7EDF9] transition-colors disabled:opacity-60 cursor-pointer"
          >
            {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />
          {error && (
            <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 whitespace-nowrap text-[10px] font-semibold text-red-700 bg-white px-2 py-1 rounded-lg shadow-md border border-red-200 z-10">
              {error}
            </span>
          )}
        </>
      )}
    </div>
  );
}
