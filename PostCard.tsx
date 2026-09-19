"use client";

import { MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import ReactionButton from "./ReactionButton";
import CommentBox from "./CommentBox";

interface PostCardProps {
  post: {
    id: string;
    content: string;
    image_url?: string | null;
    created_at: string;
    profiles: {
      full_name: string | null;
      username: string;
      avatar_url: string | null;
    };
    reactions: { id: string; user_id: string; type: string }[];
    comments: {
      id: string;
      content: string;
      profiles: { username: string; full_name: string | null };
    }[];
  };
  currentUserId?: string;
}

export default function PostCard({ post, currentUserId }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-sm hover:border-zinc-700 transition duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-zinc-800">
            <Image
              src={post.profiles.avatar_url || "/default-avatar.png"}
              alt={post.profiles.full_name || post.profiles.username}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-zinc-200">
              {post.profiles.full_name || post.profiles.username}
            </h4>
            <p className="text-xs text-zinc-500">
              @{post.profiles.username} ·{" "}
              {new Date(post.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <button className="text-zinc-400 hover:text-zinc-200">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <p className="text-sm text-zinc-300 mb-4 whitespace-pre-line leading-relaxed">
        {post.content}
      </p>

      {post.image_url && (
        <div className="relative w-full h-80 rounded-lg overflow-hidden bg-zinc-800 mb-4">
          <Image src={post.image_url} alt="Contenido publicado" fill className="object-cover" />
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-zinc-400 text-sm">
        <ReactionButton
          postId={post.id}
          initialReactions={post.reactions}
          currentUserId={currentUserId}
        />

        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center space-x-2 hover:text-purple-400 transition group"
        >
          <div className="p-2 group-hover:bg-purple-500/10 rounded-lg">
            <MessageCircle size={18} />
          </div>
          <span>{post.comments.length} comentarios</span>
        </button>

        <button className="flex items-center space-x-2 hover:text-purple-400 transition group">
          <div className="p-2 group-hover:bg-purple-500/10 rounded-lg">
            <Share2 size={18} />
          </div>
          <span>Compartir</span>
        </button>
      </div>

      {showComments && (
        <CommentBox postId={post.id} initialComments={post.comments} />
      )}
    </div>
  );
}
