import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://mcaywpzaiudhspkwifqu.supabase.co";
const SUPABASE_KEY = "sb_publishable_L6m3ur2oXWzkuNWdfvmQUw_XlQy-u1S";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
