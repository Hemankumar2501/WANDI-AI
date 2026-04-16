import { useState } from "react";
import { TopNavBar } from "@/components/layout/TopNavBar";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Calendar, Image as ImageIcon, MapPin, Users } from "lucide-react";

export default function TripEdit() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("Tokyo City Escape");
  const [dates, setDates] = useState("Mar 24 - Apr 3, 2026");
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      toast.success("Trip updated successfully.");
      navigate("/trips");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-surface font-body pb-24">
      <TopNavBar />
      <div className="pt-24 px-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-surface-container-high rounded-full transition-colors active:scale-95">
              <ArrowLeft className="w-5 h-5 text-on-surface" />
            </button>
            <h1 className="text-2xl font-headline font-bold text-on-surface">Edit Trip</h1>
          </div>
        </div>

        {/* Cover Photo Editor */}
        <div className="mb-8 relative rounded-3xl overflow-hidden h-48 group cursor-pointer shadow-sm hover:shadow-md transition-shadow" onClick={() => toast("Opening gallery picker...")}>
          <img src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=800" alt="Tokyo" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white font-bold flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Change Cover
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6 bg-surface-container-lowest p-6 rounded-[32px] border border-outline-variant/30 shadow-sm">
          <div>
            <label className="text-xs font-bold text-outline uppercase tracking-widest mb-2 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-primary-container" /> Trip Name
            </label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="w-full bg-surface-container-low border-none rounded-2xl h-14 px-5 text-lg font-bold focus:ring-2 focus:ring-primary-container transition-all" 
            />
          </div>

          <div>
            <label className="text-xs font-bold text-outline uppercase tracking-widest mb-2 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-primary-container" /> Travel Dates
            </label>
            <input 
              type="text" 
              value={dates} 
              onChange={(e) => setDates(e.target.value)} 
              className="w-full bg-surface-container-low border-none rounded-2xl h-14 px-5 font-semibold text-on-surface focus:ring-2 focus:ring-primary-container transition-all" 
            />
          </div>

          <div>
            <label className="text-xs font-bold text-outline uppercase tracking-widest mb-2 flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-primary-container" /> Privacy
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" className="px-5 py-4 rounded-2xl bg-primary-container text-white text-sm font-bold shadow-md shadow-primary-container/20 border-2 border-primary-container flex flex-col items-center gap-1 group">
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform">lock</span> Custom Group
              </button>
              <button type="button" onClick={() => toast("Changed to Public.")} className="px-5 py-4 rounded-2xl bg-surface-container-low text-on-surface-variant text-sm font-bold border-2 border-transparent hover:border-outline-variant/30 hover:bg-surface-container-high transition-all flex flex-col items-center gap-1 group">
                <span className="material-symbols-outlined text-outline group-hover:scale-110 transition-transform">public</span> Public View
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={handleSave} 
            disabled={loading}
            className="flex-1 h-14 rounded-2xl bg-primary-container text-white font-bold text-lg hover:bg-surface-tint shadow-lg hover:-translate-y-0.5 transition-all text-center flex items-center justify-center gap-2"
          >
            {loading ? <span className="material-symbols-outlined animate-spin text-lg">sync</span> : "Save Changes"}
          </Button>
          <Button 
            onClick={() => { toast.error("Are you sure? Long press to delete."); }} 
            className="flex-none h-14 px-8 rounded-2xl bg-error-container text-on-error-container font-bold text-lg hover:bg-error-container/80 transition-all text-center flex items-center justify-center"
          >
            Delete Trip
          </Button>
        </div>
      </div>
      <BottomNavBar />
    </div>
  );
}
