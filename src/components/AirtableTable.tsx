import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { fetchAirtableRecords } from "@/services/airtable";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Heart } from "lucide-react";

interface AirtableTableProps {
  onTotalRecords?: (total: number) => void;
  sortOrder?: 'asc' | 'desc';
}

const AGENCY_LOGOS = [
  {
    domain: 'proselect.be',
    logo: 'https://scontent.fbru2-1.fna.fbcdn.net/v/t39.30808-6/424861504_903474951786484_6860552531033903105_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=9f87pSSpry0Q7kNvgFyrnoT&_nc_zt=23&_nc_ht=scontent.fbru2-1.fna&_nc_gid=Ak1S7cV8uODElYBPLoC2BP7&oh=00_AYD11qaICw8KiEXJHPd2k0JeIOgaHaTW9IRlvZoyE62k0g&oe=67A1CC7A'
  },
  {
    domain: 'tempo-team.be',
    logo: 'https://scontent.fbru2-1.fna.fbcdn.net/v/t39.30808-6/352321179_802641697768990_7499832421124251242_n.png?_nc_cat=110&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=GoOS2AtHBusQ7kNvgHYxTXc&_nc_zt=23&_nc_ht=scontent.fbru2-1.fna&_nc_gid=Ae_9EPVESkA8wMfDsEVP_6L&oh=00_AYCWUQSFWcAyItU6tzoRhWSwgmXvNMnk_iuILxmJsxa71Q&oe=67A19741'
  },
  {
    domain: 'adecco.be',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpHiI1ANEpe5BlJpLQDI_4M8jl1AnJciaqaw&s'
  },
  {
    domain: 'asap.be',
    logo: 'https://a.storyblok.com/f/118264/240x240/c475b21edc/asap-logo-2.png'
  },
  {
    domain: 'synergiejobs.be',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMXkqv_r78fpVwVE9xDY6rd0GfS3bMlK1sWA&s'
  },
  {
    domain: 'randstad.be',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQK5L2880dU-fMT-PjiSxVWWbwI6Vb8l3Vw6Q&s'
  },
  {
    domain: 'accentjobs.be',
    logo: 'https://scontent-bru2-1.xx.fbcdn.net/v/t39.30808-1/282401818_7471306532942250_8129507684428268966_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=103&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=V7V32kIB9kQQ7kNvgGrchjq&_nc_zt=24&_nc_ht=scontent-bru2-1.xx&_nc_gid=AxGzm78UeCGDdyODeeOkUVP&oh=00_AYCkOMbUGq7QW9APk_A0wqGGCWF4f3gkf8SaipnTsGtuZA&oe=67A1EB3A'
  }
];

const getLogoForUrl = (url: string) => {
  try {
    const urlObject = new URL(url);
    const domain = urlObject.hostname.replace('www2.', 'www.').replace('www.', '');
    const agencyInfo = AGENCY_LOGOS.find(agency => domain.includes(agency.domain));
    return agencyInfo?.logo;
  } catch (error) {
    console.error('Error parsing URL:', error);
    return null;
  }
};

const AirtableTable = ({ onTotalRecords, sortOrder }: AirtableTableProps) => {
  const [currentOffset, setCurrentOffset] = useState<string | undefined>();
  const [previousOffsets, setPreviousOffsets] = useState<string[]>([]);
  const [allRecords, setAllRecords] = useState<any[]>([]);
  const { toast } = useToast();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["airtable", currentOffset],
    queryFn: () => fetchAirtableRecords(currentOffset),
    meta: {
      onError: () => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch data from Airtable",
        });
      }
    }
  });

  useEffect(() => {
    console.log("Data received:", data);
    if (data?.records) {
      console.log("Records found:", data.records.length);
      if (currentOffset) {
        setAllRecords(prev => [...prev, ...data.records]);
      } else {
        setAllRecords(data.records);
      }

      if (data.offset) {
        setPreviousOffsets((prev) => [...prev, currentOffset || ""]);
        setCurrentOffset(data.offset);
      }
    }
  }, [data?.records, currentOffset, data?.offset]);

  useEffect(() => {
    console.log("All records:", allRecords.length);
    if (onTotalRecords) {
      onTotalRecords(allRecords.length);
    }
  }, [allRecords.length, onTotalRecords]);

  // Sort records based on sortOrder
  const sortedRecords = [...allRecords].sort((a, b) => {
    if (!sortOrder) return 0;
    const titleA = a.fields.Poste?.toLowerCase() || '';
    const titleB = b.fields.Poste?.toLowerCase() || '';
    return sortOrder === 'asc' 
      ? titleA.localeCompare(titleB)
      : titleB.localeCompare(titleA);
  });

  if (isLoading && !allRecords.length) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-500 py-8">
        Failed to load data. Please try again later.
      </div>
    );
  }

  if (!allRecords.length) {
    return <div className="text-center py-8">No records found.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-lg px-6">
      <table className="w-full border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-[#1E2433] text-gray-300">
            <th className="p-6 text-left font-medium">SOURCE</th>
            <th className="p-6 text-left font-medium">POSTE</th>
            <th className="p-6 text-left font-medium">LIEN</th>
            <th className="p-6 text-left font-medium">LOCALISATION</th>
            <th className="p-6 text-left font-medium">FAVORIS</th>
          </tr>
        </thead>
        <tbody>
          {sortedRecords.map((record) => (
            <tr
              key={record.id}
              className="border-b border-[#2A3041] hover:bg-[#1E2433] transition-colors"
            >
              <td className="p-6">
                {record.fields.lien && (
                  <img
                    src={getLogoForUrl(record.fields.lien)}
                    alt="Agency logo"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
              </td>
              <td className="p-6 font-medium text-white">{record.fields.Poste}</td>
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
              <td className="p-6 text-gray-300">{record.fields.Localisation}</td>
              <td className="p-6">
                <Button variant="ghost" size="sm" className="hover:text-red-500">
                  <Heart className="w-5 h-5" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AirtableTable;