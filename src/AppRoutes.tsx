import { Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import Home from "@/pages/Home";
import Auth from "@/pages/Auth";
import Favoris from "@/pages/Favoris";
import NotFound from "@/pages/NotFound";
import { useAuth } from "./components/AuthProvider";

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        {user && <Route path="/favoris" element={<Favoris />} />}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;