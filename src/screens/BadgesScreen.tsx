import { BADGES } from '../game/types';

interface BadgesScreenProps {
  badges: string[];
  onBack: () => void;
}

export function BadgesScreen({ badges, onBack }: BadgesScreenProps) {
  return (
    <div className="screen badges-screen">
      <div className="badges-head">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Back">
          ←
        </button>
        <h1>HERO BADGES</h1>
        <span className="badges-count">
          {badges.length}/{BADGES.length}
        </span>
      </div>

      <div className="badges-grid">
        {BADGES.map((badge) => {
          const owned = badges.includes(badge.id);
          return (
            <div key={badge.id} className={`badge-card ${owned ? 'badge-card--owned' : ''}`}>
              <span className="badge-emoji">{owned ? badge.emoji : '🔒'}</span>
              <span className="badge-name">{owned ? badge.name : '???'}</span>
            </div>
          );
        })}
      </div>

      <p className="badges-hint">Finish a race to earn a new badge!</p>
    </div>
  );
}
