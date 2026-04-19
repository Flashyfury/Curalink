const axios = require('axios');
const xml2js = require('xml2js');

const searchPublications = async (disease, intent = '') => {
  try {
    const query = `${disease} ${intent}`.trim();

    const searchUrl =
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=5&retmode=json`;

    const searchRes = await axios.get(searchUrl);

    const ids = searchRes.data.esearchresult.idlist || [];

    if (!ids.length) {
      return { results: [] };
    }

    const fetchUrl =
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${ids.join(',')}&retmode=xml`;

    const fetchRes = await axios.get(fetchUrl);

    const parsed = await xml2js.parseStringPromise(fetchRes.data);

    const articles =
      parsed.PubmedArticleSet.PubmedArticle || [];

    const results = articles.map((item, index) => {
      const article = item.MedlineCitation[0].Article[0];

      return {
        id: ids[index],
        title: article.ArticleTitle?.[0] || '',
        abstract:
          article.Abstract?.[0]?.AbstractText?.join(' ') || '',
        year:
          article.Journal?.[0]?.JournalIssue?.[0]?.PubDate?.[0]?.Year?.[0] || '',
        source: 'PubMed',
        url: `https://pubmed.ncbi.nlm.nih.gov/${ids[index]}/`
      };
    });

    return { results };

  } catch (error) {
    console.error(error);
    return { results: [] };
  }
};

module.exports = {
  searchPublications
};