import { useState, useEffect } from 'react';
import { Project, Session } from '../types';
import { generateId } from '../utils';

type PersistedPayload = {
  projects?: Project[];
  sessions?: Session[];
  pomodoroDurations?: unknown;
};

const getSignedDuration = (session: Session) => {
  const direction = session.direction || 'add';
  const magnitude = Math.abs(session.duration);
  return direction === 'subtract' ? -magnitude : magnitude;
};

const normalizeProjects = (projects: Project[] | null | undefined): Project[] => {
  if (!Array.isArray(projects)) return [];
  return projects.map(p => ({
    ...p,
    startDate: p.startDate || Date.now(),
  }));
};

const normalizeSessions = (sessions: Session[] | null | undefined): Session[] => {
  if (!Array.isArray(sessions)) return [];
  return sessions.map(s => ({
    ...s,
    source: s.source || 'timer',
    direction: s.direction || 'add',
    duration: Math.abs(s.duration),
  }));
};

const loadLocalProjects = () => {
  const saved = localStorage.getItem('projects');
  const parsed: Project[] | null = saved ? JSON.parse(saved) : null;
  return normalizeProjects(parsed);
};

const loadLocalSessions = () => {
  const saved = localStorage.getItem('sessions');
  const parsed: Session[] | null = saved ? JSON.parse(saved) : null;
  return normalizeSessions(parsed);
};

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>(loadLocalProjects);
  const [sessions, setSessions] = useState<Session[]>(loadLocalSessions);

  useEffect(() => {
    let cancelled = false;

    const loadPersisted = async () => {
      try {
        const data = await window.ipcRenderer?.invoke('storage:load') as PersistedPayload | null;
        if (cancelled || !data) return;

        if (data.projects) {
          setProjects(normalizeProjects(data.projects));
        }
        if (data.sessions) {
          setSessions(normalizeSessions(data.sessions));
        }
      } catch (error) {
        console.error('Failed to load persisted data', error);
      }
    };

    loadPersisted();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
    localStorage.setItem('sessions', JSON.stringify(sessions));

    const persistToDisk = async () => {
      try {
        await window.ipcRenderer?.invoke('storage:save', {
          projects,
          sessions,
        });
      } catch (error) {
        console.error('Failed to persist data to disk', error);
      }
    };

    persistToDisk();
  }, [projects, sessions]);

  const addProject = (name: string, color: string) => {
    const newProject: Project = {
      id: generateId(),
      name,
      color,
      totalTime: 0,
      startDate: Date.now(),
    };
    setProjects([...projects, newProject]);
  };

  const deleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
    // Optional: delete sessions for this project
  };

  const updateProjectTime = (id: string, delta: number) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== id) return p;
      const next = Math.max(0, p.totalTime + delta);
      return { ...p, totalTime: next };
    }));
  };

  const addSession = (session: Session) => {
    const normalized: Session = {
      ...session,
      source: session.source || 'timer',
      direction: session.direction || 'add',
      duration: Math.abs(session.duration),
    };

    setSessions(prev => [...prev, normalized]);
    updateProjectTime(
      normalized.projectId,
      getSignedDuration(normalized)
    );
  };

  const adjustProjectTime = (projectId: string, seconds: number, direction: 'add' | 'subtract') => {
    if (seconds <= 0) return;

    const session: Session = {
      id: generateId(),
      projectId,
      startTime: Date.now(),
      duration: seconds,
      source: 'manual',
      direction,
    };

    addSession(session);
  };

  return {
    projects,
    addProject,
    deleteProject,
    addSession,
    adjustProjectTime,
    sessions
  };
};
