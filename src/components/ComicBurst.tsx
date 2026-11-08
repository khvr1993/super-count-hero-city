interface ComicBurstProps {
  word: string;
  token: number;
}

export function ComicBurst({ word, token }: ComicBurstProps) {
  if (!word) return null;
  return (
    <div className="comic-overlay" aria-hidden="true" key={token}>
      <div className="comic-burst">
        <svg viewBox="0 0 200 200" className="comic-star">
          <polygon
            points="100,4 117,58 170,30 150,84 198,100 150,116 170,170 117,142 100,196 83,142 30,170 50,116 2,100 50,84 30,30 83,58"
            fill="#ffd93d"
            stroke="#14213d"
            strokeWidth="6"
            strokeLinejoin="round"
          />
        </svg>
        <span className="comic-word">{word}</span>
      </div>
    </div>
  );
}
