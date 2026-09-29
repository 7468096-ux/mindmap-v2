// Gamification: XP, Levels, Streaks

export interface XPAction {
  type: 'read_node' | 'flashcard' | 'quiz_correct' | 'complete_path' | 'quiz_finish';
  xp: number;
}

export const XP_REWARDS: Record<string, number> = {
  read_node: 0,      // No XP for just reading — must pass topic exam
  flashcard: 0,      // Practice, not XP source
  quiz_correct: 0,   // General quiz — no XP
  complete_path: 0,  // Path completion — no XP
  quiz_finish: 0,    // General quiz finish — no XP
  topic_exam: 0,     // Awarded dynamically from TopicQuiz.xpReward
};

export interface Level {
  name: string;
  nameRu: string;
  minXP: number;
  emoji: string;
}

export const LEVELS: Level[] = [
  { name: 'Novice', nameRu: 'Новичок', minXP: 0, emoji: '🌱' },
  { name: 'Explorer', nameRu: 'Исследователь', minXP: 100, emoji: '🔭' },
  { name: 'Practitioner', nameRu: 'Практик', minXP: 500, emoji: '⚡' },
  { name: 'Expert', nameRu: 'Эксперт', minXP: 1500, emoji: '🧠' },
  { name: 'Master', nameRu: 'Мастер', minXP: 5000, emoji: '👑' },
];

export function getLevel(xp: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getNextLevel(xp: number): Level | null {
  const current = getLevel(xp);
  const idx = LEVELS.indexOf(current);
  return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
}

export function getLevelProgress(xp: number): number {
  const current = getLevel(xp);
  const next = getNextLevel(xp);
  if (!next) return 100;
  return Math.round(((xp - current.minXP) / (next.minXP - current.minXP)) * 100);
}

// Streak
export interface StreakData {
  currentStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  longestStreak: number;
}

const GAMIFICATION_KEY = 'mindmap-v2-gamification';

export interface GamificationState {
  totalXP: number;
  streak: StreakData;
  readNodes: string[];
}

export function loadGamification(): GamificationState {
  if (typeof window === 'undefined') {
    return { totalXP: 0, streak: { currentStreak: 0, lastActiveDate: '', longestStreak: 0 }, readNodes: [] };
  }
  try {
    const raw = localStorage.getItem(GAMIFICATION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { totalXP: 0, streak: { currentStreak: 0, lastActiveDate: '', longestStreak: 0 }, readNodes: [] };
}

export function saveGamification(state: GamificationState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GAMIFICATION_KEY, JSON.stringify(state));
  } catch {}
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function updateStreak(streak: StreakData): StreakData {
  const today = getToday();
  if (streak.lastActiveDate === today) return streak;
  
  const yesterday = getYesterday();
  let newStreak: number;
  
  if (streak.lastActiveDate === yesterday) {
    newStreak = streak.currentStreak + 1;
  } else {
    newStreak = 1;
  }
  
  return {
    currentStreak: newStreak,
    lastActiveDate: today,
    longestStreak: Math.max(streak.longestStreak, newStreak),
  };
}

export function awardXP(state: GamificationState, action: string): GamificationState {
  const xp = XP_REWARDS[action] || 0;
  const newState = {
    ...state,
    totalXP: state.totalXP + xp,
    streak: updateStreak(state.streak),
  };
  saveGamification(newState);
  return newState;
}
