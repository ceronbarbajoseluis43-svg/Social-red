"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------
// Crear una publicación (texto + imagen opcional ya subida)
// ---------------------------------------------------------
export async function createPost(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debes iniciar sesión para publicar." };
  }

  const content = String(formData.get("content") || "").trim();
  const imageUrl = formData.get("image_url") ? String(formData.get("image_url")) : null;

  if (!content && !imageUrl) {
    return { error: "La publicación necesita texto o una imagen." };
  }

  const { error } = await supabase.from("posts").insert({
    user_id: user.id,
    content,
    image_url: imageUrl,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/feed");
  return { success: true };
}

// ---------------------------------------------------------
// Añadir / cambiar / quitar una reacción a un post
// ---------------------------------------------------------
export async function toggleReaction(postId: string, type: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debes iniciar sesión para reaccionar." };
  }

  // ¿Ya existe una reacción de este usuario en este post?
  const { data: existing } = await supabase
    .from("reactions")
    .select("id, type")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing && existing.type === type) {
    // Misma reacción -> se quita (alternancia)
    const { error } = await supabase.from("reactions").delete().eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    // Nueva reacción o cambio de tipo -> upsert
    const { error } = await supabase
      .from("reactions")
      .upsert(
        { post_id: postId, user_id: user.id, type },
        { onConflict: "post_id,user_id" }
      );
    if (error) return { error: error.message };
  }

  revalidatePath("/feed");
  return { success: true };
}

// ---------------------------------------------------------
// Añadir un comentario a un post
// ---------------------------------------------------------
export async function addComment(postId: string, content: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debes iniciar sesión para comentar." };
  }

  const trimmed = content.trim();
  if (!trimmed) {
    return { error: "El comentario no puede estar vacío." };
  }

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    user_id: user.id,
    content: trimmed,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/feed");
  return { success: true };
}
