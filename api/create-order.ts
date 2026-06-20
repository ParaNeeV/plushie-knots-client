import type { VercelRequest, VercelResponse } from "@vercel/node";
import Razorpay from "razorpay";
import { getSupabaseAdmin } from "./_supabaseAdmin.js";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// Pulls the first valid rupee amount out of a price string like "₹349",
// "Starting ₹59", or "₹150 if bought in pair". Returns null if nothing
// numeric can be found — callers must fall back to manual/WhatsApp
// ordering in that case, since Razorpay needs an exact amount.
function parseRupees(price: string): number | null {
  const match = price.replace(/,/g, "").match(/(\d+(\.\d+)?)/);
  if (!match) return null;
  const n = parseFloat(match[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { name, phone, address, pincode, product, description, price } = req.body || {};

    if (!name?.trim() || !phone?.trim() || !address?.trim() || !pincode?.trim() || !product?.trim()) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const rupees = parseRupees(String(price || ""));
    if (!rupees) {
      res.status(400).json({ error: "This product doesn't have a fixed price and can't be auto-charged. Please order via WhatsApp instead." });
      return;
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      res.status(500).json({ error: "Payments aren't set up yet. Please order via WhatsApp instead." });
      return;
    }

    const supabase = getSupabaseAdmin();

    // 1. Create the order row first, as "pending" — this is what the
    // auto-cancel cron will clean up if payment never completes.
    const { data: orderRow, error: insertError } = await supabase
      .from("orders")
      .insert({
        name: name.trim(),
        phone: phone.trim(),
        address: `${address.trim()} - ${pincode.trim()}`,
        product: product.trim(),
        description: description?.trim() || "",
        status: "new",
        payment_status: "pending",
        price: `₹${rupees}`,
        notes: "",
        source: "customer",
        date: todayStr(),
      })
      .select()
      .single();

    if (insertError || !orderRow) {
      console.error("Order insert failed:", insertError);
      res.status(500).json({ error: "Couldn't create the order. Please try again." });
      return;
    }

    // 2. Create the matching Razorpay order (amount in paise).
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const rpOrder = await razorpay.orders.create({
      amount: Math.round(rupees * 100),
      currency: "INR",
      receipt: String(orderRow.id),
      notes: { order_row_id: String(orderRow.id), product: product.trim() },
    });

    // 3. Stamp the Razorpay order id back onto the row so the webhook can find it later.
    await supabase.from("orders").update({ razorpay_order_id: rpOrder.id }).eq("id", orderRow.id);

    res.status(200).json({
      orderRowId: orderRow.id,
      razorpayOrderId: rpOrder.id,
      razorpayKeyId: keyId,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      name: name.trim(),
      phone: phone.trim(),
    });
  } catch (err: any) {
    console.error("create-order error:", err);
    res.status(500).json({ error: "Something went wrong creating the order." });
  }
}
