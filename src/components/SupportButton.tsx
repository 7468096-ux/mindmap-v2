'use client';

import { useState } from 'react';
import { Language } from '@/data/nodes';

interface Props {
  lang: Language;
  isModal?: boolean;
  onClose?: () => void;
}

export default function SupportButton({ lang, isModal = false, onClose }: Props) {
  const [isOpen, setIsOpen] = useState(isModal);
  const [copied, setCopied] = useState<string | null>(null);

  const texts = {
    en: {
      title: 'Support the Project',
      subtitle: 'If you find this helpful, you can say thanks 💝',
      copy: 'Copy Address',
      copied: 'Copied!',
      close: 'Close',
      recommended: 'Recommended',
    },
    ru: {
      title: 'Поддержать проект',
      subtitle: 'Если вам помогло — можете сказать спасибо 💝',
      copy: 'Скопировать адрес',
      copied: 'Скопировано!',
      close: 'Закрыть',
      recommended: 'Рекомендую',
    },
  };
  const t = texts[lang];

  // basePath для GitHub Pages
  const basePath = process.env.NODE_ENV === 'production' ? '/mindmap-v2' : '';
  // Version for cache busting
  const version = 'v3';
  
  const wallets = [
    {
      name: 'USDT (TRC20)',
      address: 'TDZTpZxkAZU6SsvRWFJTZcWYjxB8kgcpZA',
      qr: `${basePath}/usdt-qr.jpg?${version}`,
      emoji: '💵',
      recommended: true,
    },
    {
      name: 'Bitcoin',
      address: '1F22c1d4rVwgWnKvLF8i8oxnbFDVSvLkv7',
      qr: `${basePath}/btc-qr.jpg?${version}`,
      emoji: '₿',
    },
    {
      name: 'Ethereum (ERC20)',
      address: '0x73fe57f0f560e7cdb83d968711d964b43c3fb2b0',
      qr: `${basePath}/eth-qr.jpg?${version}`,
      emoji: '⟠',
    },
  ];

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(address);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <>
      {/* Toggle Button — hidden when in modal mode */}
      {!isModal && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed right-4 bottom-4 z-50 px-4 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-full font-medium transition-all shadow-lg hover:shadow-xl hover:scale-105"
        >
          ☕ Support
        </button>
      )}

      {/* Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => { setIsOpen(false); onClose?.(); }}
          />

          {/* Modal Content - Side Panel like InfoPanel */}
          <div className="fixed inset-x-2 bottom-2 md:bottom-auto md:inset-x-auto md:right-4 md:top-4 md:w-[440px] z-50 max-h-[80vh] md:max-h-[92vh] overflow-y-auto bg-gray-900/95 backdrop-blur rounded-2xl shadow-2xl border border-gray-700">
            {/* Header */}
            <div className="sticky top-0 bg-gray-900/95 backdrop-blur border-b border-gray-700 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-white font-bold text-2xl">{t.title}</h2>
                  <p className="text-gray-400 text-sm mt-1">{t.subtitle}</p>
                </div>
                <button
                  onClick={() => { setIsOpen(false); onClose?.(); }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Wallets */}
            <div className="p-6 space-y-6">
              {wallets.map((wallet) => (
                <div
                  key={wallet.address}
                  className="bg-gray-800/50 rounded-xl p-5 border border-gray-700"
                >
                  {/* Wallet Name */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-3xl">{wallet.emoji}</span>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg">{wallet.name}</h3>
                      {wallet.recommended && (
                        <span className="text-xs text-green-400">⚡ {t.recommended}</span>
                      )}
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-shrink-0 mx-auto md:mx-0 w-48 h-48 rounded-lg overflow-hidden bg-white">
                      <img
                        src={wallet.qr}
                        alt={`${wallet.name} QR`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                      {/* Address */}
                      <div className="mb-3">
                        <p className="text-gray-400 text-xs mb-1">Wallet Address:</p>
                        <code className="block text-white text-sm bg-gray-900/70 px-3 py-2 rounded border border-gray-700 break-all">
                          {wallet.address}
                        </code>
                      </div>

                      {/* Copy Button */}
                      <button
                        onClick={() => copyAddress(wallet.address)}
                        className={`w-full px-4 py-2 rounded-lg font-medium transition-all ${
                          copied === wallet.address
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        }`}
                      >
                        {copied === wallet.address ? '✓ ' + t.copied : '📋 ' + t.copy}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur border-t border-gray-700 p-4">
              <button
                onClick={() => { setIsOpen(false); onClose?.(); }}
                className="w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors"
              >
                {t.close}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
