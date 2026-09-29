'use client';

import { useState, useEffect, useMemo } from 'react';
import { Language } from '@/data/nodes';
import { flashcardsData, Flashcard, CardState, loadSM2, saveSM2, getDefaultCardState, sm2, isDue, getDueCount } from '@/data/flashcards';

interface Props {
  lang: Language;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onXP?: () => void;
}

const STORAGE_KEY = 'mindmap-v2-flashcards-known';

export default function FlashcardsPanel({ lang, isOpen, onOpenChange, onXP }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sm2States, setSm2States] = useState<Record<string, CardState>>({});
  const [showDueOnly, setShowDueOnly] = useState(true);
  const [deck, setDeck] = useState<Flashcard[]>([]);

  // Load SM-2 states
  useEffect(() => {
    setSm2States(loadSM2());
  }, []);

  // Build deck
  useEffect(() => {
    if (showDueOnly) {
      const dueDeck = flashcardsData.filter(c => {
        const s = sm2States[c.id];
        return !s || isDue(s);
      });
      setDeck(dueDeck.length > 0 ? dueDeck : flashcardsData);
    } else {
      setDeck(flashcardsData);
    }
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [showDueOnly, sm2States]);

  const dueCount = useMemo(() => getDueCount(flashcardsData, sm2States), [sm2States]);
  const masteredCount = useMemo(() => 
    flashcardsData.filter(c => {
      const s = sm2States[c.id];
      return s && s.repetitions >= 3;
    }).length,
    [sm2States]
  );

  const handleAnswer = (quality: number) => {
    const card = deck[currentIndex];
    if (!card) return;
    
    const currentState = sm2States[card.id] || getDefaultCardState();
    const newState = sm2(currentState, quality);
    
    const newStates = { ...sm2States, [card.id]: newState };
    setSm2States(newStates);
    saveSM2(newStates);
    
    if (quality >= 3 && onXP) onXP();
    
    // Next card
    setIsFlipped(false);
    if (currentIndex < deck.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handleShuffle = () => {
    setDeck(prev => [...prev].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleReset = () => {
    if (confirm(lang === 'ru' ? 'Сбросить весь прогресс SM-2?' : 'Reset all SM-2 progress?')) {
      setSm2States({});
      saveSM2({});
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  };

  const texts = {
    en: {
      title: 'Flashcards',
      subtitle: 'SM-2 spaced repetition',
      due: 'Due',
      mastered: 'mastered',
      shuffle: 'Shuffle',
      dueOnly: 'Due only',
      showAll: 'Show all',
      clickToFlip: 'Click to flip',
      forgot: 'Forgot',
      hard: 'Hard',
      good: 'Good',
      easy: 'Easy',
      allDone: 'All cards reviewed! 🎉',
      comeback: 'Come back tomorrow for review',
    },
    ru: {
      title: 'Карточки',
      subtitle: 'SM-2 интервальное повторение',
      due: 'На повтор',
      mastered: 'изучено',
      shuffle: 'Перемешать',
      dueOnly: 'Только на повтор',
      showAll: 'Показать все',
      clickToFlip: 'Кликни чтобы перевернуть',
      forgot: 'Забыл',
      hard: 'Сложно',
      good: 'Хорошо',
      easy: 'Легко',
      allDone: 'Все карточки повторены! 🎉',
      comeback: 'Возвращайся завтра для повторения',
    },
  };
  const t = texts[lang];

  const currentCard = deck[currentIndex];
  const progressPercent = Math.round((masteredCount / flashcardsData.length) * 100);

  return (
    <>
      {/* Panel */}
      {isOpen && (
        <div className="fixed right-4 top-[180px] z-40 w-96 bg-gray-900/95 backdrop-blur rounded-xl shadow-2xl overflow-hidden border border-gray-700">
          {/* Header */}
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-white font-bold text-lg">{t.title}</h2>
            <p className="text-gray-400 text-sm">{t.subtitle}</p>
            
            {/* Progress */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span className="text-red-400">{t.due}: {dueCount}</span>
                <span>{masteredCount}/{flashcardsData.length} {t.mastered} ({progressPercent}%)</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="p-4 border-b border-gray-800 flex gap-2 flex-wrap">
            <button onClick={handleShuffle} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-sm transition-colors">
              🔀 {t.shuffle}
            </button>
            <button onClick={() => setShowDueOnly(!showDueOnly)}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                showDueOnly ? 'bg-purple-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}>
              {showDueOnly ? '📚 ' + t.showAll : '🎯 ' + t.dueOnly}
            </button>
            <button onClick={handleReset} className="px-3 py-1.5 bg-gray-800 hover:bg-red-900/50 text-gray-400 hover:text-red-400 rounded text-sm transition-colors ml-auto">
              🔄 Reset
            </button>
          </div>

          {/* Card Display */}
          <div className="p-6">
            {deck.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-2">🎉</div>
                <p className="text-white font-medium">{t.allDone}</p>
                <p className="text-gray-500 text-sm mt-2">{t.comeback}</p>
              </div>
            ) : currentCard ? (
              <>
                {/* Card */}
                <div onClick={() => setIsFlipped(!isFlipped)} style={{ perspective: '1000px', cursor: 'pointer' }}>
                  <div style={{
                    position: 'relative', width: '100%', height: '250px',
                    transformStyle: 'preserve-3d', transition: 'transform 0.6s',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}>
                    {/* Front */}
                    <div style={{
                      position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                      backgroundColor: 'rgba(139, 92, 246, 0.1)', border: '2px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '12px', padding: '24px',
                    }}>
                      <div className="text-6xl mb-4">{currentCard.emoji}</div>
                      <div className="text-white text-2xl font-bold text-center">{currentCard.front[lang]}</div>
                      <div className="text-gray-500 text-xs mt-4">{t.clickToFlip}</div>
                    </div>
                    {/* Back */}
                    <div style={{
                      position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                      backgroundColor: 'rgba(219, 39, 119, 0.1)', border: '2px solid rgba(219, 39, 119, 0.3)',
                      borderRadius: '12px', padding: '24px',
                    }}>
                      <div className="text-gray-300 text-sm leading-relaxed text-center">{currentCard.back[lang]}</div>
                    </div>
                  </div>
                </div>

                {/* Counter */}
                <div className="text-center text-gray-500 text-sm mt-4">{currentIndex + 1} / {deck.length}</div>

                {/* SM-2 Answer Buttons */}
                {isFlipped && (
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    <button onClick={(e) => { e.stopPropagation(); handleAnswer(1); }}
                      className="px-2 py-2.5 bg-red-900/40 hover:bg-red-800/60 text-red-300 rounded-lg text-xs font-medium transition-colors border border-red-800/30">
                      😵 {t.forgot}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleAnswer(3); }}
                      className="px-2 py-2.5 bg-orange-900/40 hover:bg-orange-800/60 text-orange-300 rounded-lg text-xs font-medium transition-colors border border-orange-800/30">
                      😓 {t.hard}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleAnswer(4); }}
                      className="px-2 py-2.5 bg-green-900/40 hover:bg-green-800/60 text-green-300 rounded-lg text-xs font-medium transition-colors border border-green-800/30">
                      😊 {t.good}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleAnswer(5); }}
                      className="px-2 py-2.5 bg-blue-900/40 hover:bg-blue-800/60 text-blue-300 rounded-lg text-xs font-medium transition-colors border border-blue-800/30">
                      🤓 {t.easy}
                    </button>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}

    </>
  );
}
