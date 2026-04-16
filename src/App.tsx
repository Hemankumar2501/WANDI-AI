import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ScrollToTop } from "@/components/ScrollToTop";

import Index from "./pages/Index";
import Explore from "./pages/Explore";
import FlightBooking from "./pages/FlightBooking";
import HotelBooking from "./pages/HotelBooking";
import BookingConfirmation from "./pages/BookingConfirmation";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Trips from "./pages/Trips";
import TripMap from "./pages/TripMap";
import TripEdit from "./pages/TripEdit";
import Expenses from "./pages/Expenses";
import Journal from "./pages/Journal";
import NewJournal from "./pages/NewJournal";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import AIModel from "./pages/AIModel";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <ScrollToTop />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/plan" element={<AIModel />} />
            <Route path="/flights" element={<FlightBooking />} />
            <Route path="/hotels" element={<HotelBooking />} />
            <Route path="/booking/confirm" element={<BookingConfirmation />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/trips/map" element={<TripMap />} />
            <Route path="/trips/edit" element={<TripEdit />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/journal/new" element={<NewJournal />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
