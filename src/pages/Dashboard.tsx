import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Calendar,
  MessageCircle,
  Plus,
  Clock,
  Heart,
  BookOpen,
  LogOut,
  Compass,
  Sparkles,
  Plane,
  Globe,
  TrendingUp,
  Zap,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { UserProfile, Trip, Chat } from "@/lib/supabase";

const featuredDestinations = [
  {
    name: "Kyoto, Japan",
    img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200",
    desc: "Experience the tranquility of ancient temples, geisha districts, and stunning cherry blossoms.",
  },
  {
    name: "Bali, Indonesia",
    img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200",
    desc: "Lose yourself in emerald rice terraces, sacred temple ceremonies, and breathtaking sunsets.",
  },
  {
    name: "Hoi An, Vietnam",
    img: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200",
    desc: "A lantern-lit ancient town with golden streets, tailor shops, and some of Asia's finest cuisine.",
  },
  {
    name: "Rajasthan, India",
    img: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200",
    desc: "Majestic forts, palace hotels, desert safaris, and the most vibrant colours in all of Asia.",
  },
];

const quickActions = [
  {
    to: "/flights",
    icon: Plane,
    label: "Flights",
    desc: "Book a flight",
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    to: "/hotels",
    icon: Globe,
    label: "Hotels",
    desc: "Find a stay",
    gradient: "from-violet-500 to-purple-400",
  },
  {
    to: "/explore",
    icon: MapPin,
    label: "Explore",
    desc: "Discover destinations",
    gradient: "from-teal-500 to-emerald-400",
  },
  {
    to: "/trips",
    icon: Compass,
    label: "Trips",
    desc: "Manage your trips",
    gradient: "from-amber-500 to-orange-400",
  },
  {
    to: "/journal",
    icon: BookOpen,
    label: "Journal",
    desc: "Capture memories",
    gradient: "from-rose-500 to-pink-400",
  },
  {
    to: "/dashboard",
    icon: Heart,
    label: "Profile",
    desc: "Your travel profile",
    gradient: "from-indigo-500 to-blue-400",
  },
];

