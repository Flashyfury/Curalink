const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function askLLM(prompt) {
  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.4,
      max_tokens: 700
    });

    return response.choices[0].message.content;

  } catch (error) {
    console.error("LLM Error:", error.message);
    return "Unable to generate response";
  }
}

module.exports = askLLM;