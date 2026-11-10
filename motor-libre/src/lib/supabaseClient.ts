import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Si faltan las variables la app sigue funcionando como invitado; las pantallas
// de acceso muestran un aviso en lugar de fallar.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl ?? "http://localhost:54321",
  supabaseAnonKey ?? "anon-key-no-configurada",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export async function getAccessToken(): Promise<string | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
