import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { fetchAirtableRecords } from "@/services/airtable";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface AirtableTableProps {
  onTotalRecords?: (total: number) => void;
}

const AirtableTable = ({ onTotalRecords }: AirtableTableProps) => {
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
    if (data?.records) {
      // Append new records to our accumulated list
      if (currentOffset) {
        setAllRecords(prev => [...prev, ...data.records]);
      } else {
        // If no offset (first page), reset the records
        setAllRecords(data.records);
      }

      // If there's more data to fetch, automatically get the next page
      if (data.offset) {
        setPreviousOffsets((prev) => [...prev, currentOffset || ""]);
        setCurrentOffset(data.offset);
      }
    }
  }, [data?.records, currentOffset, data?.offset]);

  // Notify parent component about total records when allRecords changes
  useEffect(() => {
    if (onTotalRecords) {
      onTotalRecords(allRecords.length);
    }
  }, [allRecords.length, onTotalRecords]);

  const handlePreviousPage = () => {
    const newPreviousOffsets = [...previousOffsets];
    const previousOffset = newPreviousOffsets.pop();
    setPreviousOffsets(newPreviousOffsets);
    setCurrentOffset(previousOffset);
  };

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

  const columns = Object.keys(allRecords[0].fields);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-gray-100">
            {columns.map((column) => (
              <th key={column} className="p-4 text-left font-medium text-gray-600">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allRecords.map((record) => (
            <tr
              key={record.id}
              className="border-b border-gray-200 hover:bg-gray-50"
            >
              {columns.map((column) => (
                <td key={`${record.id}-${column}`} className="p-4">
                  {String(record.fields[column] || "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between items-center mt-4 px-4">
        <Button
          onClick={handlePreviousPage}
          disabled={previousOffsets.length === 0}
          variant="outline"
        >
          Previous Page
        </Button>
      </div>
    </div>
  );
};

export default AirtableTable;