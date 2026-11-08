import type { GateSpec } from '../game/types';

interface GateObjectsProps {
  gate: GateSpec;
  counted: Record<number, number>;
  highlight: number | null;
  wiggleId: number | null;
  disabled: boolean;
  onTap: (index: number) => void;
}

export function GateObjects({
  gate,
  counted,
  highlight,
  wiggleId,
  disabled,
  onTap,
}: GateObjectsProps) {
  return (
    <div className="object-field">
      {gate.positions.map((pos, index) => {
        const order = counted[index];
        const isCounted = order !== undefined;
        const isHighlighted = highlight === index;
        return (
          <button
            key={index}
            type="button"
            className={`obj ${isCounted ? 'obj--counted' : ''} ${
              wiggleId === index ? 'obj--wiggle' : ''
            } ${isHighlighted ? 'obj--highlight' : ''}`}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            onClick={() => onTap(index)}
            disabled={disabled}
            aria-label={`${gate.mission.id} ${index + 1}`}
          >
            <span className="obj-emoji" role="presentation">
              {gate.mission.emoji}
            </span>
            {isCounted && gate.aids.showNumbers ? (
              <span className="obj-badge">{order}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
