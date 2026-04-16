import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { TopNavBar } from "@/components/layout/TopNavBar";
import { BottomNavBar } from "@/components/layout/BottomNavBar";

interface Hotel {
  name: string; rating: string; location: string; total: string; perNight: string; badge?: string;
  amenities: { icon: string; label: string }[]; img: string;
}

interface LiveData {
  viewers: number;
  roomsLeft: number;
  priceShift: number;     // cents up/down since load
  priceTrend: "up" | "down" | "stable";
  lastUpdate: Date;
}

const quickFilters = ["Free Cancellation", "5-Star", "Pool", "Breakfast Included"];

// ── Live-tracking helpers ─────────────────────────────────
function randomBetween(a: number, b: number) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

function initLive(): LiveData {
  return {
    viewers: randomBetween(4, 28),
    roomsLeft: randomBetween(1, 6),
    priceShift: 0,
    priceTrend: "stable",
    lastUpdate: new Date(),
  };
}

export default function HotelBooking() {
  const [activeFilter, setActiveFilter] = useState("Free Cancellation");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingEnabled, setTrackingEnabled] = useState(true);

  // Per-hotel live data keyed by name
  const [liveMap, setLiveMap] = useState<Record<string, LiveData>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleSort = () => toast("Sorting options opened.");
  const handlePin = (price: string) => toast(`Viewing hotels starting at ${price}...`);

  // Fetch hotels
  useEffect(() => {
    fetch("/api/hotels")
      .then(res => res.json())
      .then(data => {
        const list: Hotel[] = data.data || [];
        setHotels(list);
        // Seed initial live data
        const seed: Record<string, LiveData> = {};
        list.forEach(h => { seed[h.name] = initLive(); });
        setLiveMap(seed);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch hotels:", err);
        setLoading(false);
      });
  }, []);

  // Live-tracking tick (every 4 seconds)
  const tick = useCallback(() => {
    setLiveMap(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(key => {
        const d = { ...next[key] };
        // Viewers jitter
        d.viewers = Math.max(1, d.viewers + randomBetween(-3, 4));
        // Rooms occasionally change
        if (Math.random() < 0.15) d.roomsLeft = Math.max(1, d.roomsLeft + (Math.random() > 0.5 ? -1 : 1));
        // Price micro-shift (-£8 to +£12)
        const shift = randomBetween(-8, 12);
        d.priceShift += shift;
        d.priceTrend = shift > 0 ? "up" : shift < 0 ? "down" : "stable";
        d.lastUpdate = new Date();
        next[key] = d;
      });
      return next;
    });
  }, []);

  useEffect(() => {
    if (trackingEnabled) {
      intervalRef.current = setInterval(tick, 4000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [trackingEnabled, tick]);

  const handleCheckout = async (hotel: Hotel) => {
    setLoading(true);
    try {
      const amount = parseFloat(hotel.total.replace(/[^0-9.-]+/g, ""));
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_name: `Hotel - ${hotel.name} (3 Nights)`, amount_gbp: amount })
      });
      const data = await res.json();
      window.location.href = data.url;
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const toggleFav = (name: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(name)) { next.delete(name); } else { next.add(name); }
      return next;
    });
  };

  return (
    <div className="bg-surface text-on-surface font-body antialiased">
      <TopNavBar />

      <main className="pt-[72px] min-h-screen flex flex-col lg:flex-row overflow-hidden">
        {/* Map Panel */}
        <section className="hidden lg:block w-1/2 relative bg-surface-dim overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDKQUX802ABzl9eSzZV5d-N-2ZmOYkTDTm-zr6t2iFhDuqdG49FzW9aLj3hMhfhNZFFHY5HyyA8ILr-c49wNRef7-vVpOG0rFBBkva1T7TzgPkQkwAQU4vBNxElE54ctoAAoW4V_axY_1VM7kwqv9-zu67eHOhlGGqPr8aSS-gWFS1sY-KEEOJdn9f9V5fcCN-KyyLI9jbJaB0Wdxd4fAqTgJX9a8G6GckYlzRwk-2owN-HYaQlnXms8Tj_boNRaun2lL4bAAusu18')" }} />
          {/* Price pins */}
          <div onClick={() => handlePin("£289")} className="absolute top-[35%] left-[45%] cursor-pointer hover:scale-110 transition-transform">
            <div className="bg-primary-container text-on-primary px-3 py-1.5 rounded-full font-bold shadow-lg flex items-center gap-1 scale-110 border-2 border-white">
              <span className="text-sm">£289</span>
            </div>
          </div>
          <div onClick={() => handlePin("£189")} className="absolute top-[55%] left-[30%] cursor-pointer hover:scale-110 transition-transform">
            <div className="bg-surface-container-lowest text-primary-container px-3 py-1.5 rounded-full font-bold shadow-md border border-primary-container/20 hover:bg-primary-container hover:text-on-primary transition-colors">
              <span className="text-sm">£189</span>
            </div>
          </div>
          <div onClick={() => handlePin("£149")} className="absolute top-[48%] left-[60%] cursor-pointer hover:scale-110 transition-transform">
            <div className="bg-surface-container-lowest text-primary-container px-3 py-1.5 rounded-full font-bold shadow-md border border-primary-container/20 hover:bg-primary-container hover:text-on-primary transition-colors">
              <span className="text-sm">£149</span>
            </div>
          </div>

          {/* Live tracker overlay on map */}
          {trackingEnabled && (
            <div className="absolute bottom-6 left-6 right-6 bg-black/70 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <span className="text-white text-xs font-bold uppercase tracking-wider">Live Tracking</span>
                </div>
                <span className="text-white/50 text-[10px] font-mono">
                  Updated {new Date().toLocaleTimeString()}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-2xl font-black text-white">
                    {Object.values(liveMap).reduce((a, b) => a + b.viewers, 0)}
                  </p>
                  <p className="text-white/50 text-[10px] font-bold uppercase tracking-wider">Browsing Now</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-amber-400">
                    {Object.values(liveMap).reduce((a, b) => a + b.roomsLeft, 0)}
                  </p>
                  <p className="text-white/50 text-[10px] font-bold uppercase tracking-wider">Rooms Left</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-emerald-400">
                    {hotels.length}
                  </p>
                  <p className="text-white/50 text-[10px] font-bold uppercase tracking-wider">Properties</p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Hotel Results */}
        <section className="w-full lg:w-1/2 bg-surface overflow-y-auto flex flex-col">
          <header className="p-6 border-b border-outline-variant/10 sticky top-0 bg-surface/95 backdrop-blur-md z-10">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight font-headline text-on-background">32 Stays in Shinjuku</h1>
                <p className="text-sm text-on-surface-variant font-medium">Apr 9 — Apr 12 · 2 Guests</p>
              </div>
              <div className="flex items-center gap-3">
                {/* Live tracking toggle */}
                <button
                  onClick={() => {
                    setTrackingEnabled(!trackingEnabled);
                    toast(trackingEnabled ? "Live tracking paused" : "Live tracking resumed");
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${
                    trackingEnabled
                      ? "bg-red-500 text-white hover:bg-red-600 shadow-red-500/25"
                      : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                  }`}
                >
                  <span className="relative flex h-2 w-2">
                    {trackingEnabled && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>}
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${trackingEnabled ? "bg-white" : "bg-on-surface-variant/50"}`}></span>
                  </span>
                  {trackingEnabled ? "LIVE" : "Paused"}
                </button>
                <button onClick={handleSort} className="flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-full text-sm font-semibold border border-outline-variant/30 hover:bg-surface-container-highest transition-colors active:scale-95">
                  <span className="material-symbols-outlined text-[18px]">swap_vert</span> Sort: Recommended
                </button>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {quickFilters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                    activeFilter === f
                      ? "bg-primary-container text-on-primary-container"
                      : "bg-surface-container-highest text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </header>

          <div className="p-6 space-y-8 pb-24">
            {loading ? (
              <div className="p-8 text-center text-on-surface-variant animate-pulse font-bold tracking-widest uppercase">Fetching live inventory...</div>
            ) : hotels.map((hotel) => {
              const live = liveMap[hotel.name];

              return (
              <article key={hotel.name} className="group bg-surface-container-lowest rounded-lg overflow-hidden border border-transparent hover:border-primary-container/10 transition-all">
                {/* Live tracking bar for this hotel */}
                {live && trackingEnabled && (
                  <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Live dot */}
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <span className="text-red-400 text-[10px] font-black uppercase tracking-widest">Live</span>
                      </div>
                      {/* Viewers */}
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-amber-400 text-[14px]">visibility</span>
                        <span className="text-amber-300 text-[11px] font-bold">{live.viewers} watching</span>
                      </div>
                      {/* Rooms left */}
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]" style={{ color: live.roomsLeft <= 2 ? "#ef4444" : "#34d399" }}>hotel</span>
                        <span className={`text-[11px] font-bold ${live.roomsLeft <= 2 ? "text-red-400" : "text-emerald-400"}`}>
                          {live.roomsLeft <= 2 ? `Only ${live.roomsLeft} left!` : `${live.roomsLeft} rooms`}
                        </span>
                      </div>
                    </div>
                    {/* Price trend */}
                    <div className="flex items-center gap-1">
                      {live.priceTrend === "up" && (
                        <>
                          <span className="material-symbols-outlined text-red-400 text-[14px]">trending_up</span>
                          <span className="text-red-400 text-[11px] font-bold">+£{Math.abs(live.priceShift)}</span>
                        </>
                      )}
                      {live.priceTrend === "down" && (
                        <>
                          <span className="material-symbols-outlined text-emerald-400 text-[14px]">trending_down</span>
                          <span className="text-emerald-400 text-[11px] font-bold">-£{Math.abs(live.priceShift)}</span>
                        </>
                      )}
                      {live.priceTrend === "stable" && (
                        <>
                          <span className="material-symbols-outlined text-white/40 text-[14px]">trending_flat</span>
                          <span className="text-white/40 text-[11px] font-bold">Stable</span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-col md:flex-row gap-6 p-2">
                  <div className="w-full md:w-[280px] h-[200px] rounded-md overflow-hidden relative flex-shrink-0">
                    <img alt={hotel.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src={hotel.img} />
                    <button
                      onClick={() => toggleFav(hotel.name)}
                      className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-primary-container transition-colors"
                    >
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: favorites.has(hotel.name) ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                    </button>
                    {hotel.badge && (
                      <span className="absolute bottom-3 left-3 px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed-variant text-[10px] font-black uppercase tracking-wider rounded-full">{hotel.badge}</span>
                    )}
                    {/* Low stock urgency badge */}
                    {live && live.roomsLeft <= 2 && trackingEnabled && (
                      <div className="absolute top-3 left-3 px-2.5 py-1 bg-red-500 text-white text-[10px] font-black uppercase tracking-wider rounded-full animate-pulse flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">local_fire_department</span>
                        {live.roomsLeft === 1 ? "Last room!" : "Almost sold out"}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-between py-2 pr-4 flex-grow">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold text-on-surface">{hotel.name}</h3>
                        <div className="flex items-center gap-1 text-primary-container">
                          <span className="text-sm font-bold">{hotel.rating}</span>
                          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        </div>
                      </div>
                      <p className="text-sm text-on-surface-variant mb-4 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">location_on</span> {hotel.location}
                      </p>
                      <div className="flex gap-4 text-on-surface-variant">
                        {hotel.amenities.map((a) => (
                          <div key={a.label} className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[18px]">{a.icon}</span>
                            <span className="text-xs font-medium">{a.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-end mt-4">
                      <div>
                        <p className="text-xs text-on-surface-variant font-medium">Total for 3 nights</p>
                        <p className="text-2xl font-black text-on-surface">{hotel.total} <span className="text-sm font-normal text-on-surface-variant">({hotel.perNight})</span></p>
                        {/* Live price shift indicator below price */}
                        {live && trackingEnabled && live.priceShift !== 0 && (
                          <p className={`text-[11px] font-bold mt-0.5 flex items-center gap-0.5 ${live.priceShift > 0 ? "text-red-500" : "text-emerald-500"}`}>
                            <span className="material-symbols-outlined text-[12px]">{live.priceShift > 0 ? "arrow_upward" : "arrow_downward"}</span>
                            £{Math.abs(live.priceShift)} since you started looking
                          </p>
                        )}
                      </div>
                      <button onClick={() => handleCheckout(hotel)} className="px-8 py-3 bg-primary-container text-on-primary rounded-full font-bold text-sm shadow-md hover:bg-surface-tint transition-all active:scale-95">Reserve</button>
                    </div>
                  </div>
                </div>
              </article>
            );
            })}
          </div>
        </section>
      </main>

      <BottomNavBar />
    </div>
  );
}
