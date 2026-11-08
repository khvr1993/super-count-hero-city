import { Hero } from './Hero';
import type { CapeId } from '../game/types';

interface CityTrackProps {
  cape: CapeId | null;
  completed: number;
  total: number;
  finished: boolean;
}

const START = 6;
const SPAN = 80;

function nodeLeft(index: number, total: number) {
  if (total <= 1) return START;
  return START + (index / (total - 1)) * SPAN;
}

export function CityTrack({ cape, completed, total, finished }: CityTrackProps) {
  const heroLeft = finished || completed >= total ? 91 : nodeLeft(completed, total);

  return (
    <div className="track" aria-hidden="true">
      <div className="track-sun" />
      <div className="cloud cloud-a" />
      <div className="cloud cloud-b" />
      <div className="cloud cloud-c" />

      <svg className="skyline" viewBox="0 0 1000 120" preserveAspectRatio="none">
        <g fill="#1c2f63">
          <rect x="0" y="52" width="90" height="68" />
          <rect x="96" y="72" width="70" height="48" />
          <rect x="172" y="38" width="84" height="82" />
          <rect x="262" y="66" width="64" height="54" />
          <rect x="332" y="46" width="96" height="74" />
          <rect x="434" y="74" width="72" height="46" />
          <rect x="512" y="34" width="80" height="86" />
          <rect x="598" y="62" width="66" height="58" />
          <rect x="670" y="44" width="92" height="76" />
          <rect x="768" y="70" width="70" height="50" />
          <rect x="844" y="40" width="76" height="80" />
          <rect x="926" y="64" width="74" height="56" />
        </g>
        <g fill="#ffe9a8" opacity="0.85">
          <rect x="18" y="64" width="10" height="12" />
          <rect x="44" y="64" width="10" height="12" />
          <rect x="18" y="86" width="10" height="12" />
          <rect x="44" y="86" width="10" height="12" />
          <rect x="190" y="52" width="10" height="12" />
          <rect x="216" y="52" width="10" height="12" />
          <rect x="190" y="76" width="10" height="12" />
          <rect x="216" y="76" width="10" height="12" />
          <rect x="352" y="60" width="10" height="12" />
          <rect x="386" y="60" width="10" height="12" />
          <rect x="352" y="86" width="10" height="12" />
          <rect x="530" y="48" width="10" height="12" />
          <rect x="558" y="48" width="10" height="12" />
          <rect x="530" y="74" width="10" height="12" />
          <rect x="558" y="74" width="10" height="12" />
          <rect x="692" y="58" width="10" height="12" />
          <rect x="722" y="58" width="10" height="12" />
          <rect x="692" y="84" width="10" height="12" />
          <rect x="862" y="54" width="10" height="12" />
          <rect x="890" y="54" width="10" height="12" />
          <rect x="862" y="80" width="10" height="12" />
        </g>
      </svg>

      <div className="track-line" />

      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`track-node ${i < completed ? 'track-node--done' : ''} ${
            i === completed && !finished ? 'track-node--current' : ''
          }`}
          style={{ left: `${nodeLeft(i, total)}%` }}
        >
          <span className="track-node-flag" />
        </div>
      ))}

      <div className="track-hero" style={{ left: `${heroLeft}%` }}>
        <Hero cape={cape} size={62} flying />
      </div>

      <div className={`track-beacon ${finished ? 'track-beacon--lit' : ''}`} style={{ left: '91%' }}>
        <span className="track-beacon-star">★</span>
      </div>
    </div>
  );
}
