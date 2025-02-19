
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SortOrder = 'asc' | 'desc' | 'agency_asc' | 'agency_desc' | 'date_asc' | 'date_desc';

interface SearchFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortOrder?: SortOrder;
  setSortOrder: (order: SortOrder) => void;
  excludedWords: string[];
  setExcludedWords: (words: string[]) => void;
  newWord: string;
  setNewWord: (word: string) => void;
}

const SearchFilters = ({
  searchQuery,
  setSearchQuery,
  sortOrder,
  setSortOrder,
  excludedWords,
  setExcludedWords,
  newWord,
  setNewWord,
}: SearchFiltersProps) => {
  const handleAddWord = () => {
    if (newWord && !excludedWords.includes(newWord)) {
      setExcludedWords([...excludedWords, newWord]);
      setNewWord("");
    }
  };

  const handleRemoveWord = (wordToRemove: string) => {
    setExcludedWords(excludedWords.filter(word => word !== wordToRemove));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Input
              type="text"
              placeholder="Rechercher un poste..."
              className="w-full bg-background border-input focus:border-ring"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <Select
          value={sortOrder}
          onValueChange={(value: SortOrder) => setSortOrder(value)}
        >
          <SelectTrigger className="w-[200px] bg-background border-input">
            <SelectValue placeholder="Trier par..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Postes A-Z</SelectItem>
            <SelectItem value="desc">Postes Z-A</SelectItem>
            <SelectItem value="agency_asc">Agences A-Z</SelectItem>
            <SelectItem value="agency_desc">Agences Z-A</SelectItem>
            <SelectItem value="date_asc">Date (plus ancien)</SelectItem>
            <SelectItem value="date_desc">Date (plus récent)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-medium">Mots à exclure des résultats</h3>
        <div className="flex items-center gap-2">
          <Input
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            placeholder="Ajouter un mot à exclure"
            className="bg-background border-input text-foreground"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddWord();
              }
            }}
          />
          <Button 
            onClick={handleAddWord} 
            className="bg-primary hover:bg-primary/90"
            size="icon"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {excludedWords.map((word) => (
            <div
              key={word}
              className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full"
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
  );
};

export default SearchFilters;
