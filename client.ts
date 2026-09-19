// utils/supabase/client.ts
// Cliente de Supabase para Client Components (formularios interactivos, realtime, etc.)
import { createBrowserClient } from "@supabase/ssr";

export function createBrowserClientInstance() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
