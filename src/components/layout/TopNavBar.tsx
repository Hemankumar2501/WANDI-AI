import { Link, useLocation } from "react-router-dom";

export function TopNavBar() {
  const location = useLocation();
  const isActive = (path: string) =>
    location.pathname === path
      ? "text-blue-700 font-semibold"
      : "text-slate-600 hover:text-blue-600 font-medium";

  return (
    <nav className="fixed top-0 w-full h-[72px] z-50 bg-white/70 backdrop-blur-xl shadow-sm flex justify-between items-center px-8">
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
        <Link
          to="/"
          className="text-xl font-bold text-slate-900 flex items-center gap-2 font-headline"
        >
          <span className="material-symbols-outlined text-primary-container text-3xl">
            explore
          </span>
          WanderWiseAI
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/plan"
            className={"font-headline text-sm tracking-tight transition-colors " + isActive("/plan")}
          >
            AI Expert
          </Link>
          <Link
            to="/explore"
            className={`font-headline text-sm tracking-tight transition-colors ${isActive("/explore")}`}
          >
            Explore
          </Link>
          <Link
            to="/trips"
            className={`font-headline text-sm tracking-tight transition-colors ${isActive("/trips")}`}
          >
            Trips
          </Link>
          <Link
            to="/journal"
            className={`font-headline text-sm tracking-tight transition-colors ${isActive("/journal")}`}
          >
            Journal
          </Link>
          <Link
            to="/flights"
            className={`font-headline text-sm tracking-tight transition-colors ${isActive("/flights")}`}
          >
            Flights
          </Link>
          <Link
            to="/hotels"
            className={`font-headline text-sm tracking-tight transition-colors ${isActive("/hotels")}`}
          >
            Hotels
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-slate-600 font-medium text-sm px-4 py-2 transition-transform active:scale-95 duration-200"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="bg-primary-container text-on-primary px-6 py-2.5 rounded-full font-semibold text-sm transition-transform active:scale-90 duration-200"
          >
            Get started free
          </Link>
        </div>
      </div>
    </nav>
  );
}
