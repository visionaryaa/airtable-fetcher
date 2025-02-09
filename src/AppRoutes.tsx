
import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useIsMobile } from "./hooks/use-mobile";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Favoris from "./pages/Favoris";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import JobSearch from "./pages/JobSearch";

const AppRoutes = () => {
  const location = useLocation();
  const isMobile = useIsMobile();

  // Scroll to top on route change
  useEffect(() => {
    if (isMobile) {
      // Force layout recalculation before scrolling on mobile
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'instant'
        });
      }, 0);
    } else {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
    }
  }, [location.pathname, isMobile]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/favoris" element={<Favoris />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/job-search" element={<JobSearch />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

export default AppRoutes;
