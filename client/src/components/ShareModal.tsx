import React, { useState } from 'react';
import { usePoker } from '../context/PokerContext';
import { X, Copy, Check, QrCode, Smartphone, Users } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const { room } = usePoker();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !room) return null;

  const roomUrl = `${window.location.origin}${window.location.pathname}?room=${room.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(roomUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(roomUrl)}&bgcolor=FFFFFF&color=7C3AED`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-sm glass-card rounded-2xl shadow-2xl border border-white/10 p-6 z-10 text-center transition-all text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-10 h-10 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 mx-auto mb-3">
          <QrCode className="w-5 h-5" />
        </div>

        <h3 className="font-heading font-bold text-lg text-white">
          Invite Your Team
        </h3>
        <p className="text-xs text-slate-400 mt-0.5 mb-5">
          Scan QR with a mobile camera or share the direct link below.
        </p>

        {/* QR Code container */}
        <div className="w-48 h-48 mx-auto p-2 bg-white rounded-2xl shadow-inner flex items-center justify-center mb-5 overflow-hidden">
          <img
            src={qrApiUrl}
            alt="Scan QR code to join room"
            className="w-full h-full object-contain rounded-xl"
          />
        </div>

        {/* Shareable Link Box */}
        <div className="flex items-center space-x-1.5 p-2 rounded-xl bg-white/5 border border-white/10 text-left mb-4">
          <input
            type="text"
            readOnly
            value={roomUrl}
            className="flex-1 bg-transparent text-xs font-mono text-slate-300 focus:outline-none px-1 truncate"
          />
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 transition cursor-pointer shrink-0 inline-flex items-center space-x-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <div className="flex items-center justify-center space-x-4 text-[11px] text-slate-400">
          <span className="inline-flex items-center">
            <Smartphone className="w-3 h-3 mr-1 text-violet-400" /> Mobile & Tablet ready
          </span>
          <span className="inline-flex items-center">
            <Users className="w-3 h-3 mr-1 text-cyan-400" /> Unlimited estimators
          </span>
        </div>
      </div>
    </div>
  );
};
