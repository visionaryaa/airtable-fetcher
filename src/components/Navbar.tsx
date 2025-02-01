import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import Logo from "./Logo";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link to="/" className="mr-6 flex items-center space-x-2">
          <Logo />
        </Link>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link to="/jobs">Offres d'emploi</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/favoris">Favoris</Link>
            </Button>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Navbar;