import { useState } from "react";
import AirtableTable from "@/components/AirtableTable";

const Index = () => {
  const [totalRecords, setTotalRecords] = useState(0);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Airtable Data</h1>
      <p className="text-gray-600 mb-6">Total records found: {totalRecords}</p>
      <AirtableTable onTotalRecords={setTotalRecords} />
    </div>
  );
};

export default Index;