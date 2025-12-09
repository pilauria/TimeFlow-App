import React, { useState } from 'react';
import { Project } from '../types';
import { formatTime } from '../utils';

interface ProjectListProps {
  projects: Project[];
  activeProjectId: string | null;
  onStart: (id: string) => void;
  onStop: () => void;
  onDelete: (id: string) => void;
  onAdd: (name: string, color: string) => void;
  onAdjust: (id: string, seconds: number, direction: 'add' | 'subtract') => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ 
  projects, 
  activeProjectId, 
  onStart, 
  onStop, 
  onDelete,
  onAdd,
  onAdjust,
}) => {
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState('#646cff');
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [adjustMinutes, setAdjustMinutes] = useState(15);
  const [adjustDirection, setAdjustDirection] = useState<'add' | 'subtract'>('add');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      onAdd(newProjectName, newProjectColor);
      setNewProjectName('');
    }
  };

  const submitAdjustment = (projectId: string) => {
    if (adjustMinutes <= 0) return;
    const seconds = Math.round(adjustMinutes * 60);
    onAdjust(projectId, seconds, adjustDirection);
    setAdjustingId(null);
    setAdjustMinutes(15);
  };
  
  const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="project-list">
      <h2>Projects</h2>
      
      <form onSubmit={handleSubmit} className="add-project-form">
        <input 
          type="text" 
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          placeholder="New Project Name"
        />
        <input 
          type="color" 
          value={newProjectColor}
          onChange={(e) => setNewProjectColor(e.target.value)}
          style={{ width: '50px', padding: '0', height: '40px' }}
        />
        <button type="submit">Add</button>
      </form>

      <div className="card-grid">
        {projects.map(project => (
          <div 
            key={project.id} 
            className="project-card"
          >
            {/* Header: Name, Date, Time - Always Visible (Single Line) */}
            <div className="card-header">
                <div className="project-pill">
                    <span className="dot" style={{ backgroundColor: project.color }}></span>
                    <span className="name">{project.name}</span>
                </div>
                <span className="date-display">{currentDate}</span>
                <span className="header-time">{formatTime(project.totalTime)}</span>
            </div>
            
            {/* Action Buttons - Always Visible */}
            <div className="dropdown-actions">
                 {activeProjectId === project.id ? (
                    <button className="stop-btn" onClick={onStop}>Stop</button>
                  ) : (
                    <button 
                      className="start-btn" 
                      onClick={() => onStart(project.id)}
                      disabled={activeProjectId !== null}
                    >
                      Start
                    </button>
                  )}
                  <button 
                    className="ghost-btn" 
                    onClick={() => setAdjustingId(prev => prev === project.id ? null : project.id)}
                  >
                    Adjust
                  </button>
                  <button 
                    className="delete-btn" 
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this project?')) {
                        onDelete(project.id);
                      }
                    }}
                    disabled={activeProjectId === project.id}
                  >
                    ×
                  </button>
            </div>

            {/* Adjust Row - Only when adjusting this project */}
            {adjustingId === project.id && (
              <div className="adjust-row">
                <input 
                  type="number" 
                  min="0"
                  value={adjustMinutes}
                  onChange={(e) => setAdjustMinutes(Number(e.target.value))}
                  aria-label="Adjust minutes"
                />
                <span className="unit">m</span>
                <select 
                  value={adjustDirection} 
                  onChange={(e) => setAdjustDirection(e.target.value as 'add' | 'subtract')}
                  className="adjust-select"
                >
                  <option value="add">+</option>
                  <option value="subtract">-</option>
                </select>
                <div className="adjust-actions">
                  <button 
                    className="confirm-adjust" 
                    type="button"
                    onClick={() => submitAdjustment(project.id)}
                  >
                    Apply
                  </button>
                  <button 
                    className="ghost-btn"
                    type="button"
                    onClick={() => setAdjustingId(null)}
                    style={{ minWidth: 'auto' }}
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <style>{`
        .project-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .add-project-form {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        .add-project-form input[type="text"] {
          flex: 1;
        }
        /* Card Container */
        .project-card {
          background: #1a1a1a;
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0;
          transition: all 0.2s ease;
          cursor: pointer;
          overflow: hidden;
          position: relative;
        }
        .project-card:hover {
            border-color: rgba(255,255,255,0.2);
        }
        
        /* Header Styles */
        .card-header {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            gap: 0.75rem;
            width: 100%;
        }
        .project-pill {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 0.25rem 0.75rem 0.25rem 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            flex-shrink: 1;
            min-width: 0;
        }
        .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            display: inline-block;
            flex-shrink: 0;
        }
        .name {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: 0.9rem;
            font-weight: 500;
        }
        .date-display {
            color: var(--text-secondary);
            font-size: 0.85rem;
            flex-shrink: 0;
        }
        .header-time {
            font-family: 'Space Grotesk', system-ui, sans-serif;
            font-size: 1.1rem;
            font-weight: 700;
            letter-spacing: 1px;
            flex-shrink: 0;
        }

        /* Dropdown Styles */
        .card-dropdown {
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid rgba(255,255,255,0.1);
            animation: slideDown 0.25s ease-out;
            cursor: default;
        }
        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .dropdown-actions {
            display: flex;
            gap: 0.5rem;
            margin-top: 0.75rem;
            padding-top: 0.75rem;
            border-top: 1px solid rgba(255,255,255,0.1);
        }

        /* Stats Styles */
        .stats-section h4 {
            margin: 0 0 0.75rem 0;
            color: var(--text-secondary);
            font-size: 0.9rem;
            font-weight: 500;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 0.5rem;
        }
        .stat-day {
            background: rgba(255,255,255,0.03);
            padding: 0.5rem;
            border-radius: 8px;
            text-align: left;
        }
        .day-name {
            color: var(--text-secondary);
            font-size: 0.75rem;
            margin-bottom: 0.1rem;
        }
        .day-time {
            font-family: monospace;
            font-weight: 600;
            font-size: 0.9rem;
        }

        /* Adjusted button styles reuse */
        .start-btn {
          background: rgba(76, 175, 80, 0.2);
          color: #4caf50;
          padding: 0.5em 1em;
          flex: 1;
          border-radius: 6px;
          border: 1px solid rgba(76, 175, 80, 0.3);
          font-weight: 600;
        }
        .stop-btn {
          background: rgba(255, 77, 77, 0.2);
          color: #ff4d4d;
          padding: 0.5em 1em;
          flex: 1;
          border-radius: 6px;
           border: 1px solid rgba(255, 77, 77, 0.3);
           font-weight: 600;
        }
        .ghost-btn {
          background: rgba(255,255,255,0.06);
          color: var(--text-color);
          border: 1px solid var(--glass-border);
          padding: 0.5em 1em;
          border-radius: 6px;
        }
        .delete-btn {
            background: transparent;
            color: var(--text-secondary);
            border: 1px solid var(--glass-border);
            width: 38px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            font-size: 1.2rem;
        }
        .delete-btn:hover {
            color: var(--danger);
            border-color: var(--danger);
        }

        /* Adjust Row reuse */
        .adjust-row {
          width: 100%;
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: rgba(0,0,0,0.2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          flex-wrap: wrap;
        }
        .adjust-select, .adjust-inputs input {
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            color: white;
            border-radius: 4px;
            height: 30px;
        }
        .adjust-inputs input { width: 60px; padding-left: 5px; }
        .confirm-adjust {
             background: rgba(100, 108, 255, 0.2);
             color: var(--primary);
             padding: 0.3em 0.8em;
             border-radius: 4px;
        }
        .adjust-actions { margin-left: auto; display: flex; gap: 0.5rem; }
      `}</style>
    </div>
  );
};
