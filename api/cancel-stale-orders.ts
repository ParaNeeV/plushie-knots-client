import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabaseAdmin } from "./_supabaseAdmin";

// How long an order can sit unpaid before it's auto-cancelled.
const TIMEOUT_MINUTES = 20;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const supabase = getSupabaseAdmin();
    const cutoff = new Date(Date.now() - TIMEOUT_MINUTES * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("orders")
      .update({ payment_status: "cancelled" })
      .eq("payment_status", "pending")
      .lt("created_at", cutoff)
      .select("id");

    if (error) {
      console.error("cancel-stale-orders error:", error);
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(200).json({ cancelled: data?.length || 0 });
  } catch (err) {
    console.error("cancel-stale-orders error:", err);
    res.status(500).json({ error: "Failed to run cleanup" });
  }
}
