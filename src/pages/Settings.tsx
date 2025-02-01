import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, X, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

const Settings = () => {
  const [newWord, setNewWord] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const { data: userFilters, isLoading } = useQuery({
    queryKey: ['user-filters', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('user_filters')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const updateFilters = useMutation({
    mutationFn: async (words: string[]) => {
      if (!user) throw new Error('Must be logged in');
      
      if (userFilters) {
        const { error } = await supabase
          .from('user_filters')
          .update({ excluded_words: words })
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_filters')
          .insert({ user_id: user.id, excluded_words: words });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-filters'] });
      toast({
        title: "Succès",
        description: "Vos filtres ont été mis à jour",
      });
    },
    meta: {
      onError: () => {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de mettre à jour vos filtres",
        });
      }
    }
  });

  const handleAddWord = () => {
    if (!newWord) return;
    const currentWords = userFilters?.excluded_words || [];
    if (!currentWords.includes(newWord)) {
      updateFilters.mutate([...currentWords, newWord]);
      setNewWord("");
    }
  };

  const handleRemoveWord = (wordToRemove: string) => {
    const currentWords = userFilters?.excluded_words || [];
    updateFilters.mutate(currentWords.filter(word => word !== wordToRemove));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Paramètres</h1>
      
      <div className="bg-card p-6 rounded-lg space-y-6 max-w-2xl">
        <div>
          <h2 className="text-lg font-medium mb-4">Mots à exclure par défaut</h2>
          <p className="text-muted-foreground mb-4">
            Ces mots seront automatiquement exclus de vos résultats de recherche à chaque connexion.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                placeholder="Ajouter un mot à exclure"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddWord();
                  }
                }}
              />
              <Button 
                onClick={handleAddWord}
                size="icon"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {userFilters?.excluded_words.map((word) => (
                <div
                  key={word}
                  className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full"
                >
                  <span>{word}</span>
                  <button
                    onClick={() => handleRemoveWord(word)}
                    className="text-muted-foreground hover:text-destructive ml-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;