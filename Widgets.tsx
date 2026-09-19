import Image from "next/image";

interface SuggestedProfile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

export default function Widgets({ suggestions = [] as SuggestedProfile[] }) {
  return (
    <div className="sticky top-20 space-y-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">
          Sugerencias para conectar
        </h3>

        {suggestions.length === 0 && (
          <p className="text-xs text-zinc-500">
            Aún no hay sugerencias disponibles.
          </p>
        )}

        <div className="space-y-3">
          {suggestions.map((profile) => (
            <div key={profile.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-zinc-800">
                  <Image
                    src={profile.avatar_url || "/default-avatar.png"}
                    alt={profile.full_name || profile.username}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-200">
                    {profile.full_name || profile.username}
                  </p>
                  <p className="text-[11px] text-zinc-500">@{profile.username}</p>
                </div>
              </div>
              <button className="text-[11px] font-medium text-purple-400 hover:text-purple-300">
                Conectar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
