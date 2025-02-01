import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Loader2, Heart, LogOut, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AGENCY_LOGOS = [
  {
    domain: 'proselect.be',
    logo: 'https://scontent.fbru2-1.fna.fbcdn.net/v/t39.30808-6/424861504_903474951786484_6860552531033903105_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=9f87pSSpry0Q7kNvgFyrnoT&_nc_zt=23&_nc_ht=scontent.fbru2-1.fna&_nc_gid=Ak1S7cV8uODElYBPLoC2BP7&oh=00_AYD11qaICw8KiEXJHPd2k0JeIOgaHaTW9IRlvZoyE62k0g&oe=67A1CC7A'
  },
  {
    domain: 'tempo-team.be',
    logo: 'https://scontent.fbru2-1.fna.fbcdn.net/v/t39.30808-6/352321179_802641697768990_7499832421124251242_n.png?_nc_cat=110&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=GoOS2AtHBusQ7kNvgHYxTXc&_nc_zt=23&_nc_ht=scontent.fbru2-1.fna&_nc_gid=Ae_9EPVESkA8wMfDsEVP_6L&oh=00_AYCWUQSFWcAyItU6tzoRhWSwgmXvNMnk_iuILxmJsxa71Q&oe=67A19741'
  },
  {
    domain: 'adecco.be',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpHiI1ANEpe5BlJpLQDI_4M8jl1AnJciaqaw&s'
  },
  {
    domain: 'asap.be',
    logo: 'https://a.storyblok.com/f/118264/240x240/c475b21edc/asap-logo-2.png'
  },
  {
    domain: 'synergiejobs.be',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMXkqv_r78fpVwVE9xDY6rd0GfS3bMlK1sWA&s'
  },
  {
    domain: 'randstad.be',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQK5L2880dU-fMT-PjiSxVWWbwI6Vb8l3Vw6Q&s'
  },
  {
    domain: 'accentjobs.be',
    logo: 'https://scontent-bru2-1.xx.fbcdn.net/v/t39.30808-1/282401818_7471306532942250_8129507684428268966_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=103&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=V7V32kIB9kQQ7kNvgGrchjq&_nc_zt=24&_nc_ht=scontent-bru2-1.xx&_nc_gid=AxGzm78UeCGDdyODeeOkUVP&oh=00_AYCkOMbUGq7QW9APk_A0wqGGCWF4f3gkf8SaipnTsGtuZA&oe=67A1EB3A'
  }
];

const getLogoForUrl = (url: string) => {
  try {
    const urlObject = new URL(url);
    const domain = urlObject.hostname.replace('www2.', 'www.').replace('www.', '');
    const agencyInfo = AGENCY_LOGOS.find(agency => domain.includes(agency.domain));
    return agencyInfo?.logo;
  } catch (error) {
    console.error('Error parsing URL:', error);
    return null;
  }
};

const Favoris = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleAuthClick = () => {
    navigate('/auth');
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

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const removeFavorite = useMutation({
    mutationFn: async (jobLink: string) => {
      if (!user) throw new Error('Must be logged in to remove favorites');
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('job_link', jobLink)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast({
        title: "Success",
        description: "Job removed from favorites",
      });
    },
    meta: {
      onError: () => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to remove job from favorites",
        });
      }
    }
  });

  if (!user) {
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
                <a href="/favoris" className="flex items-center gap-1 hover:text-blue-400">
                  <Heart className="w-4 h-4" />
                  Favoris
                </a>
                <button className="p-2 rounded-full hover:bg-gray-700">
                  <Sun className="w-5 h-5" />
                </button>
                <Button 
                  variant="default" 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleAuthClick}
                >
                  Connexion
                </Button>
              </nav>
            </div>
          </div>
        </header>
        <div className="max-w-2xl mx-auto text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Connexion requise</h1>
          <p className="mb-6">Vous devez être connecté pour voir vos favoris.</p>
          <Button 
            onClick={() => navigate('/auth')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Se connecter
          </Button>
        </div>
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
              <a href="/favoris" className="flex items-center gap-1 hover:text-blue-400">
                <Heart className="w-4 h-4" />
                Favoris
              </a>
              <button className="p-2 rounded-full hover:bg-gray-700">
                <Sun className="w-5 h-5" />
              </button>
              <Button 
                variant="default" 
                className="bg-red-600 hover:bg-red-700"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
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
                {favorites.length} postes
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : !favorites.length ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Vous n'avez pas encore de favoris</p>
              <Button 
                onClick={() => navigate('/')}
                className="mt-4 bg-blue-600 hover:bg-blue-700"
              >
                Parcourir les offres
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg px-6">
              <table className="w-full border-collapse min-w-[800px] bg-[#1a1f2e]">
                <thead>
                  <tr className="bg-[#1E2433] text-gray-300">
                    <th className="p-6 text-left font-medium">SOURCE</th>
                    <th className="p-6 text-left font-medium">POSTE</th>
                    <th className="p-6 text-left font-medium">LIEN</th>
                    <th className="p-6 text-left font-medium">LOCALISATION</th>
                    <th className="p-6 text-left font-medium">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {favorites.map((favorite) => (
                    <tr
                      key={favorite.id}
                      className="border-b border-[#2A3041] hover:bg-[#1E2433] transition-colors bg-[#232838]"
                    >
                      <td className="p-6">
                        {favorite.job_link && (
                          <img
                            src={getLogoForUrl(favorite.job_link)}
                            alt="Agency logo"
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )}
                      </td>
                      <td className="p-6 font-medium text-white">{favorite.job_title}</td>
                      <td className="p-6">
                        <a 
                          href={favorite.job_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <Button
                            variant="default"
                            className="bg-blue-600 hover:bg-blue-700"
                            size="sm"
                          >
                            Voir l'offre
                          </Button>
                        </a>
                      </td>
                      <td className="p-6 text-gray-300">{favorite.job_location}</td>
                      <td className="p-6">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeFavorite.mutate(favorite.job_link)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Heart className="w-4 h-4 mr-2" fill="currentColor" />
                          Retirer
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Favoris;