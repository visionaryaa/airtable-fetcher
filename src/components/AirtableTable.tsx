import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchAirtableRecords } from "@/services/airtable";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const AirtableTable = () => {
  const [currentOffset, setCurrentOffset] = useState<string | undefined>();
  const [previousOffsets, setPreviousOffsets] = useState<string[]>([]);
  const { toast } = useToast();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["airtable", currentOffset],
    queryFn: () => fetchAirtableRecords(currentOffset),
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch data from Airtable",
      });
    },
  });

  const handleNextPage = () => {
    if (data?.offset) {
      setPreviousOffsets((prev) => [...prev, currentOffset || ""]);
      setCurrentOffset(data.offset);
    }
  };

  const handlePreviousPage = () => {
    const newPreviousOffsets = [...previousOffsets];
    const previousOffset = newPreviousOffsets.pop();
    setPreviousOffsets(newPreviousOffsets);
    setCurrentOffset(previousOffset);
  };

  if (isLoading) {
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

  if (!data?.records.length) {
    return <div className="text-center py-8">No records found.</div>;
  }

  const columns = Object.keys(data.records[0].fields);

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
          {data.records.map((record) => (
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
        <Button
          onClick={handleNextPage}
          disabled={!data.offset}
          variant="outline"
        >
          Next Page
        </Button>
      </div>
    </div>
  );
};

export default AirtableTable;