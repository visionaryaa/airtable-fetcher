
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import SearchFilters, { SortOrder } from "@/components/jobs/SearchFilters";
import FavoritesTable from "@/components/FavoritesTable";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Favoris = () => {
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchQuery, setSearchQuery] = useState("");
  const [excludedWords, setExcludedWords] = useState<string[]>([]);
  const [newWord, setNewWord] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <main className="container mx-auto py-8 px-4">
          <div className="max-w-md mx-auto text-center space-y-6">
            <h2 className="text-2xl font-bold">Connectez-vous pour voir vos favoris</h2>
            <p className="text-muted-foreground">
              Vous devez être connecté pour accéder à vos offres d'emploi favorites.
            </p>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link to="/auth">Se connecter</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto py-8 px-4">
        <div className="flex flex-col space-y-6">
          <SearchFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            excludedWords={excludedWords}
            setExcludedWords={setExcludedWords}
            newWord={newWord}
            setNewWord={setNewWord}
          />

          <FavoritesTable 
            onTotalRecords={setTotalRecords} 
            sortOrder={sortOrder}
            searchQuery={searchQuery}
            excludedWords={excludedWords}
          />
        </div>
      </main>
    </div>
  );
};

export default Favoris;
