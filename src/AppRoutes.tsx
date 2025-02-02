import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Favoris from "./pages/Favoris";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import JobSearch from "./pages/JobSearch";

const AppRoutes = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Index />} />
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