const { GoogleGenerativeAI } = require('@google/generative-ai');

function getFallbackReply(message = '') {
  const DEFAULT_REPLY = 'I am your TourGuardian Safety Assistant. Ask me about night safety, scams to avoid, lost passports, medical help, transportation, trekking, or geofences. For urgent danger, tap the red SOS button.';
  const RULES = [
    { test: /sos|emergency|help me|danger|unsafe|attack/i, reply: '🚨 IF YOU ARE IN IMMEDIATE DANGER: Tap the red SOS button now! It instantly broadcasts your live Google Maps location to emergency contacts and local rescue dispatch (+91-112). Move toward lit, crowded areas immediately.' },
    { test: /night|dark|evening/i, reply: '🌙 Night Safety Precautions: Stick to brightly lit main streets, avoid alleys or quiet parks, use official ride-hailing apps, and share your live location via the Live Map page.' },
    { test: /passport|stolen|theft|wallet/i, reply: '🛂 Lost Document / Theft Procedure: 1) File an FIR report at the nearest police station immediately. 2) Contact your embassy. 3) Block all stolen debit/credit cards.' },
    { test: /medical|hospital|doctor|sick/i, reply: '🏥 Medical Emergency Protocol: Dial 102 or 112 for local emergency ambulance service. Keep your emergency medical contacts updated.' },
    { test: /fuji|everest|alps|mountain/i, reply: '🏔️ Mountain/High Altitude Safety: Always check weather conditions before ascending. Dress in layers, carry emergency oxygen/first-aid, and be aware of altitude sickness symptoms. Ensure your GPS location sharing is active.' },
    { test: /trek|treak|hike|hiking|trail/i, reply: '🥾 Trekking Safety: Stick to marked trails, travel with a registered guide if possible, and activate the "Check-In Timer" on your TourGuardian dashboard so someone knows if you are overdue.' }
  ];

  const rule = RULES.find((r) => r.test.test(message));
  return rule ? rule.reply : DEFAULT_REPLY;
}

async function generateReply(message = '') {
  if (!process.env.GEMINI_API_KEY) {
    return getFallbackReply(message);
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are the TourGuardian AI Safety Assistant. The user asks: "${message}". 
Provide a concise, helpful, and highly relevant safety response for a tourist/traveler. Keep it under 3-4 sentences. Include relevant emojis. If they ask for emergency help, firmly instruct them to press the red SOS button in the app.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.error('Gemini API Error in Chatbot:', err);
    return getFallbackReply(message);
  }
}

module.exports = { generateReply };
