import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Heart, LogOut, User, Home, Menu, X } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la déconnexion.",
      });
    }
  };

  const handleAuthClick = () => {
    navigate('/auth');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="border-b border-border relative">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
            </svg>
            <h1 className="text-xl font-semibold">Intérim centrale</h1>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-foreground hover:bg-accent rounded-lg"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="/" className="flex items-center gap-1 hover:text-blue-400">
              <Home className="w-4 h-4" />
              Accueil
            </a>
            <a href="/jobs" className="hover:text-blue-400">Offres</a>
            <a 
              href="/favoris" 
              className="flex items-center gap-1 hover:text-blue-400"
            >
              <Heart className="w-4 h-4" />
              Favoris
            </a>
            <ThemeToggle />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative flex items-center gap-2 border border-border hover:bg-accent rounded-lg px-4 py-2"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden md:inline">{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-500">
                    <LogOut className="w-4 h-4 mr-2" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="default" 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleAuthClick}
              >
                Connexion
              </Button>
            )}
          </nav>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <nav className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border z-50">
            <div className="flex flex-col space-y-4 p-4">
              <a href="/" className="flex items-center gap-1 hover:text-blue-400">
                <Home className="w-4 h-4" />
                Accueil
              </a>
              <a href="/jobs" className="hover:text-blue-400">Offres</a>
              <a 
                href="/favoris" 
                className="flex items-center gap-1 hover:text-blue-400"
              >
                <Heart className="w-4 h-4" />
                Favoris
              </a>
              <div className="flex items-center justify-between">
                <ThemeToggle />
                {user ? (
                  <Button 
                    variant="ghost" 
                    onClick={handleSignOut}
                    className="text-red-500"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Déconnexion
                  </Button>
                ) : (
                  <Button 
                    variant="default" 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={handleAuthClick}
                  >
                    Connexion
                  </Button>
                )}
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;