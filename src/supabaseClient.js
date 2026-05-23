import { createClient } from '@supabase/supabase-js';

const url = process.env.REACT_APP_SUPABASE_URL;
const key = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Flag so components can show a configuration warning rather than crash.
export const supabaseMisconfigured = !url || !key;

// Placeholder values prevent createClient() from throwing when env vars are
// absent (CI preview builds, local dev without .env.local).  All queries will
// fail with network errors rather than a hard crash.
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  key || 'placeholder-anon-key',
);
