const openAlexService = {
  async searchPublications(disease, intent) {
    return {
      source: 'OpenAlex',
      query: disease,
      results: [
        {
          id: 'oa_001',
          title: `Research on ${disease}`,
          authors: ['OpenAlex Database'],
          journal: 'OpenAlex Publications',
          year: new Date().getFullYear(),
          abstract: 'Placeholder - OpenAlex API integration pending',
          doi: null,
          url: null,
        },
      ],
      note: 'OpenAlex integration pending - configure API credentials in .env',
    };
  },
};

module.exports = openAlexService;
