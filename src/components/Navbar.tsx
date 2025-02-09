
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import Logo from "./Logo";
import { LogIn, LogOut, Menu, User, Home, Settings, Heart, Search } from "lucide-react";
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

  const handleMobileNavClick = (path: string) => {
    // First scroll to top
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
    // Then navigate
    navigate(path);
  };

  const mobileNavItems = [
    { to: "/", label: "Accueil", icon: Home },
    { to: "/job-search", label: "Recherche", icon: Search },
    { to: "/favoris", label: "Favoris", icon: Heart },
    { to: "/settings", label: "Paramètres", icon: Settings },
  ];

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
              <Link to="/job-search">
                <Search className="h-4 w-4 mr-2" />
                Recherche
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/favoris">
                <Heart className="h-4 w-4 mr-2" />
                Favoris
              </Link>
            </Button>
          </nav>

          {/* Mobile Navigation */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {mobileNavItems.map((item) => (
                <DropdownMenuItem key={item.to} onClick={() => handleMobileNavClick(item.to)}>
                  <div className="w-full flex items-center">
                    {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                    {item.label}
                  </div>
                </DropdownMenuItem>
              ))}
              {user && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

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

