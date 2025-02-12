
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLogoForUrl } from "@/utils/agencyLogos";
import { formatPublicationDate } from "@/utils/dateFormatting";

interface JobTableRowProps {
  record: any;
  isJobFavorited: (link: string) => boolean;
  onFavoriteToggle: (record: any) => void;
}

export const JobTableRow = ({ record, isJobFavorited, onFavoriteToggle }: JobTableRowProps) => {
  return (
    <tr className="border-b border-border hover:bg-secondary/50 transition-colors">
      <td className="p-6">
        {record.fields.lien && (
          <img
            src={getLogoForUrl(record.fields.lien)}
            alt="Agency logo"
            className="w-8 h-8 rounded-full object-cover"
          />
        )}
      </td>
      <td className="p-6 font-medium text-foreground">{record.fields.Poste}</td>
      <td className="p-6">
        <a 
          href={record.fields.lien} 
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
      <td className="p-6 text-muted-foreground">{record.fields.Localisation}</td>
      <td className="p-6 text-muted-foreground">
        {formatPublicationDate(record.fields["Publication date"])}
      </td>
      <td className="p-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className={`hover:text-red-500 ${isJobFavorited(record.fields.lien) ? 'text-red-500' : ''}`}
          onClick={() => onFavoriteToggle(record)}
        >
          <Heart className="w-5 h-5" fill={isJobFavorited(record.fields.lien) ? "currentColor" : "none"} />
        </Button>
      </td>
    </tr>
  );
};
