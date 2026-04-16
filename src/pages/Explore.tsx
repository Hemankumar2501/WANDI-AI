import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import { Footer } from "@/components/layout/Footer";

/* ── Sidebar Nav ───────────────────────────────────────── */
const sideLinks = [
  { icon: "explore", label: "Explore", path: "/explore" },
  { icon: "travel_explore", label: "Trips", path: "/trips" },
  { icon: "auto_stories", label: "Journal", path: "/journal" },
  { icon: "person", label: "Profile", path: "/dashboard" },
];

function SideNavBar({ onOpenSettings, onOpenHelp }: { onOpenSettings?: () => void; onOpenHelp?: () => void }) {
  const location = useLocation();
  return (
    <aside className="hidden md:flex flex-col h-screen w-[240px] fixed left-0 top-0 bg-[#0F172A] py-8 z-50 font-body text-sm tracking-wide">
      <div className="px-6 mb-10">
        <h1 className="text-lg font-bold text-white">WanderWiseAI</h1>
        <p className="text-xs text-slate-400">AI Travel Concierge</p>
      </div>
      <nav className="flex-1">
        {sideLinks.map((link) => {
          const active = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`py-3 px-6 flex items-center gap-3 transition-all duration-150 ${
                active
                  ? "bg-blue-600/10 text-blue-400 border-r-4 border-blue-500"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-6 border-t border-slate-800 pt-6 space-y-4">
        <button
          onClick={onOpenSettings}
          className="text-slate-400 flex items-center gap-3 hover:text-white transition-all w-full text-left"
        >
          <span className="material-symbols-outlined">settings</span>
          <span>Settings</span>
        </button>
        <button
          onClick={onOpenHelp}
          className="text-slate-400 flex items-center gap-3 hover:text-white transition-all w-full text-left"
        >
          <span className="material-symbols-outlined">help</span>
          <span>Help</span>
        </button>
      </div>
    </aside>
  );
}

/* ── Image URLs ────────────────────────────────────────── */
const trendingDestinations = [
  {
    name: "Kyoto",
    country: "Japan",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA3rb0QcL_CrNMFXICYW0-ae_Jz5lo8Nlb8pVlZLvbA8P0YSx2VrnshympJCCczhI_TEiHd7pKShGgqujaKG2B-7jZeP5dfKVAu0xe0_eszo7xk2XeiKuezUHviRFGnYA8K_5oWP7pfkVclYfahXX9IHD13_3-LAL132TeYWFW7qdDW1ztDi3h5IIeoCbNcfOzNGh_BiRc1sfh7q4_e8O3QDN1YRyeUcw5DaJcorIDhnw8gK-mE7qYsb5kwajSjL3zQ_3u49xnNJnI",
  },
  {
    name: "Lisbon",
    country: "Portugal",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCl2Zb1oOU-HcN1zo7m4vlAdhitrREOUyvQBrPLpDIJArMnxC6ujVkZVDcPUlE9MYPTTDdDZIAJ5KdcHKdZEbx-9Zfi2nS0YC6GLV0I1Wtyl9C37rEzs1O7kd140yZzYiMS2eX09ac_La2GbU500x81EPHGMjiGBSg2CNdSYVSWbu4RJ0IHnO527K-U7GGg7IMWak1u6IYrp-n-WO8XsSZWSlRj0QdEgf2TURAAKZqAtQ5WY_nFRg47hHXDV6VnoHYvOEgAAABkIQI",
  },
  {
    name: "Medellín",
    country: "Colombia",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCtXUmdw90DhjdccxphhYtobAvhLDo4UWUBTRfUjXsMt-ZkIDHg-66vMqmb5esKADu7Z5PW5Gk8-Jh3ilzJCD17bxypatby_pM61niMbzYX8o76PJbFfyIMZOTKhmPiXnheBqMI83DbKwLmB6Y_xDkp_SPyNQpIxcGa1D9Dk2M6qwTUThAxC10qp_V_3KgFJqMIwlvF8ulnVy7F0cOrZFTOw0QOTkWNHYKkir33-_tjtFXvI_1YHv-9-jcR7ZyOsXFERorC33aoclY",
  },
  {
    name: "Reykjavik",
    country: "Iceland",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuATh04cRB_LReDxor0vvAcdFOGLmLmcBKaCtB2qPqTPbcTstCXHsL7mDWawjJbuWbAKIXuYb2mNUOMyph22OYveb3tRexesikuGaPxrpcCAbmLPGsgKqZQr8O1YvAJWptE8hYqDW5cBv2Yxl8eZT9gQuOM8I0Zzy3ZOkNuc4gR-WIZYAdj8BkhAXzSMK5i0uyQTnLP_wg3aayUWz_MB6pluy1BLL51ybItgZ5clhs4Efq4wTRYE6acX4kr1by2E25oiU-2B0NPNEE8",
  },
  {
    name: "Seoul",
    country: "South Korea",
    img: "/seoul-night.jpg",
  },
  {
    name: "Rome",
    country: "Italy",
    img: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Cape Town",
    country: "South Africa",
    img: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Sydney",
    country: "Australia",
    img: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80&w=800",
  },
];

const aiTripIdeas = [
  {
    icon: "person_pin",
    title: "Solo Lisbon",
    desc: "4-day architectural stroll & pastel de nata tour.",
    gradient: "from-primary-container to-primary-m3",
    bgAccent: "bg-primary-container/5",
  },
  {
    icon: "restaurant",
    title: "Foodie Japan",
    desc: "7-day Michelin stars & hidden street food gems.",
    gradient: "from-tertiary to-tertiary-container",
    bgAccent: "bg-tertiary-fixed/30",
  },
  {
    icon: "family_restroom",
    title: "Family Thailand",
    desc: "10-day island hopping & elephant sanctuaries.",
    gradient: "from-secondary-m3 to-[#00a394]",
    bgAccent: "bg-secondary-container/50",
  },
];

const experiences = [
  {
    title: "Parisian Night Food Crawl",
    price: "From $85 per person",
    rating: "4.9",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCwuMG47o0zC09wlAIA8RqWVpJLqauk1vE4bu5ZC4RKukaRXzW4nYs9ARnrhXaD_iWheBHqOnE91HbpJNXQU_pbXp7Fb9TWUnGHhvcLPVLa-hHwbvGR5_k3JifwkxVDiEGOhR5Q12hzmXyslSa17z0iNPCVR1xaooSAYEqlVTkxn9AJhHfUbM8e44S9SX-Ox_xeNWmxNyEgpxEvA3COaP0kvrRPrXYperl_UzBC5LKSGQVtb_ocQtsrbweAURboU1g9XLNtpLytXyQ",
  },
  {
    title: "Maya Bay Sunrise Cruise",
    price: "From $120 per person",
    rating: "4.8",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBZeDGarvNdeT6yi7SA3K2_PRjDutzsTl1JgR4pSaFZjz-pAUgNdZyf15hb_yfz0P8h2_GcpHLvi2FhSBUc82Gv0mE2XAF88GrS9fZkEIHX9aIIKG7RlzbZxnZcEJa28tuIz4mAU1kNxuF7s1oVVOQ_SqfynfEl2Q1ggk7mVzpva9i-Crjt5caCqZgUILzCWTqV752nHDSRZBFBShCQ5wpAgQceKfnp3wCZxYZbizoB6hq8WfoCutS07On8PONnFOWL3UJebbqrBpQ",
  },
  {
    title: "Pasta Masterclass in Florence",
    price: "From $95 per person",
    rating: "5.0",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD5W6xM4MmMggbJ72czWxMz7zFZOJyogZhmUfr0nHoHB2dSMVjmai_8I6XWMIWV35VKADEuua9Twx2GUEHesAhHG7gHN9K1qSAgv91YKpX6e92laa7UeLHZlYqWtOI8VBhq7goX-PghO2381-pWoYXtAs9M0ILHW_EUyl-pBrz40MuupO4PdFzWQD1N-J-SxJ_JeVVZlMtDH7SO8Joo9G_z9ExBjUQLjvBUeA4HLi9tMbT9PtpK6j2VRt6hCUCdpax6ITsoiijoX2s",
  },
];

export default function Explore() {
  const navigate = useNavigate();
  const [showAllDestinations, setShowAllDestinations] = useState(false);
  const [showInterests, setShowInterests] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleAIPlan = (ideaTitle?: React.MouseEvent | string, ideaDesc?: string) => {
    if (typeof ideaTitle === "string") {
      navigate("/plan", { state: { autoQuery: `${ideaTitle} - ${ideaDesc}` } });
    } else {
      navigate("/plan");
    }
  };
  
  const handleSurprise = () => {
    toast.success("Wandi has selected a random destination for you!");
    setTimeout(() => navigate("/flights"), 1000);
  };

  const handleInterest = () => setShowInterests(true);
  const handleAddDeal = (title: string) => toast.success(`${title} deal added to your saved Trips!`);
  const handleViewAll = () => setShowAllDestinations(!showAllDestinations);

  return (
    <div className="bg-surface font-body text-on-surface">
      <SideNavBar onOpenSettings={() => setShowSettings(true)} onOpenHelp={() => setShowHelp(true)} />

      <main className="md:ml-[240px] min-h-screen pb-24 md:pb-12">
        {/* ── Sticky Header & AI Search ──────────────────── */}
        <header className="sticky top-0 z-40 bg-surface/70 backdrop-blur-xl px-4 md:px-10 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-primary-container">
                  magic_button
                </span>
              </div>
              <input
                className="w-full pl-14 pr-6 py-5 bg-surface-container-low border-none rounded-xl text-lg focus:ring-2 focus:ring-primary-container/40 focus:bg-surface-container-lowest transition-all shadow-sm focus:outline-none"
                placeholder="Where do you want to wander? Ask AI..."
                type="text"
              />
            </div>
            <div className="flex gap-3 mt-4 overflow-x-auto scrollbar-hide">
              <button onClick={handleAIPlan} className="flex items-center gap-2 px-4 py-2 bg-primary-container text-on-primary rounded-full text-sm font-medium whitespace-nowrap active:scale-95 transition-transform">
                <span className="material-symbols-outlined text-[18px]">
                  auto_awesome
                </span>
                Plan with AI
              </button>
              <button onClick={handleSurprise} className="flex items-center gap-2 px-4 py-2 bg-secondary-container text-on-secondary-container rounded-full text-sm font-medium whitespace-nowrap active:scale-95 transition-transform">
                <span className="material-symbols-outlined text-[18px]">
                  casino
                </span>
                Surprise me
              </button>
              <button onClick={handleInterest} className="flex items-center gap-2 px-4 py-2 bg-surface-container-high text-on-surface-variant rounded-full text-sm font-medium whitespace-nowrap hover:bg-surface-container-highest transition-colors active:scale-95">
                <span className="material-symbols-outlined text-[18px]">
                  filter_list
                </span>
                Interests
              </button>
            </div>
          </div>
        </header>

        <section className="max-w-6xl mx-auto px-4 md:px-10 space-y-12 mt-8">
          {/* ── Trending Destinations ────────────────────── */}
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <h2 className="font-headline text-2xl font-bold tracking-tight text-on-surface">
                Trending Destinations
              </h2>
              <button onClick={handleViewAll} className="text-primary-container font-semibold text-sm hover:underline">
                {showAllDestinations ? "Show less" : "View all"}
              </button>
            </div>
            <div className={`grid ${showAllDestinations ? "grid-cols-2 lg:grid-cols-4 gap-y-6" : "flex overflow-x-auto scrollbar-hide"} gap-6 -mx-4 px-4`}>
              {(showAllDestinations ? trendingDestinations : trendingDestinations.slice(0, 4)).map((dest) => (
                <div key={dest.name} className={`${showAllDestinations ? "w-full" : "flex-none w-72"} group cursor-pointer`} onClick={() => navigate("/flights")}>
                  <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-3">
                    <img
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                      src={dest.img}
                      alt={dest.name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="text-xs font-label uppercase tracking-widest opacity-80">
                        {dest.country}
                      </p>
                      <h3 className="text-xl font-bold">{dest.name}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── AI Trip Ideas ────────────────────────────── */}
          <div className="bg-surface-container-low rounded-xl p-8 md:p-10">
            <div className="mb-8">
              <h2 className="font-headline text-2xl font-bold tracking-tight flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-container">
                  bolt
                </span>
                AI Trip Ideas Built For You
              </h2>
              <p className="text-on-surface-variant mt-2 max-w-2xl">
                Personalized routes based on your previous likes and search
                history.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {aiTripIdeas.map((idea) => (
                <div
                  key={idea.title}
                  onClick={() => handleAIPlan(idea.title, idea.desc)}
                  className="bg-surface-container-lowest p-6 rounded-lg shadow-sm border border-outline-variant/10 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group active:scale-[0.98]"
                >
                  <div
                    className={`absolute -right-4 -top-4 w-24 h-24 ${idea.bgAccent} rounded-full group-hover:scale-150 transition-transform duration-500`}
                  />
                  <div
                    className={`mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br ${idea.gradient} text-white`}
                  >
                    <span className="material-symbols-outlined">
                      {idea.icon}
                    </span>
                  </div>
                  <h4 className="font-headline font-bold text-lg mb-2">
                    {idea.title}
                  </h4>
                  <p className="text-sm text-on-surface-variant">{idea.desc}</p>
                  <div className="mt-4 flex items-center gap-2 text-primary-container font-medium text-sm">
                    Generate Plan{" "}
                    <span className="material-symbols-outlined text-sm">
                      arrow_forward
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Flash Deals ──────────────────────────────── */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <h2 className="font-headline text-2xl font-bold tracking-tight">
                Flash Deals
              </h2>
              <span className="text-2xl">🔥</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  route: "London (LHR) → Tokyo (HND)",
                  title: "Tokyo Direct",
                  price: "$642",
                  save: "Save $180",
                  img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDQR_FVvWVQKOYaRvUAmyleIvfef6e2sVp64kdovEU8iRX6aMKQstzIxfqwv4d8nG0xIZqA-IP1nwMXb9OEqejfV59URt0RHsH0oZk8MlwYgnTqIiCLRo_1kQ4eWGmVNFBzLWQhbHPNDLwUN_ou-fvDWvx_uFGCG1iLWU4kgWzyO1fKnxvebW89LbphurerPaza2ruf_j0-3sQHD5naQhRM4bgcHPRJ36-hOX1WlmAvU2IqZeZW9vIk0jX89nVVYil0LelEht2pQwU",
                },
                {
                  route: "NYC (JFK) → Medellín (MDE)",
                  title: "City of Springs",
                  price: "$315",
                  save: "Save $95",
                  img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDmewTxweXOK03MhOktgjwe65uCBz6NLP8iIV_5EB4Yvu8z0-sL4xQqxZzY09FPXfh0rAmWO0McBN3dbF58TPWzIzlDLwYLQ8_475dpv8ApRoKsv3P430hTo-xdTp_wctv3-hRjlMpBfQjlYDQCxM8tJ9Noce32yiUIXsCLwy3lEPmpKIDfHuZ0ty_1pEPo8aKPlEjEWcHIjiB0K9IlYDYa3HP9XcMXjMNhEpufaWwAC4Qnah4XOGy91O6G08PCFRGziBHLaha2y-M",
                },
              ].map((deal) => (
                <div
                  key={deal.title}
                  className="flex items-center gap-4 bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/10"
                >
                  <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                    <img
                      className="w-full h-full object-cover"
                      src={deal.img}
                      alt={deal.title}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-semibold text-on-surface-variant">
                          {deal.route}
                        </p>
                        <h4 className="font-headline font-bold text-lg">
                          {deal.title}
                        </h4>
                      </div>
                      <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-2 py-1 rounded text-xs font-bold">
                        {deal.save}
                      </span>
                    </div>
                    <p className="text-primary-container font-bold mt-1">
                      {deal.price}{" "}
                      <span className="text-xs text-on-surface-variant font-normal">
                        Round trip
                      </span>
                    </p>
                  </div>
                  <button onClick={() => handleAddDeal(deal.title)} className="bg-primary-container/5 hover:bg-primary-container/10 p-2 rounded-full transition-transform active:scale-90">
                    <span className="material-symbols-outlined text-primary-container">
                      add
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ── Popular Experiences ───────────────────────── */}
          <div className="space-y-6 pb-12">
            <div className="flex justify-between items-end">
              <h2 className="font-headline text-2xl font-bold tracking-tight">
                Popular Experiences
              </h2>
              <button onClick={handleViewAll} className="text-primary-container font-semibold text-sm hover:underline">
                View all
              </button>
            </div>
            <div className="flex gap-6 overflow-x-auto scrollbar-hide -mx-4 px-4">
              {experiences.map((exp) => (
                <div key={exp.title} className="flex-none w-64 group">
                  <div className="relative h-48 rounded-lg overflow-hidden mb-3">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      src={exp.img}
                      alt={exp.title}
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold">
                      {exp.rating} ★
                    </div>
                  </div>
                  <h4 className="font-bold text-sm">{exp.title}</h4>
                  <p className="text-xs text-on-surface-variant mt-1">
                    {exp.price}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </main>

      <BottomNavBar />

      {/* Interests Modal */}
      {showInterests && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-surface rounded-t-[32px] sm:rounded-[32px] overflow-hidden relative shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
            <div className="px-6 py-4 flex justify-between items-center border-b border-outline-variant/20">
              <h3 className="font-headline font-bold text-xl text-on-surface">Your Travel Interests</h3>
              <button onClick={() => setShowInterests(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm font-medium text-on-surface-variant mb-6">
                Tell Wandi what you love, and we'll tailor your destination matches perfectly. Select all that apply.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {["Foodie", "Beaches", "Mountains", "Nightlife", "History & Culture", "Budget", "Luxury", "Road Trips", "Wellness", "Solo Travel"].map((tag) => {
                  const isSelected = selectedInterests.includes(tag);
                  return (
                    <button 
                      key={tag}
                      onClick={() => setSelectedInterests(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                      className={`px-4 py-2 text-sm font-bold border transition-all active:scale-95 rounded-lg ${isSelected ? "bg-primary-container border-primary-container text-white" : "bg-surface-container-lowest border-outline-variant/30 text-on-surface-variant hover:border-primary-container/50 hover:bg-primary-container/5"}`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
              <button 
                onClick={() => {
                  setShowInterests(false);
                  toast.success(`Interests saved. Updating your destination matches...`);
                }}
                className="w-full bg-primary-container text-white font-bold text-lg py-4 rounded-xl hover:bg-surface-tint active:scale-95 transition-all outline-none"
              >
                Apply Filters {selectedInterests.length > 0 ? `(${selectedInterests.length})` : ""}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-surface rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="px-6 py-4 flex justify-between items-center border-b border-outline-variant/20 bg-surface-container-lowest">
              <h3 className="font-headline font-bold text-xl text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">settings</span>
                App Settings
              </h3>
              <button onClick={() => setShowSettings(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-bold text-on-surface mb-3">Preferences</h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 rounded-xl border border-outline-variant/30 hover:bg-surface-container-lowest cursor-pointer transition-colors">
                    <span className="text-sm font-medium">Dark Mode Appearance</span>
                    <input type="checkbox" className="w-4 h-4 rounded text-primary-container focus:ring-primary-container cursor-pointer" />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-xl border border-outline-variant/30 hover:bg-surface-container-lowest cursor-pointer transition-colors">
                    <span className="text-sm font-medium">AI Travel Suggestions</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-container focus:ring-primary-container cursor-pointer" />
                  </label>
                </div>
              </div>
              <button 
                onClick={() => { setShowSettings(false); toast.success("Settings saved successfully."); }}
                className="w-full bg-primary-container text-white font-bold text-sm py-3 rounded-xl hover:bg-surface-tint active:scale-95 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-surface rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="px-6 py-4 flex justify-between items-center border-b border-outline-variant/20 bg-surface-container-lowest">
              <h3 className="font-headline font-bold text-xl text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">help</span>
                Help Center
              </h3>
              <button onClick={() => setShowHelp(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-primary-container/5 border border-primary-container/20 rounded-xl p-4 text-center">
                <span className="material-symbols-outlined text-primary-container text-4xl mb-2">support_agent</span>
                <h4 className="font-bold text-on-surface mb-1">24/7 AI Concierge Support</h4>
                <p className="text-xs text-on-surface-variant">Our WanderWise AI is always available via the chat widget in the bottom right corner to resolve any travel or app-related queries instantly.</p>
              </div>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-3 border border-outline-variant/30 rounded-xl hover:bg-surface-container-lowest transition-colors text-left" onClick={() => toast.success("FAQ page coming soon.")}>
                  <span className="text-sm font-medium">Frequently Asked Questions</span>
                  <span className="material-symbols-outlined text-sm text-on-surface-variant">chevron_right</span>
                </button>
                <button className="w-full flex items-center justify-between p-3 border border-outline-variant/30 rounded-xl hover:bg-surface-container-lowest transition-colors text-left" onClick={() => toast.success("Contacting human support...")}>
                  <span className="text-sm font-medium">Contact Live Support</span>
                  <span className="material-symbols-outlined text-sm text-on-surface-variant">mail</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
