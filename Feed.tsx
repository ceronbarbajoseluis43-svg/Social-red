import { createClient } from "@/utils/supabase/server";
import PostCard from "./PostCard";
import CreatePost from "./CreatePost";

export default async function Feed() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: posts, error } = await supabase
    .from("posts")
    .select(
      `
      id,
      content,
      image_url,
      created_at,
      profiles ( username, full_name, avatar_url ),
      reactions ( id, user_id, type ),
      comments ( id, content, profiles ( username, full_name ) )
    `
    )
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <CreatePost />

      {error && (
        <p className="text-sm text-red-500">
          No se pudieron cargar las publicaciones: {error.message}
        </p>
      )}

      {posts?.length === 0 && (
        <p className="text-sm text-zinc-500 text-center py-10">
          Aún no hay publicaciones. ¡Sé el primero en compartir algo!
        </p>
      )}

      {posts?.map((post: any) => (
        <PostCard key={post.id} post={post} currentUserId={user?.id} />
      ))}
    </div>
  );
}
