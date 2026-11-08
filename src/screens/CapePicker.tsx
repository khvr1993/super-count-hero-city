import { useState } from 'react';
import { Hero } from '../components/Hero';
import { CAPES } from '../game/types';
import type { CapeId } from '../game/types';

interface CapePickerProps {
  initial: CapeId | null;
  onConfirm: (cape: CapeId) => void;
}

export function CapePicker({ initial, onConfirm }: CapePickerProps) {
  const [selected, setSelected] = useState<CapeId>(initial ?? 'red');

  return (
    <div className="screen cape-picker">
      <div className="cape-head">
        <h1 className="cape-title">PICK YOUR CAPE!</h1>
        <p className="cape-sub">Every hero needs one.</p>
      </div>

      <div className="cape-preview">
        <div className="home-glow" />
        <Hero cape={selected} size={230} flying />
      </div>

      <div className="cape-list">
        {CAPES.map((cape) => (
          <button
            key={cape.id}
            type="button"
            className={`cape-swatch ${selected === cape.id ? 'cape-swatch--active' : ''}`}
            onClick={() => setSelected(cape.id)}
            aria-label={cape.name}
            aria-pressed={selected === cape.id}
          >
            <span className="cape-swatch-dot" style={{ background: cape.hex }} />
            <span className="cape-swatch-name">{cape.name}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        className="btn btn--gold cape-confirm"
        onClick={() => onConfirm(selected)}
      >
        THAT&apos;S ME!
      </button>
    </div>
  );
}
