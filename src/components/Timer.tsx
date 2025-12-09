import React from 'react';
import { formatTime } from '../utils';

interface TimerProps {
  seconds: number;
  projectName?: string;
  projectColor?: string;
  onStop: () => void;
}

export const Timer: React.FC<TimerProps> = ({ 
  seconds, 
  projectName, 
  projectColor = 'var(--primary)', 
  onStop 
}) => {
  return (
    <div className="active-timer" style={{ borderColor: projectColor }}>
      <div className="timer-info">
        <span className="timer-label">Current Session</span>
        <h2 style={{ color: projectColor }}>{projectName || 'Unknown Project'}</h2>
      </div>
      <div className="timer-display">
        {formatTime(seconds)}
      </div>
      <button className="stop-large-btn" onClick={onStop}>
        Stop Timer
      </button>

      <style>{`
        .active-timer {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-left: 4px solid;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(5px);
        }
        .timer-info {
          display: flex;
          flex-direction: column;
        }
        .timer-label {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text-secondary);
        }
        .timer-info h2 {
          margin: 0.2rem 0 0 0;
          font-size: 1.5rem;
        }
        .timer-display {
          font-family: 'Space Grotesk', 'Inter', system-ui, sans-serif;
          font-size: 3rem;
          font-weight: 700;
          letter-spacing: 2px;
          color: var(--text-color);
        }
        .stop-large-btn {
          background: rgba(255, 77, 77, 0.2);
          color: #ff4d4d;
          padding: 0.8rem 2rem;
          font-size: 1.1rem;
          border-radius: 50px;
        }
        .stop-large-btn:hover {
          background: rgba(255, 77, 77, 0.4);
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};
