import React, { useState, useEffect, useRef } from 'react';

export default function FakeCallModal({ isOpen, onClose }) {
  const [callState, setCallState] = useState('incoming'); // 'incoming' | 'active'
  const [caller, setCaller] = useState({ name: 'Mom 👩', number: '+1 (555) 234-5678' });
  const [timer, setTimer] = useState(0);

  const audioCtxRef = useRef(null);
  const ringIntervalRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Synthesize realistic dual-tone phone ring (440Hz + 480Hz) using Web Audio API
  function startRingtone() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const playRingBurst = () => {
        if (ctx.state === 'closed') return;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(440, ctx.currentTime);
        osc2.frequency.setValueAtTime(480, ctx.currentTime);

        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(ctx.currentTime);
        osc2.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 1.8);
        osc2.stop(ctx.currentTime + 1.8);
      };

      playRingBurst();
      ringIntervalRef.current = setInterval(playRingBurst, 3000);
    } catch (e) {
      console.warn('Web Audio API not permitted or available:', e);
    }
  }

  function stopRingtone() {
    if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
  }

  useEffect(() => {
    if (isOpen) {
      setCallState('incoming');
      setTimer(0);
      startRingtone();
    } else {
      stopRingtone();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      stopRingtone();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isOpen]);

  function handleAccept() {
    stopRingtone();
    setCallState('active');
    setTimer(0);
    timerIntervalRef.current = setInterval(() => {
      setTimer((t) => t + 1);
    }, 1000);
  }

  function handleEnd() {
    stopRingtone();
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    onClose();
  }

  if (!isOpen) return null;

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const callers = [
    { name: 'Mom 👩', number: '+1 (555) 234-5678' },
    { name: 'Dad 👨', number: '+1 (555) 876-5432' },
    { name: 'Hotel Front Desk 🏨', number: '+91 (022) 6789-1234' },
    { name: 'Office / Boss 💼', number: '+1 (555) 990-1122' },
    { name: 'Emergency Dispatch 📞', number: '+112 (Priority Unit)' }
  ];

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-2xl text-white flex flex-col justify-between items-center p-8 select-none font-sans">
      {/* Top Header & Caller Selector */}
      <div className="w-full max-w-sm flex flex-col items-center pt-8 space-y-4 text-center">
        <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
          {callState === 'incoming' ? 'Incoming Call...' : `Active Call • ${formatTimer(timer)}`}
        </span>

        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-slate-700 to-slate-500 border-2 border-white/20 shadow-2xl flex items-center justify-center text-4xl animate-pulse">
          {caller.name.slice(-2)}
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight">{caller.name}</h2>
          <p className="text-sm text-slate-400 mt-1 font-mono">{caller.number}</p>
        </div>

        {/* Quick Caller Picker (Only visible during incoming ring state) */}
        {callState === 'incoming' && (
          <div className="flex gap-1.5 flex-wrap justify-center pt-2">
            {callers.map((c) => (
              <button
                key={c.name}
                onClick={() => setCaller(c)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition ${
                  caller.name === c.name
                    ? 'bg-white/20 border-white text-white font-bold'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Center status for active call */}
      {callState === 'active' && (
        <div className="grid grid-cols-3 gap-6 w-full max-w-xs text-center my-6">
          <div className="p-3 bg-white/10 rounded-2xl cursor-pointer hover:bg-white/20">
            <span className="text-xl block mb-1">🎙️</span>
            <span className="text-[11px] text-slate-300">Mute</span>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl cursor-pointer hover:bg-white/20">
            <span className="text-xl block mb-1">🔢</span>
            <span className="text-[11px] text-slate-300">Keypad</span>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl cursor-pointer hover:bg-white/20">
            <span className="text-xl block mb-1">🔊</span>
            <span className="text-[11px] text-slate-300">Speaker</span>
          </div>
        </div>
      )}

      {/* Bottom Action Controls */}
      <div className="w-full max-w-sm pb-10 flex justify-around items-center">
        {callState === 'incoming' ? (
          <>
            <button
              onClick={handleEnd}
              className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xl flex items-center justify-center text-2xl transition transform active:scale-95"
              title="Decline"
            >
              🚫
            </button>
            <button
              onClick={handleAccept}
              className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-xl flex items-center justify-center text-2xl transition transform active:scale-95 animate-bounce"
              title="Accept"
            >
              📞
            </button>
          </>
        ) : (
          <button
            onClick={handleEnd}
            className="w-20 h-20 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-2xl flex items-center justify-center text-3xl transition transform active:scale-95"
            title="End Call"
          >
            🔴
          </button>
        )}
      </div>
    </div>
  );
}
