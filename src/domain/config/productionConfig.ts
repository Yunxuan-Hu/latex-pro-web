export const PRODUCTION_CONFIG = {
  openaiModel: 'gpt-5.1',
  openaiProxyUrl: 'https://latex-pro-web-production.up.railway.app/api/openai/chat-completions',
  supabaseAnonKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmcXhxamRvcm9lY3Bmdm5jcXBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1Mjk5NDUsImV4cCI6MjA5OTEwNTk0NX0.t-qbYeeowofEQvos2odUW8OTKbtgsCkpUJzc9vQxw4k',
  supabaseUrl: 'https://lfqxqjdoroecpfvncqps.supabase.co',
  unlockEndpoint: 'https://latex-pro-web-production.up.railway.app/api/auth/unlock',
} as const;

export function readRuntimeEnv(key: string): string | undefined {
  const value = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.[key];
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
