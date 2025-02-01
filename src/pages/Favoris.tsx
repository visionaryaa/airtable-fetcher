import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Heart, LogOut, Sun, Trash2, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AGENCY_LOGOS: { [key: string]: string } = {
  "Accent": "https://www.acc.eu/sites/default/files/logo/logo-accent.svg",
  "Adecco": "https://logos-world.net/wp-content/uploads/2021/02/Adecco-Logo.png",
  "Manpower": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/ManpowerGroup_logo.svg/2560px-ManpowerGroup_logo.svg.png",
  "Randstad": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Randstad_Logo.svg/2560px-Randstad_Logo.svg.png",
  "Start People": "https://www.startpeople.be/sites/default/files/2019-01/logo-start-people.svg",
};

const Favoris = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('favorites')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;
        setFavorites(data || []);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger vos favoris.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [user, toast]);

  const handleRemoveFavorite = async (id: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFavorites(favorites.filter(fav => fav.id !== id));
      toast({
        title: "Favori supprimé",
        description: "L'offre a été retirée de vos favoris.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer le favori.",
      });
    }
  };

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

  if (!user) {
    return (
      <div className="min-h-screen bg-[#1a1f2e] text-white flex flex-col items-center justify-center p-4">
        <p className="text-xl mb-4">Veuillez vous connecter pour accéder à vos favoris</p>
        <Button onClick={handleAuthClick} className="bg-blue-600 hover:bg-blue-700">
          Connexion
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1f2e] text-white">
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
              </svg>
              <h1 className="text-xl font-semibold">JobScraper Pro</h1>
            </div>
            <nav className="flex items-center gap-6">
              <a href="/" className="hover:text-blue-400">Offres</a>
              <a 
                href="/favoris" 
                className="flex items-center gap-1 hover:text-blue-400"
              >
                <Heart className="w-4 h-4" />
                Favoris
              </a>
              <button className="p-2 rounded-full hover:bg-gray-700">
                <Sun className="w-5 h-5" />
              </button>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative flex items-center gap-2">
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
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">Mes Favoris</h2>
              <span className="px-3 py-1 bg-blue-600 rounded-full text-sm">
                {favorites.length} offres
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Aucune offre dans vos favoris</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((favorite) => (
                <div
                  key={favorite.id}
                  className="bg-[#2a2f3d] rounded-lg p-6 space-y-4 relative group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{favorite.title}</h3>
                      <p className="text-gray-400">{favorite.company}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-red-500"
                      onClick={() => handleRemoveFavorite(favorite.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-300">{favorite.location}</p>
                    <div className="flex items-center gap-2">
                      {favorite.agency && AGENCY_LOGOS[favorite.agency] && (
                        <img
                          src={AGENCY_LOGOS[favorite.agency]}
                          alt={favorite.agency}
                          className="h-6 object-contain"
                        />
                      )}
                    </div>
                  </div>
                  <a
                    href={favorite.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0"
                  >
                    <span className="sr-only">Voir l'offre</span>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Favoris;