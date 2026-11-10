import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useReducedMotion } from 'framer-motion';

const ExperienceContext = createContext({
  paused: false,
  stopped: false,
  systemReduced: false,
  toggleMotion: () => {},
});

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const stopped = paused || Boolean(reduced);
  useEffect(() => {
    document.documentElement.dataset.motion = stopped ? 'paused' : 'running';
    return () => {
      delete document.documentElement.dataset.motion;
    };
  }, [stopped]);
  return (
    <ExperienceContext.Provider
      value={{
        paused,
        stopped,
        systemReduced: Boolean(reduced),
        toggleMotion: () => setPaused((value) => !value),
      }}
    >
      {children}
    </ExperienceContext.Provider>
  );
}

export const useExperience = () => useContext(ExperienceContext);
