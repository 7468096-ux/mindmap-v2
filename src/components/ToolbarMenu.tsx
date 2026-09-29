'use client';

import { useState, useRef, useEffect } from 'react';
import { Language } from '@/data/nodes';
import { GamificationState, getLevel } from '@/data/gamification';

export type PanelId = 'recipes' | 'paths' | 'flashcards' | 'quiz' | 'support' | 'stats' | 'settings' | 'timeline' | 'glossary' | 'daily' | 'models' | 'relations' | null;

interface Props {
  lang: Language;
  openPanel: PanelId;
  onPanelChange: (panel: PanelId) => void;
  onSearch: () => void;
  expandAll: boolean;
  onToggleExpandAll: () => void;
  gamification: GamificationState;
  dueCards: number;
  totalNodes: number;
  completedNodes: number;
}

interface MenuItem {
  id: PanelId;
  emoji: string;
  label: { en: string; ru: string };
  badge?: string | number;
  dividerAfter?: boolean;
  section?: string;
}

export default function ToolbarMenu({
  lang, openPanel, onPanelChange, onSearch,
  expandAll, onToggleExpandAll, gamification,
  dueCards, totalNodes, completedNodes,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const level = getLevel(gamification.totalXP);

  const menuItems: MenuItem[] = [
    { id: 'recipes', emoji: '🧩', label: { en: 'Solve a Task with AI', ru: 'Решить задачу с AI' }, section: lang === 'ru' ? 'Применение' : 'Apply', dividerAfter: true },
    { id: 'paths', emoji: '📚', label: { en: 'Learning Paths', ru: 'Пути изучения' }, section: lang === 'ru' ? 'Обучение' : 'Learn' },
    { id: 'flashcards', emoji: '🎴', label: { en: 'Flashcards (SM-2)', ru: 'Карточки (SM-2)' }, badge: dueCards > 0 ? dueCards : undefined },
    { id: 'quiz', emoji: '📝', label: { en: 'Mini-Quiz', ru: 'Мини-тест' } },
    { id: 'daily', emoji: '🎯', label: { en: 'Daily Challenge', ru: 'Задача дня' }, dividerAfter: true },
    { id: 'timeline', emoji: '📰', label: { en: 'AI Timeline', ru: 'Хронология AI' }, section: lang === 'ru' ? 'Справочник' : 'Reference' },
    { id: 'glossary', emoji: '📖', label: { en: 'Glossary', ru: 'Глоссарий' } },
    { id: 'models', emoji: '📊', label: { en: 'Model Comparison', ru: 'Сравнение моделей' } },
    { id: 'relations', emoji: '🔗', label: { en: 'Concept Relations', ru: 'Связи концепций' }, dividerAfter: true },
    { id: 'stats', emoji: '🏆', label: { en: 'My Progress', ru: 'Мой прогресс' }, section: lang === 'ru' ? 'Профиль' : 'Profile' },
    { id: 'settings', emoji: '⚙️', label: { en: 'Settings', ru: 'Настройки' }, dividerAfter: true },
    { id: 'support', emoji: '☕', label: { en: 'Support Project', ru: 'Поддержать проект' } },
  ];

  const handleItemClick = (id: PanelId) => {
    onPanelChange(openPanel === id ? null : id);
    setIsOpen(false);
  };

  return (
    <div ref={menuRef} className="fixed right-4 top-4 z-40" data-no-pan>
      {/* Main menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
          isOpen
            ? 'bg-purple-600/90 text-white shadow-lg shadow-purple-500/20'
            : 'bg-gray-950/40 backdrop-blur-xl text-gray-300 hover:text-white border border-white/[0.06] hover:border-white/[0.12] shadow-2xl'
        }`}
      >
        <span className={`text-lg transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}>
          {isOpen ? '✕' : '☰'}
        </span>
        <span className="hidden sm:inline text-sm">{lang === 'ru' ? 'Меню' : 'Menu'}</span>
        {dueCards > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse shadow-lg shadow-red-500/30">
            {dueCards > 9 ? '9+' : dueCards}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-14 w-[272px] bg-gray-950/80 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/[0.07] overflow-hidden animate-in"
          style={{ animation: 'menuSlide 0.2s ease-out' }}>
          
          {/* Profile header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-purple-500/10 via-fuchsia-500/10 to-pink-500/10 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 flex items-center justify-center text-xl">
                {level.emoji}
              </div>
              <div className="flex-1">
                <div className="text-white text-sm font-semibold tracking-wide">
                  {lang === 'ru' ? level.nameRu : level.name}
                </div>
                <div className="text-gray-500 text-[11px] font-mono">
                  {gamification.totalXP} XP • {completedNodes}/{totalNodes}
                </div>
              </div>
              {gamification.streak.currentStreak > 0 && (
                <div className="flex items-center gap-0.5 bg-orange-500/10 px-2 py-1 rounded-lg border border-orange-500/20">
                  <span className="text-sm">🔥</span>
                  <span className="text-orange-400 text-xs font-bold">{gamification.streak.currentStreak}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex border-b border-white/[0.06]">
            <button
              onClick={() => { onSearch(); setIsOpen(false); }}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              <span className="text-sm">🔍</span>
              <span className="text-xs">{lang === 'ru' ? 'Поиск' : 'Search'}</span>
              <kbd className="text-[9px] text-gray-600 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">⌘K</kbd>
            </button>
            <div className="w-px bg-white/[0.06]" />
            <button
              onClick={() => { onToggleExpandAll(); setIsOpen(false); }}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              <span className="text-sm">{expandAll ? '📁' : '📂'}</span>
              <span className="text-xs">
                {expandAll ? (lang === 'ru' ? 'Свернуть' : 'Collapse') : (lang === 'ru' ? 'Развернуть' : 'Expand')}
              </span>
            </button>
          </div>

          {/* Menu items */}
          <div className="py-1.5 max-h-[50vh] overflow-y-auto">
            {menuItems.map((item) => (
              <div key={item.id}>
                {item.section && (
                  <div className="px-4 pt-2.5 pb-1 text-[10px] text-gray-600 uppercase tracking-[0.15em] font-medium">
                    {item.section}
                  </div>
                )}
                <button
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2 transition-all duration-150 ${
                    openPanel === item.id
                      ? 'bg-purple-500/10 text-purple-300'
                      : 'text-gray-400 hover:bg-white/[0.03] hover:text-gray-200'
                  }`}
                >
                  <span className="text-base w-6 text-center">{item.emoji}</span>
                  <span className="flex-1 text-left text-[13px]">{item.label[lang]}</span>
                  {item.badge && (
                    <span className="text-[10px] bg-red-500/90 text-white min-w-[18px] h-[18px] px-1 rounded-full font-bold flex items-center justify-center shadow-sm">
                      {item.badge}
                    </span>
                  )}
                  {openPanel === item.id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  )}
                </button>
                {item.dividerAfter && <div className="border-t border-white/[0.04] my-1" />}
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes menuSlide {
          from { opacity: 0; transform: translateY(-8px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
