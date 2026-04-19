const axios = require('axios');

const searchTrials = async (disease, location = '') => {
  try {
    const url =
      `https://clinicaltrials.gov/api/v2/studies?query.cond=${encodeURIComponent(disease)}&pageSize=5&format=json`;

    const response = await axios.get(url);

    const studies = response.data.studies || [];

    const results = studies.map((study) => {
      const protocol = study.protocolSection || {};

      const loc =
        protocol.contactsLocationsModule?.locations?.[0];

      return {
        id:
          protocol.identificationModule?.nctId || '',
        title:
          protocol.identificationModule?.briefTitle || '',
        status:
          protocol.statusModule?.overallStatus || '',
        phase:
          protocol.designModule?.phases || [],
        sponsor:
          protocol.sponsorCollaboratorsModule
            ?.leadSponsor?.name || '',
        condition:
          protocol.conditionsModule?.conditions || [],
        location:
          loc?.facility?.name || '',
        city:
          loc?.city || '',
        country:
          loc?.country || '',
        url:
          protocol.identificationModule?.nctId
            ? `https://clinicaltrials.gov/study/${protocol.identificationModule.nctId}`
            : ''
      };
    });

    return {
      source: 'ClinicalTrials.gov',
      query: disease,
      location,
      results
    };

  } catch (error) {
    console.error('Clinical Trials Error:', error.message);

    return {
      source: 'ClinicalTrials.gov',
      query: disease,
      location,
      results: []
    };
  }
};

module.exports = {
  searchTrials
};