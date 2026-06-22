import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { getSupabaseAdmin } from "./_supabaseAdmin.js";

// Reads the raw request body as a string. This MUST happen before anything
// else touches `req` — we need the exact bytes Razorpay sent (not a
// re-serialized JSON object) to verify the HMAC signature correctly.
function readRawBody(req: VercelRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("Missing RAZORPAY_WEBHOOK_SECRET env var");
    res.status(500).end();
    return;
  }

  const rawBody = await readRawBody(req);
  const signature = req.headers["x-razorpay-signature"] as string | undefined;
  const expectedSignature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  if (!signature || signature !== expectedSignature) {
    console.warn("razorpay-webhook: signature mismatch — rejecting");
    res.status(400).json({ error: "Invalid signature" });
    return;
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    res.status(400).json({ error: "Invalid JSON" });
    return;
  }

  try {
    const supabase = getSupabaseAdmin();

    if (event.event === "payment.captured" || event.event === "order.paid") {
      const payment = event.payload?.payment?.entity;
      const razorpayOrderId = payment?.order_id;
      const paymentId = payment?.id;
      if (razorpayOrderId) {
        const { data: existing } = await supabase
          .from("orders")
          .select("notes")
          .eq("razorpay_order_id", razorpayOrderId)
          .maybeSingle();
        const updatedNotes = [existing?.notes, `Paid via Razorpay (payment_id: ${paymentId})`].filter(Boolean).join(" | ");
        await supabase
          .from("orders")
          .update({ payment_status: "paid", status: "in-progress", notes: updatedNotes })
          .eq("razorpay_order_id", razorpayOrderId);
      }
    } else if (event.event === "payment.failed") {
      const razorpayOrderId = event.payload?.payment?.entity?.order_id;
      if (razorpayOrderId) {
        await supabase.from("orders").update({ payment_status: "failed" }).eq("razorpay_order_id", razorpayOrderId);
      }
    }
    // Any other event type: acknowledge and ignore, nothing to do.

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("razorpay-webhook processing error:", err);
    // Return non-2xx so Razorpay retries delivery — this is likely a
    // transient DB hiccup, not a bad event, so a retry can self-heal it.
    res.status(500).json({ error: "processing failed" });
  }
}
