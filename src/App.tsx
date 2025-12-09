import { useState } from 'react';
import { useProjects } from './hooks/useProjects';
import { useTimer } from './hooks/useTimer';
import { usePomodoro } from './hooks/usePomodoro';
import { ProjectList } from './components/ProjectList';
import { Timer } from './components/Timer';
import { Pomodoro } from './components/Pomodoro';
import { formatTime } from './utils';
import './App.css';
import { WeeklyStats } from './components/WeeklyStats';
import { StatsDashboard } from './components/StatsDashboard';

function App() {
  const { projects, addProject, deleteProject, addSession, adjustProjectTime, sessions } = useProjects();
  const { seconds, isActive, activeProjectId, startTimer, stopTimer } = useTimer();
  const pomodoro = usePomodoro();
  
  const [activeTab, setActiveTab] = useState<'tracker' | 'pomodoro' | 'stats'>('tracker');
  const [isMiniMode, setIsMiniMode] = useState(false);

  const handleStop = () => {
    const session = stopTimer();
    if (session) {
      addSession({
        id: Math.random().toString(36).substr(2, 9),
        ...session,
        source: 'timer',
        direction: 'add',
      });
    }
  };

  const toggleMiniMode = () => {
    const newState = !isMiniMode;
    // When entering mini mode, keep the UI on tracker to avoid unsupported views in compact mode
    if (newState && activeTab === 'stats') {
      setActiveTab('tracker');
    }
    setIsMiniMode(newState);
    window.ipcRenderer.toggleMiniMode(newState);
  };

  const activeProject = projects.find(p => p.id === activeProjectId);

  if (isMiniMode) {
    return (
        <div className="mini-mode" style={{ padding: '5px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#121212', overflow: 'hidden', border: '2px solid rgba(255, 255, 255, 0.1)', boxSizing: 'border-box' }}>
            
            {/* Mini Mode Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', width: '100%', justifyContent: 'center' }}>
                <button 
                  onClick={() => setActiveTab('tracker')} 
                  style={{ 
                    padding: '0.2rem 0.5rem', 
                    fontSize: '0.7rem', 
                    background: activeTab === 'tracker' ? 'rgba(255,255,255,0.2)' : 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    color: activeTab === 'tracker' ? 'white' : 'gray'
                  }}
                >
                  Tracker
                </button>
                <button 
                  onClick={() => setActiveTab('pomodoro')} 
                  style={{ 
                    padding: '0.2rem 0.5rem', 
                    fontSize: '0.7rem', 
                     background: activeTab === 'pomodoro' ? 'rgba(255,255,255,0.2)' : 'transparent',
                     border: 'none',
                     borderRadius: '4px',
                     color: activeTab === 'pomodoro' ? 'white' : 'gray'
                  }}
                >
                  Pomodoro
                </button>
                <button onClick={toggleMiniMode} style={{ marginLeft: 'auto', padding: '0.2rem 0.6rem', background: '#646cff', fontSize: '0.8rem', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer' }}>
                    Expand
                </button>
            </div>

            {/* Mini Content */}
            {activeTab === 'tracker' ? (
                <>
                    <div style={{ fontSize: '2.5rem', fontFamily: `'Space Grotesk', 'Inter', system-ui, sans-serif`, fontWeight: 'bold', letterSpacing: '2px' }}>
                        {seconds > 0 ? formatTime(seconds) : '00:00'}
                    </div>
                    {activeProject && <div style={{ color: activeProject.color, fontSize: '0.8rem', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{activeProject.name}</div>}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {isActive ? (
                            <button onClick={handleStop} style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '4px' }}>Stop</button>
                        ) : (
                            activeProjectId && <button onClick={() => startTimer(activeProjectId)} style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', background: '#4caf50', color: 'white', border: 'none', borderRadius: '4px' }}>Resume</button>
                        )}
                    </div>
                </>
            ) : (
                <>
                     <div style={{ fontSize: '2.5rem', fontFamily: `'Space Grotesk', 'Inter', system-ui, sans-serif`, fontWeight: 'bold', letterSpacing: '2px' }}>
                        {formatTime(pomodoro.timeLeft)}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'gray', marginBottom: '0.5rem' }}>
                        {pomodoro.mode === 'work' ? 'Focus' : 'Break'}
                    </div>
                     <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={pomodoro.toggleTimer} style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', background: pomodoro.isActive ? '#ff4d4d' : '#4caf50', color: 'white', border: 'none', borderRadius: '4px' }}>
                             {pomodoro.isActive ? 'Pause' : 'Start'}
                        </button>
                         <button onClick={pomodoro.resetTimer} style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '4px' }}>Reset</button>
                    </div>
                </>
            )}
            {/* Resize Handle Visual */}
            <div style={{
                position: 'absolute',
                bottom: '2px',
                right: '2px',
                width: '0',
                height: '0',
                borderStyle: 'solid',
                borderWidth: '0 0 10px 10px',
                borderColor: 'transparent transparent rgba(255,255,255,0.5) transparent',
                cursor: 'se-resize',
                pointerEvents: 'none'
            }} />
        </div>
    );
  }

  return (
    <div className="container" style={{ position: 'relative' }}>
      <header className="title-bar">
        <div className="app-title">TimeFlow</div>
        <div className="tabs">
          <button 
            className={`tab-btn ${activeTab === 'tracker' ? 'active' : ''}`}
            onClick={() => setActiveTab('tracker')}
          >
            Tracker
          </button>
          <button 
            className={`tab-btn ${activeTab === 'pomodoro' ? 'active' : ''}`}
            onClick={() => setActiveTab('pomodoro')}
          >
            Pomodoro
          </button>
          <button 
            className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            Dashboard
          </button>
        </div>
        <button className="mini-mode-btn" onClick={toggleMiniMode}>
          Mini Mode
        </button>
      </header>
      
      <main className="content">
        {activeTab === 'tracker' && (
          <div className="tracker-view">
            {isActive && (
              <Timer 
                seconds={seconds}
                projectName={activeProject?.name}
                projectColor={activeProject?.color}
                onStop={handleStop}
              />
            )}
            
            <WeeklyStats projects={projects} sessions={sessions} />
            
            <ProjectList 
              projects={projects}
              activeProjectId={activeProjectId}
              onStart={startTimer}
              onStop={handleStop}
              onDelete={deleteProject}
              onAdd={addProject}
              onAdjust={adjustProjectTime}
            />
          </div>
        )}

        {activeTab === 'pomodoro' && (
          <div className="pomodoro-view">
            <Pomodoro pomodoro={pomodoro} />
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="stats-view">
            <StatsDashboard projects={projects} sessions={sessions} />
          </div>
        )}
      </main>
      
       {/* Main Window Resize Handle (Decoration) */}
       <div style={{
          position: 'absolute',
          bottom: '2px',
          right: '2px',
          width: '0',
          height: '0',
          borderStyle: 'solid',
          borderWidth: '0 0 12px 12px',
          borderColor: 'transparent transparent rgba(255,255,255,0.2) transparent',
          pointerEvents: 'none'
      }} />
    </div>
  );
}

export default App;
