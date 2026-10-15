/**
 * Built-in rule-based risk engine.
 * Works fully offline. If AI_PROVIDER_API_KEY is set in .env, you can
 * swap the scoring logic below for a real model call (e.g. Anthropic/OpenAI)
 * -- the function signature/return shape is what the rest of the app expects.
 */

const HIGH_RISK_KEYWORDS = ['border', 'conflict', 'war', 'protest', 'forest', 'jungle', 'remote', 'mine', 'unrest'];
const MEDIUM_RISK_KEYWORDS = ['mountain', 'desert', 'night market', 'coastal', 'rural', 'trek', 'trail'];

const { GoogleGenerativeAI } = require('@google/generative-ai');

function getFallbackScore({ locationName = '', latitude, longitude }) {
  const lower = locationName.toLowerCase();
  let score = 20;
  const factors = [];

  // Expanded dictionaries covering misspellings and specific locations
  const HIGH_RISK = ['border', 'conflict', 'war', 'protest', 'forest', 'jungle', 'remote', 'mine', 'unrest', 'cartel', 'pirat'];
  const MEDIUM_RISK = [
    'mountain', 'desert', 'night market', 'coastal', 'rural', 'trek', 'trail', 
    'treak', 'hike', 'hiking', 'mount', 'mt ', 'fuji', 'everest', 'alps'
  ];

  let matchedHigh = false;
  HIGH_RISK.forEach(kw => { 
    if (lower.includes(kw)) { 
      score += 25; 
      factors.push(`Matched high-risk terrain/context: ${kw}`); 
      matchedHigh = true;
    }
  });

  MEDIUM_RISK.forEach(kw => { 
    if (lower.includes(kw)) { 
      score += 15; 
      factors.push(`Matched moderate-risk outdoor/terrain factor: ${kw}`); 
    }
  });

  // Specific logic for Mount Fuji / Trekking to give realistic AI-like responses offline
  if (lower.includes('fuji') || (lower.includes('mount') && (lower.includes('trek') || lower.includes('treak')))) {
    factors.push('Altitude sickness risk: Acclimatization is required.');
    factors.push('Weather volatility: Temperatures can drop below freezing near the summit.');
    score = Math.max(score, 45); // Ensure it's at least medium risk
  }

  let geoFactor = 0;
  if (typeof latitude === 'number' && typeof longitude === 'number') {
    geoFactor = Math.round((Math.abs(Math.sin(latitude * 12.9 + longitude * 78.2) * 43758) % 1) * 15);
  }

  score = Math.min(100, score + geoFactor);
  if (factors.length === 0) factors.push('No specific high-risk indicators found in the location name.');

  let level = score >= 65 ? 'high' : score >= 35 ? 'medium' : 'low';
  
  const recommendations = level === 'high' 
    ? ['Avoid non-essential travel to this area', 'Inform local authorities/embassy of your presence', 'Keep the SOS button accessible at all times', 'Consider an alternate route']
    : level === 'medium'
    ? ['Avoid isolated areas after dark', 'Travel in groups where possible', 'Keep your phone charged and location sharing on', 'Prepare appropriate gear for terrain/weather']
    : ['Stay aware of surroundings', 'Keep emergency contacts updated', 'Share your itinerary with a trusted contact'];

  return {
    score, level, factors: [...new Set(factors)], recommendations
  };
}

async function assessRisk({ locationName = '', latitude, longitude }) {
  if (process.env.OPENAI_API_KEY) {
    try {
      const { OpenAI } = require('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const prompt = `Act as a travel safety expert. Assess the travel risk for the following location: "${locationName}".
If provided, coordinates are Lat: ${latitude}, Lng: ${longitude}.
Analyze typical weather, terrain, crime, and geopolitical risks for tourists.
Return ONLY a valid JSON object strictly matching this schema, without markdown formatting:
{
  "score": number between 10-100,
  "level": "low" or "medium" or "high",
  "factors": ["list of 2-4 contributing risk factors"],
  "recommendations": ["list of 3 actionable safety recommendations"]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2
      });

      let text = response.choices[0].message.content.trim();
      if (text.startsWith('```json')) text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(text);
    } catch (err) {
      console.error('OpenAI API Error in Risk Engine:', err.message);
      // Fall through to fallback
    }
  }

  // Fallback to Gemini or Offline
  if (process.env.GEMINI_API_KEY) {
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Act as a travel safety expert. Assess the travel risk for the following location: "${locationName}".
If provided, coordinates are Lat: ${latitude}, Lng: ${longitude}.
Analyze typical weather, terrain, crime, and geopolitical risks for tourists.
Return ONLY a valid JSON object strictly matching this schema, without markdown formatting:
{
  "score": number between 10-100,
  "level": "low" or "medium" or "high",
  "factors": ["list of 2-4 contributing risk factors"],
  "recommendations": ["list of 3 actionable safety recommendations"]
}`;

      const result = await model.generateContent(prompt);
      let text = result.response.text().trim();
      if (text.startsWith('```json')) text = text.replace(/```json/g, '').replace(/```/g, '').trim();

      return JSON.parse(text);
    } catch (err) {
      console.error('Gemini API Error in Risk Engine:', err.message);
    }
  }

  return getFallbackScore({ locationName, latitude, longitude });
}

module.exports = { assessRisk };
