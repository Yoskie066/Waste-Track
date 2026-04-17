import { Router } from 'express';
import { searchLocation } from '../../config/locationIQ.js';

const router = Router();

router.get('/search', async (req, res) => {
  const { q } = req.query;

  if (!q || q.length < 3) {
    return res.status(400).json({
      error: 'Query parameter "q" is required (min 3 characters)'
    });
  }

  try {
    const results = await searchLocation(q);
    res.json(results);
  } catch (error) {
    console.error('Location search error:', error);
    res.status(500).json({ error: 'Failed to fetch location suggestions' });
  }
});

export default router;