import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Favoris = () => {
  const [favorites, setFavorites] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    getFavorites();
  }, []);

  const getFavorites = async () => {
    const { data, error } = await supabase
      .from("favorites")
      .select("*");

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer vos favoris",
        variant: "destructive",
      });
      return;
    }

    setFavorites(data);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Mes favoris</h1>
      <div className="grid gap-4">
        {favorites.map((favorite: any) => (
          <div
            key={favorite.id}
            className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold">{favorite.job_title}</h2>
            {favorite.job_location && (
              <p className="text-muted-foreground">{favorite.job_location}</p>
            )}
            <a
              href={favorite.job_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline mt-2 inline-block"
            >
              Voir l'offre
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Favoris;