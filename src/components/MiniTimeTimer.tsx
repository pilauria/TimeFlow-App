import React, { useMemo } from 'react';

type MiniTimeTimerProps = {
  timeLeftSeconds: number;
  durationMinutes: number;
  isActive: boolean;
  onDurationMinutesChange: (minutes: number) => void;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function MiniTimeTimer({
  timeLeftSeconds,
  durationMinutes,
  isActive,
  onDurationMinutesChange,
}: MiniTimeTimerProps) {
  const totalMinutes = clamp(Math.round(durationMinutes || 0), 1, 60);
  const totalSeconds = totalMinutes * 60;
  const remaining = clamp(timeLeftSeconds, 0, totalSeconds);

  const initialSectorDeg = (totalMinutes / 60) * 360;
  const sectorDeg = totalSeconds === 0 ? 0 : (remaining / totalSeconds) * initialSectorDeg;

  const remainingMinutesLabel = Math.max(0, Math.ceil(remaining / 60));

  const numbers = useMemo(() => [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55], []);

  const handleDialClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const dial = event.currentTarget.getBoundingClientRect();
    const centerX = dial.left + dial.width / 2;
    const centerY = dial.top + dial.height / 2;

    const angleRad = Math.atan2(event.clientY - centerY, event.clientX - centerX);
    const angleDeg = (angleRad * 180) / Math.PI;
    const normalized = (angleDeg + 90 + 360) % 360;

    const minutes = clamp(Math.round(normalized / 6), 1, 60);
    onDurationMinutesChange(minutes);
  };

  return (
    <div className="mini-time-timer">
      <div className="mini-time-dial" onClick={handleDialClick}>
        <div
          className="mini-time-slice"
          style={{
            background: `conic-gradient(var(--timer-accent) ${sectorDeg}deg, rgba(0,0,0,0.08) ${sectorDeg}deg 360deg)`,
          }}
        />
        <div className="mini-time-grid" />
        <div className="mini-time-numbers">
          {numbers.map((minute) => (
            <div
              key={minute}
              className="mini-time-number"
              style={{
                transform: `rotate(${minute * 6}deg) translateY(-78px) rotate(-${minute * 6}deg)`,
              }}
            >
              {minute}
            </div>
          ))}
        </div>
        <div className="mini-time-center">
          <div className="mini-time-remaining">
            {remaining > 0 ? `${remainingMinutesLabel}m` : 'done'}
          </div>
          <div className="mini-time-label">{isActive ? 'remaining' : 'tap dial to set (1-60m)'}</div>
        </div>
        <div
          className="mini-time-pointer"
          style={{ transform: `translate(-50%,-100%) rotate(${sectorDeg}deg)` }}
        />
      </div>

      <div className="mini-time-meta">
        <div className="mini-time-row">
          <span className="mini-time-caption">Time Timer length</span>
          <span className="mini-time-value">{totalMinutes} min</span>
        </div>

        <div className="mini-time-chips">
          {[5, 15, 30, 45, 60].map((preset) => (
            <button
              key={preset}
              className={`mini-time-chip ${totalMinutes === preset ? 'active' : ''}`}
              onClick={() => onDurationMinutesChange(preset)}
              type="button"
            >
              {preset}m
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

