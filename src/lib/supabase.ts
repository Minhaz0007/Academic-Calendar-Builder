import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string,
);

/** Returns a stable anonymous ID for this browser, creating one on first visit. */
export function getSessionKey(): string {
  let key = localStorage.getItem('calendarSessionKey');
  if (!key) {
    key = crypto.randomUUID();
    localStorage.setItem('calendarSessionKey', key);
  }
  return key;
}
