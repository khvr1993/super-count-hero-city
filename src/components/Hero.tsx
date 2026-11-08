import { capeById } from '../game/types';
import type { CapeId } from '../game/types';

interface HeroProps {
  cape: CapeId | null;
  size?: number;
  flying?: boolean;
  className?: string;
}

export function Hero({ cape, size = 160, flying = false, className = '' }: HeroProps) {
  const c = capeById(cape);
  return (
    <svg
      viewBox="0 0 140 158"
      width={size}
      height={(size * 158) / 140}
      className={`hero ${flying ? 'hero--flying' : ''} ${className}`}
      role="img"
      aria-label="Captain Avyan"
    >
      <ellipse cx="70" cy="151" rx="32" ry="5.5" fill="rgba(20,33,61,0.18)" />

      {/* cape */}
      <path
        d="M70 56C38 56 20 96 28 144c16-8 26-26 33-50h18c7 24 17 42 33 50 8-48-10-88-42-88Z"
        fill={c.hex}
        stroke={c.dark}
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* legs + boots */}
      <rect x="52" y="110" width="14" height="30" rx="7" fill="#1f3a93" />
      <rect x="74" y="110" width="14" height="30" rx="7" fill="#1f3a93" />
      <rect x="46" y="130" width="23" height="15" rx="7.5" fill="#ffd93d" stroke="#d9a400" strokeWidth="2" />
      <rect x="71" y="130" width="23" height="15" rx="7.5" fill="#ffd93d" stroke="#d9a400" strokeWidth="2" />

      {/* arms */}
      <rect
        x="33"
        y="78"
        width="16"
        height="40"
        rx="8"
        fill="#2f6fed"
        stroke="#1f3a93"
        strokeWidth="3"
        transform="rotate(12 41 98)"
      />
      <rect
        x="91"
        y="78"
        width="16"
        height="40"
        rx="8"
        fill="#2f6fed"
        stroke="#1f3a93"
        strokeWidth="3"
        transform="rotate(-12 99 98)"
      />
      <circle cx="35" cy="117" r="8" fill="#f7c99a" stroke="#d9a06b" strokeWidth="2" />
      <circle cx="105" cy="117" r="8" fill="#f7c99a" stroke="#d9a06b" strokeWidth="2" />

      {/* body */}
      <rect x="45" y="72" width="50" height="54" rx="22" fill="#2f6fed" stroke="#1f3a93" strokeWidth="3" />
      <path
        d="M70 84l3.2 7.2 7.8.7-5.9 5.2 1.7 7.7-6.8-4.2-6.8 4.2 1.7-7.7-5.9-5.2 7.8-.7Z"
        fill="#ffd93d"
        stroke="#d9a400"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* head */}
      <circle cx="70" cy="50" r="29" fill="#f7c99a" stroke="#d9a06b" strokeWidth="2" />
      <path d="M41 46c0-24 58-24 58 0-8-11-50-11-58 0Z" fill="#14213d" />
      <rect x="41" y="41" width="58" height="17" rx="8.5" fill="#14213d" />
      <circle cx="58" cy="49.5" r="7.6" fill="#ffffff" />
      <circle cx="82" cy="49.5" r="7.6" fill="#ffffff" />
      <circle cx="59.5" cy="49.5" r="3.3" fill="#14213d" />
      <circle cx="83.5" cy="49.5" r="3.3" fill="#14213d" />
      <path
        d="M62 64q8 6 16 0"
        stroke="#14213d"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* collar */}
      <path
        d="M52 70l18 12 18-12"
        stroke={c.dark}
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
