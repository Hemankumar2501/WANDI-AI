import { Link } from "react-router-dom";
import { toast } from "sonner";

export function Footer() {
  return (
    <footer className="bg-[#0F172A] w-full py-16 px-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="text-xl font-bold text-white flex items-center gap-2 font-headline mb-4">
              <span className="material-symbols-outlined text-primary-container text-3xl">explore</span>
              WanderWiseAI
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Your AI-powered personal travel concierge. Smart planning, seamless booking, unforgettable journeys.
            </p>
            <div className="flex gap-4">
              <button onClick={() => toast("Navigating to Twitter...")} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-sm">alternate_email</span>
              </button>
              <button onClick={() => toast("Navigating to LinkedIn...")} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-sm">share</span>
              </button>
              <button onClick={() => toast("Navigating to Instagram...")} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-sm">photo_camera</span>
              </button>
            </div>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="text-white font-bold mb-4 font-headline">Company</h4>
            <div className="flex flex-col gap-3 text-sm">
              <button onClick={() => toast("About Us page coming soon!")} className="text-left text-slate-400 hover:text-blue-300 transition-colors">About</button>
              <button onClick={() => toast("We are currently not hiring.")} className="text-left text-slate-400 hover:text-blue-300 transition-colors">Careers</button>
              <button onClick={() => toast("Travel blog is under construction.")} className="text-left text-slate-400 hover:text-blue-300 transition-colors">Blog</button>
            </div>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="text-white font-bold mb-4 font-headline">Product</h4>
            <div className="flex flex-col gap-3 text-sm">
              <button onClick={() => toast("WanderWise Developer API is currently in Beta.")} className="text-left text-slate-400 hover:text-blue-300 transition-colors">API</button>
              <button onClick={() => toast("Support agents are offline.")} className="text-left text-slate-400 hover:text-blue-300 transition-colors">Support</button>
              <button onClick={() => toast("Please see the pricing section on the homepage.")} className="text-left text-slate-400 hover:text-blue-300 transition-colors">Pricing</button>
            </div>
          </div>

          {/* Links 3 */}
          <div>
            <h4 className="text-white font-bold mb-4 font-headline">Legal</h4>
            <div className="flex flex-col gap-3 text-sm">
              <button onClick={() => toast("Privacy Policy document is being generated.")} className="text-left text-slate-400 hover:text-blue-300 transition-colors">Privacy</button>
              <button onClick={() => toast("Terms of Service is being generated.")} className="text-left text-slate-400 hover:text-blue-300 transition-colors">Terms</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
