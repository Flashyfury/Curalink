function scoreStudy(study, query = '', disease = '') {
  let score = 0;

  const text =
    `${study.title || ''} ${study.abstract || ''}`.toLowerCase();

  const q = query.toLowerCase();
  const d = disease.toLowerCase();

  // Exact disease relevance
  if (d && text.includes(d)) score += 30;

  // Query terms relevance
  q.split(' ').forEach(word => {
    if (word.length > 2 && text.includes(word)) score += 5;
  });

  // Recent publication boost
  const year = Number(study.year) || 0;
  if (year >= 2024) score += 20;
  else if (year >= 2020) score += 10;

  // Strong evidence types
  if (text.includes('randomized')) score += 15;
  if (text.includes('meta-analysis')) score += 18;
  if (text.includes('phase iii')) score += 12;
  if (text.includes('systematic review')) score += 15;

  return score;
}

function rankStudies(studies = [], query = '', disease = '') {
  return studies
    .map(item => ({
      ...item,
      score: scoreStudy(item, query, disease)
    }))
    .sort((a, b) => b.score - a.score);
}

module.exports = rankStudies;