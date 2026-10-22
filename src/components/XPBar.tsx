'use client';
import { Trophy16Regular, Fire16Filled } from '@fluentui/react-icons';

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
        <Trophy16Regular className="text-amber-300" aria-hidden />
        <span className="text-white/90 font-semibold">
          {lang === 'ru' ? level.nameRu : level.name}
        </span>
      </div>

      {/* XP Bar */}
      <div className="flex items-center gap-2 min-w-[110px] flex-1">
        <div className="flex-1 h-1 bg-white/[0.1] rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400 transition-all duration-700 ease-out"
            style={{ width: `${Math.max(progress, 2)}%` }}
          >
          </div>
        </div>
        <span className="text-white/55 tabular-nums whitespace-nowrap text-[11px]">
          {state.totalXP}{nextLevel ? `/${nextLevel.minXP}` : ''}
        </span>
      </div>

      {/* Streak */}
      {streak > 0 && (
        <div className="flex items-center gap-0.5 shrink-0">
          <Fire16Filled className="text-orange-400" aria-hidden />
          <span className="text-orange-400 font-bold text-[11px]">{streak}</span>
        </div>
      )}
    </div>
  );
}
