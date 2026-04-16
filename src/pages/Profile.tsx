import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  User,
  MapPin,
  Globe,
  Star,
  Trophy,
  Camera,
  Settings,
  Plane,
  BookOpen,
  Edit2,
  Mountain,
  Heart,
  Flag,
  ChevronRight,
  Zap,
  Shield,
  Bell,
  CreditCard,
  HelpCircle,
  LogOut,
  Moon,
  Sun,
  Languages,
  Link2,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const MOCK_USER = {
  name: "Jai Kumar",
  email: "jai@example.com",
  avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Jai",
  bio: "Solo traveler chasing sunrises across Asia 🌅",
  travelStyle: "solo",
  homeCity: "Mumbai, India",
  tripsCount: 12,
  countriesCount: 8,
  memoriesCount: 34,
  achievements: [
    {
      id: "1",
      title: "First Trip",
      icon: Plane,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      id: "2",
      title: "5 Countries",
      icon: Flag,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      id: "3",
      title: "Solo Explorer",
      icon: Mountain,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
    {
      id: "4",
      title: "Memory Keeper",
      icon: Heart,
      color: "text-rose-400",
      bg: "bg-rose-400/10",
    },
    {
      id: "5",
      title: "Asia Traveler",
      icon: Globe,
      color: "text-violet-400",
      bg: "bg-violet-400/10",
    },
  ],
  visitedCountries: [
    "Japan",
    "Thailand",
    "Bali",
    "Vietnam",
    "Maldives",
    "India",
    "Singapore",
    "Nepal",
  ],
};

type Section =
  | "profile"
  | "settings"
  | "notifications"
  | "privacy"
  | "connected"
  | "language"
  | "payment"
  | "help"
  | "about";

const SETTINGS_GROUPS = [
  {
    label: "Account",
    items: [
      { id: "notifications" as Section, icon: Bell, label: "Notifications" },
      { id: "privacy" as Section, icon: Shield, label: "Privacy" },
      { id: "connected" as Section, icon: Link2, label: "Connected Accounts" },
    ],
  },
  {
    label: "Preferences",
    items: [
      {
        id: "language" as Section,
        icon: Languages,
        label: "Language & Region",
      },
      { id: "payment" as Section, icon: CreditCard, label: "Payment Methods" },
    ],
  },
  {
    label: "Support",
    items: [
      { id: "help" as Section, icon: HelpCircle, label: "Help & Support" },
      { id: "about" as Section, icon: Star, label: "About & Legal" },
    ],
  },
];

export default function Profile() {
  const [section, setSection] = useState<Section>("profile");
  const [isEditing, setIsEditing] = useState(false);
  const { colorMode, setColorMode } = useTheme();

  return (
    <Layout>
      <div className="min-h-screen relative overflow-hidden pt-28 pb-16">
        <div className="absolute inset-0 mesh-gradient opacity-20 pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-5xl">
          {section === "profile" ? (
            <ProfileView
              onSettings={() => setSection("settings")}
              onEdit={() => setIsEditing(true)}
            />
          ) : section === "settings" ? (
            <SettingsView
              onBack={() => setSection("profile")}
              onNavigate={setSection}
              colorMode={colorMode}
              setColorMode={setColorMode}
            />
          ) : section === "notifications" ? (
            <NotificationsView onBack={() => setSection("settings")} />
          ) : section === "payment" ? (
            <PaymentView onBack={() => setSection("settings")} />
          ) : section === "help" ? (
            <HelpView onBack={() => setSection("settings")} />
          ) : (
            <GenericView
              title={section}
              onBack={() => setSection("settings")}
            />
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && <EditProfileModal onClose={() => setIsEditing(false)} />}
      </AnimatePresence>
    </Layout>
  );
}

function ProfileView({
  onSettings,
  onEdit,
}: {
  onSettings: () => void;
  onEdit: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header card */}
      <div className="bento-card p-6 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-sky-500/5 to-transparent pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl overflow-hidden ring-4 ring-primary/20 shadow-xl">
              <img
                src={MOCK_USER.avatar}
                alt={MOCK_USER.name}
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-primary flex items-center justify-center shadow-lg">
              <Camera className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display font-bold text-2xl">
                {MOCK_USER.name}
              </h1>
              <span className="badge-azure capitalize">
                {MOCK_USER.travelStyle}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {MOCK_USER.email}
            </p>
            <p className="text-sm mt-1.5 text-foreground/80">{MOCK_USER.bio}</p>
            <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              {MOCK_USER.homeCity}
            </div>
          </div>
          {/* Actions */}
          <div className="flex gap-2 sm:flex-col">
            <Button
              onClick={onEdit}
              variant="outline"
              size="sm"
              className="rounded-xl gap-1.5 text-xs"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </Button>
            <Button
              onClick={onSettings}
              variant="ghost"
              size="sm"
              className="rounded-xl gap-1.5 text-xs"
            >
              <Settings className="w-3.5 h-3.5" /> Settings
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-border/40">
          {[
            { value: MOCK_USER.tripsCount, label: "Trips", icon: Plane },
            {
              value: MOCK_USER.countriesCount,
              label: "Countries",
              icon: Globe,
            },
            {
              value: MOCK_USER.memoriesCount,
              label: "Memories",
              icon: BookOpen,
            },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <span className="font-display font-bold text-2xl">
                  {s.value}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Countries visited */}
      <div className="bento-card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold">Countries Visited</h2>
          <span className="badge-azure">
            {MOCK_USER.visitedCountries.length} countries
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {MOCK_USER.visitedCountries.map((c) => (
            <span
              key={c}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-muted/50 border border-border/50"
            >
              <Flag className="w-3 h-3 text-primary" />
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="bento-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h2 className="font-display font-semibold">Achievements</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {MOCK_USER.achievements.map((a) => {
            const Icon = a.icon;
            return (
              <div
                key={a.id}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl ${a.bg} border border-border/30`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${a.bg}`}
                >
                  <Icon className={`w-5 h-5 ${a.color}`} />
                </div>
                <span className="text-xs font-semibold text-center">
                  {a.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function SettingsView({
  onBack,
  onNavigate,
  colorMode,
  setColorMode,
}: {
  onBack: () => void;
  onNavigate: (s: Section) => void;
  colorMode: string;
  setColorMode: (m: "light" | "dark") => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={onBack}
          className="p-2 rounded-xl hover:bg-muted/50 text-muted-foreground"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
        </button>
        <h1 className="font-display font-bold text-2xl">Settings</h1>
      </div>

      {/* Appearance */}
      <div className="bento-card p-5 mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Appearance
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {colorMode === "dark" ? (
              <Moon className="w-5 h-5 text-primary" />
            ) : (
              <Sun className="w-5 h-5 text-amber-400" />
            )}
            <div>
              <p className="text-sm font-semibold">App Theme</p>
              <p className="text-xs text-muted-foreground capitalize">
                {colorMode} mode
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-1 bg-muted/40 rounded-xl border border-border/50">
            <button
              onClick={() => setColorMode("light")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${colorMode === "light" ? "bg-amber-400/20 text-amber-500" : "text-muted-foreground"}`}
            >
              <Sun className="w-3.5 h-3.5" /> Light
            </button>
            <button
              onClick={() => setColorMode("dark")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${colorMode === "dark" ? "bg-primary/20 text-primary" : "text-muted-foreground"}`}
            >
              <Moon className="w-3.5 h-3.5" /> Dark
            </button>
          </div>
        </div>
      </div>

      {/* Settings groups */}
      {SETTINGS_GROUPS.map((group) => (
        <div key={group.label} className="bento-card p-2 mb-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-3 py-2">
            {group.label}
          </p>
          {group.items.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-muted/50 transition-all group ${i !== group.items.length - 1 ? "border-b border-border/30" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-semibold group-hover:text-foreground">
                    {item.label}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            );
          })}
        </div>
      ))}

      {/* Log out */}
      <div className="bento-card p-2">
        <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-500/10 transition-all group">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
            <LogOut className="w-4 h-4 text-red-400" />
          </div>
          <span className="text-sm font-semibold text-red-400">Log out</span>
        </button>
      </div>
    </motion.div>
  );
}

function NotificationsView({ onBack }: { onBack: () => void }) {
  const [toggles, setToggles] = useState({
    tripReminders: true,
    dealAlerts: true,
    groupActivity: true,
    journalReminders: false,
  });
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={onBack}
          className="p-2 rounded-xl hover:bg-muted/50 text-muted-foreground"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
        </button>
        <h1 className="font-display font-bold text-2xl">Notifications</h1>
      </div>
      <div className="bento-card p-5 space-y-4">
        {Object.entries(toggles).map(([key, val]) => (
          <div
            key={key}
            className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
          >
            <div>
              <p className="text-sm font-semibold capitalize">
                {key.replace(/([A-Z])/g, " $1")}
              </p>
              <p className="text-xs text-muted-foreground">
                Receive push notifications
              </p>
            </div>
            <button
              onClick={() =>
                setToggles((t) => ({ ...t, [key]: !t[key as keyof typeof t] }))
              }
              className={`w-11 h-6 rounded-full transition-colors relative ${val ? "bg-primary" : "bg-muted/60"}`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${val ? "translate-x-5" : ""}`}
              />
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function PaymentView({ onBack }: { onBack: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={onBack}
          className="p-2 rounded-xl hover:bg-muted/50 text-muted-foreground"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
        </button>
        <h1 className="font-display font-bold text-2xl">Payment Methods</h1>
      </div>
      <div className="text-center py-20 bento-card">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-muted/40 border border-border/40 flex items-center justify-center mb-6">
          <CreditCard className="w-9 h-9 text-muted-foreground/40" />
        </div>
        <h3 className="font-display font-bold text-xl mb-2">
          No payment methods yet
        </h3>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6">
          Add a card to book flights and hotels without leaving the app.
        </p>
        <Button className="gradient-button text-white rounded-xl gap-2">
          <Zap className="w-4 h-4" /> Add a card
        </Button>
      </div>
    </motion.div>
  );
}

function HelpView({ onBack }: { onBack: () => void }) {
  const faqs = [
    {
      q: "How do I create a trip?",
      a: "Tap the + button in the Trips tab or use the AI Trip Builder to generate a full itinerary from a text prompt.",
    },
    {
      q: "Can I share my trip with others?",
      a: "Yes! Open the trip, go to the Group tab, tap Invite, and share the link or send an email invite.",
    },
    {
      q: "How does the expense splitter work?",
      a: "Add expenses in the Expenses tab. Choose equal or custom splits, and we'll track who owes whom.",
    },
    {
      q: "Is my journal private?",
      a: "By default yes. You can change each entry's visibility to Friends or Public individually.",
    },
  ];
  const [open, setOpen] = useState<number | null>(null);

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={onBack}
          className="p-2 rounded-xl hover:bg-muted/50 text-muted-foreground"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
        </button>
        <h1 className="font-display font-bold text-2xl">Help & Support</h1>
      </div>
      <div className="bento-card p-5 mb-4">
        <h2 className="font-semibold text-lg mb-4">
          Frequently Asked Questions
        </h2>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border border-border/40 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
              >
                <span className="text-sm font-semibold">{faq.q}</span>
                <ChevronRight
                  className={`w-4 h-4 text-muted-foreground transition-transform ${open === i ? "rotate-90" : ""}`}
                />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-4 pb-4 text-sm text-muted-foreground">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
      <div className="bento-card p-5 text-center">
        <p className="text-sm text-muted-foreground mb-3">Still need help?</p>
        <Button variant="outline" className="rounded-xl gap-2">
          <HelpCircle className="w-4 h-4" /> Chat with Support
        </Button>
      </div>
    </motion.div>
  );
}

function GenericView({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={onBack}
          className="p-2 rounded-xl hover:bg-muted/50 text-muted-foreground"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
        </button>
        <h1 className="font-display font-bold text-2xl capitalize">
          {title.replace(/([A-Z])/g, " $1")}
        </h1>
      </div>
      <div className="bento-card p-8 text-center text-muted-foreground">
        <Settings className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p className="text-sm">This section is coming soon!</p>
      </div>
    </motion.div>
  );
}

function EditProfileModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState(MOCK_USER.name);
  const [bio, setBio] = useState(MOCK_USER.bio);
  const [style, setStyle] = useState(MOCK_USER.travelStyle);
  const styles = ["solo", "couple", "family", "group", "business"];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        className="w-full max-w-lg glass-card rounded-3xl border border-border/50 p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-xl">Tell us about you</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-muted/50 text-muted-foreground"
          >
            ✕
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          We'll use this to personalise your recommendations.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
              Display Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 glass-card rounded-xl border border-border/60 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 glass-card rounded-xl border border-border/60 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
              Travel Style
            </label>
            <div className="flex flex-wrap gap-2">
              {styles.map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all capitalize ${style === s ? "bg-primary/10 border-primary/40 text-primary" : "border-border/50 text-muted-foreground hover:border-primary/30"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-xl"
          >
            Skip for now
          </Button>
          <Button
            className="flex-1 gradient-button text-white rounded-xl font-bold"
            onClick={onClose}
          >
            Continue
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
