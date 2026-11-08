import type { Mission } from './types';

export const MISSIONS: Mission[] = [
  {
    id: 'kittens',
    emoji: '🐱',
    intro: 'Kittens are stuck on the roof!',
    question: 'How many kittens?',
  },
  {
    id: 'cells',
    emoji: '⚡',
    intro: 'The suit needs power!',
    question: 'How many power cells?',
  },
  {
    id: 'pizzas',
    emoji: '🍕',
    intro: 'Heroes need pizza!',
    question: 'How many pizzas?',
  },
  {
    id: 'robots',
    emoji: '🤖',
    intro: 'Robots are blocking the bridge!',
    question: 'How many robots?',
  },
  {
    id: 'stars',
    emoji: '⭐',
    intro: 'Look at the night sky!',
    question: 'How many stars?',
  },
  {
    id: 'balloons',
    emoji: '🎈',
    intro: "It's parade time!",
    question: 'How many balloons?',
  },
];

export const COMIC_WORDS = ['POW!', 'ZAP!', 'WHOOSH!', 'BAM!', 'KAPOW!', 'BOOM!'];

export function randomOf<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

export function shuffle<T>(list: T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
