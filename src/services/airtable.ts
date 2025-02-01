const AIRTABLE_API_KEY = 'patq4JIuuLh5xgo34.4456c0e7774bd235c10f6e2fc2a251c8014b76b3a2b76a6e6c56859bc88ee8b1';
const BASE_ID = 'app1uI6yNTTPK7NRq';
const TABLE_ID = 'tblchMlIvxyhvuY9D';

export interface AirtableResponse {
  records: Array<{
    id: string;
    fields: Record<string, any>;
    createdTime: string;
  }>;
  offset?: string;
}

export const fetchAirtableRecords = async (offset?: string): Promise<AirtableResponse> => {
  console.log("Fetching records with offset:", offset); // Debug log
  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}${offset ? `?offset=${offset}` : ''}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch data from Airtable');
    }

    const data = await response.json();
    console.log("Airtable response:", data); // Debug log
    return data;
  } catch (error) {
    console.error("Error fetching from Airtable:", error);
    throw error;
  }
};