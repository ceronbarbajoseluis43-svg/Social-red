"use client";

import { useState, useRef, useTransition } from "react";
import { createBrowserClientInstance } from "@/utils/supabase/client";
import { createPost } from "@/app/actions";
import { Image as ImageIcon, Loader2 } from "lucide-react";

export default function CreatePost() {
  const supabase = createBrowserClientInstance();

  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageFile) return;
    setError("");

    startTransition(async () => {
      let imageUrl: string | null = null;

      try {
        if (imageFile) {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (!session) throw new Error("No estás autenticado.");

          const fileExt = imageFile.name.split(".").pop();
          const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("posts-images")
            .upload(fileName, imageFile);
          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage.from("posts-images").getPublicUrl(fileName);
          imageUrl = publicUrl;
        }

        const formData = new FormData();
        formData.set("content", content);
        if (imageUrl) formData.set("image_url", imageUrl);

        const result = await createPost(formData);
        if (result?.error) throw new Error(result.error);

        setContent("");
        setImageFile(null);
        setImagePreview(null);
      } catch (err: any) {
        setError(err.message || "Error al crear la publicación.");
      }
    });
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="¿Qué estás pensando para hoy en Social Swingers?"
          className="w-full min-h-[80px] bg-transparent text-sm text-zinc-200 placeholder-zinc-500 resize-none focus:outline-none"
        />

        {imagePreview && (
          <div className="relative w-full h-48 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center">
            <img src={imagePreview} alt="Vista previa" className="object-contain h-full w-full" />
            <button
              type="button"
              onClick={() => {
                setImageFile(null);
                setImagePreview(null);
              }}
              className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white rounded-full p-1 text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 text-zinc-400 hover:text-purple-400 text-xs transition"
          >
            <ImageIcon size={18} />
            <span>Añadir foto</span>
          </button>

          <button
            type="submit"
            disabled={isPending || (!content.trim() && !imageFile)}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:hover:bg-purple-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition flex items-center space-x-1"
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            <span>Publicar</span>
          </button>
        </div>
      </form>
    </div>
  );
}
