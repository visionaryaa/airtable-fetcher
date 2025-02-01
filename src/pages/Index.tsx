import AirtableTable from "@/components/AirtableTable";

const Index = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Airtable Data</h1>
      <AirtableTable />
    </div>
  );
};

export default Index;