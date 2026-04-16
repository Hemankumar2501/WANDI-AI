import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Compass,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
  Globe,
  MapPin,
  Star,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const heroImages = [
  "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=900&q=85", // Kyoto
  "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=900&q=85", // Bali
  "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=900&q=85", // Bangkok
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [imgIdx] = useState(() =>
    Math.floor(Math.random() * heroImages.length),
  );
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) navigate("/dashboard");
    };
    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate("/dashboard");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    if (!password.trim()) {
      toast({
        title: "Password required",
        description: "Please enter your password.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });
      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      if (data.user) {
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in!",
          action: <CheckCircle2 className="w-5 h-5 text-green-500" />,
        });
        const from =
          (location.state as { from?: { pathname?: string } })?.from
            ?.pathname || "/";
        navigate(from);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}${window.location.pathname}`,
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      });
      if (error) {
        toast({
          title: "Google sign in failed",
          description: error.message,
          variant: "destructive",
        });
        setIsGoogleLoading(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
        variant: "destructive",
      });
      setIsGoogleLoading(false);
    }
  };

  return (
    <Layout hideFooter>
      <div className="min-h-screen flex overflow-hidden">
        {/* ── LEFT PANEL — Destination Image ── */}
        <div className="auth-panel-left w-0 md:w-[45%] flex-shrink-0 relative">
          {/* Hero image */}
          <img
            src={heroImages[imgIdx]}
            alt="Travel destination"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(217_91%_35%)] via-[hsl(262_83%_35%/0.8)] to-[hsl(224_40%_10%)]" />

          {/* Content */}
          <div className="relative z-10 flex flex-col h-full p-12 justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-white">
                WanderWise
              </span>
            </div>

            {/* Center copy */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/80 text-xs font-semibold tracking-widest uppercase mb-6">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  AI-Powered Travel
                </div>
                <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 leading-tight">
                  Your Next
                  <br />
                  Adventure
                  <br />
                  Starts Here
                </h2>
                <p className="text-white/60 text-base leading-relaxed max-w-sm">
                  Join 100K+ travelers who plan smarter, save more, and discover
                  deeper with WanderWise AI.
                </p>
              </motion.div>

              {/* Social proof chips */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="mt-8 flex flex-wrap gap-3"
              >
                {[
                  { icon: Globe, label: "50+ Asian Destinations" },
                  { icon: Star, label: "4.9 Rating" },
                  { icon: MapPin, label: "50K+ Asia Trips" },
                ].map((chip) => (
                  <div
                    key={chip.label}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs font-semibold"
                  >
                    <chip.icon className="w-3.5 h-3.5 text-amber-300" />
                    {chip.label}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Bottom nav */}
            <div className="flex items-center gap-4 text-white/40 text-xs">
              <span>Privacy Policy</span>
              <span>·</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL — Login Form ── */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative overflow-hidden bg-background">
          {/* Ambient glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/5 rounded-full blur-[80px] pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md relative z-10"
          >
            {/* Mobile logo */}
            <div className="md:hidden flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-sky-400 flex items-center justify-center">
                <Compass className="w-4 h-4 text-white" />
              </div>
              <span className="font-display text-lg font-bold gradient-text">
                WanderWise
              </span>
            </div>

            <h1 className="text-3xl font-display font-bold mb-2 tracking-tight">
              Welcome back
            </h1>
            <p className="text-muted-foreground mb-8">
              Sign in to continue your journey
            </p>

            {/* Google OAuth */}
            <>
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 font-semibold gap-3 mb-5 glass-card border-border/60 hover-glow"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {isGoogleLoading ? "Signing in..." : "Continue with Google"}
              </Button>
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/60" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-background text-muted-foreground font-medium">
                    or continue with email
                  </span>
                </div>
              </div>
            </>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 text-sm bg-muted/30 border-border/60 focus:border-primary/50 rounded-xl"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-semibold">
                    Password
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-primary hover:text-primary/80 font-semibold transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 text-sm bg-muted/30 border-border/60 focus:border-primary/50 rounded-xl"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full gradient-button h-12 font-bold text-white gap-2 rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            {/* Social proof */}
            <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <div className="flex -space-x-1.5">
                {["AB", "CD", "EF", "GH"].map((a) => (
                  <div
                    key={a}
                    className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/40 to-violet-400/40 border border-background flex items-center justify-center text-[8px] font-bold text-primary"
                  >
                    {a[0]}
                  </div>
                ))}
              </div>
              <span>Join 100K+ travelers planning their next trip</span>
            </div>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-primary hover:text-primary/80 font-bold transition-colors"
              >
                Sign up free
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
