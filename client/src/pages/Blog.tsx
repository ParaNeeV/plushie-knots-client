import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Clock, Star, ChevronDown, ChevronUp, Heart, Share2 } from "lucide-react";

const steps = [
  {
    number: "01",
    emoji: "🧶",
    title: "Gather Your Supplies",
    difficulty: "Easy",
    time: "5 min",
    content: "Before you begin, you'll need: soft yarn in your chosen color (we love pastel pinks and creams!), a crochet hook (3.5mm works great for amigurumi), polyester stuffing, a yarn needle, safety eyes (6–9mm), and scissors. Tip from Jiya & Kiyoshi — always use high-quality soft yarn so your teddy feels extra cuddly!",
    tip: "Pro tip: Choose a yarn color that makes you happy — you'll be spending a lot of time with it! 🌸",
    image: "🧵",
  },
  {
    number: "02",
    emoji: "✨",
    title: "Make a Magic Ring",
    difficulty: "Medium",
    time: "10 min",
    content: "The magic ring (also called magic circle) is the foundation of almost every amigurumi piece. Loop the yarn around your fingers twice, insert your hook through the loop, pull up a loop and chain 1. This creates an adjustable ring that closes tightly — so your teddy won't have a hole in the center. This is the technique Jiya uses for every single Plushie Knots creation!",
    tip: "If the magic ring feels tricky at first, practice with scrap yarn 10 times. It'll click suddenly and feel natural!",
    image: "⭕",
  },
  {
    number: "03",
    emoji: "🐻",
    title: "Crochet the Head",
    difficulty: "Medium",
    time: "30 min",
    content: "Round 1: 6 single crochets (sc) into magic ring. Round 2: 2 sc in each stitch (12 sts). Round 3: *sc, 2sc* repeat (18 sts). Rounds 4–6: *sc, sc, 2sc* repeat (24 sts). Continue increasing until you have 36 sts, then crochet straight for 4 rounds. Then start decreasing — *sc, sc2tog* — until you're back to 6 sts. This sphere shape becomes your teddy's round, squishy head!",
    tip: "Use a stitch marker to track the start of each round. Trust us — you'll lose count without it! 😄",
    image: "🔮",
  },
  {
    number: "04",
    emoji: "👁️",
    title: "Add the Safety Eyes",
    difficulty: "Easy",
    time: "5 min",
    content: "Before stuffing the head, attach the safety eyes! Position them on round 18–20, about 6–8 stitches apart. Push the post through the fabric, then attach the washer on the inside — squeeze firmly until it clicks. Once the washer is on, the eyes are permanent, so take your time deciding the placement. Slightly wider eyes = more surprised expression. Closer together = more sleepy and cute!",
    tip: "Hold the head at arm's length and check both eyes look even before locking them in. Symmetry is key! 👀",
    image: "👁️",
  },
  {
    number: "05",
    emoji: "🌟",
    title: "Stuff & Close the Head",
    difficulty: "Easy",
    time: "10 min",
    content: "Fill the head with polyester stuffing — pack it firmly but not too tight. You want a nice round shape that bounces back when squeezed. Once stuffed, continue decreasing until you have 6 stitches left. Cut the yarn leaving a long tail, thread it through the yarn needle, and weave through the remaining 6 stitches. Pull tight to close, then weave in the end. Your teddy head is done!",
    tip: "Kiyoshi's secret: stuff the head slightly firmer than you think — it softens with love over time! 🤍",
    image: "⭐",
  },
  {
    number: "06",
    emoji: "🤎",
    title: "Make the Body & Ears",
    difficulty: "Medium",
    time: "40 min",
    content: "Body: Start with 6 sc in magic ring, increase to 24 sts over 4 rounds, crochet straight for 6 rounds, then decrease back. Stuff before closing. Ears: Magic ring, 6 sc, increase to 12 sts over 2 rounds, fold flat and sew the opening closed — don't stuff! Make 2. Arms: Magic ring, 6 sc, increase to 9, crochet straight for 6 rounds, stuff lightly and close. Make 2.",
    tip: "Keep all your pieces in a small bowl as you make them — tiny amigurumi parts love to disappear! 😂",
    image: "🫶",
  },
  {
    number: "07",
    emoji: "🪡",
    title: "Assemble Your Teddy",
    difficulty: "Medium",
    time: "20 min",
    content: "Pin all pieces in place before sewing — ears at the top of the head, arms at the sides of the body, head centered on top of the body. Use your yarn needle and matching yarn to sew each piece on with a whip stitch. Pull firmly but not so tight the fabric puckers. The key is to sew through both layers multiple times for a secure attachment. Weave in all ends securely.",
    tip: "This is the most satisfying step! Watching it all come together is pure magic 🧶✨",
    image: "🧸",
  },
  {
    number: "08",
    emoji: "🌸",
    title: "Add Personal Touches",
    difficulty: "Easy",
    time: "15 min",
    content: "Now make it uniquely yours! Embroider a cute nose with 3–4 satin stitches in dark brown yarn. Add a small smile below. You can tie a tiny ribbon around the neck, add a bow on the ear, or embroider a small heart on the chest. This is where Jiya & Kiyoshi add their signature Plushie Knots magic — every single teddy gets a unique personal touch!",
    tip: "Use embroidery thread for finer details like the nose and mouth — it gives a cleaner look than yarn! 🌸",
    image: "💝",
  },
];

