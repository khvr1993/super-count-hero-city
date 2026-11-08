import type { Tier } from './types';

export interface LevelInfo {
  tier: Tier;
  name: string;
  emoji: string;
  tagline: string;
  detail: string;
  color: string;
}

export const LEVELS: LevelInfo[] = [
  {
    tier: 1,
    name: 'Rookie',
    emoji: '🐣',
    tagline: 'Count to 5',
    detail: 'Numbers on every tap + Power Core',
    color: '#2ecc71',
  },
  {
    tier: 2,
    name: 'Hero',
    emoji: '🦸',
    tagline: 'Count to 7',
    detail: 'Numbers on tap + Power Core',
    color: '#3a86ff',
  },
  {
    tier: 3,
    name: 'Super',
    emoji: '⚡',
    tagline: 'Count to 8',
    detail: 'No numbers — count in your head',
    color: '#9b5de5',
  },
  {
    tier: 4,
    name: 'Turbo',
    emoji: '🔥',
    tagline: 'Count to 10',
    detail: 'No numbers, no Power Core',
    color: '#ff7a3d',
  },
];

export function levelByTier(tier: Tier): LevelInfo {
  return LEVELS.find((level) => level.tier === tier) ?? LEVELS[0];
}
