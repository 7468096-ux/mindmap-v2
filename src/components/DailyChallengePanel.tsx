'use client';

import { useState, useEffect, useMemo } from 'react';
import { Language } from '@/data/nodes';
import { topicQuizzes, TopicQuestion } from '@/data/topicQuizzes';

interface Props {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  onXP: (xp: number) => void;
}

const DAILY_KEY = 'mindmap-v2-daily-challenge';

interface DailyState {
  date: string;
  questionIndex: number;
  answered: boolean;
  correct: boolean;
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

// Get all questions flattened
function getAllQuestions(): (TopicQuestion & { topicTitle: { en: string; ru: string } })[] {
  const all: (TopicQuestion & { topicTitle: { en: string; ru: string } })[] = [];
  topicQuizzes.forEach(q => {
    q.questions.forEach(question => {
      all.push({ ...question, topicTitle: q.title });
    });
  });
  return all;
}

// Deterministic daily question based on date
function getDailyIndex(date: string, total: number): number {
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    hash = ((hash << 5) - hash) + date.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % total;
}

export default function DailyChallengePanel({ lang, isOpen, onClose, onXP }: Props) {
  const [state, setState] = useState<DailyState | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const allQuestions = useMemo(() => getAllQuestions(), []);
  const today = getToday();
  const dailyIndex = getDailyIndex(today, allQuestions.length);
  const question = allQuestions[dailyIndex];

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DAILY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DailyState;
        if (parsed.date === today) {
          setState(parsed);
          if (parsed.answered) {
            setShowResult(true);
            setSelected(parsed.correct ? question.correctIndex : -1);
          }
        }
      }
    } catch {}
  }, [today, question.correctIndex]);

  const handleAnswer = (index: number) => {
    if (showResult) return;
    setSelected(index);
    setShowResult(true);
    const correct = index === question.correctIndex;
    const newState: DailyState = { date: today, questionIndex: dailyIndex, answered: true, correct };
    setState(newState);
    localStorage.setItem(DAILY_KEY, JSON.stringify(newState));
    if (correct) onXP(15);
  };

  if (!isOpen) return null;

  const t = {
    en: { title: 'Daily Challenge', subtitle: 'One question a day keeps forgetting away', topic: 'Topic', reward: '+15 XP for correct answer', correct: 'Correct! 🎉', wrong: 'Not quite...', alreadyDone: 'Come back tomorrow!', explanation: 'Explanation' },
    ru: { title: 'Задача дня', subtitle: 'Один вопрос в день — и знания крепче', topic: 'Тема', reward: '+15 XP за правильный ответ', correct: 'Правильно! 🎉', wrong: 'Не совсем...', alreadyDone: 'Возвращайся завтра!', explanation: 'Объяснение' },
  }[lang];

  const alreadyAnswered = state?.answered && state?.date === today;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-x-2 bottom-2 md:inset-x-auto md:bottom-auto md:right-4 md:top-16 md:w-[440px] z-50 max-h-[80vh] md:max-h-[85vh] overflow-y-auto bg-gray-900/95 backdrop-blur rounded-2xl shadow-2xl border border-gray-700"
        onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}>
        <div className="p-4 bg-gradient-to-r from-amber-900/40 to-orange-900/40 border-b border-gray-700 rounded-t-2xl flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-lg">🎯 {t.title}</h2>
            <p className="text-gray-400 text-xs">{t.subtitle}</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white text-xl w-8 h-8 flex items-center justify-center bg-black/20 rounded-full">×</button>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-purple-400 uppercase tracking-wide">{t.topic}: {question.topicTitle[lang]}</span>
            <span className="text-xs text-amber-400">{t.reward}</span>
          </div>

          <h3 className="text-white text-lg font-medium mb-5">{question.question[lang]}</h3>

          <div className="space-y-2">
            {question.options[lang].map((opt, i) => {
              const isCorrect = i === question.correctIndex;
              const isSelected = selected === i;
              let cls = 'w-full p-3.5 rounded-lg text-left transition-all border-2 text-sm ';
              if (showResult) {
                if (isCorrect) cls += 'bg-green-900/20 border-green-600 text-green-300';
                else if (isSelected) cls += 'bg-red-900/20 border-red-600 text-red-300';
                else cls += 'bg-gray-800/50 border-gray-700 text-gray-500';
              } else {
                cls += 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50 hover:border-gray-600 cursor-pointer';
              }
              return (
                <button key={i} onClick={() => handleAnswer(i)} disabled={showResult} className={cls}>
                  <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
                  {showResult && isCorrect && ' ✓'}
                </button>
              );
            })}
          </div>

          {showResult && (
            <div className="mt-4 space-y-3">
              <div className={`text-center py-3 rounded-lg font-bold ${
                (alreadyAnswered ? state?.correct : selected === question.correctIndex)
                  ? 'bg-green-900/20 text-green-400'
                  : 'bg-red-900/20 text-red-400'
              }`}>
                {(alreadyAnswered ? state?.correct : selected === question.correctIndex) ? t.correct : t.wrong}
              </div>
              <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">{t.explanation}</div>
                <p className="text-gray-300 text-sm">{question.explanation[lang]}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
