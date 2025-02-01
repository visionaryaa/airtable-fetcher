import AirtableTable from "@/components/AirtableTable";

const Index = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Offres d'emploi</h1>
      <AirtableTable />
    </div>
  );
};

export default Index;