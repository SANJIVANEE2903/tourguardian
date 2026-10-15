import React, { useEffect, useState } from 'react';
import { getSocket } from '../socket';

export default function BroadcastBanner() {
  const [broadcast, setBroadcast] = useState(null);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    function handleBroadcast(data) {
      setBroadcast(data);
    }

    socket.on('broadcast:alert', handleBroadcast);
    return () => {
      socket.off('broadcast:alert', handleBroadcast);
    };
  }, []);

  if (!broadcast) return null;

  const bgStyle =
    broadcast.severity === 'critical'
      ? 'bg-rose-600 text-white'
      : broadcast.severity === 'warning'
      ? 'bg-amber-500 text-white'
      : 'bg-brand-600 text-white';

  return (
    <div className={`${bgStyle} px-4 py-3 shadow-lg flex justify-between items-center z-50 sticky top-0 animate-bounce`}>
      <div className="flex items-center gap-3">
        <span className="text-xl">📢</span>
        <div>
          <h4 className="font-bold text-sm leading-tight uppercase tracking-wider">
            [{broadcast.severity}] {broadcast.title}
          </h4>
          <p className="text-xs opacity-95">{broadcast.message}</p>
        </div>
      </div>
      <button
        onClick={() => setBroadcast(null)}
        className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold"
      >
        Dismiss
      </button>
    </div>
  );
}
