import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import Logo from "./Logo";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LogIn, LogOut, Menu, User, Home, Settings, Heart } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link to="/" className="mr-6 flex items-center space-x-2">
          <Logo />
        </Link>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Accueil
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/jobs">Offres d'emploi</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/favoris">
                <Heart className="h-4 w-4 mr-2" />
                Favoris
              </Link>
            </Button>
          </nav>

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="flex flex-col space-y-4">
                <Link to="/" className="text-foreground/60 hover:text-foreground">
                  <Home className="h-4 w-4 inline-block mr-2" />
                  Accueil
                </Link>
                <Link to="/jobs" className="text-foreground/60 hover:text-foreground">
                  Offres d'emploi
                </Link>
                <Link to="/favoris" className="text-foreground/60 hover:text-foreground">
                  <Heart className="h-4 w-4 inline-block mr-2" />
                  Favoris
                </Link>
                {user && (
                  <Link to="/settings" className="text-foreground/60 hover:text-foreground">
                    <Settings className="h-4 w-4 inline-block mr-2" />
                    Paramètres
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Account Section */}
          <div className="flex items-center space-x-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                    <span className="sr-only">Account menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="text-muted-foreground">
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Paramètres</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Déconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" asChild>
                <Link to="/auth">
                  <LogIn className="h-5 w-5" />
                  <span className="sr-only">Login</span>
                </Link>
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;