import React, { useState, useRef, useEffect } from 'react';
import api from '../api/axios';
import FakeCallModal from './FakeCallModal';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [showFakeCall, setShowFakeCall] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm your TourGuardian safety assistant. Ask me anything about travel safety." }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);


  useEffect(() => {
    if (open) {
      api.get('/chatbot/history')
        .then((res) => {
          if (res.data && res.data.length > 0) {
            const historyMsgs = [];
            res.data.forEach((h) => {
              historyMsgs.push({ role: 'user', text: h.message });
              historyMsgs.push({ role: 'bot', text: h.response });
            });
            setMessages([
              { role: 'bot', text: "Hi! I'm your TourGuardian safety assistant. Ask me anything about travel safety." },
              ...historyMsgs
            ]);
          }
        })
        .catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  async function send() {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((m) => [...m, { role: 'user', text: userMsg }]);
    setInput('');
    setSending(true);
    try {
      const { data } = await api.post('/chatbot/chat', { message: userMsg });
      setMessages((m) => [...m, { role: 'bot', text: data.reply }]);
    } catch (err) {
      setMessages((m) => [...m, { role: 'bot', text: 'Sorry, I could not reach the assistant right now.' }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-brand-500 hover:bg-brand-600 text-white shadow-lg flex items-center justify-center text-xl"
        title="AI Safety Assistant"
      >
        🤖
      </button>

      {open && (
        <div className="fixed bottom-24 left-6 z-50 w-80 max-w-[90vw] h-96 card flex flex-col p-0 overflow-hidden">
          <div className="bg-brand-500 text-white px-4 py-3 font-semibold flex justify-between items-center text-sm">
            <span className="flex items-center gap-1.5">🤖 Safety Assistant</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFakeCall(true)}
                className="bg-white/20 hover:bg-white/30 text-white text-xs px-2 py-1 rounded font-medium flex items-center gap-1"
                title="Decoy Call"
              >
                📞 Fake Call
              </button>
              <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">✕</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                m.role === 'user' ? 'bg-brand-500 text-white ml-auto rounded-br-sm' : 'bg-white border border-slate-200 rounded-bl-sm'
              }`}>
                {m.text}
              </div>
            ))}
            {sending && <div className="text-xs text-slate-400">Assistant is typing…</div>}
            <div ref={bottomRef} />
          </div>
          <div className="p-2 border-t border-slate-200 flex gap-2">
            <input
              className="input text-sm"
              placeholder="Ask about safety…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
            />
            <button className="btn-primary text-sm px-3" onClick={send} disabled={sending}>Send</button>
          </div>
        </div>
      )}

      <FakeCallModal isOpen={showFakeCall} onClose={() => setShowFakeCall(false)} />
    </>
  );
}

