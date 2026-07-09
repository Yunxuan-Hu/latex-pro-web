import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { PRODUCTION_CONFIG, readRuntimeEnv } from '../config/productionConfig';

interface SupabaseRuntimeConfig {
  url: string;
  anonKey: string;
}

let client: SupabaseClient | null = null;

export function getSupabaseConfig(): SupabaseRuntimeConfig | null {
  const url = readRuntimeEnv('VITE_SUPABASE_URL') || PRODUCTION_CONFIG.supabaseUrl;
  const anonKey = readRuntimeEnv('VITE_SUPABASE_ANON_KEY') || PRODUCTION_CONFIG.supabaseAnonKey;

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
