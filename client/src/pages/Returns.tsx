import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Returns() {
  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/">
          <button className="flex items-center gap-2 text-sm text-amber-500 hover:text-pink-500 transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </button>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-3xl font-bold text-amber-900 mb-2">Return & Refund Policy</h1>
          <p className="text-sm text-amber-400 mb-8">Last updated: June 2026</p>

          <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-8 space-y-6 text-amber-800">

            <section>
              <h2 className="text-lg font-bold text-amber-900 mb-2">Our Promise</h2>
              <p className="text-sm leading-relaxed">Every Plushie Knots product is handmade with care by Jiya & Kiyoshi. We want you to love what you receive. If something isn't right, we're here to make it right 🌸</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-amber-900 mb-2">1. Custom & Made-to-Order Items</h2>
              <p className="text-sm leading-relaxed">Since all our products are handmade to order, we generally <strong>do not accept returns</strong> unless the item arrives damaged or is significantly different from what was agreed upon.</p>
              <p className="text-sm leading-relaxed mt-2">Please review your order details carefully before confirming. If you have any doubts, message us on WhatsApp before placing your order.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-amber-900 mb-2">2. Damaged or Wrong Item</h2>
              <p className="text-sm leading-relaxed mb-2">If your order arrives damaged or is the wrong item, please contact us within <strong>48 hours of delivery</strong> with:</p>
              <ul className="text-sm space-y-1 list-disc list-inside text-amber-700">
                <li>A photo of the damaged / incorrect item</li>
                <li>Your name and order details</li>
              </ul>
              <p className="text-sm leading-relaxed mt-2">We will offer a replacement or full refund depending on the situation.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-amber-900 mb-2">3. Refunds</h2>
              <p className="text-sm leading-relaxed">Approved refunds will be processed within <strong>5–7 business days</strong> via the original payment method or UPI/bank transfer as agreed.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-amber-900 mb-2">4. Cancellations</h2>
              <p className="text-sm leading-relaxed">Orders can be cancelled within <strong>24 hours</strong> of placing them, before production begins. Once we've started making your order, cancellations are not possible.</p>
              <p className="text-sm leading-relaxed mt-2">To cancel, message us on WhatsApp as soon as possible.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-amber-900 mb-2">5. Colour & Size Variations</h2>
              <p className="text-sm leading-relaxed">As all items are handmade, slight variations in colour, size, and texture are natural and expected. These are not considered defects and are not eligible for return.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-amber-900 mb-2">6. Contact Us</h2>
              <p className="text-sm leading-relaxed">For any return or refund queries, reach us on Instagram <a href="https://instagram.com/plushie_knots_" target="_blank" rel="noreferrer" className="text-pink-500 hover:underline">@plushie_knots_</a> or WhatsApp. We typically respond within a few hours 🧶</p>
            </section>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
