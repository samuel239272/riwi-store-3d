import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  gameLevels,
  isCorrect,
  levelId,
  rewards,
  type GameId,
  type CodingReward,
} from '../../data/codingGames';

export const rewardsStorageKey = 'riwi-coding-rewards-v1';
interface Progress {
  completed: string[];
  activeCode: string | null;
}
const empty = (): Progress => ({ completed: [], activeCode: null });
function readProgress(): Progress {
  try {
    const stored = JSON.parse(localStorage.getItem(rewardsStorageKey) ?? 'null');
    if (stored?.version !== 1 || !Array.isArray(stored.completed)) return empty();
    const completed: string[] = [];
    for (const game of ['debug', 'pipeline'] as GameId[]) {
      for (let i = 0; i < gameLevels[game].length; i++) {
        const id = levelId(game, i);
        if (!stored.completed.includes(id)) break;
        completed.push(id);
      }
    }
    const activeCode =
      rewards.find((r) => r.code === stored.activeCode && completed.includes(r.id))?.code ?? null;
    return { completed, activeCode };
  } catch {
    return empty();
  }
}
interface RewardContext {
  completed: string[];
  earned: CodingReward[];
  active: CodingReward | null;
  durable: boolean;
  solve: (game: GameId, index: number, answer: string | number[]) => boolean;
  apply: (code: string) => boolean;
  remove: () => void;
}
const Context = createContext<RewardContext | null>(null);
export function RewardsProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState(readProgress);
  const [durable, setDurable] = useState(true);
  useEffect(() => {
    try {
      localStorage.setItem(rewardsStorageKey, JSON.stringify({ version: 1, ...progress }));
      setDurable(true);
    } catch {
      setDurable(false);
    }
  }, [progress]);
  const earned = rewards.filter((r) => progress.completed.includes(r.id));
  const active = earned.find((r) => r.code === progress.activeCode) ?? null;
  const solve: RewardContext['solve'] = (game, index, answer) => {
    if (index > 0 && !progress.completed.includes(levelId(game, index - 1))) return false;
    if (!isCorrect(game, index, answer)) return false;
    const id = levelId(game, index);
    setProgress((current) =>
      current.completed.includes(id)
        ? current
        : { ...current, completed: [...current.completed, id] },
    );
    return true;
  };
  const apply = (code: string) => {
    const reward = earned.find((r) => r.code === code.trim().toUpperCase());
    if (!reward) return false;
    setProgress((current) => ({ ...current, activeCode: reward.code }));
    return true;
  };
  return (
    <Context.Provider
      value={{
        completed: progress.completed,
        earned,
        active,
        durable,
        solve,
        apply,
        remove: () => setProgress((current) => ({ ...current, activeCode: null })),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useRewards() {
  const context = useContext(Context);
  if (!context) throw new Error('RewardsProvider is required');
  return context;
}
