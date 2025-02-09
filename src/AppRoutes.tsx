
import { Routes, Route, useLocation } from "react-router-dom";
import { useLayoutEffect } from "react";
import { useIsMobile } from "./hooks/use-mobile";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Favoris from "./pages/Favoris";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import JobSearch from "./pages/JobSearch";

const ScrollToTop = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  useLayoutEffect(() => {
    // Reset scroll position immediately when route changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Use instant to prevent any smooth scrolling animation
    });
    
    // Force the scroll reset again after a frame to ensure it works
    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
    });
  }, [location.pathname]); // Only depend on pathname changes

  return null;
};

const AppRoutes = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">
        <ScrollToTop />
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

