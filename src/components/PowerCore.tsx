interface PowerCoreProps {
  filled: number;
  total: number;
  emoji: string;
}

export function PowerCore({ filled, total, emoji }: PowerCoreProps) {
  return (
    <div className="core" aria-label={`Power core ${filled} of ${total}`}>
      <div className="core-label">
        <span className="core-bolt">⚡</span> POWER CORE
      </div>
      <div className="core-slots">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={`core-slot ${i < filled ? 'core-slot--filled' : ''}`}>
            {i < filled ? <span className="core-slot-emoji">{emoji}</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
