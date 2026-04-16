import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Compass,
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Check,
  Globe,
  Sparkles,
  Wallet,
  Shield,
  MapPin,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import zxcvbn from "zxcvbn";

const benefits = [
  {
    icon: Sparkles,
    title: "AI Trip Planner",
    desc: "Get personalized itineraries in seconds",
  },
  {
    icon: Globe,
    title: "50+ Asian Destinations",
    desc: "Explore the best of Asia",
  },
  {
    icon: Wallet,
    title: "Budget Optimizer",
    desc: "Smart spending recommendations",
  },
  {
    icon: Shield,
    title: "Safety Alerts",
    desc: "Real-time safety intelligence",
  },
  {
    icon: MapPin,
    title: "Hidden Gems",
    desc: "Local secrets only AI can surface",
  },
];

const heroImage =
  "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=900&q=85"; // Bali

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const check = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) navigate("/dashboard");
    };
    check();
  }, [navigate]);

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (val.length > 0) {
      const result = zxcvbn(val, [name, email, "wanderwise"]);
      setPasswordStrength(result.score);
    } else {
      setPasswordStrength(0);
    }
  };

  const pwColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-teal-400",
    "bg-green-500",
  ];
  const pwLabels = ["Very weak", "Weak", "Fair", "Good", "Strong"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your full name.",
        variant: "destructive",
      });
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters.",
        variant: "destructive",
      });
      return;
    }
    const result = zxcvbn(password, [name, email, "wanderwise"]);
    if (result.score < 2) {
      toast({
        title: "Password too weak",
        description:
          result.feedback.warning || "Please choose a stronger password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: { data: { full_name: name.trim() } },
      });
      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      if (data.user) {
        if (data.user.identities && data.user.identities.length === 0) {
          toast({
            title: "Account exists",
            description:
              "An account with this email already exists. Please sign in.",
            variant: "destructive",
          });
          return;
        }
        toast({
          title: "Account created!",
          description: `Welcome, ${name}! Check your email to confirm.`,
          action: <CheckCircle2 className="w-5 h-5 text-green-500" />,
        });
        navigate("/login");
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

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}${window.location.pathname}#/dashboard`,
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      });
      if (error) {
        toast({
          title: "Google sign up failed",
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
        {/* ── LEFT PANEL — Benefits ── */}
        <div className="auth-panel-left w-0 md:w-[45%] flex-shrink-0 relative">
          <img
            src={heroImage}
            alt="Santorini"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(217_91%_35%)] via-[hsl(175_82%_30%/0.85)] to-[hsl(224_40%_10%)]" />

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

            {/* Copy + Benefits */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-3 leading-tight">
                  Everything you need to
                  <br />
                  travel smarter
                </h2>
                <p className="text-white/60 text-sm mb-8">
                  Join 100K+ travelers. Free forever. No credit card needed.
                </p>
              </motion.div>

              <div className="space-y-4">
                {benefits.map((b, i) => (
                  <motion.div
                    key={b.title}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1, duration: 0.6 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center flex-shrink-0">
                      <b.icon className="w-4 h-4 text-amber-300" />
                    </div>
                    <div>
                      <div className="text-white text-sm font-semibold">
                        {b.title}
                      </div>
                      <div className="text-white/50 text-xs">{b.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-3">
              {["SSL Secured", "GDPR Compliant", "Free Forever"].map(
                (badge) => (
                  <div
                    key={badge}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/8 backdrop-blur-md border border-white/12 text-white/60 text-[10px] font-semibold"
                  >
                    <Check className="w-3 h-3 text-green-400" />
                    {badge}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL — Signup Form ── */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative overflow-hidden bg-background">
          <div className="absolute top-0 left-0 w-96 h-96 bg-teal-400/5 rounded-full blur-[120px] pointer-events-none" />

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
              Create your account
            </h1>
            <p className="text-muted-foreground mb-8 text-sm">
              Free forever · No credit card required
            </p>

            {/* Google OAuth */}
            <>
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 font-semibold gap-3 mb-5 glass-card border-border/60 hover-glow"
                onClick={handleGoogleSignUp}
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
                {isGoogleLoading ? "Signing up..." : "Continue with Google"}
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

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-semibold">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Jane Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 h-12 text-sm bg-muted/30 border-border/60 focus:border-primary/50 rounded-xl"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
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
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-semibold">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Min 8 characters"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    className="pl-10 pr-10 h-12 text-sm bg-muted/30 border-border/60 focus:border-primary/50 rounded-xl"
                    required
                    minLength={8}
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
                {/* Strength bar */}
                {password.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= passwordStrength ? pwColors[passwordStrength] : "bg-muted"}`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {pwLabels[passwordStrength]}
                    </p>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full gradient-button h-12 font-bold text-white gap-2 rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create Free Account"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            {/* Trust line */}
            <div className="mt-5 flex items-center justify-center gap-4 text-xs text-muted-foreground/60">
              {["No credit card", "100% Free", "Cancel anytime"].map((t, i) => (
                <span key={i} className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-green-500" />
                  {t}
                </span>
              ))}
            </div>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary hover:text-primary/80 font-bold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
