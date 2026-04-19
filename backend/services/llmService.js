const { Ollama } = require('ollama');

const ollama = new Ollama({
  host: 'http://127.0.0.1:11434'
});

async function askLLM(prompt) {
  try {
    const response = await ollama.chat({
      model: 'llama3',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    return response.message.content;
  } catch (error) {
    console.error('LLM Error:', error.message);
    return 'Unable to generate response';
  }
}

module.exports = askLLM;