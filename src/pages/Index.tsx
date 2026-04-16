import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { TopNavBar } from "@/components/layout/TopNavBar";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import { Footer } from "@/components/layout/Footer";

/* ── Image URLs from Stitch design ─────────────────────── */
const HERO_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBH2bG4XxE4iFNuIO6b3fwoD3gt2Yrpf9sUP_xw7vIlCieE0lqYeEEP2yFzBfkU3aWlGZOwNqB0EkheLSKgXWKQ6VPMj5Efsb_o45WmVvS6CkuGkS7Y1Bah-kYgcSX24aX6uKUTxJ9kZEtRI952ckwvc5urcSfsXEp3g-wPE3S9jVZOrpg4JjT4OhgQAUQhYwVeB5Gy2Dew9eTwWMbF9at6el-hJtlXBq_Eb9U1-nCUFQbMBj8f_QrtWBpw7xqNlfW8xaDjpj5a1HM";
const ITINERARY_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBuE3r3FB95RKU3BEQEi0Bx1eFhvcEMlza_ss6WTjJ3qOW0l5co9nzXdNY7QlIeH50OIW54M6i0FmCY-FyoxPrz7gCjLKM6douchN61BAW6Nuq1anHkek3MdPI8jcdHiGWU3yTkk3LRp2vpWyegmB4gjfJ_QiecUOMGPuHfPgCBO3mLvqrcgwXbjkeTVYlXWcoOD1r5xSDInJzfOBwqgSbOx9pyPCIXgPUAPZbYz1l2WfJhPCfzavMtWkoPnyGAgzqEYO5v9V9BzHc";
const GROUP_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDGgN1sjBcLVl0YOWWqct96PasHhn6f86JZR3Y2ZUYjFIxvfTHxUt575P19Hjfol3151JfqNEZyBQzia_0p1bd2sDh118elQXCGfw0XFFi9RY5V5xVy3Wa3-EzwFyYkTBezxCKSK6GlUTjaF8b9jAdySFBXsYde2uUazTaV8z-sZFv_S7i-2D4LovH4skK3QN30h0lqiPnqb_hLFPbGV3-O8lHUvukbD5MWC3uGJ8A-dIn6CEDCUfMSqlXMyDtdRv5QA08XKlXML0Q";
const SHIBUYA_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAp5TDMdS5c0YilPBMOPsZFfhdBdxeHfPp3EMkn46RSvlPXo3zCQfe69XOXc5eRX0QeKbHHLBBpy1acERwj_hVmdLeGFr-sg6qN_IEeCKaK7ryd8uFu75Im9vWHHsFGc_vFpCLX1NFLrqur_TUSfmqgxga1uCK56-dFRaffj-HjeCLge_7BXwk1HHnT7FmanaO2fhgjl5eZqZ8gIzUziqbsoHczk_b4hKgh154H-eqcvxNVh3l1zCbbCmUkWT2CzRp8HMskdvucdIw";
const HOTEL_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCwuqzvsEJXRyv0Qh8MjJyS3QR9PLLb6Tn2Hjn1DZLMuQiozccoMB9qmw-98jih9wkRvnOJzmu6UZLlhmdAtZt393sSIOcf2wy8uUoadpsYErCmcibqe23MLEsHdxxUlKlDyN7zIcrs0IvleCv7H0broUrzOdN2oY_oPfjgMB3NIWRzjQX5HtivXTzd_K9KvWZ8A0G-rmE05ZsauZ4fen14pOlxT6pNY1Dy60qUCj9E1iCKnQn6Lgy9gVEUl0HD5eFe96IfEnYW5j8";
const CTA_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBcvmYN2nOV5qFqgTMYvHmeBvOSYHGnZ8PV9RnoLuecpCBFsXllmP-5WByNLf2R7VckhagKh86kxi5_tGzTcBSssN6ponJqCbDKwIIP-3Njw5v_zsydUPtxwKY6elYe7VWSmSUYry2VnoeEdXuS62pj0IKizTguoh3ZZ9ApqDONoYS18KBWSGqYdDysGt2rgsC79Ka__2wc099Xo73EXaO3py-P_SUdaSB78gXWpqemy-2Q7CFsZfnOBZsnVyejyYEX7-59R7o2YWs";

