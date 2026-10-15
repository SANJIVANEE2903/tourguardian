const { pool } = require('../config/db');
const { generateAIReply } = require('../utils/aiChatbot');

async function chat(req, res, next) {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'message is required.' });

    // Pull recent turns for this user so the assistant has conversation context.
    const [rows] = await pool.query(
      'SELECT message, response FROM chatbot_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 6',
      [req.user.id]
    );
    // rows come back newest-first — reverse to oldest-first, then flatten
    // each row into a user turn + assistant turn for the API's messages array.
    const history = [];
    rows.reverse().forEach((r) => {
      history.push({ role: 'user', content: r.message });
      history.push({ role: 'assistant', content: r.response });
    });

    const reply = await generateAIReply(message, history);

    await pool.query(
      'INSERT INTO chatbot_logs (user_id, message, response) VALUES (?, ?, ?)',
      [req.user.id, message, reply]
    );

    res.json({ reply });
  } catch (err) { next(err); }
}

async function history(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM chatbot_logs WHERE user_id = ? ORDER BY created_at ASC LIMIT 100', [req.user.id]);
    res.json(rows);
  } catch (err) { next(err); }
}

module.exports = { chat, history };
