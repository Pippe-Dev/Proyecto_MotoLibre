import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";

export interface ProfileData {
  nombre?: string;
  celular?: string;
  tipoDocumento?: string;
  documento?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  configured: boolean;
  profile: ProfileData;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, profile: ProfileData) => Promise<{ needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateProfile: (profile: ProfileData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ERROR_MESSAGES: Record<string, string> = {
  "Invalid login credentials": "Correo o contraseña incorrectos.",
  "Email not confirmed": "Debes confirmar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada.",
  "User already registered": "Ya existe una cuenta con ese correo.",
  "New password should be different from the old password.":
    "La nueva contraseña debe ser diferente de la anterior.",
};

function toError(error: { message: string }): Error {
  const translated = ERROR_MESSAGES[error.message];
  if (translated) return new Error(translated);
  if (/password should be at least/i.test(error.message)) {
    return new Error("La contraseña es demasiado corta.");
  }
  if (/rate limit/i.test(error.message)) {
    return new Error("Demasiados intentos. Espera un momento e inténtalo de nuevo.");
  }
  return new Error(error.message || "Ocurrió un error inesperado.");
}

function assertConfigured(): void {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase no está configurado. Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en el archivo .env."
    );
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session);
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const user = session?.user ?? null;

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      session,
      loading,
      configured: isSupabaseConfigured,
      profile: (user?.user_metadata ?? {}) as ProfileData,

      async signIn(email, password) {
        assertConfigured();
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw toError(error);
      },

      async signUp(email, password, profile) {
        assertConfigured();
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: profile,
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw toError(error);
        // Con confirmación de correo activada, Supabase no devuelve sesión.
        return { needsConfirmation: !data.session };
      },

      async signOut() {
        assertConfigured();
        const { error } = await supabase.auth.signOut();
        if (error) throw toError(error);
      },

      async sendPasswordReset(email) {
        assertConfigured();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/restablecer`,
        });
        if (error) throw toError(error);
      },

      async updatePassword(password) {
        assertConfigured();
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw toError(error);
      },

      async updateProfile(profile) {
        assertConfigured();
        const { error } = await supabase.auth.updateUser({ data: profile });
        if (error) throw toError(error);
      },
    }),
    [user, session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de AuthProvider");
  }

  return context;
}
