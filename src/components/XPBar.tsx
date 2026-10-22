'use client';

import { Language } from '@/data/nodes';
import { GamificationState, getLevel, getNextLevel, getLevelProgress } from '@/data/gamification';

interface Props {
  lang: Language;
  state: GamificationState;
}

export default function XPBar({ lang, state }: Props) {
  const level = getLevel(state.totalXP);
  const nextLevel = getNextLevel(state.totalXP);
  const progress = getLevelProgress(state.totalXP);
  const streak = state.streak.currentStreak;

  return (
    <div className="flex items-center gap-3 text-xs">
      {/* Level badge */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-atlas-chalk font-medium">
          {lang === 'ru' ? level.nameRu : level.name}
        </span>
      </div>

      {/* XP Bar */}
      <div className="flex items-center gap-2 min-w-[110px] flex-1">
        <div className="flex-1 h-[3px] bg-atlas-grid rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-atlas-chalk transition-all duration-700 ease-out"
            style={{ width: `${Math.max(progress, 2)}%` }}
          >
          </div>
        </div>
        <span className="text-atlas-mist tabular-nums whitespace-nowrap text-[11px]">
          {state.totalXP}{nextLevel ? `/${nextLevel.minXP}` : ''}
        </span>
      </div>

      {/* Streak */}
      {streak > 0 && (
        <div className="flex items-center gap-0.5 shrink-0">
          <span className="text-atlas-mist text-[11px]">{lang === 'ru' ? 'Серия' : 'Streak'} {streak}</span>
        </div>
      )}
    </div>
  );
}
