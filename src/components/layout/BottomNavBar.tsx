import { Link, useLocation } from "react-router-dom";

const navItems = [
  { icon: "explore", label: "Explore", path: "/explore" },
  { icon: "luggage", label: "Trips", path: "/trips" },
  { icon: "book", label: "Journal", path: "/journal" },
  { icon: "person", label: "Profile", path: "/dashboard" },
];

export function BottomNavBar() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 w-full h-[64px] z-50 bg-[#0F172A] shadow-[0_-4px_12px_rgba(0,0,0,0.1)] flex justify-around items-center px-2">
      {navItems.map((item) => {
        const active = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center transition-colors ${
              active
                ? "text-blue-400 scale-110"
                : "text-slate-400 active:bg-slate-800"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={
                active
                  ? { fontVariationSettings: "'FILL' 1" }
                  : undefined
              }
            >
              {item.icon}
            </span>
            <span className="font-body text-[10px] font-medium uppercase tracking-widest mt-1">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
