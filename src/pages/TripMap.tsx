import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { TopNavBar } from "@/components/layout/TopNavBar";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import { MapPin, ArrowLeft, Clock, Sparkles, Navigation, ChevronRight, Search, X, Car, Footprints, Train, Bike, Loader2, LocateFixed, Route } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* Fix Leaflet default marker icons */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

/* Custom colored marker */
const createColorIcon = (color: string, isActive: boolean) => new L.DivIcon({
  className: "custom-marker",
  html: `<div style="background:${color};width:${isActive ? 36 : 28}px;height:${isActive ? 36 : 28}px;border-radius:50%;border:${isActive ? 4 : 3}px solid white;box-shadow:0 ${isActive ? 4 : 2}px ${isActive ? 16 : 8}px rgba(0,0,0,${isActive ? 0.4 : 0.3});display:flex;align-items:center;justify-content:center;"><div style="width:${isActive ? 12 : 8}px;height:${isActive ? 12 : 8}px;background:white;border-radius:50%;"></div></div>`,
  iconSize: [isActive ? 36 : 28, isActive ? 36 : 28],
  iconAnchor: [isActive ? 18 : 14, isActive ? 18 : 14],
  popupAnchor: [0, -20],
});

const myLocationIcon = new L.DivIcon({
  className: "my-loc-marker",
  html: `<div style="position:relative;"><div style="width:20px;height:20px;background:#3B82F6;border-radius:50%;border:4px solid white;box-shadow:0 0 0 2px #3B82F6,0 2px 8px rgba(59,130,246,0.5);"></div><div style="position:absolute;inset:-12px;border:2px solid rgba(59,130,246,0.3);border-radius:50%;animation:locPulse 2s infinite;"></div></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -14],
});

const destIcon = new L.DivIcon({
  className: "dest-marker",
  html: `<div style="background:#DC2626;width:36px;height:36px;border-radius:50%;border:4px solid white;box-shadow:0 4px 16px rgba(220,38,38,0.5);display:flex;align-items:center;justify-content:center;"><div style="width:12px;height:12px;background:white;border-radius:50%;"></div></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
});

/* Day data */
const dayData = [
  { day: 1, label: "Tokyo Arrival", city: "Tokyo", color: "#10B981",
    locations: [
      { lat: 35.6852, lng: 139.7100, title: "Shinjuku Gyoen National Garden", time: "10:00 AM", desc: "Cherry blossom viewing at one of Tokyo's most beautiful parks", type: "Nature" },
      { lat: 35.6938, lng: 139.7036, title: "Ichiran Ramen Shinjuku", time: "1:30 PM", desc: "Classic Tonkotsu ramen in private booths", type: "Dining" },
      { lat: 35.6594, lng: 139.7387, title: "teamLab Borderless", time: "4:00 PM", desc: "Immersive digital art museum", type: "Art" },
    ]
  },
  { day: 2, label: "Pop Culture", city: "Tokyo", color: "#3B82F6",
    locations: [
      { lat: 35.6984, lng: 139.7731, title: "Akihabara Electric Town", time: "9:00 AM", desc: "Anime, manga, and retro gaming paradise", type: "Culture" },
      { lat: 35.6716, lng: 139.7030, title: "Harajuku & Takeshita Street", time: "12:00 PM", desc: "Tokyo's fashion capital", type: "Shopping" },
      { lat: 35.6764, lng: 139.6993, title: "Meiji Shrine", time: "2:00 PM", desc: "Peaceful sacred shrine", type: "Spiritual" },
      { lat: 35.6595, lng: 139.7005, title: "Shibuya Crossing", time: "4:00 PM", desc: "World's busiest intersection", type: "Landmark" },
      { lat: 35.6943, lng: 139.7046, title: "Golden Gai", time: "7:00 PM", desc: "200+ tiny bars in narrow alleys", type: "Nightlife" },
    ]
  },
  { day: 3, label: "Shinjuku & Shibuya", city: "Tokyo", color: "#8B5CF6",
    locations: [
      { lat: 35.6654, lng: 139.7707, title: "Tsukiji Outer Market", time: "9:30 AM", desc: "Legendary seafood market", type: "Food" },
      { lat: 35.6596, lng: 139.7006, title: "Shibuya Sky", time: "3:00 PM", desc: "360° rooftop views", type: "Viewpoint" },
    ]
  },
  { day: 4, label: "Hakone", city: "Hakone", color: "#F59E0B",
    locations: [
      { lat: 35.2326, lng: 139.1070, title: "Hakone Open-Air Museum", time: "10:00 AM", desc: "Sculptures amid mountains", type: "Art" },
      { lat: 35.2037, lng: 139.0227, title: "Lake Ashi Pirate Ship", time: "1:00 PM", desc: "Cruise with Mt Fuji views", type: "Cruise" },
    ]
  },
  { day: 5, label: "Kyoto Temples", city: "Kyoto", color: "#EF4444",
    locations: [
      { lat: 34.9671, lng: 135.7727, title: "Fushimi Inari Shrine", time: "9:00 AM", desc: "10,000 vermillion torii gates", type: "Temple" },
      { lat: 35.0394, lng: 135.7292, title: "Kinkaku-ji", time: "2:30 PM", desc: "The Golden Pavilion", type: "Temple" },
      { lat: 35.0036, lng: 135.7747, title: "Gion District", time: "6:00 PM", desc: "Geisha district evening walk", type: "Culture" },
    ]
  },
  { day: 6, label: "Arashiyama", city: "Kyoto", color: "#EC4899",
    locations: [
      { lat: 35.0173, lng: 135.6714, title: "Bamboo Grove", time: "8:30 AM", desc: "Towering bamboo tunnel", type: "Nature" },
      { lat: 35.0103, lng: 135.6781, title: "Monkey Park", time: "11:00 AM", desc: "Wild macaques overlooking Kyoto", type: "Nature" },
    ]
  },
  { day: 7, label: "Nara", city: "Nara", color: "#14B8A6",
    locations: [
      { lat: 34.6851, lng: 135.8398, title: "Nara Park & Todai-ji", time: "9:30 AM", desc: "Feed bowing deer & giant Buddha", type: "Temple" },
    ]
  },
  { day: 8, label: "Osaka", city: "Osaka", color: "#F97316",
    locations: [
      { lat: 34.6687, lng: 135.5013, title: "Dotonbori", time: "10:00 AM", desc: "Neon-lit street food paradise", type: "Food" },
      { lat: 34.6873, lng: 135.5262, title: "Osaka Castle", time: "2:00 PM", desc: "Magnificent 16th-century castle", type: "Landmark" },
    ]
  },
  { day: 9, label: "USJ", city: "Osaka", color: "#6366F1",
    locations: [
      { lat: 34.6654, lng: 135.4323, title: "Universal Studios Japan", time: "9:00 AM", desc: "Harry Potter & Nintendo World", type: "Theme Park" },
    ]
  },
  { day: 10, label: "Departure", city: "Tokyo", color: "#78716C",
    locations: [
      { lat: 35.7148, lng: 139.7967, title: "Sensoji Temple", time: "9:00 AM", desc: "Tokyo's oldest temple", type: "Temple" },
      { lat: 35.6812, lng: 139.7671, title: "Tokyo Station Ramen Street", time: "11:30 AM", desc: "8 legendary ramen shops", type: "Food" },
    ]
  },
];

