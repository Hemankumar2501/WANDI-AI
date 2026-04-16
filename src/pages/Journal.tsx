import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { TopNavBar } from "@/components/layout/TopNavBar";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import { Heart, MapPin, Users, Calendar, ChevronRight, Globe2, Camera, X } from "lucide-react";

/* ── Shared story bubbles ── */
const stories = [
  { label: "Hanoi",   img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC64xB4TfhEvEYnIZ8iWyAA6ytMQ9nuhpgt_Lic0QtE6F_N4xvJzXZqhPptnLgbR2-L8hLry8OykHgXgyVmu2QKsWvnBjUX7d1DUiBCuf5r_mF94Kq-ndyqwa7gAS5u8LUVKbfPJhOhMwEK1uVV8uMqvoTzUxOV1Bnsorb0e2fkLGug2KY_GFCpS3gsZJ4_kHfTIGFOBGnagrN5XhJKZt7xVCbzEUAnpoHlNZBn62qqKf32z8iuDw3TNbbipS6cGXtXwcZoTzY8njY", active: true },
  { label: "Camping", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC2fEoESwx0als4lOBieUji_S1VtmP6ReZCTum3egrIIa9oEKtnDszK6TruZogAJqa8zolZnoOwzIpMdHTk1aNLSpwOGDzS_IuR484GA10zLlOWVY5qNxvux-8goLeRY-6oQTczubmlh4n7Hmdn4r_qR_AKisvvRLVG2HtATdWttqDhI8Q_rCuAMm3Z4QRHRz-w9RNSyvJJhDG54xicMWa_ZPiVzOnVojTklups6KbccpvAjo0gx3r0bU1pY1M7JvoBD0MCbaCCaq0", active: true },
  { label: "Prague",  img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAsxQecvUUaJKfFGiNFE0iznuDKCIJJXwW1Ttax1sZlpFaIsIUV2-6O1TB5AXFFbE3C3AQ5fnmRzK27B4ZcBG2nC5u92DhsJV8bohR4sH3GKXmma_KnK-3DPzhzyrxB0_W1lW3JbSE0FqZcUx1TjjdcjjWBaRBIcrcuVMf8Ni4K68UlSNVm4axY8zyH1vx0YWaAB_cU_mQQaOap6cg5b7ERqodJTCybuHEur5dXQWLgsFL-jun84Hbh64STRN1B7UquNDEdyB3iaG4" },
  { label: "Alps",    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYo8jJFER3yd7M3ZwinIYjl1er3ph8w2nP0btpWl_fnpWs3KiQgg6hNQBI2kS8cjm7OFOXj6SVu6sCm4RHhQlarfdLkHiT_82jy30lX3fRxfAxLhYJOWYzv5AM5Ho3myS0RkgSit1FpGgzT9IxgywYYQPw8AW1lgDlMZFEiC_2CtJFx1-0JPGR91FzVhGjHg5ZxfsLF97DU3u79zYhSV-xvH3VW44_H3bNHNCJOu1c_Szq31N3s0VA_BZSiNSL7dUT25O1OJH-QUY" },
  { label: "Bali",    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCiNGw5jrzz89tdhQFY_F7JdboGmNPg5KbuAC_4QGVbxrrF7qkxes2DxA5LWUzw_X-faKqav8kenFy0lFWvC0SOdaVw7fbp83Y5K22-UHOieHDvtz0B2GTA7rKfovlhIf4Qp5vnYKpZfLPw65Tep32YfsKZRqmWQp6cPtBHfOKBdUmOmrTh94IXn5gZnV9UdRQutye0_OWO_fpAPexSgiobi7T2MikVt3hh3-6rF0-jkTaXls5oNRhYbdpL5bSUk3SsbiEz8pfOblg" },
];

/* ── "All" tab masonry cards ── */
const allCards = [
  { title: "Kyoto, Japan",  location: "Inari Shrine",  time: "3 days ago",  badge: "🌸 Japan", likes: 124, h: "h-64", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD7md-zcsJiKsAbMF31qwZ--4tAm3bANG65pH74Lb3VmGedW4Y9iTrQGt7D1pfkcn6qno2z92HxjATSpd_F_c2WudLZrT4YvwLl56mpUMU09a8PJKGD_Kc2JJ6lADlQ49Vgzjt8RMgOmKsql7IrjdmLmSZesKlIZxDrrD35ifWazMvZ9PwsvQcbX23kdMNVpPwCqtrua3Wb7R9BZmmLsOI1cVGSu7zmKroCeY2211BQVrHJvMGbAddlyeO7etU7nPB0QXSuGKZHZEs", col: 1 },
  { title: "Street Food",   location: "Bangkok",       time: "1 week ago",  badge: "", likes: 0, h: "h-48", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDu0PB7uStz_XSKb8KRMuFjfq8QP0APmO3KvdJVWVSsSsvUTv3kUO-VcBUYWikEyPBl9MluBO7YcyiKR26tZoG0D7gtYOQeGN_kAKJ8iWZvpfgeImhBnATn2QQkOGpohrpYedleJ-XjzNqkPMp0tm9PyWIDXDSqJ5FpuoqXYt1Xn5M0UP65rxfPKsakPpHGsXXks2__fGv-2nj5Gjp_3ONPKnSGMYd9YQsB-Huh24F_hqWIqcn_yMxqhJCBQ16eI5H2mJzJys9FWsU", col: 2 },
  { title: "Shibuya Night", location: "Tokyo",         time: "2 weeks ago", badge: "", likes: 0, h: "h-44", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBQkK1oMOaH0Q9JyF06BHrNugE_MawJ2PYpISdE21c_VrOwXC9YTZrXERJVnUHnRf9PD3SmUFRvS0lxLFn7O-YB9fzt-SKads6D9qHeNU20zCS3U15loBhpyV-10DMjHWRTfhwP5iPMFBfuueD7sxO56_QVfcmk7cP58wYc_N1jyYV-6aqd0hXnnbxzSNBq6akg8FAgQ5r70leAEKkmiImE0b2jJfliVHdlSm5Dw_khU6wrmZsbQP-yn20v6Ij51UK7woUEHs75NTg", col: 1 },
  { title: "Bali Memories", location: "with 4 others", time: "Golden Hour", badge: "", likes: 0, h: "h-72", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAAVQgd7DtB3bAFv6i71Cv555_N1I_3QXxL0tH3IAERlV_G67efSADusTjulf1RD-Owpr2Hd9CwzWrwf5b-QJM1atsJ-noZX98bcWjw2rzHpDlUEGmIYAq0i2om6zmfWSXU4BlSl6g6CAaeDuksJ49irRQb7OeE6kHn2p7QLSVrFiHh9MVzydONt6DhWbJLrMfg8gxaru5OvzfQ1nmvbNIEZMeSWSgLmiSaVdXaQRPDPbGL1X0_6YsXPvYuMDkxx2nY1IMMsdVe7ak", col: 2 },
];

/* ── "By Trip" tab data ── */
const trips = [
  {
    name: "Japan Cherry Blossom 2026",
    dates: "Mar 24 – Apr 2, 2026",
    cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuD7md-zcsJiKsAbMF31qwZ--4tAm3bANG65pH74Lb3VmGedW4Y9iTrQGt7D1pfkcn6qno2z92HxjATSpd_F_c2WudLZrT4YvwLl56mpUMU09a8PJKGD_Kc2JJ6lADlQ49Vgzjt8RMgOmKsql7IrjdmLmSZesKlIZxDrrD35ifWazMvZ9PwsvQcbX23kdMNVpPwCqtrua3Wb7R9BZmmLsOI1cVGSu7zmKroCeY2211BQVrHJvMGbAddlyeO7etU7nPB0QXSuGKZHZEs",
    photos: 42, days: 10, memories: 8,
    tags: ["Tokyo", "Kyoto", "Osaka", "Nara"],
  },
  {
    name: "Bali Retreat",
    dates: "Jan 5 – Jan 14, 2026",
    cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuCiNGw5jrzz89tdhQFY_F7JdboGmNPg5KbuAC_4QGVbxrrF7qkxes2DxA5LWUzw_X-faKqav8kenFy0lFWvC0SOdaVw7fbp83Y5K22-UHOieHDvtz0B2GTA7rKfovlhIf4Qp5vnYKpZfLPw65Tep32YfsKZRqmWQp6cPtBHfOKBdUmOmrTh94IXn5gZnV9UdRQutye0_OWO_fpAPexSgiobi7T2MikVt3hh3-6rF0-jkTaXls5oNRhYbdpL5bSUk3SsbiEz8pfOblg",
    photos: 97, days: 9, memories: 12,
    tags: ["Ubud", "Seminyak", "Tanah Lot"],
  },
  {
    name: "Prague Winter Trip",
    dates: "Dec 20 – Dec 27, 2025",
    cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuAsxQecvUUaJKfFGiNFE0iznuDKCIJJXwW1Ttax1sZlpFaIsIUV2-6O1TB5AXFFbE3C3AQ5fnmRzK27B4ZcBG2nC5u92DhsJV8bohR4sH3GKXmma_KnK-3DPzhzyrxB0_W1lW3JbSE0FqZcUx1TjjdcjjWBaRBIcrcuVMf8Ni4K68UlSNVm4axY8zyH1vx0YWaAB_cU_mQQaOap6cg5b7ERqodJTCybuHEur5dXQWLgsFL-jun84Hbh64STRN1B7UquNDEdyB3iaG4",
    photos: 55, days: 7, memories: 6,
    tags: ["Old Town", "Christmas Market"],
  },
];

/* ── "Friends" tab data ── */
const friends = [
  {
    name: "Alex Chen",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBKcTGF7FwM4aSYgcQNAg1cXxS8AKhL2vXSmymtfTap83VD5O7o5Em73CkjLt0koGpW5xU8GHOl1A_ehqbg4NUu43ebDpLWAfaW526PKTsHcYZqfFN92Z2wDzE2fg5gTS0xtzuRqWuUJnScbYRrdZdJCjV6gpAcyBRsWANwyJGuNiQTuNwRXNh_PUq5lPYAa8LNuyKoWGDpmRXDOsnfl55rhCqZ9kK1BcqRrUGCDa3J6qtoWTP8qm3tj-4ElQXRjxFSOmB76R0mOXw",
    location: "Currently in Kyoto 🇯🇵",
    city: "Kyoto, Japan",
    posts: [
      { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD7md-zcsJiKsAbMF31qwZ--4tAm3bANG65pH74Lb3VmGedW4Y9iTrQGt7D1pfkcn6qno2z92HxjATSpd_F_c2WudLZrT4YvwLl56mpUMU09a8PJKGD_Kc2JJ6lADlQ49Vgzjt8RMgOmKsql7IrjdmLmSZesKlIZxDrrD35ifWazMvZ9PwsvQcbX23kdMNVpPwCqtrua3Wb7R9BZmmLsOI1cVGSu7zmKroCeY2211BQVrHJvMGbAddlyeO7etU7nPB0QXSuGKZHZEs", caption: "Fushimi Inari at 6am 🌅", likes: 87, time: "2h ago" },
      { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBQkK1oMOaH0Q9JyF06BHrNugE_MawJ2PYpISdE21c_VrOwXC9YTZrXERJVnUHnRf9PD3SmUFRvS0lxLFn7O-YB9fzt-SKads6D9qHeNU20zCS3U15loBhpyV-10DMjHWRTfhwP5iPMFBfuueD7sxO56_QVfcmk7cP58wYc_N1jyYV-6aqd0hXnnbxzSNBq6akg8FAgQ5r70leAEKkmiImE0b2jJfliVHdlSm5Dw_khU6wrmZsbQP-yn20v6Ij51UK7woUEHs75NTg", caption: "Nishiki Market 🍡", likes: 61, time: "5h ago" },
    ],
  },
  {
    name: "Sarah Miller",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBLrQToSToMGvCxofnRUab2x04M7eb0i7tFq6hT4ieyK1Tkt6YfryT3ItO-DtYrlntovd3HemLvt7lt7QPqMs0MQ4K94W7edDj1Vv9CZbYyXMo9EtD2VHcT3L-N-WEcF1aWm8yIpBK7gyJNRhOlbTyIyom8xy97c6IeYp7MDbHJf9e-_Fis0DJ-s5OT2B0_frxj4qZXRSisYsk48lyMYfRVpc2pFozOYpl8vL21HWiD-1do2-wjLaOnYvatde4q9hIRU4sznUWP8Aw",
    location: "Just returned from Bali 🇮🇩",
    city: "Bali, Indonesia",
    posts: [
      { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCiNGw5jrzz89tdhQFY_F7JdboGmNPg5KbuAC_4QGVbxrrF7qkxes2DxA5LWUzw_X-faKqav8kenFy0lFWvC0SOdaVw7fbp83Y5K22-UHOieHDvtz0B2GTA7rKfovlhIf4Qp5vnYKpZfLPw65Tep32YfsKZRqmWQp6cPtBHfOKBdUmOmrTh94IXn5gZnV9UdRQutye0_OWO_fpAPexSgiobi7T2MikVt3hh3-6rF0-jkTaXls5oNRhYbdpL5bSUk3SsbiEz8pfOblg", caption: "Rice terraces in Ubud 🌾", likes: 143, time: "1d ago" },
    ],
  },
];

/* ── Card component shared between tabs ── */
function MasonryCard({ card, onClick }: { card: typeof allCards[0]; onClick: () => void }) {
  const [liked, setLiked] = useState(false);
  return (
    <article onClick={onClick} className="relative bg-surface-container-lowest rounded-2xl overflow-hidden group active:scale-95 transition-all duration-300 cursor-pointer shadow-sm">
      <div className={`${card.h} w-full`}>
        <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={card.img} alt={card.title} />
      </div>
      {card.badge && (
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-tertiary-fixed/90 text-on-tertiary-fixed-variant text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm">{card.badge}</span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10">
        <h3 className="text-white font-bold text-xs leading-tight">{card.title}</h3>
        <p className="text-white/80 text-[10px]">{card.location} · {card.time}</p>
        {card.likes > 0 && (
          <div className="mt-1.5 flex items-center gap-1">
            <button onClick={(e) => { e.stopPropagation(); setLiked(l => !l); }} className="flex items-center gap-1 active:scale-90 transition-transform">
              <Heart className={`w-3.5 h-3.5 ${liked ? "fill-red-400 text-red-400" : "text-white/80"}`} />
              <span className="text-white text-[10px] font-bold">{card.likes + (liked ? 1 : 0)}</span>
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export default function Journal() {
  const [activeTab, setActiveTab] = useState("All");
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(["Recent", "All Categories"]);

  const handleCardClick = (title: string) => toast(`Opening journal entry for ${title}...`);
  const toggleLike = (key: string) => setLikedPosts(prev => ({ ...prev, [key]: !prev[key] }));

  const col1 = allCards.filter(c => c.col === 1);
  const col2 = allCards.filter(c => c.col === 2);

  return (
    <div className="bg-surface text-on-surface font-body overflow-x-hidden">
      <TopNavBar />

      <main className="pt-[72px] pb-32 max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between py-6">
          <h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface">My Journal</h1>
          <button 
            onClick={() => setIsFilterOpen(true)} 
            className={`flex items-center justify-center w-10 h-10 rounded-full transition-all active:scale-95 ${isFilterOpen ? "bg-blue-600 text-white shadow-lg" : "hover:bg-blue-50/50 text-blue-600"}`}
          >
            <span className="material-symbols-outlined font-bold">tune</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-outline-variant/20 mb-6">
          {["All", "By Trip", "Friends"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm transition-all ${activeTab === tab ? "font-bold text-primary-container border-b-2 border-primary-container" : "font-medium text-slate-500 hover:text-primary-container"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Stories Row (shown on All only) */}
        {activeTab === "All" && (
          <section className="overflow-x-auto scrollbar-hide -mx-4 px-4 flex gap-4 items-start py-2 mb-8">
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <Link to="/journal/new" className="w-16 h-16 rounded-full border-2 border-dashed border-primary-container/40 flex items-center justify-center bg-surface-container-low hover:bg-primary-container/5 active:scale-90 transition-all">
                <span className="material-symbols-outlined text-primary-container font-bold">add</span>
              </Link>
              <span className="text-[11px] font-medium text-on-surface-variant">New</span>
            </div>
            {stories.map(s => (
              <div key={s.label} className="flex flex-col items-center gap-2 flex-shrink-0">
                <div className={`w-16 h-16 rounded-full p-[2px] ${s.active ? "bg-gradient-to-tr from-primary-container to-secondary-container" : "bg-outline-variant/30"}`}>
                  <div className="w-full h-full rounded-full border-2 border-white overflow-hidden">
                    <img className="w-full h-full object-cover" src={s.img} alt={s.label} />
                  </div>
                </div>
                <span className={`text-[11px] font-medium ${s.active ? "text-on-surface-variant" : "text-slate-400"}`}>{s.label}</span>
              </div>
            ))}
          </section>
        )}

        {/* ── ALL TAB ── */}
        {activeTab === "All" && (
          <section className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-4">
              {col1.map(card => <MasonryCard key={card.title} card={card} onClick={() => handleCardClick(card.title)} />)}
            </div>
            <div className="flex flex-col gap-4 pt-8">
              {col2.map(card => <MasonryCard key={card.title} card={card} onClick={() => handleCardClick(card.title)} />)}
            </div>
          </section>
        )}

        {/* ── BY TRIP TAB ── */}
        {activeTab === "By Trip" && (
          <section className="space-y-5">
            <p className="text-sm text-gray-500">Your memories organised by each adventure.</p>
            {trips.map(trip => (
              <div key={trip.name} onClick={() => handleCardClick(trip.name)} className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all active:scale-[0.99]">
                {/* Cover */}
                <div className="relative h-44 w-full overflow-hidden">
                  <img src={trip.cover} alt={trip.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-bold text-lg leading-tight">{trip.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Calendar className="w-3 h-3 text-white/70" />
                      <span className="text-white/80 text-xs">{trip.dates}</span>
                    </div>
                  </div>
                </div>
                {/* Stats */}
                <div className="p-4">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                      <Camera className="w-4 h-4 text-blue-500" />
                      <span className="font-bold">{trip.photos}</span> photos
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                      <MapPin className="w-4 h-4 text-purple-500" />
                      <span className="font-bold">{trip.days}</span> days
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                      <Globe2 className="w-4 h-4 text-emerald-500" />
                      <span className="font-bold">{trip.memories}</span> memories
                    </div>
                  </div>
                  {/* Destination tags */}
                  <div className="flex flex-wrap gap-2">
                    {trip.tags.map(tag => (
                      <span key={tag} className="text-[11px] font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full">{tag}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-gray-400">Tap to view all memories</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>
              </div>
            ))}

            {/* Add new trip CTA */}
            <Link to="/journal/new" className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors font-medium text-sm">
              <span className="material-symbols-outlined text-xl">add_circle</span>
              Start a new trip journal
            </Link>
          </section>
        )}

        {/* ── FRIENDS TAB ── */}
        {activeTab === "Friends" && (
          <section className="space-y-8">
            <p className="text-sm text-gray-500">Memories shared by your travel companions.</p>
            {friends.map(friend => (
              <div key={friend.name} className="space-y-3">
                {/* Friend header */}
                <div className="flex items-center gap-3">
                  <img src={friend.avatar} alt={friend.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-100" />
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 text-sm">{friend.name}</div>
                    <div className="flex items-center gap-1 text-[11px] text-gray-500">
                      <MapPin className="w-3 h-3" />
                      {friend.location}
                    </div>
                  </div>
                  <button onClick={() => toast(`Following ${friend.name}!`)} className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full active:scale-95 transition-all">
                    Follow
                  </button>
                </div>

                {/* Their posts */}
                {friend.posts.map(post => {
                  const likeKey = `${friend.name}-${post.caption}`;
                  return (
                    <div key={post.caption} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                      <img src={post.img} alt={post.caption} className="w-full h-56 object-cover" />
                      <div className="p-4">
                        <p className="text-gray-800 text-sm font-medium mb-3">{post.caption}</p>
                        <div className="flex items-center justify-between">
                          <button onClick={() => toggleLike(likeKey)} className="flex items-center gap-1.5 active:scale-90 transition-transform">
                            <Heart className={`w-5 h-5 ${likedPosts[likeKey] ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                            <span className="text-sm font-bold text-gray-600">{post.likes + (likedPosts[likeKey] ? 1 : 0)}</span>
                          </button>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">{post.time}</span>
                            <button onClick={() => toast("Comment added!")} className="text-xs text-gray-400 hover:text-blue-500 transition-colors font-medium">
                              💬 Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Discover more banner */}
            <div className="flex items-center gap-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-100">
              <Users className="w-9 h-9 text-blue-500 shrink-0" />
              <div className="flex-1">
                <div className="font-bold text-gray-900 text-sm">Discover more travellers</div>
                <div className="text-xs text-gray-500 mt-0.5">Connect with friends who love exploring</div>
              </div>
              <button onClick={() => toast("Opening traveller discovery...")} className="text-xs font-bold text-blue-600 bg-white px-3 py-2 rounded-xl shadow-sm active:scale-95 transition-all shrink-0">
                Explore
              </button>
            </div>
          </section>
        )}
      </main>

      {/* FAB */}
      <Link to="/journal/new" className="fixed bottom-24 left-6 z-[45] flex items-center gap-2 bg-primary-container px-5 py-4 rounded-full shadow-[0_12px_32px_-4px_rgba(19,27,46,0.3)] hover:scale-105 active:scale-95 transition-all md:bottom-8 md:left-auto md:right-24">
        <span className="material-symbols-outlined text-white font-bold">photo_camera</span>
        <span className="text-white font-headline font-bold text-sm">New memory</span>
      </Link>

      {/* Filter Sheet Overlay */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={() => setIsFilterOpen(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-t-[32px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-500">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8" onClick={() => setIsFilterOpen(false)} />
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold font-headline">Filter Memories</h2>
              <button onClick={() => setIsFilterOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-8 pb-4">
              {/* Category Filter */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 block">Categories</label>
                <div className="flex flex-wrap gap-2.5">
                  {["All Memories", "Photography", "Food", "People", "Landscapes", "Hidden Gems"].map(cat => {
                    const isActive = activeFilters.includes(cat);
                    return (
                      <button 
                        key={cat}
                        onClick={() => setActiveFilters(prev => prev.includes(cat) ? prev.filter(f => f !== cat) : [...prev, cat])}
                        className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${isActive ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                      >
                        {cat}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Trip Context Toggle */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 block">Trip Context</label>
                <div className="space-y-3">
                  {[
                    { label: "Japan Cherry Blossom 2026", photos: 42, color: "bg-pink-50" },
                    { label: "Bali Retreat", photos: 97, color: "bg-emerald-50" },
                    { label: "Prague Winter", photos: 55, color: "bg-blue-50" }
                  ].map(trip => (
                    <div key={trip.label} className={`flex items-center justify-between p-4 rounded-2xl ${trip.color} border border-transparent hover:border-blue-200 transition-all cursor-pointer`}>
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span className="font-bold text-gray-800 text-sm">{trip.label}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-500">{trip.photos} Memories</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 block">Sort By</label>
                <div className="grid grid-cols-2 gap-3">
                  {["Newest First", "Oldest First", "Popularity", "Trip Order"].map(sort => (
                    <button 
                      key={sort}
                      className="px-4 py-3 rounded-2xl border border-gray-100 text-sm font-bold text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-all text-left flex items-center justify-between group"
                    >
                      {sort}
                      < ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button 
                onClick={() => {
                  toast.success("Filters applied successfully!");
                  setIsFilterOpen(false);
                }}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavBar />
    </div>
  );
}