export default function Dashboard() {
  const [user, setUser] = useState<import("@supabase/supabase-js").User | null>(
    null,
  );
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();


  useEffect(() => {
    const loadUserData = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError || !session) {
          // Provide mock user instead of redirecting so UI can be previewed
          setUser({ id: "mock-123", email: "traveler@example.com" } as import("@supabase/supabase-js").User);
          setUserProfile({ full_name: "Demo Traveler" } as UserProfile);
          setIsLoading(false);
          return;
        }
        setUser(session.user);

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        if (!profileError && profile) setUserProfile(profile);

        const { data: tripsData, error: tripsError } = await supabase
          .from("trips")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(5);
        if (!tripsError && tripsData) setTrips(tripsData);

        const { data: chatsData, error: chatsError } = await supabase
          .from("chats")
          .select("*")
          .eq("user_id", session.user.id)
          .order("updated_at", { ascending: false })
          .limit(5);
        if (!chatsError && chatsData) setChats(chatsData);
      } catch (error) {
        console.error("Error loading user data:", error);
        setUser({ id: "mock-123", email: "traveler@example.com" } as import("@supabase/supabase-js").User);
        setUserProfile({ full_name: "Demo Traveler" } as UserProfile);
      } finally {
        setIsLoading(false);
      }
    };
    loadUserData();
  }, [navigate]);

  const [featured] = useState(
    () =>
      featuredDestinations[
        Math.floor(Math.random() * featuredDestinations.length)
      ],
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const getDisplayName = () => {
    if (userProfile?.full_name) return userProfile.full_name;
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.email) return user.email.split("@")[0];
    return "Traveler";
  };

  const getAvatarUrl = () => {
    if (userProfile?.avatar_url) return userProfile.avatar_url;
    if (user?.user_metadata?.avatar_url) return user.user_metadata.avatar_url;
    return null;
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const analyticsData = [
    {
      icon: Globe,
      label: "Asian Destinations",
      value: trips.length > 0 ? `${trips.length}` : "—",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: Plane,
      label: "Trips Planned",
      value: `${trips.length}`,
      color: "text-violet-400",
      bg: "bg-violet-400/10",
    },
    {
      icon: Plus,
      label: "Tools Available",
      value: "4",
      color: "text-teal-400",
      bg: "bg-teal-400/10",
    },
    {
      icon: TrendingUp,
      label: "Days Explored",
      value: trips.length > 0 ? `${trips.length * 7}` : "—",
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
  ];

  if (isLoading || !user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-14 h-14 border-[3px] border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">
              Loading your dashboard...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen py-0 relative overflow-hidden">
        {/* Ambient background */}
        <div className="absolute inset-0 mesh-gradient opacity-30 pointer-events-none" />
        <div className="absolute inset-0 grid-lines opacity-20 pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10 pt-28 pb-16">
          {/* ── Header Greeting Bar ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10"
          >
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative">
                {getAvatarUrl() ? (
                  <img
                    src={getAvatarUrl()!}
                    alt={getDisplayName()}
                    className="w-14 h-14 rounded-2xl object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-sky-400 flex items-center justify-center shadow-lg text-white font-display font-bold text-lg">
                    {getInitials()}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-background" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h1 className="text-2xl md:text-3xl font-display font-bold">
                    Welcome back,{" "}
                    <span className="gradient-text">{getDisplayName()}</span>!
                    👋
                  </h1>
                </div>
                <p className="text-muted-foreground text-sm">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  · Ready for your next adventure?
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/trips">
                <Button className="gradient-button px-5 py-2.5 rounded-xl font-semibold text-sm text-white gap-2">
                  <Sparkles className="w-4 h-4" /> My Trips
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="gap-2 glass-card border-border/60 px-5 py-2.5 rounded-xl font-semibold text-sm hover-glow"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </Button>
            </div>
          </motion.div>

          {/* ── AI Chat Banner ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7 }}
            className="mb-8"
          >
            <div className="bento-card p-8 bg-gradient-to-br from-primary-container to-blue-200 flex flex-col md:flex-row items-center justify-between gap-6 border-none shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 md:p-12 opacity-10 pointer-events-none">
                <Sparkles className="w-32 h-32 md:w-48 md:h-48 text-primary" />
              </div>
              <div className="relative z-10 max-w-lg">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" /> Wandi Assistant
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-on-primary-container mb-3">
                  Need travel inspiration?
                </h2>
                <p className="text-on-primary-container/80 font-medium">
                  Your AI concierge is ready to help you discover hidden gems, plan custom itineraries, and manage bookings instantly.
                </p>
              </div>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-chat'))}
                className="relative z-10 gradient-button text-white px-8 py-4 rounded-full font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3 whitespace-nowrap self-start md:self-auto"
              >
                <MessageCircle className="w-5 h-5" />
                Chat with Wandi
              </button>
            </div>
          </motion.div>

          {/* ── Analytics Ribbon ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {analyticsData.map((tile, i) => (
              <motion.div
                key={tile.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.1 + i * 0.07,
                  type: "spring",
                  stiffness: 200,
                }}
                className="analytics-tile"
              >
                <div
                  className={`w-10 h-10 rounded-xl ${tile.bg} flex items-center justify-center`}
                >
                  <tile.icon className={`w-5 h-5 ${tile.color}`} />
                </div>
                <div className="text-2xl font-display font-bold">
                  {tile.value}
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  {tile.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* ── Quick Actions ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3 mb-8"
          >
            {quickActions.map((action) => (
              <Link key={action.label} to={action.to}>
                <div className="bento-card group p-4 flex flex-col items-center text-center gap-3 hover:border-primary/20 cursor-pointer min-h-[100px] justify-center">
                  <div
                    className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
                  >
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xs leading-tight">
                      {action.label}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </motion.div>

          {/* ── Destination Spotlight ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="mb-8"
          >
            <div className="relative h-72 md:h-80 rounded-[1.5rem] overflow-hidden group cursor-pointer shadow-xl">
              <img
                src={featured.img}
                alt={featured.name}
                className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900/60 via-transparent to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-primary text-xs font-bold flex items-center gap-1.5">
                    <Compass className="w-3 h-3" /> Destination of the Day
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                  {featured.name}
                </h2>
                <p className="text-white/70 text-sm md:text-base max-w-xl mb-5">
                  {featured.desc}
                </p>
                <Link
                  to="/flights"
                >
                  <Button className="gradient-button text-white font-bold rounded-xl px-6 py-2.5 gap-2 text-sm">
                    Book a flight here <Plane className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* ── Trips Grid ── */}
          <div className="grid grid-cols-1 gap-6">
            {/* Saved Trips */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
            >
              <div className="bento-card p-6 h-full">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-display font-bold text-lg flex items-center gap-2">
                    <Heart className="w-5 h-5 text-primary" /> My Trips
                  </h3>
                  <Link to="/trips">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary/80 text-xs font-semibold"
                    >
                      View All
                    </Button>
                  </Link>
                </div>

                {trips.length > 0 ? (
                  <div className="space-y-3">
                    {trips.map((trip, i) => (
                      <motion.div
                        key={trip.id}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.08 }}
                        className="flex items-center gap-4 p-3 rounded-xl glass-card hover-glow group cursor-pointer"
                      >
                        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                          <img
                            src={
                              trip.image_url ||
                              "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=200"
                            }
                            alt={trip.destination}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">
                            {trip.destination}
                          </h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            {new Date(
                              trip.start_date,
                            ).toLocaleDateString()} –{" "}
                            {new Date(trip.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold capitalize flex-shrink-0">
                          {trip.status}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
                      <MapPin className="w-7 h-7 text-muted-foreground/50" />
                    </div>
                    <p className="text-muted-foreground text-sm mb-4">
                      No trips yet. Start planning your first adventure!
                    </p>
                    <Link to="/trips">
                      <Button className="gradient-button text-white gap-2 text-sm rounded-xl">
                        <Plus className="w-4 h-4" /> View Trips
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

