import { ReactNode } from "react";
import { TopNavBar } from "./TopNavBar";
import { Footer } from "./Footer";
import { BottomNavBar } from "./BottomNavBar";

interface LayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
}

export function Layout({ children, hideFooter = false }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNavBar />
      <main className="flex-1 pt-[72px]">{children}</main>
      {!hideFooter && <Footer />}
      <BottomNavBar />
    </div>
  );
}
