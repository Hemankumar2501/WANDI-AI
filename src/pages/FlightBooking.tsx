import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { TopNavBar } from "@/components/layout/TopNavBar";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import { Footer } from "@/components/layout/Footer";

interface Flight {
  airline: string; code: string; depart: string; arrive: string; departCode: string; arriveCode: string;
  duration: string; stops: string; price: string; class: string; picked?: boolean;
  perks?: string[]; logo: string; hasStop?: boolean;
}

const stopFilters = [
  { label: "Non-stop", price: "£840" },
  { label: "1 Stop", price: "£620", checked: true },
  { label: "2+ Stops", price: "£510" },
];

export default function FlightBooking() {
  const [selected, setSelected] = useState<string | null>(null);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);

  const handleSwap = () => toast("Swapped origin and destination.");
  const handleSearch = () => { setLoading(true); toast("Searching for new flights..."); setTimeout(() => setLoading(false), 1000); };
  const handleViewOffer = () => toast("Displaying Wandi's Top Pick details!");

  const handleCheckout = async (flight: Flight) => {
    setSelected(flight.code);
    setLoading(true);
    try {
      // Mocking price generically, removing £ symbol
      const amount = parseFloat(flight.price.replace(/[^0-9.-]+/g,""));
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_name: `Flight - ${flight.airline} (${flight.code})`, amount_gbp: amount })
      });
      const data = await res.json();
      window.location.href = data.url;
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };  useEffect(() => {
    fetch("/api/flights")
      .then(res => res.json())
      .then(data => {
        setFlights(data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch flights:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-surface text-on-surface font-body antialiased">
      <TopNavBar />

      <main className="pt-[72px] min-h-screen">
        {/* Search Header */}
        <section className="bg-surface-container-low py-8">
          <div className="max-w-7xl mx-auto px-8">
            <div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm flex flex-wrap lg:flex-nowrap items-center gap-4">
              <div className="flex-1 min-w-[200px] relative">
                <label className="absolute -top-2.5 left-4 px-1 bg-surface-container-lowest text-[10px] font-bold text-primary-container tracking-widest uppercase">Origin</label>
                <div className="flex items-center gap-3 px-4 py-3 bg-surface-container-low rounded-md">
                  <span className="material-symbols-outlined text-outline">flight_takeoff</span>
                  <input className="bg-transparent border-none focus:ring-0 focus:outline-none font-semibold w-20" defaultValue="LHR" />
                  <span className="text-on-surface-variant text-sm">London, UK</span>
                </div>
              </div>
              <button onClick={handleSwap} className="p-2 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors active:scale-95">
                <span className="material-symbols-outlined text-primary-container">swap_horiz</span>
              </button>
              <div className="flex-1 min-w-[200px] relative">
                <label className="absolute -top-2.5 left-4 px-1 bg-surface-container-lowest text-[10px] font-bold text-primary-container tracking-widest uppercase">Destination</label>
                <div className="flex items-center gap-3 px-4 py-3 bg-surface-container-low rounded-md">
                  <span className="material-symbols-outlined text-outline">flight_land</span>
                  <input className="bg-transparent border-none focus:ring-0 focus:outline-none font-semibold w-20" defaultValue="NRT" />
                  <span className="text-on-surface-variant text-sm">Tokyo, JP</span>
                </div>
              </div>
              <div className="w-px h-10 bg-outline-variant/30 hidden lg:block" />
              <div className="w-48 relative">
                <label className="absolute -top-2.5 left-4 px-1 bg-surface-container-lowest text-[10px] font-bold text-primary-container tracking-widest uppercase">Date</label>
                <div className="flex items-center gap-3 px-4 py-3 bg-surface-container-low rounded-md">
                  <span className="material-symbols-outlined text-outline">calendar_today</span>
                  <input type="date" className="bg-transparent border-none focus:ring-0 focus:outline-none font-medium text-sm" />
                </div>
              </div>
              <div className="w-40 relative">
                <label className="absolute -top-2.5 left-4 px-1 bg-surface-container-lowest text-[10px] font-bold text-primary-container tracking-widest uppercase">Travelers</label>
                <div className="flex items-center gap-3 px-4 py-3 bg-surface-container-low rounded-md">
                  <span className="material-symbols-outlined text-outline">person</span>
                  <select className="bg-transparent border-none focus:ring-0 focus:outline-none font-medium text-sm appearance-none">
                    <option>2 Adults</option>
                    <option>1 Adult</option>
                    <option>3 Adults</option>
                  </select>
                </div>
              </div>
              <button onClick={handleSearch} className="bg-primary-container text-white p-4 rounded-md hover:bg-surface-tint transition-all shrink-0 active:scale-95">
                <span className="material-symbols-outlined">search</span>
              </button>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-8 py-10">
          <div className="grid grid-cols-12 gap-10">
            {/* Filters */}
            <aside className="col-span-12 lg:col-span-3 space-y-10">
              <div className="space-y-8">
                <div>
                  <h3 className="font-headline text-lg font-bold mb-4">Filters</h3>
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-primary-container tracking-widest uppercase">Stops</label>
                    <div className="space-y-2">
                      {stopFilters.map((f) => (
                        <label key={f.label} className="flex items-center gap-3 cursor-pointer group">
                          <div className={`w-5 h-5 rounded border-2 transition-colors flex items-center justify-center ${f.checked ? "border-primary-container bg-primary-container/10" : "border-outline-variant group-hover:border-primary-container"}`}>
                            {f.checked && <span className="material-symbols-outlined text-primary-container text-sm font-bold">check</span>}
                          </div>
                          <span className="text-sm font-medium">{f.label}</span>
                          <span className="ml-auto text-xs text-on-surface-variant">{f.price}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-primary-container tracking-widest uppercase">Price Range</label>
                  <div className="px-2">
                    <input type="range" min="400" max="1200" defaultValue="900" className="w-full accent-primary-container" />
                    <div className="flex justify-between mt-2">
                      <span className="text-xs font-semibold">£400</span>
                      <span className="text-xs font-semibold">£1,200+</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Results */}
            <div className="col-span-12 lg:col-span-9 space-y-6">
              {/* AI Banner */}
              <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primary-container to-[#003fb1] p-8 text-white shadow-lg">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                    </div>
                    <div>
                      <h2 className="font-headline text-xl font-bold mb-1">Wandi's Top Pick</h2>
                      <p className="text-on-primary-container text-sm max-w-md">"Based on your preference for direct flights and morning departures, the JAL flight at 10:20 is the best balance of comfort and value."</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-md border border-white/10">
                    <div className="text-right">
                      <div className="text-xs uppercase tracking-widest opacity-80">Starting from</div>
                      <div className="text-2xl font-bold">£942</div>
                    </div>
                    <button onClick={handleViewOffer} className="bg-secondary-container text-on-secondary-container px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform active:scale-95">View Offer</button>
                  </div>
                </div>
                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
              </div>

              {/* Flight Cards */}
              <div className="space-y-4">
                {loading ? (
                  <div className="p-8 text-center text-on-surface-variant animate-pulse font-bold tracking-widest uppercase">Fetching live flights...</div>
                ) : flights.map((f) => (
                  <div key={f.code} className={`group bg-surface-container-lowest p-6 rounded-lg transition-all shadow-sm ${f.picked ? "border-2 border-primary-container/20 hover:border-primary-container" : "border border-transparent hover:border-surface-container-high hover:shadow-md"}`}>
                    <div className="flex flex-wrap md:flex-nowrap items-center gap-8">
                      <div className="w-32 flex flex-col items-center">
                        <img alt={f.airline} className="h-8 mb-2" src={f.logo} />
                        <span className="text-xs font-semibold text-on-surface-variant">{f.airline}</span>
                      </div>
                      <div className="flex-1 flex items-center justify-between gap-4">
                        <div className="text-center">
                          <div className="text-xl font-bold">{f.depart}</div>
                          <div className="text-xs font-medium text-outline">{f.departCode}</div>
                        </div>
                        <div className="flex-1 flex flex-col items-center px-4">
                          <span className="text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-1">{f.duration}</span>
                          <div className="w-full h-px bg-surface-container-high relative">
                            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full border border-outline bg-white" />
                            {f.hasStop && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-error-m3" />}
                            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-outline" />
                          </div>
                          <span className={`text-[10px] font-bold tracking-widest uppercase mt-1 ${f.hasStop ? "text-error-m3" : "text-secondary-m3"}`}>{f.stops}</span>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold">{f.arrive}<span className="text-[10px] align-top text-primary-container ml-1">+1</span></div>
                          <div className="text-xs font-medium text-outline">{f.arriveCode}</div>
                        </div>
                      </div>
                      <div className="w-px h-12 bg-surface-container-high hidden md:block" />
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-2xl font-black text-on-surface">{f.price}</div>
                          <div className="text-[10px] font-bold text-outline tracking-wider uppercase">{f.class}</div>
                        </div>
                        <button
                          onClick={() => handleCheckout(f)}
                          className={`px-8 py-3 rounded-full font-bold transition-all ${
                            selected === f.code || f.picked
                              ? "bg-primary-container text-white"
                              : "bg-surface-container-high text-primary-container hover:bg-primary-container hover:text-white"
                          }`}
                        >
                          {selected === f.code ? "Selected ✓" : "Select"}
                        </button>
                      </div>
                    </div>
                    {f.perks && (
                      <div className="mt-4 pt-4 border-t border-surface-container-low flex items-center gap-4 text-xs font-medium text-on-surface-variant flex-wrap">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">wifi</span> {f.perks[0]}</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">restaurant</span> {f.perks[1]}</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">luggage</span> {f.perks[2]}</span>
                        <div className="ml-auto flex items-center gap-1 text-primary-container">
                          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          <span>High satisfaction score</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <BottomNavBar />
    </div>
  );
}
