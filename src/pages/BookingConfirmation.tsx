import { Link } from "react-router-dom";
import { toast } from "sonner";
import { TopNavBar } from "@/components/layout/TopNavBar";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import { Footer } from "@/components/layout/Footer";

const HERO_IMG = "https://lh3.googleusercontent.com/aida-public/AB6AXuC1qu6Bi8gQT434NENE49LPV_k00sun4bOt9upjYwFM9ENQYum0Fb_AlKre4dws5jFpqEZ5WBOczH9XxPWEXRZJH_RU15fJqTqAMbQ38MZB2QJWIr27UQipbHBwWmARl59G_jzc3_EwwgM2AEuqIu-DYR2MsT6Js8zGhCPCEv3p6nsIXP3XfvGkbaJGp8NhG_zPHC_iu4Ma5R3vAsX-TEW6XFOtdR7x15XWRXJ-H6kcy2UQfw83i35Bef5SUY1Y9beVbOEWSqmp9Vw";
const HOTEL_IMG = "https://lh3.googleusercontent.com/aida-public/AB6AXuCcs0rjBpzxhZIwfjpSNxCJ72Zr7gUGHEck3JDxEZ5O7xnjwwy7e9E1lOL26L9tee5zr-KblHjBoRkg4JXNouFg0SCFdsh8u91jgX30tO-XC3CFxpHMn3hSaFSJF8bWAb2VOtmfczRM9xesCYQQYSXG34ECkgK-BQIWN9qWZA2WNuvbe43R325zLcRP995ASklPOoeT7nxHlLmEgzLz-JEv5Ic64_ekwhcxxRtuC4IWdox5Htb-q-gsDOhYZ1VFwVVYyL7bx27tWsc";
const ZEN_IMG = "https://lh3.googleusercontent.com/aida-public/AB6AXuB0z681jF-qI8l-AHJWxg8LXwMrLcohWY6Hx7BwH-uE2l1P-1QUkL3W6cnIQt28ecld6u1YY576BWy0YmcFeiuLdf16ofspHIGOPpI0d_DuQ2LODl155b5HMGsggWmCN5POEFhcy87e-aG00EY27l2dX1Yn09AFNmUDfSEJzdic2frBLWfArxAvLcIAFL54IPsFeBbA9ShJAehA9QK0kmPCt8ekmv2tawGTRHLkMkUWwWcXlxcGg17mr3Rwi-k9m1YlAm74NaFKy9k";

