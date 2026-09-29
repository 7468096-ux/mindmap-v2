'use client';

import { useState } from 'react';
import { Language } from '@/data/nodes';

interface Props {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  onResetAll: () => void;
}

export default function SettingsPanel({ lang, isOpen, onClose, onResetAll }: Props) {
  if (!isOpen) return null;

  const [confirmReset, setConfirmReset] = useState(false);

  const handleResetAll = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
      return;
    }
    // Clear all localStorage
    const keys = [
      'mindmap-v2-learning-progress',
      'mindmap-v2-gamification',
      'mindmap-v2-sm2',
      'mindmap-v2-flashcards-known',
      'mindmap-v2-quiz',
    ];
    keys.forEach(k => localStorage.removeItem(k));
    onResetAll();
    setConfirmReset(false);
  };

  const texts = {
    en: {
      title: 'Settings',
      about: 'About',
      version: 'Version',
      author: 'Author',
      tech: 'Tech Stack',
      data: 'Data Management',
      resetAll: 'Reset All Progress',
      resetConfirm: 'Click again to confirm!',
      resetWarning: 'This will clear all XP, streaks, flashcard progress, quiz scores, and learning paths.',
      shortcuts: 'Keyboard Shortcuts',
      source: 'Source Code',
    },
    ru: {
      title: 'Настройки',
      about: 'О проекте',
      version: 'Версия',
      author: 'Автор',
      tech: 'Технологии',
      data: 'Управление данными',
      resetAll: 'Сбросить весь прогресс',
      resetConfirm: 'Нажми ещё раз для подтверждения!',
      resetWarning: 'Это удалит все XP, серии, прогресс карточек, тестов и путей обучения.',
      shortcuts: 'Горячие клавиши',
      source: 'Исходный код',
    },
  };
  const t = texts[lang];

  const shortcuts = [
    { keys: '⌘K', desc: lang === 'ru' ? 'Поиск по нодам' : 'Search nodes' },
    { keys: 'ESC', desc: lang === 'ru' ? 'Закрыть панель' : 'Close panel' },
    { keys: 'Scroll', desc: lang === 'ru' ? 'Масштабирование' : 'Zoom in/out' },
    { keys: 'Drag', desc: lang === 'ru' ? 'Перемещение карты' : 'Pan the map' },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-x-2 bottom-2 md:inset-x-auto md:bottom-auto md:right-4 md:top-16 md:w-[380px] z-50 max-h-[80vh] md:max-h-[85vh] overflow-y-auto bg-gray-900/95 backdrop-blur rounded-2xl shadow-2xl border border-gray-700"
        onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}>

        {/* Header */}
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur p-4 z-10 flex items-center justify-between border-b border-gray-700 rounded-t-2xl">
          <h2 className="text-white font-bold text-lg">⚙️ {t.title}</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white text-xl w-8 h-8 flex items-center justify-center bg-black/20 rounded-full">×</button>
        </div>

        <div className="p-4 space-y-4">
          {/* About */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="text-gray-400 text-xs uppercase tracking-wide mb-3">{t.about}</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">{t.version}</span>
                <span className="text-white font-mono">2.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">{t.author}</span>
                <span className="text-white">Aleksandr Lukashkin</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">{t.tech}</span>
                <span className="text-gray-300 text-xs">Next.js • React • TypeScript</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Nodes</span>
                <span className="text-purple-400 font-bold">112</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Demos</span>
                <span className="text-purple-400 font-bold">25</span>
              </div>
            </div>
            <a
              href="https://github.com/7468096-ux/mindmap-v2"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block text-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors"
            >
              🔗 {t.source}
            </a>
          </div>

          {/* Shortcuts */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="text-gray-400 text-xs uppercase tracking-wide mb-3">⌨️ {t.shortcuts}</div>
            <div className="space-y-2">
              {shortcuts.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <kbd className="text-[10px] text-gray-400 bg-gray-900 px-2 py-1 rounded border border-gray-700 min-w-[48px] text-center font-mono">
                    {s.keys}
                  </kbd>
                  <span className="text-gray-300 text-sm">{s.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-red-900/30">
            <div className="text-gray-400 text-xs uppercase tracking-wide mb-3">🗂 {t.data}</div>
            <p className="text-gray-500 text-xs mb-3">{t.resetWarning}</p>
            <button
              onClick={handleResetAll}
              className={`w-full px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                confirmReset
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-red-900/30 text-red-400 hover:bg-red-900/50 border border-red-800/30'
              }`}
            >
              {confirmReset ? `⚠️ ${t.resetConfirm}` : `🗑 ${t.resetAll}`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
