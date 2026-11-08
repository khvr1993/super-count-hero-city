import { Hero } from '../components/Hero';
import { BADGES } from '../game/types';
import type { SaveData } from '../game/types';
import { ParentGate } from './ParentGate';

interface HomeProps {
  save: SaveData;
  onStart: () => void;
  onBadges: () => void;
  onPatch: (patch: Record<string, unknown>) => void;
  onReset: () => void;
}

export function Home({ save, onStart, onBadges, onPatch, onReset }: HomeProps) {
  return (
    <div className="screen home">
      <div className="home-top">
        <div className="pill pill--bolts">
          <span className="pill-icon">⚡</span>
          <b>{save.bolts}</b>
        </div>
        <button type="button" className="pill pill--badges" onClick={onBadges}>
          <span className="pill-icon">🏅</span>
          <b>
            {save.badges.length}/{BADGES.length}
          </b>
        </button>
      </div>

      <div className="home-main">
        <h1 className="logo">
          <span className="logo-super">SUPER</span>
          <span className="logo-count">COUNT</span>
        </h1>
        <p className="logo-sub">HERO CITY</p>

        <div className="home-hero">
          <div className="home-glow" />
          <span className="home-spark home-spark--1">✦</span>
          <span className="home-spark home-spark--2">✦</span>
          <span className="home-spark home-spark--3">⚡</span>
          <Hero cape={save.cape} size={196} flying />
        </div>

        <button type="button" className="race-btn" onClick={onStart}>
          <span className="race-btn-bolt">⚡</span>
          <span className="race-btn-text">RACE!</span>
        </button>

        <p className="home-hint">
          Count with Captain {save.name}
          {save.races > 0 ? ` · ${save.races} ${save.races === 1 ? 'race' : 'races'} run` : ''}
        </p>
      </div>

      <ParentGate
        sound={save.settings.sound}
        voice={save.settings.voice}
        timer={save.settings.timer}
        name={save.name}
        tier={save.tier}
        onPatch={onPatch}
        onReset={onReset}
      />
    </div>
  );
}
