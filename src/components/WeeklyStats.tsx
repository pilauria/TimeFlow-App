import React, { useMemo, useState } from 'react';
import { formatTime } from '../utils';
import { Project, Session } from '../types';

interface WeeklyStatsProps {
  projects: Project[];
  sessions: Session[];
}

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const getWeekStart = () => {
  const now = new Date();
  const day = now.getDay(); // 0 (Sun) - 6 (Sat)
  const diff = day === 0 ? -6 : 1 - day; // Monday as start
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(now.getDate() + diff);
  return start;
};

const getCurrentDayIndex = () => {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1; // 0 = Monday, 6 = Sunday
};

export const WeeklyStats: React.FC<WeeklyStatsProps> = ({ projects, sessions }) => {
  const weekStart = useMemo(() => getWeekStart(), []);
  const todayIndex = getCurrentDayIndex();
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedProjectId(prev => prev === id ? null : id);
  };

  const projectStats = useMemo(() => {
    const dayMs = 24 * 60 * 60 * 1000;
    const startMs = weekStart.getTime();

    const base = projects.reduce<Record<string, number[]>>((acc, p) => {
      acc[p.id] = Array(7).fill(0);
      return acc;
    }, {});

    sessions.forEach(session => {
      const sessionDayIdx = Math.floor((session.startTime - startMs) / dayMs);
      if (sessionDayIdx >= 0 && sessionDayIdx < 7 && base[session.projectId]) {
        const signed = session.direction === 'subtract' ? -Math.abs(session.duration) : Math.abs(session.duration);
        const nextValue = base[session.projectId][sessionDayIdx] + signed;
        base[session.projectId][sessionDayIdx] = Math.max(0, nextValue);
      }
    });

    return projects.map(project => {
      const daily = base[project.id] || Array(7).fill(0);
      const weekTotal = daily.reduce((sum, v) => sum + v, 0);
      return { project, daily, weekTotal };
    });
  }, [projects, sessions, weekStart]);

  const weekRangeLabel = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(weekStart.getDate() + 6);
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${weekStart.toLocaleDateString(undefined, opts)} - ${end.toLocaleDateString(undefined, opts)}`;
  }, [weekStart]);

  const formatStartDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="weekly-stats">
      <div className="stats-header">
        <div>
          <div className="stats-title">Weekly Stats</div>
          <div className="stats-subtitle">Time per project (Mon - Sun)</div>
        </div>
        <div className="week-range">{weekRangeLabel}</div>
      </div>

      {projectStats.length === 0 ? (
        <div className="empty-stats">Create a project to start tracking stats.</div>
      ) : (
        <div className="card-grid">
          {projectStats.map(({ project, daily, weekTotal }) => {
            const isExpanded = expandedProjectId === project.id;
            return (
            <div className={`stats-card ${isExpanded ? 'expanded' : ''}`} key={project.id}>
              <div className="card-header" onClick={() => toggleExpand(project.id)}>
                <div className="project-chip">
                  <span className="project-dot" style={{ background: project.color }} />
                  <span className="project-name">{project.name}</span>
                </div>
                <span className="start-date">{formatStartDate(project.startDate)}</span>
                <div className="total-time">{formatTime(weekTotal)}</div>
                <span className="expand-icon">{isExpanded ? '▲' : '▼'}</span>
              </div>
              {isExpanded && (
                <div className="day-row">
                  {dayLabels.map((label, idx) => {
                    const isFuture = idx > todayIndex;
                    return (
                      <div className={`day-cell ${isFuture ? 'future' : ''}`} key={label}>
                        <span className="day-label">{label}</span>
                        <span className="day-time">{formatTime(daily[idx] || 0)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )})}
        </div>
      )}

      <style>{`
        .weekly-stats {
          margin-bottom: 1.5rem;
          width: 100%;
          box-sizing: border-box;
        }
        .stats-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .stats-title {
          font-family: 'Space Grotesk', 'Inter', system-ui, sans-serif;
          font-size: 1.1rem;
          font-weight: 600;
          letter-spacing: 0.4px;
        }
        .stats-subtitle {
          color: var(--text-secondary);
          font-size: 0.95rem;
        }
        .week-range {
          font-size: 0.95rem;
          color: var(--text-secondary);
          padding: 0.35rem 0.65rem;
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.03);
        }
        .stats-card {
          background: #1a1a1a;
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 0.9rem 1rem;
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
          transition: all 0.2s ease;
          min-width: 0;
        }
        .stats-card:hover {
          border-color: rgba(255,255,255,0.2);
        }
        .card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
        }
        .project-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.3rem 0.65rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          min-width: 0;
          flex-shrink: 1;
        }
        .project-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          display: inline-block;
          flex-shrink: 0;
        }
        .project-name {
          font-weight: 600;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .start-date {
          font-size: clamp(0.8rem, 1.5vw, 0.95rem);
          color: var(--text-secondary);
          white-space: nowrap;
          flex-shrink: 0;
        }
        .total-time {
          font-family: 'Space Grotesk', 'Inter', system-ui, sans-serif;
          letter-spacing: 1px;
          font-weight: 700;
          font-size: clamp(1rem, 2vw, 1.2rem);
          white-space: nowrap;
          flex-shrink: 0;
        }
        .expand-icon {
          color: var(--text-secondary);
          font-size: 0.7rem;
          margin-left: auto;
          flex-shrink: 0;
        }
        .day-row {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
          gap: 0.5rem;
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--glass-border);
          animation: slideDown 0.2s ease-out;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .day-cell {
          padding: 0.55rem 0.65rem;
          border-radius: 10px;
          border: 1px solid var(--glass-border);
          background: rgba(255, 255, 255, 0.02);
        }
        .day-cell.future {
          opacity: 0.5;
        }
        .day-label {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        .day-time {
          display: block;
          margin-top: 0.2rem;
          font-family: 'Space Grotesk', 'Inter', system-ui, sans-serif;
          letter-spacing: 1px;
          font-weight: 600;
        }
        .empty-stats {
          color: var(--text-secondary);
          font-size: 0.95rem;
          padding: 0.75rem;
        }
      `}</style>
    </div>
  );
};
