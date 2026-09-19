"use client";

import { useState, useTransition } from "react";
import { addComment } from "@/app/actions";
import { Send } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  profiles: { username: string; full_name: string | null };
}

interface CommentBoxProps {
  postId: string;
  initialComments: Comment[];
}

export default function CommentBox({ postId, initialComments }: CommentBoxProps) {
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const content = text;
    setText("");
    setError("");

    startTransition(async () => {
      const result = await addComment(postId, content);
      if (result?.error) {
        setError(result.error);
        setText(content);
      } else {
        setComments((prev) => [
          ...prev,
          { id: `temp-${Date.now()}`, content, profiles: { username: "tú", full_name: null } },
        ]);
      }
    });
  };

  return (
    <div className="mt-3 space-y-2 border-t border-zinc-800/60 pt-3">
      {comments.map((c) => (
        <div key={c.id} className="text-xs text-zinc-300">
          <span className="font-semibold text-zinc-200">
            {c.profiles?.full_name || c.profiles?.username}:{" "}
          </span>
          {c.content}
        </div>
      ))}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un comentario..."
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500"
        />
        <button
          type="submit"
          disabled={isPending || !text.trim()}
          className="text-purple-400 hover:text-purple-300 disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </form>
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}
