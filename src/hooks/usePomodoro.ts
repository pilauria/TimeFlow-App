import { useState, useEffect } from 'react';
import { playNotificationSound } from '../assets/sound';

export interface Durations {
  work: number;
  shortBreak: number;
  longBreak: number;
}

export type PomodoroMode = 'work' | 'shortBreak' | 'longBreak';

export const usePomodoro = () => {
  const [mode, setMode] = useState<PomodoroMode>('work');
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const [durations, setDurations] = useState<Durations>(() => {
    const saved = localStorage.getItem('pomodoroDurations');
    return saved ? JSON.parse(saved) : { work: 25, shortBreak: 5, longBreak: 15 };
  });

  const [timeLeft, setTimeLeft] = useState(durations.work * 60);

  useEffect(() => {
    localStorage.setItem('pomodoroDurations', JSON.stringify(durations));

    const persistToDisk = async () => {
      try {
        await window.ipcRenderer?.invoke('storage:save', { pomodoroDurations: durations });
      } catch (error) {
        console.error('Failed to persist Pomodoro settings', error);
      }
    };

    persistToDisk();
  }, [durations]);

  // Removed Audio init, using direct function call

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      playNotificationSound();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    let cancelled = false;

    const loadPersisted = async () => {
      try {
        const data = await window.ipcRenderer?.invoke('storage:load') as { pomodoroDurations?: Durations } | null;
        if (cancelled || !data?.pomodoroDurations) return;

        setDurations(data.pomodoroDurations);
        setTimeLeft(data.pomodoroDurations[mode] * 60);
      } catch (error) {
        console.error('Failed to load Pomodoro settings', error);
      }
    };

    loadPersisted();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(durations[mode] * 60);
    }
  }, [durations, mode]);

  const switchMode = (newMode: PomodoroMode) => {
    setMode(newMode);
    setTimeLeft(durations[newMode] * 60);
    setIsActive(false);
  };

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(durations[mode] * 60);
  };

  const handleDurationChange = (key: keyof Durations, value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num > 0) {
      setDurations(prev => ({ ...prev, [key]: num }));
    }
  };

  return {
    mode,
    isActive,
    timeLeft,
    showSettings,
    durations,
    setShowSettings,
    switchMode,
    toggleTimer,
    resetTimer,
    handleDurationChange
  };
};
