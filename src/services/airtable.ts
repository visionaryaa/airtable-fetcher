
const AIRTABLE_API_KEY = 'patq4JIuuLh5xgo34.4456c0e7774bd235c10f6e2fc2a251c8014b76b3a2b76a6e6c56859bc88ee8b1';

const AIRTABLE_BASES = {
  logisticsLiege: {
    baseId: 'app1uI6yNTTPK7NRq',
    tableId: 'tblchMlIvxyhvuY9D',
  },
  customSearch: {
    baseId: 'appH9eP8uC0TPOuG3',
    tableId: 'tblchMlIvxyhvuY9D',
  }
} as const;

export interface AirtableResponse {
  records: Array<{
    id: string;
    fields: Record<string, any>;
    createdTime: string;
  }>;
  offset?: string;
}

export const fetchAirtableRecords = async (
  offset?: string, 
  baseKey: keyof typeof AIRTABLE_BASES = 'logisticsLiege',
  searchId?: string | null
): Promise<AirtableResponse> => {
  const { baseId, tableId } = AIRTABLE_BASES[baseKey];
  let url = `https://api.airtable.com/v0/${baseId}/${tableId}`;
  
  // Build the filter formula if we have a searchId
  if (searchId) {
    const filterFormula = `SearchID='${searchId}'`;
    url += `?filterByFormula=${encodeURIComponent(filterFormula)}`;
    if (offset) {
      url += `&offset=${offset}`;
    }
  } else if (offset) {
    url += `?offset=${offset}`;
  }
  
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
    console.log("Airtable response:", data);
    return data;
  } catch (error) {
    console.error("Error fetching from Airtable:", error);
    throw error;
  }
};
