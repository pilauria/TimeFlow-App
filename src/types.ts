export interface Session {
  id: string;
  projectId: string;
  startTime: number;
  endTime?: number;
  duration: number; // in seconds
  source?: 'timer' | 'manual';
  direction?: 'add' | 'subtract';
}

export interface Project {
  id: string;
  name: string;
  color: string;
  totalTime: number; // in seconds
  startDate: number; // timestamp ms
}

export interface PomodoroSettings {
  workDuration: number; // in minutes
  breakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  sessionsBeforeLongBreak: number;
}
