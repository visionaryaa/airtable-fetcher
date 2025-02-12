
import { Heart } from "lucide-react";
import { MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getLogoForUrl } from "@/utils/agencyLogos";
import { formatPublicationDate } from "@/utils/dateFormatting";

interface JobCardProps {
  record: any;
  isJobFavorited: (link: string) => boolean;
  onFavoriteToggle: (record: any) => void;
}

export const JobCard = ({ record, isJobFavorited, onFavoriteToggle }: JobCardProps) => {
  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {record.fields.lien && (
              <img
                src={getLogoForUrl(record.fields.lien)}
                alt="Agency logo"
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <h3 className="font-medium text-foreground">{record.fields.Poste}</h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {record.fields.Localisation}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {formatPublicationDate(record.fields["Publication date"])}
          </div>
          <div className="flex items-center justify-between">
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
            <Button 
              variant="ghost" 
              size="sm" 
              className={`hover:text-red-500 ${isJobFavorited(record.fields.lien) ? 'text-red-500' : ''}`}
              onClick={() => onFavoriteToggle(record)}
            >
              <Heart className="w-5 h-5" fill={isJobFavorited(record.fields.lien) ? "currentColor" : "none"} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