const destinations = [
  {
    name: "Tokyo, Japan",
    price: "From $1,240 / person",
    rating: "4.9",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAkUZx-le47yjOW3dnqb8RQowJ6_bmB2D4Rw1nS89pa95w1gvcA4gGelCXLh9reuolvLTXUWiAjm1DzYBXDZbWP1ddomOAIlfKei7ZNbG3KsjvvGQG5O1NCbqeAjz_mSj0Jyj7KNIIByS8dYFWmG9tBXwXYhsvjfgWmkTuDo9Sa3y7hQAPQqiHMsyo7Ox6lxMGbfoaW-XZoe39CwAbiIr_LZroqmBYv8vfAzuziB1bTGdgBuORIwd0GX2ufX1kXnfVFKj0kccnM_pk",
  },
  {
    name: "Paris, France",
    price: "From $980 / person",
    rating: "4.8",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBt-Afb3b2N3o_Fx81RJpWym-KfP6tltB272Fa9Iqk3_-ZDog8XetzGMY8at1xeaK94X1R792kHU4njttGzf98cykOzxDL2jImjxjMgExQdcIp29Q-rb0MlwNQxRZmN_4rjwyTVEpx5GTjr6SXsug5-mPV5SMbFTmTLqXwntw48gZ3OhM2vZAQklLtThL5bBWL_yvsmLfcgTfkY6suOcPCbmvwYFWYpop6ZKLkqFLuKrhbyWavgchGnXKLv9N4huxKOTWpTBrCa98A",
  },
  {
    name: "Bali, Indonesia",
    price: "From $650 / person",
    rating: "4.9",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuArzv5HQtkL7I7PNSb6z7vE161pgYuAtJwVN-rUo7OHLcvVep5E4tn9wKzzfWHXutXScNpIh9J3MGrUdRxWzYNcVh7XL2fAUb6T182XHc2cFlN65xjw2t4Jg7i7bU5xXFGeUdKd3h-mA0sUfoAV5bQQHdrRXfNkuQGrt0oliOEQBtj5YxHFISf6ilDTsoI8iIfnddrj0uk6mUJ0wxmT2asjuXxxZS19DxrFMIEVZhjfklZz2nU8ONDNW4kauwzwjMfm9N3ufcO1qp0",
  },
];

