import { LEVELS } from '../game/levels';
import type { Tier } from '../game/types';

interface LevelSelectProps {
  current: Tier;
  onPick: (tier: Tier) => void;
  onBack: () => void;
}

export function LevelSelect({ current, onPick, onBack }: LevelSelectProps) {
  return (
    <div className="screen levels-screen">
      <div className="levels-head">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Back">
          ←
        </button>
        <h1>CHOOSE YOUR LEVEL</h1>
        <span className="levels-spacer" aria-hidden="true" />
      </div>

      <p className="levels-sub">Tap a level to start racing!</p>

      <div className="levels-grid">
        {LEVELS.map((level) => (
          <button
            key={level.tier}
            type="button"
            className={`level-card ${current === level.tier ? 'level-card--active' : ''}`}
            style={{ ['--level-color' as string]: level.color }}
            onClick={() => onPick(level.tier)}
          >
            {current === level.tier ? <span className="level-card-current">CURRENT</span> : null}
            <span className="level-card-emoji">{level.emoji}</span>
            <span className="level-card-tier">LEVEL {level.tier}</span>
            <span className="level-card-name">{level.name}</span>
            <span className="level-card-tagline">{level.tagline}</span>
            <span className="level-card-detail">{level.detail}</span>
          </button>
        ))}
      </div>

      <p className="levels-hint">The game also adjusts to how you play.</p>
    </div>
  );
}
