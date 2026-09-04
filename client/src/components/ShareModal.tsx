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

  const roomUrl = window.location.origin + window.location.pathname + (window.location.search ? '' : `?room=${room.id}`);

  const handleCopy = () => {
    navigator.clipboard.writeText(roomUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Generate an SVG QR Code representation or high-contrast visual
  // Using an accessible public QR code image or generated SVG
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(roomUrl)}&bgcolor=FFFFFF&color=4F46E5`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" 
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 text-center transition-all">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-3">
          <QrCode className="w-5 h-5" />
        </div>

        <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
          Invite Your Team
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-5">
          Teammates can scan with phone camera or click the invite link.
        </p>

        {/* QR Code container */}
        <div className="w-44 h-44 mx-auto p-2 bg-white rounded-2xl border border-slate-200 shadow-inner flex items-center justify-center mb-5 overflow-hidden">
          <img
            src={qrApiUrl}
            alt="Scan QR code to join room"
            className="w-full h-full object-contain rounded-lg"
          />
        </div>

        {/* Shareable Link Box */}
        <div className="flex items-center space-x-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left mb-4">
          <input
            type="text"
            readOnly
            value={roomUrl}
            className="flex-1 bg-transparent text-xs font-mono text-slate-700 dark:text-slate-300 focus:outline-none px-1 truncate"
          />
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition cursor-pointer shrink-0 inline-flex items-center space-x-1"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <div className="flex items-center justify-center space-x-4 text-[11px] text-slate-400">
          <span className="inline-flex items-center">
            <Smartphone className="w-3 h-3 mr-1" /> Mobile & Tablet ready
          </span>
          <span className="inline-flex items-center">
            <Users className="w-3 h-3 mr-1" /> Unlimited participants
          </span>
        </div>
      </div>
    </div>
  );
};
