const express = require('express');
const router = express.Router();
const axios = require('axios');

// GET /api/trials?disease=lung cancer
router.get('/', async (req, res) => {
  try {
    const { disease } = req.query;

    if (!disease) {
      return res.status(400).json({
        error: 'Disease is required'
      });
    }

    const url =
      `https://clinicaltrials.gov/api/v2/studies?query.cond=${encodeURIComponent(disease)}&pageSize=5&format=json`;

    const response = await axios.get(url);

    const studies = response.data.studies || [];

    const results = studies.map((study) => {
      const protocol = study.protocolSection || {};

      return {
        title:
          protocol.identificationModule?.briefTitle || '',
        status:
          protocol.statusModule?.overallStatus || '',
        phase:
          protocol.designModule?.phases || [],
        condition:
          protocol.conditionsModule?.conditions || [],
        location:
          protocol.contactsLocationsModule?.locations?.[0]
            ?.facility?.name || '',
        city:
          protocol.contactsLocationsModule?.locations?.[0]
            ?.city || '',
        country:
          protocol.contactsLocationsModule?.locations?.[0]
            ?.country || ''
      };
    });

    res.json({
      disease,
      count: results.length,
      trials: results
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Failed to fetch trials'
    });
  }
});

module.exports = router;