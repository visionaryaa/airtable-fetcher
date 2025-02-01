import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Favoris = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: favorites, isLoading, refetch } = useQuery({
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

  const handleRemoveFavorite = async (id: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Vous devez être connecté pour supprimer un favori.",
      });
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Favori supprimé",
        description: "Le favori a été supprimé avec succès.",
      });
      refetch();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du favori.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#1a1f2e] text-white p-8">
        <div className="max-w-2xl mx-auto text-center">
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
    <div className="min-h-screen bg-[#1a1f2e] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Mes Favoris</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : !favorites?.length ? (
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
          <div className="grid gap-4">
            {favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="bg-[#2a2f3d] p-4 rounded-lg flex items-center justify-between"
              >
                <div>
                  <h3 className="font-semibold">{favorite.job_title}</h3>
                  {favorite.job_location && (
                    <p className="text-sm text-gray-400 mt-1">
                      {favorite.job_location}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={favorite.job_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                  <Button
                    variant="destructive"
                    size="icon"
                    disabled={isDeleting}
                    onClick={() => handleRemoveFavorite(favorite.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favoris;