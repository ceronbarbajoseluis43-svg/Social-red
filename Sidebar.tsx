import { Home, User, Users, Heart, Settings } from "lucide-react";
import Link from "next/link";

const links = [
  { href: "/feed", label: "Inicio", icon: Home },
  { href: "/profile", label: "Mi perfil", icon: User },
  { href: "/friends", label: "Conexiones", icon: Users },
  { href: "/matches", label: "Afinidades", icon: Heart },
  { href: "/settings", label: "Configuración", icon: Settings },
];

export default function Sidebar() {
  return (
    <div className="sticky top-20 bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-1">
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:bg-zinc-800 hover:text-purple-400 transition"
        >
          <Icon size={18} />
          <span>{label}</span>
        </Link>
      ))}
    </div>
  );
}
