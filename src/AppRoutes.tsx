
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
    const scrollToTop = () => {
      if (isMobile) {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'instant'
        });
      } else {
        window.scrollTo(0, 0);
      }
    };

    // Execute scroll immediately
    scrollToTop();
    
    // And also after a short delay to ensure all content is rendered
    const timeoutId = setTimeout(scrollToTop, 100);

    return () => clearTimeout(timeoutId);
  }, [location.pathname, isMobile]);

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

