"use client";

import { useState } from "react";
import { Search, Bell, MessageSquare, LogOut } from "lucide-react";
import { createBrowserClientInstance } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface NavbarProps {
  avatarUrl?: string | null;
  username?: string | null;
}

export default function Navbar({ avatarUrl, username }: NavbarProps) {
  const supabase = createBrowserClientInstance();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-zinc-950/90 backdrop-blur border-b border-zinc-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-16">
        <div className="flex items-center gap-6">
          <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            Social Swingers
          </span>

          <div className="hidden md:flex items-center bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 w-72">
            <Search size={16} className="text-zinc-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar perfiles..."
              className="bg-transparent text-sm text-zinc-200 placeholder-zinc-500 ml-2 w-full focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-zinc-400 hover:text-purple-400 transition relative">
            <MessageSquare size={20} />
          </button>
          <button className="text-zinc-400 hover:text-purple-400 transition relative">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 bg-pink-500 text-[10px] leading-none rounded-full w-4 h-4 flex items-center justify-center">
              !
            </span>
          </button>

          <div className="relative w-9 h-9 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700">
            <Image
              src={avatarUrl || "/default-avatar.png"}
              alt={username || "Perfil"}
              fill
              className="object-cover"
            />
          </div>

          <button
            onClick={handleLogout}
            className="text-zinc-400 hover:text-red-400 transition"
            title="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
}
