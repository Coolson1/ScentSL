"use client";

import Image from "next/image";
import { X, Upload, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

type Props = {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
};

export function ImageUploader({ value, onChange, max = 5 }: Props) {
  const remaining = max - value.length;
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  function remove(url: string) {
    onChange(value.filter((u) => u !== url));
  }

  async function handleUpload(file: File) {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      toast.error("Cloudinary is not configured");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    setUploading(true);
    setUploadProgress(0);

    try {
      const xhr = new XMLHttpRequest();

      const uploadPromise = new Promise<string>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        });
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              try {
                const result = JSON.parse(xhr.responseText);
                resolve(result.secure_url);
              } catch {
                reject(new Error("Invalid response"));
              }
            } else {
              reject(new Error("Upload failed"));
            }
          }
        };
        xhr.open("POST", uploadUrl);
        xhr.send(formData);
      });

      const url = await uploadPromise;

      if (!value.includes(url)) {
        onChange([...value, url].slice(0, max));
        toast.success("Image uploaded");
      }
    } catch (error) {
      console.error(error);
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
        {value.map((url) => (
          <div
            key={url}
            className="relative aspect-square overflow-hidden rounded-md border border-border bg-muted"
          >
            <Image
              src={url}
              alt="Uploaded image"
              fill
              unoptimized
              sizes="(max-width: 640px) 50vw, 20vw"
              className="object-cover"
            />
            <button
              type="button"
              aria-label="Remove image"
              onClick={() => remove(url)}
              className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white opacity-90 hover:bg-black"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}

        {remaining > 0 && (
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-brand-gold/40 bg-muted/40 text-xs text-muted-foreground transition-colors hover:border-brand-gold hover:bg-brand-gold/5">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={uploading || !CLOUD_NAME || !UPLOAD_PRESET}
              onChange={(e) => {
                const files = e.target.files;
                if (files) {
                  const uploads = Array.from(files).slice(0, remaining);
                  uploads.forEach((file) => handleUpload(file));
                }
              }}
            />
            {uploading ? (
              <>
                <Loader2 className="size-5 animate-spin text-brand-gold" />
                <span>{uploadProgress}%</span>
              </>
            ) : !CLOUD_NAME || !UPLOAD_PRESET ? (
              <span className="text-amber-600">Cloudinary not configured</span>
            ) : (
              <>
                <Upload className="size-5 text-brand-gold" />
                <span>Upload image</span>
                <span className="text-[10px]">
                  {remaining} of {max} left
                </span>
              </>
            )}
          </label>
        )}
      </div>

      {value.length > 0 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => onChange([])}
          disabled={uploading}
        >
          Clear all images
        </Button>
      )}
    </div>
  );
}