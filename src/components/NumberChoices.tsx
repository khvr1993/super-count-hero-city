interface NumberChoicesProps {
  choices: number[];
  disabled: boolean;
  reveal: boolean;
  answer: number;
  wrongValue: number | null;
  onPick: (value: number) => void;
}

const TONES = ['blue', 'red', 'green', 'purple', 'gold'];

export function NumberChoices({
  choices,
  disabled,
  reveal,
  answer,
  wrongValue,
  onPick,
}: NumberChoicesProps) {
  return (
    <div className={`choices choices--${choices.length}`}>
      {choices.map((value, i) => (
        <button
          key={value}
          type="button"
          className={`choice choice--${TONES[i % TONES.length]} ${
            reveal && value === answer ? 'choice--reveal' : ''
          } ${wrongValue === value ? 'choice--wrong' : ''}`}
          onClick={() => onPick(value)}
          disabled={disabled}
          aria-label={`${value}`}
        >
          {value}
        </button>
      ))}
    </div>
  );
}
