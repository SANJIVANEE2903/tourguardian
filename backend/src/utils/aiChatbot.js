/**
 * Real AI chatbot powered by the Google Gemini API, with automatic
 * fallback to the built-in rule-based engine if no API key is set or the
 * API call fails for any reason (network, rate limit, invalid key, etc).
 *
 * Requires: npm install @google/generative-ai
 * Set GEMINI_API_KEY in backend/.env to enable real AI responses.
 */

const { generateReply: ruleBasedReply } = require('./chatbotEngine');
const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
if (process.env.GEMINI_API_KEY) {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

const SYSTEM_PROMPT = `You are the TourGuardian AI Safety Assistant, built into a tourist safety app.
You help travelers stay safe: route safety, local risk awareness, emergency
contact guidance, common scams, and general travel precautions.

Rules:
- Keep answers concise (2-4 sentences) and practical.
- If the user describes an active emergency or immediate danger, tell them
  clearly to use the app's SOS button right now, and give one or two
  immediate safety steps.
- You are not a replacement for local emergency services (police, ambulance).
  For genuine emergencies, always mention contacting local emergency numbers
  in addition to the app's SOS feature.
- Do not give medical, legal, or diagnostic advice beyond basic first-aid
  style safety guidance.
- Be warm and reassuring, but direct — the user may be anxious or in a
  stressful travel situation.`;

/**
 * @param {string} message - the user's latest message
 * @param {Array<{role: 'user'|'assistant', content: string}>} history - prior turns, oldest first
 * @returns {Promise<string>} the assistant's reply text
 */
async function generateAIReply(message, history = []) {
  if (process.env.OPENAI_API_KEY) {
    try {
      const { OpenAI } = require('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history.map((h) => ({ role: h.role, content: h.content })),
        { role: 'user', content: message }
      ];

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages,
        temperature: 0.7,
        max_tokens: 300
      });

      return response.choices[0].message.content.trim();
    } catch (err) {
      console.error('OpenAI API call failed in Chatbot:', err.message);
      // Fall through
    }
  }

  // Fallback to Gemini or Offline
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: SYSTEM_PROMPT,
      });

      const geminiHistory = history.map(h => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }]
      }));

      const chat = model.startChat({ history: geminiHistory });
      const result = await chat.sendMessage(message);
      
      return result.response.text().trim();
    } catch (err) {
      console.error('Gemini API call failed, falling back to rule-based reply:', err.message);
    }
  }

  return ruleBasedReply(message);
}

module.exports = { generateAIReply };
