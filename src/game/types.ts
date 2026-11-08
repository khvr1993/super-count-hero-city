export type CapeId = 'red' | 'blue' | 'green' | 'gold';

export interface Cape {
  id: CapeId;
  name: string;
  hex: string;
  dark: string;
}

export const CAPES: Cape[] = [
  { id: 'red', name: 'Red Rocket', hex: '#ff4d4d', dark: '#c92a2a' },
  { id: 'blue', name: 'Blue Blast', hex: '#3a86ff', dark: '#1b5fd9' },
  { id: 'green', name: 'Green Guardian', hex: '#2ecc71', dark: '#1d9e55' },
  { id: 'gold', name: 'Gold Glory', hex: '#ffc400', dark: '#d99e00' },
];

export function capeById(id: CapeId | null | undefined): Cape {
  return CAPES.find((c) => c.id === id) ?? CAPES[0];
}

export type MissionId = 'kittens' | 'cells' | 'pizzas' | 'robots' | 'stars' | 'balloons';

export interface Mission {
  id: MissionId;
  emoji: string;
  intro: string;
  question: string;
}

export interface Pt {
  x: number;
  y: number;
}

export type Tier = 1 | 2 | 3 | 4;

export interface Aids {
  showNumbers: boolean;
  showTray: boolean;
}

export interface GateSpec {
  mission: Mission;
  count: number;
  positions: Pt[];
  choices: number[];
  timeLimitMs: number | null;
  aids: Aids;
}

export type GateOutcome = 'clean' | 'helped' | 'timeout';

export interface GateRecord {
  outcome: GateOutcome;
  solveMs: number;
  bolts: number;
}

export interface RaceResult {
  bolts: number;
  gates: GateRecord[];
}

export interface Settings {
  sound: boolean;
  timer: boolean;
}

export interface SaveData {
  version: number;
  name: string;
  cape: CapeId | null;
  bolts: number;
  badges: string[];
  tier: Tier;
  points: number;
  races: number;
  avgSolveMs: number | null;
  settings: Settings;
}

export interface Badge {
  id: string;
  emoji: string;
  name: string;
}

export const BADGES: Badge[] = [
  { id: 'firstcape', emoji: '🦸', name: 'First Cape' },
  { id: 'shield', emoji: '🛡️', name: 'Shield Up' },
  { id: 'boots', emoji: '👟', name: 'Lightning Boots' },
  { id: 'goggles', emoji: '🥽', name: 'X-Ray Goggles' },
  { id: 'robot', emoji: '🤖', name: 'Robot Sidekick' },
  { id: 'star', emoji: '⭐', name: 'Golden Star' },
  { id: 'medal', emoji: '🏅', name: 'Hero Medal' },
  { id: 'crown', emoji: '👑', name: 'Hero City Legend' },
];