export default function Index() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const handleVideoClick = () => setIsVideoOpen(true);
  const handleScrollLeft = () => scrollRef.current?.scrollBy({ left: -350, behavior: "smooth" });
  const handleScrollRight = () => scrollRef.current?.scrollBy({ left: 350, behavior: "smooth" });
  const handleConfirmAll = () => toast.success("Itinerary successfully saved to your Trips!");
  const handleContactSales = () => toast("Our sales team has been notified. We will email you shortly.");

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container">
      <TopNavBar />

      <main className="pt-[72px]">
        {/* ── Hero Section ──────────────────────────────── */}
        <section className="relative h-[870px] min-h-[600px] w-full overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <img
              className="w-full h-full object-cover"
              src={HERO_IMG}
              alt="Tropical coastline at golden hour"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-on-background/40 via-transparent to-surface" />
          </div>

          <div className="relative z-10 text-center px-4 max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-secondary-container text-on-secondary-container px-4 py-1.5 rounded-full mb-8 font-label text-[0.75rem] font-bold tracking-widest uppercase">
              <span
                className="material-symbols-outlined text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
              AI-POWERED TRAVEL
            </div>

            <h1 className="font-headline text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 drop-shadow-md">
              Your whole trip. <br />
              <span className="text-secondary-fixed">One place.</span>
            </h1>

            <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              Personalized itineraries, smart bookings, and local secrets
              curated by your personal AI travel concierge.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/explore"
                className="bg-primary-container hover:bg-surface-tint text-on-primary px-8 py-4 rounded-full text-lg font-bold flex items-center gap-2 transition-all shadow-xl active:scale-95"
              >
                Plan my first trip{" "}
                <span className="material-symbols-outlined">
                  arrow_forward
                </span>
              </Link>
              <button onClick={handleVideoClick} className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-8 py-4 rounded-full text-lg font-bold transition-all border border-white/30 active:scale-95">
                How it works
              </button>
            </div>
          </div>

          {/* ── Floating Search Card ─────────────────────── */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-full max-w-5xl px-4 z-20">
            <div className="bg-surface-container-lowest p-6 md:p-8 rounded-4xl shadow-2xl flex flex-col md:flex-row items-end gap-4 border border-outline-variant/10">
              <div className="flex-1 w-full space-y-2">
                <label className="font-label text-on-surface-variant font-semibold text-xs ml-2">
                  WHERE TO?
                </label>
                <div className="flex items-center bg-surface-container-low px-4 py-3 rounded-xl border border-transparent focus-within:border-primary-container/40 focus-within:bg-white transition-all">
                  <span className="material-symbols-outlined text-outline mr-2">
                    location_on
                  </span>
                  <input
                    className="bg-transparent border-none focus:ring-0 w-full placeholder:text-outline text-on-surface focus:outline-none"
                    placeholder="e.g. Kyoto, Japan"
                    type="text"
                  />
                </div>
              </div>

              <div className="flex-[0.7] w-full space-y-2">
                <label className="font-label text-on-surface-variant font-semibold text-xs ml-2">
                  DEPARTURE
                </label>
                <div className="flex items-center bg-surface-container-low px-4 py-3 rounded-xl transition-all">
                  <span className="material-symbols-outlined text-outline mr-2">
                    calendar_today
                  </span>
                  <input
                    className="bg-transparent border-none focus:ring-0 w-full text-on-surface focus:outline-none"
                    type="date"
                  />
                </div>
              </div>

              <div className="flex-[0.7] w-full space-y-2">
                <label className="font-label text-on-surface-variant font-semibold text-xs ml-2">
                  RETURN
                </label>
                <div className="flex items-center bg-surface-container-low px-4 py-3 rounded-xl transition-all">
                  <span className="material-symbols-outlined text-outline mr-2">
                    calendar_today
                  </span>
                  <input
                    className="bg-transparent border-none focus:ring-0 w-full text-on-surface focus:outline-none"
                    type="date"
                  />
                </div>
              </div>

              <div className="flex-1 w-full space-y-2">
                <label className="font-label text-on-surface-variant font-semibold text-xs ml-2">
                  TRAVELLERS
                </label>
                <div className="flex items-center bg-surface-container-low px-4 py-3 rounded-xl transition-all">
                  <span className="material-symbols-outlined text-outline mr-2">
                    person
                  </span>
                  <select className="bg-transparent border-none focus:ring-0 w-full text-on-surface appearance-none focus:outline-none">
                    <option>2 Adults, 0 Children</option>
                    <option>1 Adult</option>
                    <option>Group (5+)</option>
                  </select>
                </div>
              </div>

              <Link
                to="/explore"
                className="bg-primary-container text-on-primary h-[52px] w-full md:w-auto px-10 rounded-xl font-bold hover:bg-surface-tint transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">search</span>
                Search
              </Link>
            </div>
          </div>
        </section>

        {/* ── Stats Bar ─────────────────────────────────── */}
        <section className="pt-24 pb-16 bg-surface">
          <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "50k+", label: "Trips Planned" },
              { value: "120+", label: "Countries" },
              { value: "4.9/5", label: "User Rating" },
              { value: "24/7", label: "AI Support" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-headline text-4xl font-extrabold text-on-surface mb-1">
                  {s.value}
                </p>
                <p className="text-on-surface-variant font-medium">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── How It Works ──────────────────────────────── */}
        <section className="py-24 px-8 bg-surface-container-low">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-headline text-4xl font-bold text-on-surface mb-4">
                Your journey, simplified.
              </h2>
              <p className="text-on-surface-variant max-w-xl mx-auto">
                Three simple steps to the most memorable trip of your life.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  icon: "forum",
                  title: "1. Tell Wandi",
                  desc: "Chat with our AI concierge about your vibe, budget, and must-sees. No forms required.",
                },
                {
                  icon: "auto_awesome_motion",
                  title: "2. Get AI Itinerary",
                  desc: "Receive a custom, day-by-day plan that adapts to real-time weather and crowd data.",
                },
                {
                  icon: "payments",
                  title: "3. Book Everything",
                  desc: "One-click checkout for flights, hotels, and local experiences. No jumping between sites.",
                },
              ].map((step) => (
                <div
                  key={step.title}
                  className="flex flex-col items-center text-center space-y-6"
                >
                  <div className="w-20 h-20 rounded-4xl bg-surface-container-highest flex items-center justify-center text-primary-container">
                    <span
                      className="material-symbols-outlined text-4xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {step.icon}
                    </span>
                  </div>
                  <h3 className="font-headline text-xl font-bold">
                    {step.title}
                  </h3>
                  <p className="text-on-surface-variant leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features Bento Grid ───────────────────────── */}
        <section className="py-32 px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Large Feature Card */}
            <div className="md:col-span-8 bg-primary-container rounded-4xl p-12 overflow-hidden relative min-h-[500px] flex flex-col justify-end group">
              <img
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                src={ITINERARY_IMG}
                alt="Travel itinerary map"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-container via-transparent to-transparent" />
              <div className="relative z-10 text-on-primary">
                <span className="bg-secondary-fixed text-on-secondary-fixed px-4 py-1 rounded-full font-label text-xs font-bold mb-6 inline-block">
                  SMART ITINERARIES
                </span>
                <h3 className="font-headline text-4xl font-bold mb-4">
                  Precision planning, powered by data.
                </h3>
                <p className="max-w-md text-on-primary-container leading-relaxed">
                  Our AI analyzes millions of data points to ensure your route
                  is efficient and your stops are spectacular.
                </p>
              </div>
            </div>

            {/* Vertical Feature Card */}
            <div className="md:col-span-4 bg-surface-container rounded-4xl p-10 flex flex-col justify-between">
              <div>
                <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-sm">
                  <span className="material-symbols-outlined text-primary-container text-3xl">
                    groups
                  </span>
                </div>
                <h3 className="font-headline text-2xl font-bold text-on-surface mb-4">
                  Seamless Group Travel
                </h3>
                <p className="text-on-surface-variant leading-relaxed">
                  Split costs, vote on activities, and share the journey with
                  friends in a single collaborative interface.
                </p>
              </div>
              <img
                className="w-full h-48 object-cover rounded-2xl mt-8"
                src={GROUP_IMG}
                alt="Group of friends hiking"
              />
            </div>

            {/* Small Feature Card */}
            <div className="md:col-span-4 bg-tertiary-fixed rounded-4xl p-10 flex flex-col items-start gap-6">
              <span className="material-symbols-outlined text-tertiary text-5xl">
                support_agent
              </span>
              <h3 className="font-headline text-2xl font-bold text-on-tertiary-fixed">
                Local Guide in Your Pocket
              </h3>
              <p className="text-on-tertiary-fixed-variant">
                Instant translations and cultural tips wherever you land.
              </p>
            </div>

            {/* Wide Feature Card */}
            <div className="md:col-span-8 bg-surface-container-highest rounded-4xl p-12 flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 order-2 md:order-1">
                <h3 className="font-headline text-3xl font-bold text-on-surface mb-6">
                  Effortless Bookings
                </h3>
                <p className="text-on-surface-variant leading-relaxed mb-8">
                  We negotiate with thousands of providers to find you the best
                  rates, automatically applying member-only discounts.
                </p>
                <Link
                  to="/explore"
                  className="flex items-center gap-2 text-primary-container font-bold hover:underline"
                >
                  Explore partners{" "}
                  <span className="material-symbols-outlined">
                    arrow_outward
                  </span>
                </Link>
              </div>
              <div className="flex-1 order-1 md:order-2 grid grid-cols-2 gap-4">
                {[
                  { icon: "hotel", label: "HOTELS" },
                  { icon: "flight", label: "FLIGHTS" },
                  { icon: "restaurant", label: "DINING" },
                  { icon: "directions_car", label: "TRANSPORT" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="aspect-square bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm"
                  >
                    <span className="material-symbols-outlined text-primary-container text-3xl mb-2">
                      {item.icon}
                    </span>
                    <span className="text-xs font-bold text-outline">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Trending Destinations ─────────────────────── */}
        <section className="py-32 bg-[#0F172A] overflow-hidden">
          <div className="max-w-7xl mx-auto px-8 mb-16 flex justify-between items-end">
            <div>
              <h2 className="font-headline text-4xl font-bold text-white mb-4">
                Trending this season
              </h2>
              <p className="text-slate-400">
                Hand-picked destinations trending globally.
              </p>
            </div>
            <div className="flex gap-4">
              <button onClick={handleScrollLeft} className="w-12 h-12 rounded-full border border-slate-700 flex items-center justify-center text-white hover:bg-slate-800 transition-colors">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button onClick={handleScrollRight} className="w-12 h-12 rounded-full border border-slate-700 flex items-center justify-center text-white hover:bg-slate-800 transition-colors">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex gap-8 px-8 overflow-x-auto scrollbar-hide pb-12 snap-x snap-mandatory">
            {destinations.map((dest) => (
              <div
                key={dest.name}
                onClick={() => navigate("/explore")}
                className="min-w-[320px] md:min-w-[400px] aspect-[3/4] rounded-3xl overflow-hidden relative group snap-start cursor-pointer transition-transform active:scale-95"
              >
                <img
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  src={dest.img}
                  alt={dest.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex justify-between items-end">
                    <div>
                      <h4 className="text-white font-headline text-2xl font-bold">
                        {dest.name}
                      </h4>
                      <p className="text-slate-300">{dest.price}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-white text-sm font-bold flex items-center gap-1">
                      <span
                        className="material-symbols-outlined text-xs text-yellow-400"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>{" "}
                      {dest.rating}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Meet Wandi Chat Demo ──────────────────────── */}
        <section className="py-32 px-8 bg-surface">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-20">
            <div className="flex-1">
              <h2 className="font-headline text-4xl md:text-5xl font-bold text-on-surface mb-8">
                Meet Wandi, your AI concierge.
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4 p-6 bg-surface-container-low rounded-2xl border-l-4 border-primary-container">
                  <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white shrink-0">
                    <span className="material-symbols-outlined text-sm">
                      smart_toy
                    </span>
                  </div>
                  <p className="text-on-surface leading-relaxed">
                    "Based on your love for minimalist architecture and quiet
                    cafes, I've curated a day in Nakameguro, Tokyo. Ready to
                    book the boutique hotel nearby?"
                  </p>
                </div>
                <div className="flex gap-4 p-6 bg-surface-container-lowest rounded-2xl self-end text-right ml-12">
                  <p className="text-on-surface-variant flex-1 italic leading-relaxed">
                    "That sounds perfect! Can you find a direct flight that gets
                    there before sunset?"
                  </p>
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant shrink-0">
                    <span className="material-symbols-outlined text-sm">
                      person
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-chat'))}
                className="mt-10 bg-primary-container text-on-primary px-8 py-3 rounded-full font-bold flex items-center gap-2 w-fit cursor-pointer hover:bg-primary-container/90 active:scale-95 transition-transform"
              >
                Start chatting{" "}
                <span className="material-symbols-outlined">chat</span>
              </button>
            </div>

            <div className="flex-1 w-full">
              <div className="bg-surface-container-lowest rounded-4xl p-8 shadow-2xl border border-outline-variant/10 relative">
                <div className="absolute top-4 right-4 bg-tertiary-fixed text-on-tertiary-fixed px-4 py-1 rounded-full text-xs font-bold">
                  LIVE UPDATE
                </div>
                <h4 className="font-headline text-2xl font-bold mb-6">
                  Your Tokyo Itinerary
                </h4>
                <div className="space-y-6">
                  <div className="flex gap-6 items-center">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                      <img
                        className="w-full h-full object-cover"
                        src={SHIBUYA_IMG}
                        alt="Shibuya"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary-container mb-1">
                        09:00 AM — SHIBUYA
                      </p>
                      <h5 className="font-bold text-on-surface">
                        Art &amp; Architecture Walk
                      </h5>
                    </div>
                  </div>
                  <div className="flex gap-6 items-center">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                      <img
                        className="w-full h-full object-cover"
                        src={HOTEL_IMG}
                        alt="Hotel"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary-container mb-1">
                        02:00 PM — STAY
                      </p>
                      <h5 className="font-bold text-on-surface">
                        The Trunk Hotel (Kitasando)
                      </h5>
                    </div>
                  </div>
                  <div className="flex gap-6 items-center">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-surface-container-high flex items-center justify-center">
                      <span className="material-symbols-outlined text-3xl text-on-surface-variant">
                        restaurant
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary-container mb-1">
                        07:30 PM — DINING
                      </p>
                      <h5 className="font-bold text-on-surface">
                        Omoide Yokocho (Memory Lane)
                      </h5>
                    </div>
                  </div>
                  <div className="h-[1px] bg-outline-variant/20 w-full my-6" />
                  <div className="flex justify-between items-center bg-surface-container-low p-4 rounded-xl">
                    <div>
                      <p className="text-xs text-on-surface-variant">
                        TOTAL ESTIMATE
                      </p>
                      <p className="text-xl font-bold text-on-surface">
                        $2,450.00
                      </p>
                    </div>
                    <button onClick={handleConfirmAll} className="bg-primary-container text-on-primary px-6 py-2 rounded-lg font-bold hover:bg-surface-tint transition-all active:scale-95 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">check</span>
                      Confirm All
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Pricing ───────────────────────────────────── */}
        <section className="py-32 px-8 bg-surface-container-low">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="font-headline text-4xl font-bold text-on-surface mb-16">
              Choose your way to explore
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free */}
              <div className="bg-surface-container-lowest p-10 rounded-4xl text-left border border-outline-variant/30 flex flex-col justify-between">
                <div>
                  <h3 className="font-headline text-2xl font-bold mb-2">
                    Explorer
                  </h3>
                  <p className="text-on-surface-variant text-sm mb-8">
                    Great for solo adventurers planning a weekend getaway.
                  </p>
                  <div className="text-4xl font-extrabold mb-8">
                    $0{" "}
                    <span className="text-lg font-normal text-outline">
                      /mo
                    </span>
                  </div>
                  <ul className="space-y-4 mb-10">
                    {[
                      "AI-Generated Itineraries",
                      "Standard Bookings",
                      "Digital Travel Journal",
                    ].map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-3 text-sm text-on-surface"
                      >
                        <span className="material-symbols-outlined text-secondary-m3 text-xl">
                          check_circle
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link to="/signup" className="w-full py-4 text-center rounded-full border border-primary-container text-primary-container font-bold hover:bg-primary-container/5 transition-colors block">
                  Start for free
                </Link>
              </div>

              {/* Pro */}
              <div className="bg-primary-container p-10 rounded-4xl text-left text-on-primary shadow-2xl relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-6 right-6 bg-secondary-fixed text-on-secondary-fixed px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
                  MOST POPULAR
                </div>
                <div>
                  <h3 className="font-headline text-2xl font-bold mb-2">
                    Jetsetter
                  </h3>
                  <p className="text-on-primary-container text-sm mb-8">
                    For frequent travelers who want the ultimate luxury
                    treatment.
                  </p>
                  <div className="text-4xl font-extrabold mb-8">
                    $19{" "}
                    <span className="text-lg font-normal text-on-primary-container">
                      /mo
                    </span>
                  </div>
                  <ul className="space-y-4 mb-10">
                    {[
                      "Priority AI Assistance (24/7)",
                      "Exclusive Partner Deals (Up to 40% off)",
                      "Multi-stop Flight Optimization",
                      "Unlimited Group Collaborators",
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm">
                        <span className="material-symbols-outlined text-secondary-fixed text-xl">
                          check_circle
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link to="/signup" className="w-full py-4 text-center rounded-full bg-white text-primary-container font-bold hover:bg-slate-50 transition-colors block">
                  Go Pro
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Final CTA Banner ──────────────────────────── */}
        <section className="py-24 px-8">
          <div className="max-w-7xl mx-auto bg-[#0F172A] rounded-[3rem] p-12 md:p-24 relative overflow-hidden text-center group">
            <div className="absolute inset-0 z-0 opacity-20">
              <img
                className="w-full h-full object-cover"
                src={CTA_IMG}
                alt="Mountain peak at sunset"
              />
            </div>
            <div className="relative z-10">
              <h2 className="font-headline text-4xl md:text-6xl font-bold text-white mb-8">
                Ready to travel smarter?
              </h2>
              <p className="text-slate-400 text-lg mb-12 max-w-xl mx-auto">
                Join 50,000+ travelers who have found their new favorite way to
                see the world.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/signup"
                  className="bg-primary-container text-on-primary px-10 py-5 rounded-full text-xl font-bold hover:scale-105 transition-transform active:scale-95 shadow-2xl"
                >
                  Get started free
                </Link>
                <button onClick={handleContactSales} className="bg-white/10 text-white backdrop-blur-md px-10 py-5 rounded-full text-xl font-bold border border-white/20 hover:bg-white/20 transition-all active:scale-95">
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* How it Works Modal Overhead */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-surface rounded-[32px] overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 md:p-8 border-b border-outline-variant/20">
              <h2 className="text-2xl font-headline font-bold text-on-surface">How WanderWiseAI Works</h2>
              <button 
                onClick={() => setIsVideoOpen(false)} 
                className="w-10 h-10 bg-surface-container-high hover:bg-surface-container-highest rounded-full flex items-center justify-center text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 md:p-8 overflow-y-auto space-y-8 bg-surface-container-lowest">
              
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xl shrink-0 mt-1 shadow-md shadow-primary-container/20">1</div>
                <div>
                  <h3 className="text-xl font-bold font-headline mb-2 text-on-surface">Dream It</h3>
                  <p className="text-on-surface-variant font-medium leading-relaxed">
                    Tell Wandi, our AI travel concierge, about your dream trip. Whether you know the exact destination or just want "a warm beach with good seafood", simply type it into the Explore bar.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xl shrink-0 mt-1 shadow-md shadow-secondary-container/20">2</div>
                <div>
                  <h3 className="text-xl font-bold font-headline mb-2 text-on-surface">Plan It</h3>
                  <p className="text-on-surface-variant font-medium leading-relaxed">
                    Instantly receive a meticulously crafted, day-by-day itinerary. Our AI analyzes local hotspots, transit times, and your specific budget to generate the perfect schedule.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center font-bold text-xl shrink-0 mt-1 shadow-md shadow-tertiary-container/20">3</div>
                <div>
                  <h3 className="text-xl font-bold font-headline mb-2 text-on-surface">Book It</h3>
                  <p className="text-on-surface-variant font-medium leading-relaxed">
                    Review your AI-generated flight and hotel recommendations. Use our integrated interactive map to pinpoint locations and seamlessly book everything from a single checkout screen.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center font-bold text-xl shrink-0 mt-1 shadow-md">4</div>
                <div>
                  <h3 className="text-xl font-bold font-headline mb-2 text-on-surface">Live It</h3>
                  <p className="text-on-surface-variant font-medium leading-relaxed">
                    Access your entire trip through the Trips Dashboard. Save your plane tickets, calculate shared group expenses on the fly, and post photos directly to your personal Travel Journal.
                  </p>
                </div>
              </div>

            </div>

            <div className="p-6 md:p-8 bg-surface border-t border-outline-variant/20 flex justify-end">
              <button onClick={() => { setIsVideoOpen(false); navigate("/explore"); }} className="bg-primary-container text-on-primary px-8 py-4 rounded-full font-bold hover:bg-surface-tint transition-colors w-full sm:w-auto text-lg shadow-lg active:scale-95 text-center">
                Try it now
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <BottomNavBar />
    </div>
  );
}
