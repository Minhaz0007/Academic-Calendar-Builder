import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string,
);

/**
 * Fixed key that identifies this deployment's calendar row.
 * All visitors to the app URL read and write the same record —
 * no localStorage or per-browser identity needed.
 */
export const SESSION_KEY = 'main';

/** @deprecated Use SESSION_KEY directly. Kept for call-site compatibility. */
export function getSessionKey(): string {
  return SESSION_KEY;
}