const faqs = [
  {
    q: "How long does it take to make a crochet teddy?",
    a: "For a beginner, expect 4–6 hours total. With practice, Jiya & Kiyoshi can make one in about 2 hours! Don't rush — enjoy the process.",
  },
  {
    q: "What size will the finished teddy be?",
    a: "Using 3.5mm hook and DK weight yarn, your teddy will be about 15–18cm (6–7 inches) tall. Perfect for a gift or desk companion!",
  },
  {
    q: "Can I wash the finished teddy?",
    a: "Yes! Hand wash in cool water with mild soap, squeeze gently, reshape and air dry. Don't machine wash as it can distort the shape.",
  },
  {
    q: "Is crochet hard to learn for beginners?",
    a: "The magic ring and single crochet are the only stitches you need for this teddy! Most beginners pick it up in an afternoon. YouTube tutorials alongside this guide work great.",
  },
  {
    q: "Where can I get a custom teddy made by Plushie Knots?",
    a: "Right here! Jiya & Kiyoshi take custom orders for handmade teddies, bouquets, keychains and more. Use the order form on our homepage 🌸",
  },
];

export default function Blog() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);

  return (
    <div className="min-h-screen bg-amber-50 font-['Poppins',sans-serif]">

      {/* Hero */}
      <div className="bg-gradient-to-b from-pink-100 to-amber-50 pt-8 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/">
            <a className="inline-flex items-center gap-2 text-sm text-pink-400 hover:text-pink-600 mb-6 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Plushie Knots
            </a>
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* WikiHow style category */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-pink-400 bg-pink-100 px-3 py-1 rounded-full">Crochet Guide</span>
              <span className="text-xs text-amber-400">by Jiya & Kiyoshi</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-amber-900 leading-tight mb-4">
              How to Make a Crochet Teddy Bear 🧸
            </h1>

            <p className="text-amber-600 text-base leading-relaxed mb-6">
              A step-by-step guide from the makers at Plushie Knots — the same technique Jiya & Kiyoshi use for every handmade plushie they create. Perfect for beginners!
            </p>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-amber-500">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-pink-400" />
                <span>2–4 hours total</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span>Beginner friendly</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>🧶</span>
                <span>8 steps</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-3xl mx-auto px-4 pb-16">

        {/* Intro card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl border border-pink-100 shadow-sm p-6 mb-8 -mt-4"
        >
          <p className="text-sm text-amber-700 leading-relaxed">
            At <span className="font-semibold text-pink-500">Plushie Knots</span>, every teddy bear starts with love and a crochet hook. Jiya & Kiyoshi have made hundreds of handmade plushies — and this is the exact method they use. Whether you want to try making one yourself or just want to know what goes into your custom order, this guide is for you! 🌸
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-6 mb-12">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="bg-white rounded-3xl border border-pink-100 shadow-sm overflow-hidden"
            >
              {/* Step header */}
              <div className="flex items-center gap-4 px-6 py-4 border-b border-pink-50">
                <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-2xl flex-shrink-0">
                  {step.emoji}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-pink-300">STEP {step.number}</span>
                    <span className="text-xs text-amber-400 bg-amber-50 px-2 py-0.5 rounded-full">{step.time}</span>
                    <span className="text-xs text-pink-400 bg-pink-50 px-2 py-0.5 rounded-full">{step.difficulty}</span>
                  </div>
                  <h2 className="text-base font-bold text-amber-900">{step.title}</h2>
                </div>
                <div className="text-3xl hidden sm:block">{step.image}</div>
              </div>

              {/* Step content */}
              <div className="px-6 py-5">
                <p className="text-sm text-amber-700 leading-relaxed mb-4">{step.content}</p>
                <div className="bg-pink-50 border border-pink-100 rounded-2xl px-4 py-3">
                  <p className="text-xs text-pink-600 leading-relaxed">💡 {step.tip}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-pink-100 to-amber-100 rounded-3xl border border-pink-200 p-8 text-center mb-12"
        >
          <div className="text-4xl mb-3">🧸</div>
          <h3 className="text-xl font-bold text-amber-900 mb-2">Rather have one made for you?</h3>
          <p className="text-sm text-amber-600 mb-5">Jiya & Kiyoshi handcraft every plushie with love. Custom colors, sizes, and personal touches available!</p>
          <Link href="/">
            <motion.a
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="inline-block bg-pink-400 hover:bg-pink-500 text-white font-semibold rounded-2xl px-8 py-3 text-sm shadow-md transition-colors cursor-pointer"
            >
              Place a Custom Order 🌸
            </motion.a>
          </Link>
        </motion.div>

        {/* FAQ */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-amber-900 mb-5">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05 * i }}
                className="bg-white rounded-2xl border border-pink-100 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-amber-900 pr-4">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="h-4 w-4 text-pink-400 flex-shrink-0" />
                    : <ChevronDown className="h-4 w-4 text-amber-300 flex-shrink-0" />
                  }
                </button>
                {openFaq === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-5 pb-4"
                  >
                    <p className="text-sm text-amber-600 leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Like & Share */}
        <div className="flex items-center justify-center gap-4">
          <motion.button
            onClick={() => setLiked(!liked)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border text-sm font-medium transition-colors ${liked ? "bg-pink-400 text-white border-pink-400" : "bg-white text-pink-400 border-pink-200 hover:border-pink-400"}`}
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-white" : ""}`} />
            {liked ? "Liked!" : "This helped me"}
          </motion.button>
          <motion.button
            onClick={() => navigator.share?.({ title: "How to Make a Crochet Teddy", url: window.location.href })}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-amber-200 bg-white text-amber-500 text-sm font-medium hover:border-amber-400 transition-colors"
          >
            <Share2 className="h-4 w-4" />
            Share guide
          </motion.button>
        </div>

      </div>
    </div>
  );
}
