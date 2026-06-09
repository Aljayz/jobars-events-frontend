"use client";

import { useRef, useState } from "react";
import { uploadApprovalFile } from "../actions";
import { Upload, X } from "lucide-react";
import Image from "next/image";

export default function UploadForm({ bookingId }: { bookingId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    if (f.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  }

  function clearFile() {
    setFile(null);
    setPreview(null);
    if (formRef.current) formRef.current.reset();
  }

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        setUploading(true);
        await uploadApprovalFile(fd);
        setUploading(false);
        clearFile();
      }}
      className="rounded-xl border border-gray-800 bg-gray-900/50 p-5"
    >
      <input type="hidden" name="bookingId" value={bookingId} />
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-300">
        <Upload className="size-4 text-yellow-400" />
        Upload Proof
      </h3>

      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            name="title"
            placeholder="Title (e.g. Invitation Proof)"
            aria-label="Proof title"
            required
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-yellow-400 focus:outline-none"
          />
          <select
            name="fileType"
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 focus:border-yellow-400 focus:outline-none"
          >
            <option value="">Select type\u2026</option>
            <option value="invitation">Invitation</option>
            <option value="photo">Photo</option>
            <option value="video_preview">Video Preview</option>
          </select>
        </div>

        <textarea
          name="description"
          placeholder="Description (optional)"
          aria-label="Description"
          rows={2}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-yellow-400 focus:outline-none resize-none"
        />

        <div className="rounded-lg border border-dashed border-gray-700 p-4">
          {preview ? (
            <div className="relative">
              <Image src={preview} alt="Preview" width={400} height={200} unoptimized className="max-h-40 rounded-lg object-contain mx-auto" />
              <button
                type="button"
                onClick={clearFile}
                aria-label="Clear file"
                className="absolute -right-2 -top-2 rounded-full bg-gray-800 p-1 text-gray-400 hover:text-red-400"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ) : file ? (
            <div className="flex items-center justify-between rounded-lg bg-gray-800 px-3 py-2">
              <span className="text-sm text-gray-300 truncate">{file.name}</span>
              <button type="button" onClick={clearFile} aria-label="Clear file" className="text-gray-500 hover:text-red-400 shrink-0 ml-2">
                <X className="size-3.5" />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center py-4">
              <Upload className="mb-2 size-6 text-gray-500" />
              <p className="text-sm text-gray-500">Click to upload a file</p>
              <p className="text-xs text-gray-600 mt-1">PNG, JPG, WebP, PDF, or MP4 (max 10MB)</p>
              <input
                type="file"
                name="file"
                accept="image/png,image/jpeg,image/webp,application/pdf,video/mp4,video/webm"
                required
                onChange={handleFile}
                className="hidden"
              />
            </label>
          )}
        </div>

        <button
          type="submit"
          disabled={uploading || !file}
          className="inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-5 py-2.5 text-sm font-semibold text-black hover:bg-yellow-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </form>
  );
}
