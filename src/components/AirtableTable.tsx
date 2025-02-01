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
    <div className="overflow-x-auto rounded-lg">
      <table className="w-full border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-[#2a2f3d] text-gray-300">
            <th className="p-4 text-left font-medium">SOURCE</th>
            <th className="p-4 text-left font-medium">POSTE</th>
            <th className="p-4 text-left font-medium">LIEN</th>
            <th className="p-4 text-left font-medium">LOCALISATION</th>
            <th className="p-4 text-left font-medium">FAVORIS</th>
          </tr>
        </thead>
        <tbody>
          {sortedRecords.map((record) => (
            <tr
              key={record.id}
              className="border-b border-gray-800 hover:bg-[#2a2f3d] transition-colors"
            >
              <td className="p-4">
                {record.fields.source && (
                  <img
                    src={record.fields.source}
                    alt="Company logo"
                    className="w-8 h-8 rounded-full"
                  />
                )}
              </td>
              <td className="p-4 font-medium text-white">{record.fields.Poste}</td>
              <td className="p-4">
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
              <td className="p-4 text-gray-300">{record.fields.Localisation}</td>
              <td className="p-4">
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