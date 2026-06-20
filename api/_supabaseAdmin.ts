import { createClient } from "@supabase/supabase-js";

// Server-only Supabase client. Uses the SERVICE ROLE key (full read/write,
// bypasses RLS) so order rows can be created/updated reliably from these
// serverless functions regardless of the public RLS policies the anon key
// is restricted by on the client. This key must NEVER be sent to the browser
// — it only lives in Vercel's server-side environment variables.
const SUPABASE_URL = "https://mcaywpzaiudhspkwifqu.supabase.co";

export function getSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
  }
  return createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false },
  });
}
