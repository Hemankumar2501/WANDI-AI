import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Compass, Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/update-password`,
      });
      
      if (error) throw error;
      
      setIsSent(true);
      toast.success("Security code sent! Check your inbox.");
    } catch (error: any) {
      toast.error(error.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout hideFooter>
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-background">
        {/* Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/5 rounded-full blur-[80px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md bg-surface-container-lowest/50 backdrop-blur-xl border border-outline-variant/30 p-8 md:p-10 rounded-[32px] shadow-2xl relative z-10"
        >
          <div className="flex justify-center mb-8">
            <Link to="/" className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-sky-400 flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
              <Compass className="w-7 h-7 text-white" />
            </Link>
          </div>

          {!isSent ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-display font-bold tracking-tight mb-3">Reset Password</h1>
                <p className="text-muted-foreground text-sm">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-14 text-base bg-muted/40 border-outline-variant/60 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-2xl transition-all"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-primary-container hover:bg-surface-tint text-white font-bold rounded-2xl flex items-center justify-center gap-2 transform active:scale-95 transition-all shadow-md shadow-primary-container/20"
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }} 
                className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-3">Check your email</h2>
              <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
                We've sent password reset instructions to <br/>
                <span className="font-semibold text-foreground">{email}</span>
              </p>
              <Link to="/login">
                <Button variant="outline" className="w-full h-14 rounded-2xl font-bold border-outline-variant/50 hover:bg-muted/50 transition-colors">
                  Return to Login
                </Button>
              </Link>
            </div>
          )}

          {!isSent && (
            <div className="mt-8 text-center text-sm">
              <Link to="/login" className="text-muted-foreground hover:text-foreground font-semibold transition-colors flex items-center justify-center gap-2">
                <ArrowRight className="w-4 h-4 rotate-180" /> Back to Sign In
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
