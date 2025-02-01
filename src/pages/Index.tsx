import { useState } from "react";
import AirtableTable from "@/components/AirtableTable";
import { Button } from "@/components/ui/button";
import FilterDialog from "@/components/FilterDialog";
import { Filter } from "lucide-react";

const Index = () => {
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [excludedWords, setExcludedWords] = useState<string[]>([]);

  const handleSortToggle = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Offres d'emploi ({totalRecords})</h1>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowFilterDialog(true)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filtres
            </Button>
            <Button
              variant="outline"
              onClick={handleSortToggle}
            >
              Trier {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher une offre..."
            className="w-full p-4 rounded-lg border bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <FilterDialog
          open={showFilterDialog}
          onOpenChange={setShowFilterDialog}
          excludedWords={excludedWords}
          onConfirm={setExcludedWords}
        />

        <AirtableTable
          onTotalRecords={setTotalRecords}
          sortOrder={sortOrder}
          searchQuery={searchQuery}
          excludedWords={excludedWords}
        />
      </div>
    </div>
  );
};

export default Index;