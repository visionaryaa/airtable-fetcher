
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface JobControlsProps {
  totalRecords: number;
  isScrapingLoading: boolean;
  isDeletingLoading: boolean;
  onScrape: () => void;
  onDelete: () => void;
}

const JobControls = ({
  totalRecords,
  isScrapingLoading,
  isDeletingLoading,
  onScrape,
  onDelete,
}: JobControlsProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold">Offres Logistiques Liège</h2>
        <span className="px-3 py-1 bg-blue-600 rounded-full text-sm text-white">
          {totalRecords} postes
        </span>
      </div>
      <div className="flex gap-2 md:gap-4">
        <Button
          onClick={onScrape}
          disabled={isScrapingLoading}
          className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
        >
          {isScrapingLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Recherche...
            </>
          ) : (
            'Rechercher'
          )}
        </Button>

        <Button
          onClick={onDelete}
          disabled={isDeletingLoading}
          variant="destructive"
          className="bg-red-600 hover:bg-red-700 whitespace-nowrap"
        >
          {isDeletingLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Réinitialisation...
            </>
          ) : (
            'Réinitialiser la base'
          )}
        </Button>
      </div>
    </div>
  );
};

export default JobControls;
