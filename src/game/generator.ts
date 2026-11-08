import type { GateOutcome, GateSpec, Mission, Tier } from './types';
import { NUMBER_WORDS, MISSIONS, randomOf, shuffle } from './missions';


export const TIER_INFO: Record<Tier, { min: number; max: number; aids: GateSpec['aids'] }> =
  {
    1: {
      min: 3,
      max: 5,
      aids: { speakCount: true, showNumbers: true, showTray: true },
    },
    2: {
      min: 5,
      max: 7,
      aids: { speakCount: false, showNumbers: true, showTray: true },
    },
    3: {
      min: 6,
      max: 8,
      aids: { speakCount: false, showNumbers: false, showTray: true },
    },
    4: {
      min: 7,
      max: 10,
      aids: { speakCount: false, showNumbers: false, showTray: false },
    },
  };

export function timeLimitFor(avgSolveMs: number | null): number {
  const avg = avgSolveMs ?? 7000;
  return Math.round(Math.min(35000, Math.max(20000, avg * 2.2 + 8000)));
}

function buildChoices(answer: number, howMany: number): number[] {
  const wrongs = new Set<number>();
  const deltas = shuffle([-1, 1, -2, 2, -3, 3]);
  for (const delta of deltas) {
    const value = answer + delta;
    if (value >= 1 && value <= 20 && value !== answer) wrongs.add(value);
    if (wrongs.size >= howMany - 1) break;
  }
  return shuffle([answer, ...wrongs]);
}

function randomCount(tier: Tier, lastCount: number): number {
  const { min, max } = TIER_INFO[tier];
  for (let tries = 0; tries < 12; tries++) {
    const n = min + Math.floor(Math.random() * (max - min + 1));
    if (n !== lastCount) return n;
  }
  return min;
}

function positionsFor(count: number): { x: number; y: number }[] {
  const cols = count <= 4 ? 2 : count <= 9 ? 3 : 4;
  const rows = Math.ceil(count / cols);
  const stepX = cols === 2 ? 30 : cols === 3 ? 22 : 17;
  const stepY = rows <= 1 ? 0 : rows === 2 ? 26 : 21;

  return shuffle(
    Array.from({ length: count }).map((_, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const inRow = Math.min(cols, count - row * cols);
      const x = 50 + (col - (inRow - 1) / 2) * stepX + (Math.random() * 6 - 3);
      const y = 50 + (row - (rows - 1) / 2) * stepY + (Math.random() * 6 - 3);
      return {
        x: Math.min(90, Math.max(10, x)),
        y: Math.min(86, Math.max(14, y)),
      };
    }),
  );
}

export function generateGate(
  tier: Tier,
  count: number,
  mission: Mission,
  timeLimitMs: number | null,
): GateSpec {
  const choiceCount = tier >= 4 ? 4 : 3;
  return {
    mission,
    count,
    positions: positionsFor(count),
    choices: buildChoices(count, choiceCount),
    timeLimitMs,
    aids: { ...TIER_INFO[tier].aids },
  };
}

export function generateRace(
  tier: Tier,
  avgSolveMs: number | null,
  gateCount = 4,
): GateSpec[] {
  const missions = shuffle(MISSIONS);
  const timeLimit = timeLimitFor(avgSolveMs);
  let lastCount = -1;
  const gates: GateSpec[] = [];
  for (let i = 0; i < gateCount; i++) {
    const count = randomCount(tier, lastCount);
    lastCount = count;
    gates.push(generateGate(tier, count, missions[i % missions.length], timeLimit));
  }
  return gates;
}

export function applyOutcome(
  tier: Tier,
  points: number,
  outcome: GateOutcome,
): { tier: Tier; points: number } {
  let nextTier = tier;
  let nextPoints = points;

  if (outcome === 'clean') nextPoints += 1;
  else nextPoints -= 1;

  if (nextPoints >= 2 && nextTier < 4) {
    nextTier = (nextTier + 1) as Tier;
    nextPoints = 0;
  } else if (nextPoints <= -2 && nextTier > 1) {
    nextTier = (nextTier - 1) as Tier;
    nextPoints = 0;
  }

  return { tier: nextTier, points: Math.max(-1, Math.min(1, nextPoints)) };
}

export function numberWord(n: number): string {
  return NUMBER_WORDS[n] ?? String(n);
}

export function randomPraise(name: string): string {
  const base = randomOf([
    'Super counting!',
    'You got it!',
    'Kapow! Amazing!',
    'Number power, activate!',
    'Unstoppable!',
    'Bolt says: wow!',
    'Hero City is safe!',
    'Great counting!',
  ]);
  return Math.random() < 0.45 ? `${base} ${name}!` : base;
}
