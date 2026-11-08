import { useMemo } from 'react';

const COLORS = ['#ff4d4d', '#ffd93d', '#3a86ff', '#2ecc71', '#9b5de5', '#ff8fab', '#4cc3ff'];

interface ConfettiProps {
  pieces?: number;
}

export function Confetti({ pieces = 46 }: ConfettiProps) {
  const bits = useMemo(
    () =>
      Array.from({ length: pieces }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.7,
        duration: 1.1 + Math.random() * 1.1,
        color: COLORS[i % COLORS.length],
        size: 7 + Math.random() * 8,
        round: Math.random() > 0.6,
        drift: Math.random() * 80 - 40,
      })),
    [pieces],
  );

  return (
    <div className="confetti" aria-hidden="true">
      {bits.map((b) => (
        <span
          key={b.id}
          className={`confetti-bit ${b.round ? 'confetti-bit--round' : ''}`}
          style={{
            left: `${b.left}%`,
            width: `${b.size}px`,
            height: `${b.size * (b.round ? 1 : 0.55)}px`,
            background: b.color,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.duration}s`,
            ['--drift' as string]: `${b.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
