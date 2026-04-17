import axios from 'axios';

const LOCATION_API_URL = 'http://localhost:3000/api/location';

export const fetchLocationSuggestions = async (query) => {
  if (!query || query.length < 3) return [];
  try {
    const response = await axios.get(`${LOCATION_API_URL}/search`, {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    console.error('Location fetch error:', error);
    return [];
  }
};