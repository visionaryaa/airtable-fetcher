import { Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import Home from "@/pages/Home";
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import Favoris from "@/pages/Favoris";
import NotFound from "@/pages/NotFound";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/components/AuthProvider";

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/offres" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/favoris" element={user ? <Favoris /> : <Auth />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default AppRoutes;