import { useState } from "react";
import { TopNavBar } from "@/components/layout/TopNavBar";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Camera, Image as ImageIcon, MapPin, Loader2 } from "lucide-react";

export default function NewJournal() {
  const navigate = useNavigate();
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [location, setLocation] = useState("Tokyo, Japan");

  const handleSimulatePhoto = () => {
    setLoading(true);
    // Simulate camera/gallery load
    setTimeout(() => {
      setPhoto("https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=800");
      setLoading(false);
    }, 1500);
  };

  const handlePost = () => {
    if (!photo && !text.trim()) {
      toast.error("Please add a photo or write something to post.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      toast.success("Memory captured! Added to your journal.");
      navigate("/journal");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-surface font-body pb-24">
      <TopNavBar />
      <div className="pt-24 px-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-surface-container-high rounded-full transition-colors active:scale-95">
              <ArrowLeft className="w-5 h-5 text-on-surface" />
            </button>
            <h1 className="text-2xl font-headline font-bold text-on-surface">New Memory</h1>
          </div>
          <Button 
            onClick={handlePost} 
            disabled={loading}
            className="bg-primary-container text-white px-6 rounded-full font-bold shadow-md hover:bg-surface-tint hover:-translate-y-0.5 transition-all"
          >
            {loading && photo ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Post
          </Button>
        </div>

        {/* Photo Uploader */}
        <div className="mb-6">
          {photo ? (
            <div className="relative w-full aspect-[4/5] rounded-[32px] overflow-hidden shadow-sm group">
              <img src={photo} alt="Preview" className="w-full h-full object-cover" />
              <button onClick={() => setPhoto(null)} className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors">✕</button>
            </div>
          ) : (
            <div 
              onClick={handleSimulatePhoto}
              className="w-full aspect-[4/5] rounded-[32px] bg-surface-container-low border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-surface-container hover:border-primary-container/40 transition-all active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-10 h-10 text-primary-container animate-spin" />
                  <p className="text-sm font-semibold text-on-surface-variant">Opening camera...</p>
                </>
              ) : (
                <>
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary-container/10 flex items-center justify-center text-primary-container shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]">
                      <Camera className="w-8 h-8" />
                    </div>
                    <div className="w-16 h-16 rounded-full bg-secondary-container/30 flex items-center justify-center text-secondary-m3 shadow-md">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-on-surface text-lg">Tap to Capture</p>
                    <p className="text-sm text-on-surface-variant font-medium">or choose from gallery</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="space-y-6">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-outline-variant/20 shadow-sm mt-1">
              <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=Jai" alt="Avatar" className="w-full h-full object-cover bg-primary-container/10" />
            </div>
            <textarea
              className="flex-1 w-full min-h-[120px] bg-transparent border-none focus:ring-0 text-lg placeholder:text-outline font-medium resize-none leading-relaxed"
              placeholder="What made this moment special?"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="pt-4 border-t border-outline-variant/20">
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => toast("Opening maps to tag location...")}
                className="flex items-center gap-2 px-4 py-2 bg-surface-container-low hover:bg-surface-container-high rounded-full border border-outline-variant/30 text-sm font-semibold text-on-surface-variant transition-colors active:scale-95"
              >
                <MapPin className="w-4 h-4 text-primary-container" />
                {location}
              </button>
              <button 
                onClick={() => toast("Tagging friends...")}
                className="flex items-center gap-2 px-4 py-2 bg-surface-container-low hover:bg-surface-container-high rounded-full border border-outline-variant/30 text-sm font-semibold text-on-surface-variant transition-colors active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                Tag Friends
              </button>
              <button 
                onClick={() => toast("Privacy set to public.")}
                className="flex items-center gap-2 px-4 py-2 bg-surface-container-low hover:bg-surface-container-high rounded-full border border-outline-variant/30 text-sm font-semibold text-on-surface-variant transition-colors active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">public</span>
                Public
              </button>
            </div>
          </div>
        </div>
      </div>
      <BottomNavBar />
    </div>
  );
}
