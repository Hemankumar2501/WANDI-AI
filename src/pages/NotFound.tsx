import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Compass, MapPin, Home, Telescope } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden noise-texture">
      {/* Background */}
      <div className="absolute inset-0 mesh-gradient opacity-40" />
      <div className="grid-lines absolute inset-0 opacity-30" />

      {/* Glowing Orbs */}
      <div className="hero-glow w-[600px] h-[600px] bg-primary/20 top-[-10%] left-[-10%]" />
      <div
        className="hero-glow w-[500px] h-[500px] bg-aurora-violet/15 bottom-[-10%] right-[-10%]"
        style={{ animationDelay: "4s" }}
      />
      <div
        className="hero-glow w-[350px] h-[350px] bg-gold/10 top-[40%] right-[10%]"
        style={{ animationDelay: "2s" }}
      />

      {/* Floating particles */}
      <div className="particles">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="particle" />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        {/* Animated Compass */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 14,
            duration: 1,
          }}
          className="w-28 h-28 mx-auto mb-8 rounded-[2rem] bg-gradient-to-br from-primary via-azure-bright to-aurora-violet flex items-center justify-center shadow-2xl shadow-primary/40"
        >
          <Compass className="w-14 h-14 text-white" strokeWidth={1.5} />
        </motion.div>

        {/* 404 */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1
            className="text-[10rem] md:text-[14rem] font-black leading-none gradient-text select-none"
            style={{ lineHeight: 0.85, marginBottom: "0.1em" }}
          >
            404
          </h1>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 mb-4"
        >
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Lost in the Destination?
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            Even the best explorers get off track sometimes. This page doesn't
            exist — but the world is full of places that do.
          </p>
        </motion.div>

        {/* Map pin trail decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-2 my-6"
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: i === 2 ? 1 : 0.3, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.08, type: "spring" }}
            >
              <MapPin
                className={`w-5 h-5 ${i === 2 ? "text-primary" : "text-muted-foreground"}`}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
        >
          <Link to="/">
            <button className="gold-button flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold shadow-xl">
              <Home className="w-5 h-5" />
              Return Home
            </button>
          </Link>
          <Link to="/explore">
            <button className="glass-card magnetic-border flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold border-white/10 hover-glow transition-all">
              <Telescope className="w-5 h-5 text-primary" />
              Explore Destinations
            </button>
          </Link>
        </motion.div>

        {/* Bottom breadcrumb path hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-10 text-xs text-muted-foreground/60"
        >
          You tried to visit:{" "}
          <code className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono text-primary/70">
            {location.pathname}
          </code>
        </motion.p>
      </div>
    </div>
  );
};

export default NotFound;
