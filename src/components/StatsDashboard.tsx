import React, { useMemo } from 'react';
import { Project, Session } from '../types';
import { formatTime } from '../utils';

interface StatsDashboardProps {
  projects: Project[];
  sessions: Session[];
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_WEEK = MS_PER_DAY * 7;

const getWeekStart = (timestamp: number) => {
  const date = new Date(timestamp);
  const day = date.getDay(); // 0 (Sun) - 6 (Sat)
  const diff = day === 0 ? -6 : 1 - day; // shift so Monday is start
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + diff);
  return date.getTime();
};

const formatWeekRange = (start: number) => {
  const end = start + MS_PER_WEEK - MS_PER_DAY;
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${new Date(start).toLocaleDateString(undefined, opts)} - ${new Date(end).toLocaleDateString(undefined, opts)}`;
};

const signedDuration = (session: Session) => {
  const base = Math.abs(session.duration);
  return session.direction === 'subtract' ? -base : base;
};

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ projects, sessions }) => {
  const {
    weeks,
    projectSummaries,
    totalTracked,
    weeksCount,
    firstWeekStart,
    mostTrackedProject
  } = useMemo(() => {
    const timestamps: number[] = [];
    projects.forEach(p => timestamps.push(p.startDate));
    sessions.forEach(s => timestamps.push(s.startTime || s.endTime || Date.now()));

    const firstStart = timestamps.length > 0 ? Math.min(...timestamps) : Date.now();
    const firstWeekStart = getWeekStart(firstStart);
    const currentWeekStart = getWeekStart(Date.now());
    const weeksCount = Math.floor((currentWeekStart - firstWeekStart) / MS_PER_WEEK) + 1;

    const weekBuckets: Record<number, Record<string, number>> = {};
    const projectTotals: Record<string, { seconds: number; sessions: number; first: number }> = {};

    projects.forEach(p => {
      projectTotals[p.id] = { seconds: 0, sessions: 0, first: p.startDate };
    });

    sessions.forEach(session => {
      const duration = signedDuration(session);
      const startTs = session.startTime || session.endTime || Date.now();
      const projectId = session.projectId;
      const weekKey = getWeekStart(startTs);

      if (!weekBuckets[weekKey]) {
        weekBuckets[weekKey] = {};
      }
      const currentWeekValue = weekBuckets[weekKey][projectId] || 0;
      weekBuckets[weekKey][projectId] = Math.max(0, currentWeekValue + duration);

      if (!projectTotals[projectId]) {
        projectTotals[projectId] = { seconds: 0, sessions: 0, first: startTs };
      }
      const currentProjectValue = projectTotals[projectId].seconds;
      projectTotals[projectId].seconds = Math.max(0, currentProjectValue + duration);
      projectTotals[projectId].sessions += 1;
      projectTotals[projectId].first = Math.min(projectTotals[projectId].first, startTs);
    });

    const weeks = Array.from({ length: weeksCount }).map((_, idx) => {
      const start = firstWeekStart + idx * MS_PER_WEEK;
      const totalsByProject = weekBuckets[start] || {};
      const totalSeconds = Object.values(totalsByProject).reduce((sum, v) => sum + v, 0);
      const topProjects = Object.entries(totalsByProject)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([projectId, seconds]) => {
          const project = projects.find(p => p.id === projectId);
          return {
            projectId,
            projectName: project?.name || 'Archived project',
            color: project?.color || '#6b7280',
            seconds
          };
        });
      return {
        start,
        totalSeconds,
        totalsByProject,
        topProjects
      };
    });

    const totalTracked = Object.values(projectTotals).reduce((sum, p) => sum + p.seconds, 0);
    const projectSummaries = projects.map(project => {
      const stats = projectTotals[project.id] || { seconds: 0, sessions: 0, first: project.startDate };
      const avgPerWeek = weeksCount > 0 ? Math.round(stats.seconds / weeksCount) : 0;
      return {
        project,
        totalSeconds: stats.seconds,
        sessions: stats.sessions,
        firstSession: stats.first,
        avgPerWeek
      };
    }).sort((a, b) => b.totalSeconds - a.totalSeconds);

    const mostTrackedProject = projectSummaries[0] || null;

    return {
      weeks,
      projectSummaries,
      totalTracked,
      weeksCount,
      firstWeekStart,
      mostTrackedProject
    };
  }, [projects, sessions]);

  const hasData = sessions.length > 0;

  return (
    <div className="stats-dashboard">
      <div className="dashboard-header">
        <div>
          <div className="stats-title">Dashboard</div>
          <div className="stats-subtitle">Full history overview · {weeksCount} week{weeksCount === 1 ? '' : 's'} since start</div>
        </div>
        <div className="week-chip">Since {new Date(firstWeekStart).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
      </div>

      <div className="card-grid kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total Tracked</div>
          <div className="kpi-value">{formatTime(totalTracked)}</div>
          <div className="kpi-hint">Across all projects</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Projects</div>
          <div className="kpi-value">{projects.length}</div>
          <div className="kpi-hint">Active in this workspace</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Average / Week</div>
          <div className="kpi-value">{weeksCount > 0 ? formatTime(Math.round(totalTracked / weeksCount)) : '00:00'}</div>
          <div className="kpi-hint">Since first tracked week</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Most Tracked</div>
          <div className="kpi-value">{mostTrackedProject ? mostTrackedProject.project.name : '—'}</div>
          <div className="kpi-hint">{mostTrackedProject ? formatTime(mostTrackedProject.totalSeconds) : 'No data yet'}</div>
        </div>
      </div>

      {!hasData ? (
        <div className="empty-stats">
          Add projects and start tracking to see the dashboard. All stats are stored locally and kept across sessions.
        </div>
      ) : (
        <>
          <div className="section-header">
            <div>
              <div className="section-title">Project Overview</div>
              <div className="section-subtitle">Totals, cadence, and first tracked date</div>
            </div>
          </div>
          <div className="card-grid">
            {projectSummaries.map(({ project, totalSeconds, sessions, firstSession, avgPerWeek }) => (
              <div className="project-card" key={project.id}>
                <div className="project-head">
                  <div className="project-chip">
                    <span className="project-dot" style={{ background: project.color }} />
                    <span className="project-name">{project.name}</span>
                  </div>
                  <div className="project-total">{formatTime(totalSeconds)}</div>
                </div>
                <div className="project-meta">
                  <div>
                    <div className="meta-label">Sessions</div>
                    <div className="meta-value">{sessions}</div>
                  </div>
                  <div>
                    <div className="meta-label">Avg / Week</div>
                    <div className="meta-value">{formatTime(avgPerWeek)}</div>
                  </div>
                  <div>
                    <div className="meta-label">First Tracked</div>
                    <div className="meta-value">{new Date(firstSession).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="section-header spaced">
            <div>
              <div className="section-title">Weekly History</div>
              <div className="section-subtitle">All weeks since the beginning</div>
            </div>
          </div>

          <div className="week-grid">
            {weeks.map(week => (
              <div className="week-card" key={week.start}>
                <div className="week-head">
                  <div className="week-label">{formatWeekRange(week.start)}</div>
                  <div className="week-total">{formatTime(week.totalSeconds)}</div>
                </div>
                <div className="week-body">
                  {week.topProjects.length === 0 ? (
                    <div className="week-empty">No entries</div>
                  ) : (
                    week.topProjects.map(item => (
                      <div className="week-row" key={item.projectId}>
                        <div className="project-chip ghost">
                          <span className="project-dot" style={{ background: item.color }} />
                          <span className="project-name">{item.projectName}</span>
                        </div>
                        <span className="week-time">{formatTime(item.seconds)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <style>{`
        .stats-dashboard {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
          width: 100%;
          padding: 0.4rem;
          box-sizing: border-box;
        }
        .dashboard-header,
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .stats-title {
          font-family: 'Space Grotesk', 'Inter', system-ui, sans-serif;
          font-weight: 700;
          letter-spacing: 0.4px;
          font-size: 1.25rem;
        }
        .stats-subtitle,
        .section-subtitle {
          color: var(--text-secondary);
          font-size: 0.95rem;
        }
        .week-chip {
          padding: 0.45rem 0.75rem;
          border-radius: 12px;
          border: 1px solid var(--glass-border);
          background: rgba(255,255,255,0.04);
          color: var(--text-secondary);
          font-size: 0.95rem;
        }
        .kpi-grid {
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        }
        .kpi-card {
          background: #1a1a1a;
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 1rem 1.1rem;
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        .kpi-label {
          color: var(--text-secondary);
          font-size: 0.95rem;
        }
        .kpi-value {
          margin-top: 0.25rem;
          font-family: 'Space Grotesk', 'Inter', system-ui, sans-serif;
          font-size: clamp(1.3rem, 2vw, 1.6rem);
          font-weight: 700;
          letter-spacing: 1px;
        }
        .kpi-hint {
          margin-top: 0.35rem;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
        .empty-stats {
          padding: 1rem;
          border: 1px dashed var(--glass-border);
          border-radius: 12px;
          color: var(--text-secondary);
          background: rgba(255,255,255,0.03);
        }
        .section-title {
          font-family: 'Space Grotesk', 'Inter', system-ui, sans-serif;
          font-weight: 600;
          letter-spacing: 0.3px;
          font-size: 1.05rem;
        }
        .section-header.spaced {
          margin-top: 0.35rem;
        }
        .project-card {
          background: #161616;
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 0.95rem 1.05rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.18);
        }
        .project-head {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.65rem;
        }
        .project-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.35rem 0.65rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          min-width: 0;
        }
        .project-chip.ghost {
          background: transparent;
          border-color: var(--glass-border);
        }
        .project-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .project-name {
          font-weight: 600;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .project-total {
          margin-left: auto;
          font-family: 'Space Grotesk', 'Inter', system-ui, sans-serif;
          font-weight: 700;
          letter-spacing: 0.6px;
        }
        .project-meta {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 0.65rem;
        }
        .meta-label {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
        .meta-value {
          font-weight: 600;
          margin-top: 0.1rem;
          font-size: 1rem;
        }
        .week-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 0.85rem;
        }
        .week-card {
          background: #111;
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 0.9rem 1rem;
          box-shadow: 0 10px 20px rgba(0,0,0,0.15);
        }
        .week-head {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .week-label {
          font-weight: 600;
          font-size: 0.98rem;
        }
        .week-total {
          margin-left: auto;
          font-family: 'Space Grotesk', 'Inter', system-ui, sans-serif;
          font-weight: 700;
          letter-spacing: 0.6px;
        }
        .week-body {
          margin-top: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .week-empty {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
        .week-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .week-time {
          margin-left: auto;
          font-weight: 600;
          font-size: 0.95rem;
        }

        /* Responsive */
        @media (max-width: 640px) {
          .dashboard-header,
          .section-header {
            align-items: flex-start;
          }
          .week-chip {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};
