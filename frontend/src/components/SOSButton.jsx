import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { getSocket } from '../socket';

export default function SOSButton() {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [open, setOpen] = useState(false);
  const [liveAck, setLiveAck] = useState(false);

  // Listen for the real-time server confirmation that the SOS was received
  // and broadcast to admins — gives instant reassurance beyond the HTTP response.
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    function handleAck() { setLiveAck(true); }
    socket.on('sos:ack', handleAck);
    return () => socket.off('sos:ack', handleAck);
  }, []);

  function getPosition() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => resolve(null),
        { timeout: 5000 }
      );
    });
  }

  async function handleSOS() {
    setSending(true);
    setResult(null);
    setLiveAck(false);
    try {
      const coords = await getPosition();
      const { data } = await api.post('/sos', {
        latitude: coords?.latitude,
        longitude: coords?.longitude,
        message: 'I need help — SOS triggered from TourGuardian app.'
      });
      setResult({ ok: true, data });
    } catch (err) {
      setResult({ ok: false, message: err.response?.data?.message || 'Failed to send SOS.' });
    } finally {
      setSending(false);
      setOpen(true);
    }
  }

  return (
    <>
      <button
        onClick={handleSOS}
        disabled={sending}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-danger-500 hover:bg-danger-600 text-white font-bold shadow-lg flex items-center justify-center text-sm animate-pulse disabled:opacity-70"
        title="Send SOS emergency alert"
      >
        {sending ? '...' : 'SOS'}
      </button>

      {open && result && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="card max-w-md w-full space-y-4" onClick={(e) => e.stopPropagation()}>
            {result.ok ? (
              <>
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="text-3xl">🚨</span>
                  <div>
                    <h3 className="text-lg font-bold text-rose-600 leading-tight">EMERGENCY SOS DISPATCHED</h3>
                    <p className="text-xs text-slate-500">Live GPS tracking broadcasted to Command Center</p>
                  </div>
                </div>

                {result.data.mapsUrl && (
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                    <span className="text-slate-500 block mb-0.5">Live Trackable Google Maps URL:</span>
                    <a
                      href={result.data.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-600 font-mono font-semibold underline break-all"
                    >
                      {result.data.mapsUrl}
                    </a>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Emergency Contacts Notified ({result.data.contactsNotified?.length || 0}):
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {(result.data.contactsNotified || []).map((c, i) => (
                      <div key={i} className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                        <div className="flex justify-between font-semibold text-slate-800">
                          <span>👤 {c.name} ({c.relationship})</span>
                          <span className="text-emerald-700 font-mono">📱 {c.phone}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-tight italic">"{c.messageSent}"</p>
                        <span className={c.dispatchStatus && c.dispatchStatus.includes('REAL_') ? "text-emerald-700 font-bold inline-block bg-emerald-100 text-[10px] px-2 py-0.5 rounded uppercase" : "text-amber-600 font-bold inline-block bg-amber-100 text-[10px] px-2 py-0.5 rounded uppercase"}>
                          {c.dispatchStatus || '✓ DISPATCHED'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-400 text-center">
                  {liveAck ? '✅ Live WebSockets ACK confirmed by Command Center.' : 'Transmitting to rescue nodes...'}
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-rose-600 mb-2">SOS Alert Failed</h3>
                <p className="text-sm text-slate-600 mb-3">{result.message}</p>
              </>
            )}
            <button className="btn-primary w-full bg-slate-800 hover:bg-slate-900" onClick={() => setOpen(false)}>Close & Continue Tracking</button>
          </div>
        </div>
      )}
    </>
  );
}