/* Haversine distance */
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatTime(mins: number): string {
  if (mins < 1) return "< 1 min";
  if (mins < 60) return `${Math.round(mins)} min`;
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatDist(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

/* Map components */
function FitBounds({ locations }: { locations: { lat: number; lng: number }[] }) {
  const map = useMap();
  useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map((l) => [l.lat, l.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations, map]);
  return null;
}

function PanTo({ lat, lng, zoom }: { lat: number | null; lng: number | null; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat !== null && lng !== null) map.setView([lat, lng], zoom || 14, { animate: true });
  }, [lat, lng, zoom, map]);
  return null;
}

const mapStyles = {
  street: { url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", attribution: '&copy; OSM &copy; CARTO', label: "Street", icon: "🗺️" },
  satellite: { url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", attribution: '&copy; Esri', label: "Satellite", icon: "🛰️" },
  terrain: { url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", attribution: '&copy; OpenTopoMap', label: "Terrain", icon: "⛰️" },
};

const getAllLocations = (filterDay?: number | null) => {
  const days = filterDay ? dayData.filter((d) => d.day === filterDay) : dayData;
  return days.flatMap((d) => d.locations.map((loc) => ({ ...loc, day: d.day, dayLabel: d.label, color: d.color, city: d.city })));
};

export default function TripMap() {
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [mapStyle, setMapStyle] = useState<"street" | "satellite" | "terrain">("satellite");
  const [panTarget, setPanTarget] = useState<{ lat: number | null; lng: number | null; zoom?: number }>({ lat: null, lng: null });

  // Route mode
  const [routeMode, setRouteMode] = useState(false);
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [destQuery, setDestQuery] = useState("");
  const [destResults, setDestResults] = useState<any[]>([]);
  const [destLoading, setDestLoading] = useState(false);
  const [destination, setDestination] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [routeInfo, setRouteInfo] = useState<{ driving: { dist: number; time: number }; walking: { dist: number; time: number }; cycling: { dist: number; time: number }; transit: { dist: number; time: number } } | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [activeTransport, setActiveTransport] = useState<"driving" | "walking" | "cycling" | "transit">("driving");
  const [isNavigating, setIsNavigating] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  // Browse mode search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchedPlace, setSearchedPlace] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [nearbyDistances, setNearbyDistances] = useState<any[]>([]);

  const searchTimeoutRef = useRef<any>(null);
  const destTimeoutRef = useRef<any>(null);
  const fromTimeoutRef = useRef<any>(null);
  const [fromQuery, setFromQuery] = useState("");
  const [fromResults, setFromResults] = useState<any[]>([]);
  const [fromLoading, setFromLoading] = useState(false);

  const filteredLocations = getAllLocations(activeDay);
  const totalStops = getAllLocations().length;

  // Auto-detect GPS on mount for search bias
  const [userGps, setUserGps] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [showBrowseSuggestions, setShowBrowseSuggestions] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const gps = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserGps(gps);
        // Fetch nearby places at different zoom levels to get local shops, streets, etc.
        try {
          const zooms = [18, 16, 14, 12, 10]; // street → city level
          const results: any[] = [];
          const seen = new Set<string>();
          for (const z of zooms) {
            if (results.length >= 8) break;
            const offsets = z >= 16
              ? [{ lat: 0, lng: 0 }, { lat: 0.002, lng: 0.002 }, { lat: -0.002, lng: 0.002 }, { lat: 0.002, lng: -0.002 }]
              : [{ lat: 0, lng: 0 }];
            for (const off of offsets) {
              if (results.length >= 8) break;
              try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${gps.lat + off.lat}&lon=${gps.lng + off.lng}&zoom=${z}&accept-language=en&addressdetails=1`);
                const rev = await res.json();
                if (rev.display_name && !seen.has(rev.display_name.split(",")[0])) {
                  seen.add(rev.display_name.split(",")[0]);
                  results.push({
                    lat: parseFloat(rev.lat), lng: parseFloat(rev.lon),
                    name: rev.display_name.split(",")[0],
                    address: rev.display_name,
                  });
                }
              } catch {}
            }
          }
          setNearbyPlaces(results);
        } catch {}
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  /* Fetch places from Photon API (Google Maps-like Autocomplete / Fuzzy Search) */
  const fetchPlaces = async (q: string, limit = 8) => {
    let url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=${limit}`;
    const loc = myLocation || userGps;
    if (loc) url += `&lat=${loc.lat}&lon=${loc.lng}`; // Bias nearby

    const res = await fetch(url);
    const data = await res.json();
    return data.features.map((f: any) => {
      const p = f.properties;
      const addrParams = [p.name, p.street, p.district, p.city || p.county, p.state, p.country].filter(Boolean);
      const uniqueAddr = Array.from(new Set(addrParams)).join(", ");
      return {
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
        name: p.name || p.city || p.county || p.state,
        address: uniqueAddr
      };
    }).filter((r: any) => r.name);
  };

  /* Get user GPS location */
  const getMyLocation = () => {
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`);
          const data = await res.json();
          const loc = { lat: latitude, lng: longitude, name: data.display_name?.split(",")[0] || "My Location" };
          setMyLocation(loc);
          setFromQuery(loc.name);
        } catch {
          setMyLocation({ lat: latitude, lng: longitude, name: "My Location" });
          setFromQuery("My Location");
        }
        setPanTarget({ lat: latitude, lng: longitude, zoom: 13 });
        setGettingLocation(false);
      },
      () => {
        setGettingLocation(false);
        const loc = { lat: 35.6812, lng: 139.7671, name: "Tokyo Station (Demo)" };
        setMyLocation(loc);
        setFromQuery(loc.name);
        setPanTarget({ lat: loc.lat, lng: loc.lng, zoom: 13 });
      },
      { enableHighAccuracy: true }
    );
  };

  /* Search FROM location */
  const handleFromSearch = (q: string) => {
    setFromQuery(q);
    setMyLocation(null);
    setShowFromSuggestions(false);
    clearRoute();
    if (fromTimeoutRef.current) clearTimeout(fromTimeoutRef.current);
    if (q.length < 3) { setFromResults([]); return; }
    fromTimeoutRef.current = setTimeout(async () => {
      setFromLoading(true);
      try {
        const results = await fetchPlaces(q);
        setFromResults(results);
      } catch { setFromResults([]); }
      setFromLoading(false);
    }, 400);
  };

  const selectFromResult = (place: any) => {
    setMyLocation(place);
    setFromResults([]);
    setFromQuery(place.name);
    setPanTarget({ lat: place.lat, lng: place.lng, zoom: 13 });
    // Auto-calculate if destination exists
    if (destination) calcRoute(place, destination);
  };

  /* Search destination */
  const handleDestSearch = (q: string) => {
    setDestQuery(q);
    setShowDestSuggestions(false);
    if (destTimeoutRef.current) clearTimeout(destTimeoutRef.current);
    if (q.length < 3) { setDestResults([]); return; }
    destTimeoutRef.current = setTimeout(async () => {
      setDestLoading(true);
      try {
        const results = await fetchPlaces(q);
        setDestResults(results);
      } catch { setDestResults([]); }
      setDestLoading(false);
    }, 400);
  };

  /* Select destination and calculate route */
  const selectDestination = async (place: any) => {
    setDestination(place);
    setDestResults([]);
    setDestQuery(place.name);
    if (myLocation) calcRoute(myLocation, place);
    else setPanTarget({ lat: place.lat, lng: place.lng });
  };

  /* Calculate route between two points */
  const calcRoute = async (from: { lat: number; lng: number }, to: { lat: number; lng: number }) => {
    setRouteLoading(true);
    try {
      const osrmRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`);
      const osrmData = await osrmRes.json();
      if (osrmData.routes?.[0]) {
        const coords: [number, number][] = osrmData.routes[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
        setRoutePath(coords);
        const driveDist = osrmData.routes[0].distance / 1000;
        const driveTime = osrmData.routes[0].duration / 60;
        setRouteInfo({
          driving: { dist: driveDist, time: driveTime },
          walking: { dist: driveDist, time: driveDist / 5 * 60 },
          cycling: { dist: driveDist, time: driveDist / 15 * 60 },
          transit: { dist: driveDist * 0.9, time: driveTime * 1.3 },
        });
        const bounds = L.latLngBounds(coords);
        setPanTarget({ lat: bounds.getCenter().lat, lng: bounds.getCenter().lng });
      }
    } catch {
      const dist = haversine(from.lat, from.lng, to.lat, to.lng);
      setRoutePath([[from.lat, from.lng], [to.lat, to.lng]]);
      setRouteInfo({
        driving: { dist, time: dist / 40 * 60 },
        walking: { dist, time: dist / 5 * 60 },
        cycling: { dist, time: dist / 15 * 60 },
        transit: { dist, time: dist / 30 * 60 },
      });
    }
    setRouteLoading(false);
  };

  /* Browse mode search */
  const handleBrowseSearch = (q: string) => {
    setSearchQuery(q);
    setShowBrowseSuggestions(false);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (q.length < 3) { setSearchResults([]); return; }
    searchTimeoutRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await fetchPlaces(q);
        setSearchResults(results);
      } catch { setSearchResults([]); }
      setSearchLoading(false);
    }, 400);
  };

  const selectBrowseResult = (place: any) => {
    setSearchedPlace(place);
    setSearchResults([]);
    setSearchQuery(place.name);
    setPanTarget({ lat: place.lat, lng: place.lng });
    const allLocs = getAllLocations();
    const withDist = allLocs.map((loc) => {
      const dist = haversine(place.lat, place.lng, loc.lat, loc.lng);
      return { ...loc, dist, walkTime: dist / 5 * 60, cycleTime: dist / 15 * 60, transitTime: dist / 30 * 60, driveTime: dist / 40 * 60 };
    }).sort((a, b) => a.dist - b.dist).slice(0, 6);
    setNearbyDistances(withDist);
  };

  const clearRoute = () => { stopNavigation(); setDestination(null); setDestQuery(""); setRoutePath([]); setRouteInfo(null); };
  const clearAll = () => { setRouteMode(false); setMyLocation(null); setFromQuery(""); clearRoute(); setSearchedPlace(null); setSearchQuery(""); setNearbyDistances([]); };

  const startNavigation = () => {
    if (!destination) return;
    setIsNavigating(true);
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const newLoc = { lat: latitude, lng: longitude, name: "My Location" };
        setMyLocation(newLoc);
        // Live auto-pan and zoom to follow user
        setPanTarget({ lat: latitude, lng: longitude, zoom: 18 });
      },
      (err) => console.log("Navigation err:", err),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );
    watchIdRef.current = watchId;
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const routeColors: Record<string, string> = { driving: "#F97316", walking: "#10B981", cycling: "#3B82F6", transit: "#8B5CF6" };

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen">
      <TopNavBar />
      <main className="pt-[72px] pb-24 md:pb-0">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 z-40">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
          </div>
          <div className="max-w-7xl mx-auto px-6 md:px-8 py-5 relative z-10">
            <Link to="/trips" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-2 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Trip
            </Link>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-headline font-extrabold text-white tracking-tight">Trip Map</h1>
                <p className="text-white/60 text-sm">{totalStops} locations · 5 cities · 10 days</p>
              </div>
              {/* Mode Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setRouteMode(false); clearRoute(); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${!routeMode ? "bg-white text-indigo-700" : "bg-white/15 text-white/80 hover:bg-white/25"}`}
                >
                  <Search className="w-3.5 h-3.5" /> Browse
                </button>
                <button
                  onClick={() => { setRouteMode(true); setSearchedPlace(null); setNearbyDistances([]); setSearchQuery(""); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${routeMode ? "bg-white text-indigo-700" : "bg-white/15 text-white/80 hover:bg-white/25"}`}
                >
                  <Route className="w-3.5 h-3.5" /> Directions
                </button>
              </div>
            </div>

            {/* Route Mode: From/To Panel */}
            {routeMode && (
              <div className="mt-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-3">
                {/* FROM */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0 shadow-md">
                    <LocateFixed className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 relative">
                    <div className="flex items-center gap-2">
                      <div className="bg-white/15 rounded-xl px-4 py-2 flex-1 focus-within:bg-white/25 transition-colors">
                        <div className="text-[10px] text-white/50 font-bold uppercase tracking-wider">FROM</div>
                        <input
                          value={fromQuery}
                          onChange={(e) => handleFromSearch(e.target.value)}
                          onFocus={() => { if (!fromQuery && nearbyPlaces.length) setShowFromSuggestions(true); }}
                          onBlur={() => setTimeout(() => setShowFromSuggestions(false), 200)}
                          placeholder="Search or tap 📍 for GPS..."
                          className="w-full bg-transparent text-white placeholder-white/40 text-sm outline-none font-medium"
                          style={{ color: "white" }}
                        />
                      </div>
                      <button
                        onClick={getMyLocation}
                        disabled={gettingLocation}
                        className="w-10 h-10 rounded-xl bg-blue-500/30 hover:bg-blue-500/50 flex items-center justify-center shrink-0 transition-colors"
                        title="Use GPS"
                      >
                        {gettingLocation ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <LocateFixed className="w-4 h-4 text-white" />}
                      </button>
                      {myLocation && (
                        <button onClick={() => { setMyLocation(null); setFromQuery(""); clearRoute(); }} className="text-white/50 hover:text-white shrink-0">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {(fromResults.length > 0 || showFromSuggestions) && (
                      <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-56 overflow-y-auto">
                        {fromResults.length > 0 ? fromResults.map((r, i) => (
                          <button key={i} onClick={() => selectFromResult(r)} className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors flex items-start gap-2 border-b border-gray-100 last:border-0">
                            <MapPin className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-gray-900 truncate">{r.name}</div>
                              <div className="text-[10px] text-gray-500 truncate">{r.address}</div>
                            </div>
                          </button>
                        )) : (
                          <>
                            <div className="px-4 py-2 bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider">📍 Nearby Places</div>
                            {nearbyPlaces.map((r, i) => (
                              <button key={i} onClick={() => selectFromResult(r)} className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors flex items-start gap-2 border-b border-gray-100 last:border-0">
                                <MapPin className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                                <div className="min-w-0">
                                  <div className="text-sm font-bold text-gray-900 truncate">{r.name}</div>
                                  <div className="text-[10px] text-gray-500 truncate">{r.address}</div>
                                </div>
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {/* TO */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shrink-0 shadow-md">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 relative">
                    {destination ? (
                      <div className="flex items-center gap-2">
                        <div className="bg-white/15 rounded-xl px-4 py-2.5 flex-1">
                          <div className="text-[10px] text-white/50 font-bold uppercase tracking-wider">TO</div>
                          <div className="text-white text-sm font-bold truncate">{destination.name}</div>
                        </div>
                        <button onClick={clearRoute} className="text-white/50 hover:text-white"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <>
                        <div className="bg-white/15 rounded-xl px-4 py-2 focus-within:bg-white/25 transition-colors">
                          <div className="text-[10px] text-white/50 font-bold uppercase tracking-wider">TO</div>
                          <input
                            value={destQuery}
                            onChange={(e) => handleDestSearch(e.target.value)}
                            onFocus={() => { if (!destQuery && nearbyPlaces.length) setShowDestSuggestions(true); }}
                            onBlur={() => setTimeout(() => setShowDestSuggestions(false), 200)}
                            placeholder="Search destination..."
                            className="w-full bg-transparent text-white placeholder-white/40 text-sm outline-none font-medium"
                            style={{ color: "white" }}
                          />
                        </div>
                        {(destResults.length > 0 || showDestSuggestions) && (
                          <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-56 overflow-y-auto">
                            {destResults.length > 0 ? destResults.map((r, i) => (
                              <button key={i} onClick={() => selectDestination(r)} className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors flex items-start gap-2 border-b border-gray-100 last:border-0">
                                <MapPin className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                                <div className="min-w-0">
                                  <div className="text-sm font-bold text-gray-900 truncate">{r.name}</div>
                                  <div className="text-[10px] text-gray-500 truncate">{r.address}</div>
                                </div>
                              </button>
                            )) : (
                              <>
                                <div className="px-4 py-2 bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider">📍 Nearby Places</div>
                                {nearbyPlaces.map((r, i) => (
                                  <button key={i} onClick={() => selectDestination(r)} className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors flex items-start gap-2 border-b border-gray-100 last:border-0">
                                    <MapPin className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                                    <div className="min-w-0">
                                      <div className="text-sm font-bold text-gray-900 truncate">{r.name}</div>
                                      <div className="text-[10px] text-gray-500 truncate">{r.address}</div>
                                    </div>
                                  </button>
                                ))}
                              </>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Browse Mode: Search */}
            {!routeMode && (
              <div className="mt-4 relative w-full md:w-96">
                <div className="flex items-center bg-white/15 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden focus-within:bg-white/25 transition-colors">
                  <Search className="w-4 h-4 text-white/60 ml-4 shrink-0" />
                  <input
                    value={searchQuery}
                    onChange={(e) => handleBrowseSearch(e.target.value)}
                    onFocus={() => { if (!searchQuery && nearbyPlaces.length) setShowBrowseSuggestions(true); }}
                    onBlur={() => setTimeout(() => setShowBrowseSuggestions(false), 200)}
                    placeholder="Search any place..."
                    className="flex-1 bg-transparent text-white placeholder-white/50 px-3 py-3 text-sm outline-none font-medium"
                    style={{ color: "white" }}
                  />
                  {searchLoading && <Loader2 className="w-4 h-4 text-white/60 mr-3 animate-spin" />}
                  {searchQuery && !searchLoading && <button onClick={() => { setSearchQuery(""); setSearchResults([]); setSearchedPlace(null); setNearbyDistances([]); }} className="mr-3 text-white/60 hover:text-white"><X className="w-4 h-4" /></button>}
                </div>
                {(searchResults.length > 0 || showBrowseSuggestions) && (
                  <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-64 overflow-y-auto">
                    {searchResults.length > 0 ? searchResults.map((r, i) => (
                      <button key={i} onClick={() => selectBrowseResult(r)} className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-start gap-3 border-b border-gray-100 last:border-0">
                        <MapPin className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-gray-900 truncate">{r.name}</div>
                          <div className="text-[11px] text-gray-500 truncate">{r.address}</div>
                        </div>
                      </button>
                    )) : (
                      <>
                        <div className="px-4 py-2 bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider">📍 Nearby Places</div>
                        {nearbyPlaces.map((r, i) => (
                          <button key={i} onClick={() => selectBrowseResult(r)} className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-start gap-3 border-b border-gray-100 last:border-0">
                            <MapPin className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-gray-900 truncate">{r.name}</div>
                              <div className="text-[11px] text-gray-500 truncate">{r.address}</div>
                            </div>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Day Pills */}
        <div className="bg-surface-container-lowest border-b border-outline-variant/10 sticky top-[72px] z-30">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide py-3">
              <button onClick={() => setActiveDay(null)} className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 ${activeDay === null ? "bg-gray-900 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>All</button>
              {dayData.map((d) => (
                <button key={d.day} onClick={() => setActiveDay(activeDay === d.day ? null : d.day)} className={`shrink-0 px-3 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${activeDay === d.day ? "text-white shadow-md" : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"}`} style={activeDay === d.day ? { backgroundColor: d.color } : {}}>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeDay === d.day ? "white" : d.color }} />D{d.day}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Map */}
            <div className="lg:col-span-8">
              <div className="relative bg-surface-container-lowest rounded-2xl overflow-hidden shadow-lg border border-outline-variant/10 h-[450px] md:h-[600px]">
                <MapContainer center={[20, 0]} zoom={2} scrollWheelZoom={true} className="h-full w-full z-0" style={{ height: "100%", width: "100%" }}>
                  <TileLayer key={mapStyle} attribution={mapStyles[mapStyle].attribution} url={mapStyles[mapStyle].url} maxZoom={mapStyle === "terrain" ? 17 : 19} />
                  {!searchedPlace && !routeMode && activeDay !== null && <FitBounds locations={filteredLocations} />}
                  <PanTo lat={panTarget.lat} lng={panTarget.lng} zoom={panTarget.zoom} />

                  {/* Trip markers */}
                  {filteredLocations.map((loc, idx) => (
                    <Marker key={`${loc.day}-${idx}`} position={[loc.lat, loc.lng]} icon={createColorIcon(loc.color, selectedLocation?.title === loc.title)} eventHandlers={{ click: () => setSelectedLocation(loc) }}>
                      <Popup>
                        <div style={{ minWidth: 200, fontFamily: "system-ui" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: loc.color }} />
                            <span style={{ fontSize: 11, fontWeight: 700, color: loc.color }}>Day {loc.day} · {loc.dayLabel}</span>
                          </div>
                          <div style={{ fontWeight: 800, fontSize: 15, color: "#1a1a1a", marginBottom: 4 }}>{loc.title}</div>
                          <div style={{ fontSize: 12, color: "#666" }}>🕐 {loc.time} · 📍 {loc.city}</div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* My location marker */}
                  {myLocation && <Marker position={[myLocation.lat, myLocation.lng]} icon={myLocationIcon}>
                    <Popup><div style={{ fontWeight: 700, fontSize: 14 }}>📍 {myLocation.name}</div><div style={{ fontSize: 12, color: "#666" }}>Your location</div></Popup>
                  </Marker>}

                  {/* Destination marker */}
                  {destination && <Marker position={[destination.lat, destination.lng]} icon={destIcon}>
                    <Popup><div style={{ fontWeight: 700, fontSize: 14 }}>🎯 {destination.name}</div><div style={{ fontSize: 12, color: "#666" }}>Destination</div></Popup>
                  </Marker>}

                  {/* Browse search marker */}
                  {searchedPlace && !routeMode && <Marker position={[searchedPlace.lat, searchedPlace.lng]} icon={destIcon}>
                    <Popup><div style={{ fontWeight: 700, fontSize: 14 }}>{searchedPlace.name}</div></Popup>
                  </Marker>}

                  {/* Route line */}
                  {routePath.length > 0 && <Polyline positions={routePath} pathOptions={{ color: routeColors[activeTransport], weight: 5, opacity: 0.8, dashArray: activeTransport === "walking" ? "8 12" : undefined }} />}
                </MapContainer>

                {/* Map Style Toggle */}
                <div className="absolute top-3 right-3 z-[400] flex bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  {(Object.keys(mapStyles) as Array<keyof typeof mapStyles>).map((key) => (
                    <button key={key} onClick={() => setMapStyle(key)} className={`px-3 py-2 text-[11px] font-bold flex items-center gap-1 transition-all ${mapStyle === key ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                      <span className="text-sm">{mapStyles[key].icon}</span>
                      <span className="hidden sm:inline">{mapStyles[key].label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-4">
              {/* Route Info Panel */}
              {routeMode && routeInfo && destination && myLocation && (
                <div className="bg-white rounded-2xl shadow-lg border border-outline-variant/10 overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Route className="w-4 h-4 text-indigo-600" />
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Route Details</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-bold text-gray-900 truncate">{myLocation.name}</span>
                      <span className="text-gray-400">→</span>
                      <span className="font-bold text-gray-900 truncate">{destination.name}</span>
                    </div>
                  </div>
                  {/* Transport modes */}
                  <div className="p-4 space-y-2">
                    {([
                      { key: "driving" as const, icon: Car, label: "Drive", color: "orange" },
                      { key: "walking" as const, icon: Footprints, label: "Walk", color: "green" },
                      { key: "cycling" as const, icon: Bike, label: "Cycle", color: "blue" },
                      { key: "transit" as const, icon: Train, label: "Transit", color: "purple" },
                    ]).map(({ key, icon: Icon, label, color }) => (
                      <button
                        key={key}
                        onClick={() => setActiveTransport(key)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTransport === key ? `bg-${color}-50 ring-2 ring-${color}-300` : "bg-gray-50 hover:bg-gray-100"}`}
                        style={activeTransport === key ? { backgroundColor: `${routeColors[key]}10`, outline: `2px solid ${routeColors[key]}40` } : {}}
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${routeColors[key]}20` }}>
                          <Icon className="w-5 h-5" style={{ color: routeColors[key] }} />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-bold text-gray-900">{label}</div>
                          <div className="text-[10px] text-gray-500">{formatDist(routeInfo[key].dist)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-extrabold" style={{ color: routeColors[key] }}>{formatTime(routeInfo[key].time)}</div>
                        </div>
                      </button>
                    ))}

                    <button
                      onClick={isNavigating ? stopNavigation : startNavigation}
                      className={`w-full mt-3 py-3.5 rounded-xl font-bold text-sm tracking-wide text-white transition-all shadow-[0_4px_12px_rgba(0,0,0,0.15)] active:scale-95 flex items-center justify-center gap-2 ${
                        isNavigating ? "bg-[#EF4444] hover:bg-[#DC2626]" : ""
                      }`}
                      style={!isNavigating ? { backgroundColor: routeColors[activeTransport] } : {}}
                    >
                      {isNavigating ? <X className="w-4 h-4" /> : <Navigation className="w-4 h-4 ml-[-4px]" />}
                      {isNavigating ? "End Navigation" : "Start"}
                    </button>
                  </div>
                </div>
              )}

              {/* Route loading state */}
              {routeMode && routeLoading && (
                <div className="bg-white rounded-2xl shadow-lg border p-8 flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                  <p className="text-sm font-medium text-gray-600">Calculating routes...</p>
                </div>
              )}

              {/* Route mode: no location yet */}
              {routeMode && !myLocation && !routeLoading && (
                <div className="bg-white rounded-2xl shadow-lg border p-6 text-center">
                  <LocateFixed className="w-10 h-10 text-blue-500 mx-auto mb-3" />
                  <h3 className="font-bold text-gray-900 mb-1">Set Your Location</h3>
                  <p className="text-xs text-gray-500 mb-4">Click "Use My Current Location" above to start getting directions</p>
                </div>
              )}

              {/* Browse mode: nearby distances */}
              {!routeMode && searchedPlace && nearbyDistances.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-bold text-red-600 uppercase tracking-wider flex items-center gap-1"><MapPin className="w-3 h-3" /> Distances From</div>
                        <h3 className="font-bold text-gray-900 text-sm">{searchedPlace.name}</h3>
                      </div>
                      <button onClick={() => { setSearchedPlace(null); setSearchQuery(""); setNearbyDistances([]); }} className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50"><X className="w-3.5 h-3.5 text-gray-500" /></button>
                    </div>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {nearbyDistances.map((loc, i) => (
                      <div key={i} className="p-3 border-b border-gray-100 last:border-0">
                        <div className="flex items-start gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: loc.color }} />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-gray-900 truncate">{loc.title}</h4>
                            <span className="text-[10px] text-gray-500">Day {loc.day} · {formatDist(loc.dist)}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                          <div className="bg-green-50 rounded-lg p-1.5 text-center"><Footprints className="w-3 h-3 text-green-600 mx-auto" /><div className="text-[9px] font-extrabold text-green-700">{formatTime(loc.walkTime)}</div></div>
                          <div className="bg-blue-50 rounded-lg p-1.5 text-center"><Bike className="w-3 h-3 text-blue-600 mx-auto" /><div className="text-[9px] font-extrabold text-blue-700">{formatTime(loc.cycleTime)}</div></div>
                          <div className="bg-purple-50 rounded-lg p-1.5 text-center"><Train className="w-3 h-3 text-purple-600 mx-auto" /><div className="text-[9px] font-extrabold text-purple-700">{formatTime(loc.transitTime)}</div></div>
                          <div className="bg-orange-50 rounded-lg p-1.5 text-center"><Car className="w-3 h-3 text-orange-600 mx-auto" /><div className="text-[9px] font-extrabold text-orange-700">{formatTime(loc.driveTime)}</div></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location list (default) */}
              {!routeMode && !searchedPlace && (
                <div className="bg-surface-container-lowest rounded-2xl shadow-lg border border-outline-variant/10 overflow-hidden">
                  <div className="p-4 border-b border-outline-variant/10 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-headline font-bold text-on-surface text-base">{activeDay ? `Day ${activeDay}: ${dayData.find((d) => d.day === activeDay)?.label}` : "All Locations"}</h3>
                        <p className="text-xs text-on-surface-variant mt-0.5">{filteredLocations.length} stops</p>
                      </div>
                      <div className="flex items-center gap-1 bg-primary-container/10 px-2.5 py-1 rounded-full"><Sparkles className="w-3 h-3 text-primary-container" /><span className="text-[10px] font-bold text-primary-container">AI Route</span></div>
                    </div>
                  </div>
                  <div className="max-h-[450px] overflow-y-auto">
                    {(activeDay ? dayData.filter((d) => d.day === activeDay) : dayData).map((day) => (
                      <div key={day.day}>
                        {!activeDay && (
                          <div className="px-4 py-2 bg-gray-50/80 border-b border-outline-variant/10 flex items-center gap-2 sticky top-0 z-10">
                            <div className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[9px] font-extrabold" style={{ backgroundColor: day.color }}>{day.day}</div>
                            <span className="text-xs font-bold text-gray-700">{day.label}</span>
                            <span className="text-[10px] text-gray-400 ml-auto">{day.city}</span>
                          </div>
                        )}
                        {day.locations.map((loc, idx) => (
                          <button key={idx} onClick={() => { setSelectedLocation({ ...loc, day: day.day, dayLabel: day.label, color: day.color, city: day.city }); setPanTarget({ lat: loc.lat, lng: loc.lng }); }}
                            className={`w-full text-left px-4 py-3 flex items-start gap-3 border-b border-outline-variant/5 transition-all hover:bg-blue-50/50 group ${selectedLocation?.title === loc.title ? "bg-blue-50 border-l-2" : ""}`}
                            style={selectedLocation?.title === loc.title ? { borderLeftColor: day.color } : {}}>
                            <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: day.color }} />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-gray-800 truncate">{loc.title}</h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-semibold text-gray-500 flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {loc.time}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${day.color}15`, color: day.color }}>{loc.type}</span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 shrink-0 mt-1" />
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100">
                <div className="flex items-center gap-2 mb-3"><MapPin className="w-4 h-4 text-indigo-600" /><span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Trip Stats</span></div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center"><div className="text-2xl font-extrabold text-indigo-900">5</div><div className="text-[10px] text-indigo-600 font-semibold">Cities</div></div>
                  <div className="text-center"><div className="text-2xl font-extrabold text-indigo-900">{totalStops}</div><div className="text-[10px] text-indigo-600 font-semibold">Stops</div></div>
                  <div className="text-center"><div className="text-2xl font-extrabold text-indigo-900">10</div><div className="text-[10px] text-indigo-600 font-semibold">Days</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes locPulse { 0%,100%{transform:scale(1);opacity:0.6;} 50%{transform:scale(1.5);opacity:0;} }
      `}</style>
      <BottomNavBar />
    </div>
  );
}
