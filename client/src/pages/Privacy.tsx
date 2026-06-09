import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/">
          <button className="flex items-center gap-2 text-sm text-amber-500 hover:text-pink-500 transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </button>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-3xl font-bold text-amber-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-amber-400 mb-8">Last updated: June 2026</p>

          <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-8 space-y-6 text-amber-800">

            <section>
              <h2 className="text-lg font-bold text-amber-900 mb-2">1. Who We Are</h2>
              <p className="text-sm leading-relaxed">Plushie Knots is a handmade crochet business run by Jiya and Kiyoshi, based in India. We make custom crochet bouquets, plushies, keychains, and more. Our website is <a href="https://plushie-knots-client.vercel.app" className="text-pink-500 hover:underline">plushie-knots-client.vercel.app</a>.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-amber-900 mb-2">2. What Information We Collect</h2>
              <p className="text-sm leading-relaxed mb-2">When you place an order or join our waitlist, we collect:</p>
              <ul className="text-sm space-y-1 list-disc list-inside text-amber-700">
                <li>Your name</li>
                <li>Your WhatsApp / phone number</li>
                <li>Your order details (product, description, customisation preferences)</li>
              </ul>
              <p className="text-sm leading-relaxed mt-2">We do <strong>not</strong> collect payment information, passwords, or any sensitive personal data.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-amber-900 mb-2">3. How We Use Your Information</h2>
              <p className="text-sm leading-relaxed mb-2">Your information is used only to:</p>
              <ul className="text-sm space-y-1 list-disc list-inside text-amber-700">
                <li>Process and fulfill your order</li>
                <li>Contact you on WhatsApp about your order status</li>
                <li>Notify you when orders reopen (if you joined our waitlist)</li>
              </ul>
              <p className="text-sm leading-relaxed mt-2">We do <strong>not</strong> sell, share, or rent your information to any third party.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-amber-900 mb-2">4. Data Storage</h2>
              <p className="text-sm leading-relaxed">Your order information is stored securely in our database (Supabase), hosted on servers in India. Your profile details (name and phone) are saved locally on your device for a faster ordering experience.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-amber-900 mb-2">5. Cookies & Analytics</h2>
              <p className="text-sm leading-relaxed">We use Vercel Analytics to understand how visitors use our site. This collects anonymous data like page views and country — no personal information is linked to this data.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-amber-900 mb-2">6. Your Rights</h2>
              <p className="text-sm leading-relaxed">You can ask us to delete your data at any time. Just message us on WhatsApp and we'll remove your information within 48 hours.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-amber-900 mb-2">7. Contact Us</h2>
              <p className="text-sm leading-relaxed">For any privacy-related questions, reach us on Instagram <a href="https://instagram.com/plushie_knots_" target="_blank" rel="noreferrer" className="text-pink-500 hover:underline">@plushie_knots_</a> or via WhatsApp.</p>
            </section>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
