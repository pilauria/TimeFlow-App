import { useState, useEffect, useRef } from 'react';

export const useTimer = () => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let interval: any = null;
    
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const startTimer = (projectId: string) => {
    setActiveProjectId(projectId);
    setIsActive(true);
    startTimeRef.current = Date.now();
  };

  const stopTimer = () => {
    setIsActive(false);
    const endTime = Date.now();
    const duration = seconds;
    const startTime = startTimeRef.current || (endTime - duration * 1000);
    
    const sessionData = {
        projectId: activeProjectId!,
        startTime,
        endTime,
        duration
    };

    setSeconds(0);
    setActiveProjectId(null);
    startTimeRef.current = null;

    return sessionData;
  };

  const resetTimer = () => {
    setSeconds(0);
    setIsActive(false);
    setActiveProjectId(null);
  };

  return {
    seconds,
    isActive,
    activeProjectId,
    startTimer,
    stopTimer,
    resetTimer
  };
};
