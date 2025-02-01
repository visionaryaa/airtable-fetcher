import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import SearchFilters from "@/components/jobs/SearchFilters";
import FavoritesTable from "@/components/FavoritesTable";

const Favoris = () => {
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [excludedWords, setExcludedWords] = useState<string[]>([]);
  const [newWord, setNewWord] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <main className="container mx-auto py-8 px-4">
          <div className="text-center py-8">
            Veuillez vous connecter pour voir vos favoris.
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