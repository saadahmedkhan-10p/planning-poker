import React, { useState } from 'react';
import { usePoker } from '../context/PokerContext';
import { X, Check, Copy } from 'lucide-react';

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

  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(roomUrl)}&bgcolor=FFFFFF&color=000000`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-[360px] text-[#E6EDF3] transition-all"
        style={{
          background: '#161B22',
          border: '1px solid #30363D',
          borderRadius: '12px',
          padding: '24px'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm text-[#E6EDF3]">
            Invite Team
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#1C2128] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Code in clean white box */}
        <div 
          className="w-48 h-48 mx-auto p-2 bg-white rounded-lg flex items-center justify-center mb-4"
          style={{ border: '1px solid #30363D' }}
        >
          <img
            src={qrApiUrl}
            alt="Scan QR code"
            className="w-full h-full object-contain"
          />
        </div>

        {/* URL and Copy */}
        <div 
          className="flex items-center gap-1.5 p-1.5 rounded mb-3"
          style={{
            background: '#0D1117',
            border: '1px solid #30363D',
            borderRadius: '6px'
          }}
        >
          <input
            type="text"
            readOnly
            value={roomUrl}
            className="flex-1 bg-transparent text-xs font-mono text-[#8B949E] focus:outline-none px-2 truncate"
          />
          <button
            onClick={handleCopy}
            className="text-xs font-medium text-white transition cursor-pointer shrink-0 flex items-center gap-1"
            style={{
              background: '#7C3AED',
              borderRadius: '6px',
              padding: '6px 10px',
              border: 'none'
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#6D28D9')}
            onMouseLeave={e => (e.currentTarget.style.background = '#7C3AED')}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#3FB950]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <p className="text-[11px] text-[#8B949E] text-center">
          Share this link with your team to invite them to this room.
        </p>
      </div>
    </div>
  );
};