export default function BookingConfirmation() {
  const handleDownload = () => toast.success("Ticket PDF downloaded successfully!");
  const handleShare = () => toast("Share dialog opened.");

  return (
    <div className="bg-surface text-on-surface font-body antialiased">
      <TopNavBar />

      <main className="pt-24 pb-32 px-6 max-w-5xl mx-auto">
        {/* Success Header */}
        <section className="text-center mb-16 pt-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary-container text-on-secondary-container mb-6 animate-pulse">
            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <h1 className="font-headline text-5xl font-extrabold text-on-background tracking-tight mb-4">You're booked!</h1>
          <p className="text-on-surface-variant text-lg max-w-md mx-auto leading-relaxed">
            Pack your bags! We've sent your confirmation and travel docs to <span className="font-semibold text-primary-container">your email</span>.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Summary */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-surface-container-lowest rounded-lg p-1 shadow-sm overflow-hidden">
              <div className="h-48 rounded-t-2xl overflow-hidden">
                <img className="w-full h-full object-cover" src={HERO_IMG} alt="Tokyo skyline" />
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-3 inline-block">Flight Confirmed</span>
                    <h3 className="font-headline text-2xl font-bold text-on-background">London to Tokyo</h3>
                    <p className="text-on-surface-variant font-medium">Saturday, 14 Oct 2024</p>
                  </div>
                  <p className="text-[11px] text-outline font-mono mt-2 tracking-widest uppercase">Ref: JL-7842-LHR</p>
                </div>
                <div className="flex items-center justify-between p-6 bg-surface-container-low rounded-md">
                  <div className="text-center flex-1">
                    <div className="text-3xl font-bold text-on-background font-headline">LHR</div>
                    <div className="text-xs text-outline font-medium">11:35 AM</div>
                  </div>
                  <div className="flex-1 flex flex-col items-center px-4">
                    <div className="w-full border-t-2 border-dashed border-outline-variant relative">
                      <span className="material-symbols-outlined absolute -top-3 left-1/2 -translate-x-1/2 bg-surface-container-low px-2 text-primary-container">flight_takeoff</span>
                    </div>
                    <div className="text-[10px] font-bold text-primary-container mt-2 uppercase tracking-tighter">13h 45m · Non-stop</div>
                  </div>
                  <div className="text-center flex-1">
                    <div className="text-3xl font-bold text-on-background font-headline">NRT</div>
                    <div className="text-xs text-outline font-medium">08:20 AM (+1)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-surface-container-low rounded-lg p-8">
              <h4 className="font-headline text-lg font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">payments</span> Payment Summary
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between text-sm"><span className="text-on-surface-variant">Adult Passenger (x1)</span><span className="font-medium">£1,420.00</span></div>
                <div className="flex justify-between text-sm"><span className="text-on-surface-variant">Taxes &amp; Fees</span><span className="font-medium">£264.00</span></div>
                <div className="pt-4 border-t border-outline-variant/30 flex justify-between items-end">
                  <div>
                    <p className="text-xs text-outline uppercase font-bold tracking-widest mb-1">Total Paid</p>
                    <p className="text-3xl font-extrabold text-on-background">£1,684.00</p>
                  </div>
                  <div className="flex items-center gap-3 bg-surface-container-lowest px-4 py-2 rounded-full border border-outline-variant/20">
                    <span className="material-symbols-outlined text-blue-800">credit_card</span>
                    <span className="text-xs font-semibold text-on-surface-variant">Visa •••• 4242</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="lg:col-span-5 space-y-8">
            <div className="flex flex-col gap-4">
              <Link to="/trips" className="w-full bg-primary-container text-white py-5 rounded-full font-bold text-lg hover:bg-surface-tint transition-all shadow-xl shadow-primary-container/20 flex items-center justify-center gap-3 active:scale-[0.98]">
                <span className="material-symbols-outlined">auto_awesome</span> Add to Japan trip
              </Link>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={handleDownload} className="flex items-center justify-center gap-2 py-4 rounded-full bg-surface-container-high text-on-primary-fixed-variant font-semibold text-sm hover:bg-surface-container-highest transition-colors active:scale-95">
                  <span className="material-symbols-outlined text-sm">download</span> Ticket PDF
                </button>
                <button onClick={handleShare} className="flex items-center justify-center gap-2 py-4 rounded-full bg-surface-container-high text-on-primary-fixed-variant font-semibold text-sm hover:bg-surface-container-highest transition-colors active:scale-95">
                  <span className="material-symbols-outlined text-sm">share</span> Share
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-headline text-xl font-bold mb-6">What's next?</h4>
              <div className="grid grid-cols-1 gap-4">
                <Link to="/hotels" className="group bg-surface-container-lowest p-6 rounded-lg flex items-center gap-6 shadow-sm hover:translate-x-1 transition-transform cursor-pointer">
                  <div className="w-16 h-16 rounded-md overflow-hidden shrink-0">
                    <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={HOTEL_IMG} alt="Hotel" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-on-background">Find your sanctuary</h5>
                    <p className="text-sm text-on-surface-variant">Curated hotels in Shinjuku &amp; Shibuya</p>
                  </div>
                  <span className="material-symbols-outlined text-primary-container group-hover:translate-x-1 transition-transform">chevron_right</span>
                </Link>
                <Link to="/trips" className="group bg-surface-container-lowest p-6 rounded-lg flex items-center gap-6 shadow-sm hover:translate-x-1 transition-transform cursor-pointer">
                  <div className="w-16 h-16 rounded-md overflow-hidden shrink-0">
                    <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={ZEN_IMG} alt="Zen Garden" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-on-background">View itinerary</h5>
                    <p className="text-sm text-on-surface-variant">See your daily Japan plan</p>
                  </div>
                  <span className="material-symbols-outlined text-primary-container group-hover:translate-x-1 transition-transform">chevron_right</span>
                </Link>

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
