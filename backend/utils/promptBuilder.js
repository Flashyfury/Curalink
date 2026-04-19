function buildPrompt(userMessage, contextData = '') {
  return `
You are an evidence-based medical research assistant.

Use only the provided context.
If evidence is insufficient, say so.

User Query:
${userMessage}

Context:
${contextData}

Return response in this format:

1. Condition Overview
2. Research Insights
3. Clinical Trials
4. Source Attribution
`;
}

module.exports = buildPrompt;