import { GoogleGenAI } from '@google/genai';

// Initialize Gemini client according to @google/genai guidelines
export const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

export const MODEL_NAME = 'gemini-3.8-flash';
