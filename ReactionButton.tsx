"use client";

import { useState, useTransition } from "react";
import { toggleReaction } from "@/app/actions";

interface Reaction {
  id: string;
  user_id: string;
  type: string;
}

interface ReactionButtonProps {
  postId: string;
  initialReactions: Reaction[];
  currentUserId?: string;
}

const REACTION_TYPES = [
  { key: "like", label: "👍" },
  { key: "love", label: "❤️" },
  { key: "haha", label: "😂" },
  { key: "wow", label: "😮" },
  { key: "sad", label: "😢" },
  { key: "angry", label: "😡" },
];

export default function ReactionButton({
  postId,
  initialReactions,
  currentUserId,
}: ReactionButtonProps) {
  const [reactions, setReactions] = useState(initialReactions);
  const [showMenu, setShowMenu] = useState(false);
  const [isPending, startTransition] = useTransition();

  const userReaction = reactions.find((r) => r.user_id === currentUserId)?.type;

  const handleReact = (type: string) => {
    if (!currentUserId) return;
    setShowMenu(false);

    // Actualización optimista
    const isRemoving = userReaction === type;
    setReactions((prev) => {
      const withoutMine = prev.filter((r) => r.user_id !== currentUserId);
      return isRemoving
        ? withoutMine
        : [...withoutMine, { id: "temp", user_id: currentUserId, type }];
    });

    startTransition(async () => {
      const result = await toggleReaction(postId, type);
      if (result?.error) {
        // Revertir en caso de error
        setReactions(initialReactions);
      }
    });
  };

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setShowMenu(true)}
        onClick={() => handleReact(userReaction || "like")}
        disabled={isPending}
        className={`flex items-center space-x-2 p-2 rounded-lg transition ${
          userReaction ? "text-purple-400 font-bold" : "text-zinc-400 hover:text-zinc-200"
        }`}
      >
        <span>{userReaction ? REACTION_TYPES.find((r) => r.key === userReaction)?.label : "👍"}</span>
        <span className="capitalize text-xs">{userReaction || "Me gusta"}</span>
        <span className="bg-zinc-800 text-xs px-1.5 py-0.5 rounded-full text-zinc-300">
          {reactions.length}
        </span>
      </button>

      {showMenu && (
        <div
          onMouseLeave={() => setShowMenu(false)}
          className="absolute bottom-full left-0 mb-2 bg-zinc-900 border border-zinc-800 flex space-x-2 p-2 rounded-xl shadow-xl z-50"
        >
          {REACTION_TYPES.map((react) => (
            <button
              key={react.key}
              onClick={() => handleReact(react.key)}
              className="text-2xl hover:scale-125 transition transform duration-150"
              title={react.key}
            >
              {react.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
