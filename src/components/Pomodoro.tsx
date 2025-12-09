import React from 'react';
import { formatTime } from '../utils';
import { usePomodoro } from '../hooks/usePomodoro';

// We now accept props instead of managing state
interface PomodoroProps {
    pomodoro: ReturnType<typeof usePomodoro>;
}

export const Pomodoro: React.FC<PomodoroProps> = ({ pomodoro }) => {
  const { 
    mode, isActive, timeLeft, showSettings, durations,
    setShowSettings, switchMode, toggleTimer, resetTimer, handleDurationChange
  } = pomodoro;

  const modes = {
    work: { label: 'Focus', color: '#ff4d4d' },
    shortBreak: { label: 'Short Break', color: '#4caf50' },
    longBreak: { label: 'Long Break', color: '#2196f3' }
  };

  const currentMode = modes[mode];
  const progress = 100 - (timeLeft / (durations[mode] * 60)) * 100;

  return (
    <div className="pomodoro-container">
      <div className="header-actions">
        <div className="mode-selector">
          {(Object.keys(modes) as Array<keyof typeof modes>).map(m => (
            <button 
              key={m}
              className={`mode-btn ${mode === m ? 'active' : ''}`}
              onClick={() => switchMode(m)}
              style={mode === m ? { backgroundColor: modes[m].color, color: 'white' } : {}}
            >
              {modes[m].label}
            </button>
          ))}
        </div>
        <button className="settings-btn" onClick={() => setShowSettings(!showSettings)}>
          ⚙️
        </button>
      </div>

      {showSettings && (
        <div className="settings-panel">
          <h3>Timer Settings (minutes)</h3>
          <div className="setting-row">
            <label>Focus</label>
            <input 
              type="number" 
              value={durations.work} 
              onChange={(e) => handleDurationChange('work', e.target.value)}
            />
          </div>
          <div className="setting-row">
            <label>Short Break</label>
            <input 
              type="number" 
              value={durations.shortBreak} 
              onChange={(e) => handleDurationChange('shortBreak', e.target.value)}
            />
          </div>
          <div className="setting-row">
            <label>Long Break</label>
            <input 
              type="number" 
              value={durations.longBreak} 
              onChange={(e) => handleDurationChange('longBreak', e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="timer-circle">
        <div className="time-text">{formatTime(timeLeft)}</div>
        <div className="progress-ring" style={{ 
          background: `conic-gradient(${currentMode.color} ${progress}%, transparent 0)` 
        }} />
      </div>

      <div className="controls">
        <button className="control-btn main" onClick={toggleTimer}>
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button className="control-btn" onClick={resetTimer}>
          Reset
        </button>
      </div>

      <style>{`
        .pomodoro-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
          padding: 2rem;
          background: var(--glass-bg);
          border-radius: 16px;
          border: 1px solid var(--glass-border);
          position: relative;
        }
        .header-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        .mode-selector {
          display: flex;
          gap: 0.5rem;
          background: rgba(0,0,0,0.2);
          padding: 0.5rem;
          border-radius: 12px;
        }
        .mode-btn {
          border: none;
          background: transparent;
          color: var(--text-secondary);
          border-radius: 8px;
          padding: 0.5rem 1rem;
        }
        .mode-btn.active {
          font-weight: bold;
        }
        .settings-btn {
          background: transparent;
          border: none;
          font-size: 1.2rem;
          padding: 0.5rem;
          cursor: pointer;
        }
        .settings-panel {
          background: rgba(0,0,0,0.8);
          padding: 1rem;
          border-radius: 12px;
          position: absolute;
          top: 80px;
          z-index: 10;
          width: 80%;
          border: 1px solid var(--glass-border);
        }
        .setting-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .setting-row input {
          width: 60px;
          padding: 0.3rem;
        }
        .timer-circle {
          position: relative;
          width: 250px;
          height: 250px;
          border-radius: 50%;
          background: rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .progress-ring {
          position: absolute;
          top: -5px;
          left: -5px;
          right: -5px;
          bottom: -5px;
          border-radius: 50%;
          z-index: -1;
          filter: blur(10px);
          opacity: 0.5;
        }
        .time-text {
          font-size: 4rem;
          font-weight: 700;
          font-family: 'Space Grotesk', 'Inter', system-ui, sans-serif;
          letter-spacing: 2px;
        }
        .controls {
          display: flex;
          gap: 1rem;
        }
        .control-btn {
          min-width: 100px;
        }
        .control-btn.main {
          background: var(--text-color);
          color: var(--bg-color);
          font-weight: bold;
        }
        .control-btn.main:hover {
          background: white;
        }
      `}</style>
    </div>
  );
};
