import { useEffect } from 'react';
import { Confetti } from '../components/Confetti';
import { Hero } from '../components/Hero';
import { sfx } from '../game/audio';
import { BADGES } from '../game/types';
import type { RaceResult, SaveData } from '../game/types';

export type Medal = 'gold' | 'silver' | 'bronze';

interface RaceEndProps {
  save: SaveData;
  result: RaceResult;
  badgeId: string | null;
  bonusBolts: number;
  medal: Medal;
  cleanCount: number;
  onAgain: () => void;
  onHome: () => void;
  onBadges: () => void;
}

const MEDAL_INFO: Record<Medal, { emoji: string; label: string }> = {
  gold: { emoji: '🥇', label: 'GOLD HERO' },
  silver: { emoji: '🥈', label: 'SILVER HERO' },
  bronze: { emoji: '🥉', label: 'BRONZE HERO' },
};

export function RaceEnd({
  save,
  result,
  badgeId,
  bonusBolts,
  medal,
  cleanCount,
  onAgain,
  onHome,
  onBadges,
}: RaceEndProps) {
  const badge = badgeId ? BADGES.find((b) => b.id === badgeId) : null;
  const medalInfo = MEDAL_INFO[medal];

  useEffect(() => {
    sfx('fanfare');
  }, []);

  return (
    <div className="screen end-screen">
      <Confetti pieces={70} />

      <h1 className="end-title">HERO CITY IS SAFE!</h1>
      <p className="end-sub">
        {cleanCount === result.gates.length
          ? 'Perfect counting, hero!'
          : 'Great rescuing out there!'}
      </p>

      <div className="end-hero">
        <div className="home-glow" />
        <Hero cape={save.cape} size={168} flying />
      </div>

      <div className="end-stats">
        <div className={`end-medal end-medal--${medal}`}>
          <span className="end-medal-emoji">{medalInfo.emoji}</span>
          <span className="end-medal-label">{medalInfo.label}</span>
        </div>
        <div className="end-stat">
          <span className="end-stat-icon">⚡</span>
          <b>+{result.bolts}</b>
          <small>power bolts</small>
        </div>
        <div className="end-stat">
          <span className="end-stat-icon">🏅</span>
          <b>{save.badges.length}</b>
          <small>badges</small>
        </div>
      </div>

      <div className={`end-badge ${badge ? 'end-badge--new' : 'end-badge--bonus'}`}>
        {badge ? (
          <>
            <span className="end-badge-emoji">{badge.emoji}</span>
            <div>
              <span className="end-badge-kicker">NEW BADGE!</span>
              <span className="end-badge-name">{badge.name}</span>
            </div>
          </>
        ) : (
          <>
            <span className="end-badge-emoji">⚡</span>
            <div>
              <span className="end-badge-kicker">ALL BADGES COLLECTED!</span>
              <span className="end-badge-name">+{bonusBolts} bonus bolts</span>
            </div>
          </>
        )}
      </div>

      <div className="end-actions">
        <button type="button" className="btn btn--green end-again" onClick={onAgain}>
          RACE AGAIN
        </button>
        <div className="end-actions-row">
          <button type="button" className="btn btn--small btn--blue" onClick={onBadges}>
            MY BADGES
          </button>
          <button type="button" className="btn btn--small btn--ghost" onClick={onHome}>
            HOME
          </button>
        </div>
      </div>
    </div>
  );
}
