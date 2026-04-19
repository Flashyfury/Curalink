const express = require('express');
const router = express.Router();

const pubmedService = require('../services/pubmedService');

// GET /api/publications?disease=diabetes&intent=latest treatment
router.get('/', async (req, res) => {
  try {
    const { disease, intent, query } = req.query;

    const finalDisease = disease || query || '';
    const finalIntent = intent || '';

    if (!finalDisease) {
      return res.status(400).json({
        error: 'Disease or query is required'
      });
    }

    const data = await pubmedService.searchPublications(
      finalDisease,
      finalIntent
    );

    res.json({
      query: `${finalDisease} ${finalIntent}`.trim(),
      count: data.results.length,
      publications: data.results,
      source: 'PubMed'
    });

  } catch (error) {
    console.error('Publications error:', error);

    res.status(500).json({
      error: 'Failed to fetch publications'
    });
  }
});

module.exports = router;