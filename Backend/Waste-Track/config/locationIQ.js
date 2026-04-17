import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const LOCATIONIQ_API_KEY = process.env.LOCATIONIQ_API_KEY;
const BASE_URL = 'https://us1.locationiq.com/v1/search';

export const searchLocation = async (query) => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        key: LOCATIONIQ_API_KEY,
        q: query,
        format: 'json',
        limit: 5
      }
    });
    return response.data;
  } catch (error) {
    console.error('LocationIQ error:', error.message);
    return [];
  }
};