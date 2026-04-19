const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const Conversation = require('../models/Conversation');

const pubmedService = require('../services/pubmedService');
const clinicalTrialsService = require('../services/clinicalTrialsService');

const askLLM = require('../services/llmService');
const buildPrompt = require('../utils/promptBuilder');
const rankStudies = require('../services/ranker');

router.post('/', async (req, res) => {
  try {
    const {
      sessionId,
      patientName,
      disease,
      intent,
      location,
      message
    } = req.body;

    if (!message) {
      return res.status(400).json({
        error: 'Message is required'
      });
    }

    const currentSessionId = sessionId || uuidv4();

    // Find or create conversation
    let conversation = await Conversation.findOne({
      sessionId: currentSessionId
    });

    if (!conversation) {
      conversation = new Conversation({
        sessionId: currentSessionId,
        context: {
          disease: disease || '',
          intent: intent || '',
          location: location || ''
        },
        messages: []
      });
    }

    // Update memory context
    if (disease) conversation.context.disease = disease;
    if (intent) conversation.context.intent = intent;
    if (location) conversation.context.location = location;

    // Save user message
    conversation.messages.push({
      role: 'user',
      content: message
    });

    // Final remembered values
    const finalDisease =
      disease || conversation.context.disease || 'general health';

    const finalIntent =
      intent || conversation.context.intent || '';

    const finalLocation =
      location || conversation.context.location || 'Not provided';

    // Follow-up smart logic
    const isFollowUp = !disease && !intent;

    const searchIntent = isFollowUp
      ? message
      : finalIntent || message;

    // Fetch research data
    const papers = await pubmedService.searchPublications(
      finalDisease,
      searchIntent
    );

    const trialsData = await clinicalTrialsService.searchTrials(
      finalDisease,
      finalLocation
    );

    // Raw results
    const paperResults = papers.results || [];
    const trialResults = trialsData.results || [];

    // Rank papers
    const rankedPapers = rankStudies(
      paperResults,
      message,
      finalDisease
    );

    const topPapers = rankedPapers.slice(0, 5);

    const paperCount = paperResults.length;
    const trialCount = trialResults.length;

    const topPaper =
      topPapers.length > 0 ? topPapers[0] : null;

    const topTrial =
      trialResults.length > 0 ? trialResults[0] : null;

    // Safe abstract handling
    const topAbstract = topPaper?.abstract
      ? typeof topPaper.abstract === 'string'
        ? topPaper.abstract
        : JSON.stringify(topPaper.abstract)
      : 'No abstract available';

    // Build evidence context
    const contextData = `
Patient Name: ${patientName || 'User'}
Disease: ${finalDisease}
Intent: ${searchIntent}
Location: ${finalLocation}

Publications Found: ${paperCount}

Top Publication:
Title: ${topPaper ? topPaper.title : 'No publication found'}
${topPaper?.year ? `Year: ${topPaper.year}` : ''}
Abstract: ${topAbstract}
${topPaper?.score ? `Relevance Score: ${topPaper.score}` : ''}

Trials Found: ${trialCount}

Top Trial:
Title: ${topTrial ? topTrial.title : 'No trial found'}
${topTrial?.status ? `Status: ${topTrial.status}` : ''}
${topTrial?.phase ? `Phase: ${topTrial.phase}` : ''}
`;

    // Build prompt
    const prompt = buildPrompt(message, contextData);

    // Ask local LLM
    const reply = await askLLM(prompt);

    const assistantReply =
      reply ||
      `
1. Condition Overview
No AI response generated.

2. Research Insights
${paperCount} publication(s) found.

3. Clinical Trials
${trialCount} trial(s) found.

4. Source Attribution
PubMed + ClinicalTrials.gov
`;

    // Save assistant response
    conversation.messages.push({
      role: 'assistant',
      content: assistantReply
    });

    await conversation.save();

    res.json({
      success: true,
      sessionId: currentSessionId,
      reply: assistantReply,
      rememberedDisease: finalDisease,
      studiesFound: paperCount,
      trialsFound: trialCount,
      topPublication: topPaper,
      rankedPublications: topPapers,
      topTrial: topTrial
    });

  } catch (error) {
    console.error('Chat Route Error:', error);

    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

module.exports = router;