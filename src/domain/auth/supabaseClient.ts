import { createClient, type SupabaseClient } from '@supabase/supabase-js';

interface SupabaseRuntimeConfig {
  url: string;
  anonKey: string;
}

let client: SupabaseClient | null = null;

export function getSupabaseConfig(): SupabaseRuntimeConfig | null {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig() !== null;
}

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();

  if (!config) {
    return null;
  }

  if (!client) {
    client = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return client;
}
