const { GoogleGenAI } = require('@google/genai');

async function getGeminiResponse(prompt) {
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_key_here') {
      return "AI service temporarily unavailable. Please set a valid GEMINI_API_KEY in the backend .env file.";
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Use active high-performance models with fallback support
    const modelsToTry = ['gemini-flash-latest', 'gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.6-flash'];
    let lastError = null;

    for (const model of modelsToTry) {
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Model timeout after 6s')), 6000)
        );

        const generatePromise = ai.models.generateContent({
          model,
          contents: prompt,
        });

        const response = await Promise.race([generatePromise, timeoutPromise]);
        if (response && response.text) {
          return response.text;
        }
      } catch (err) {
        lastError = err;
        console.warn(`Model ${model} failed (${err.message?.slice(0, 80)}), trying fallback if available...`);
      }
    }

    throw lastError || new Error("No response from AI models");
  } catch (error) {
    console.error("AI API Error:", error.message || error);
    return "AI service temporarily unavailable. Please check your connection or API key.";
  }
}

module.exports = {
  getGeminiResponse
};

