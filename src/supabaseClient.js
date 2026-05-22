import { createClient } from '@supabase/supabase-js';

// REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY must be set
// in .env.local (dev) or as Cloudflare Pages environment variables (prod).
// The anon key is intentionally browser-safe: RLS limits it to SELECT only.
export const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY,
);
