import type { SaveData } from './types';

const KEY = 'super-count-save-v1';

export function defaultSave(): SaveData {
  return {
    version: 1,
    name: 'Avyan',
    spokenName: 'Ah-vee-yahn',
    cape: null,
    bolts: 0,
    badges: [],
    tier: 1,
    points: 0,
    races: 0,
    avgSolveMs: null,
    settings: { sound: true, voice: true, timer: true },
  };
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSave();
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    const base = defaultSave();
    return {
      ...base,
      ...parsed,
      settings: { ...base.settings, ...(parsed.settings ?? {}) },
      badges: Array.isArray(parsed.badges) ? parsed.badges : [],
    };
  } catch {
    return defaultSave();
  }
}

export function persistSave(save: SaveData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch {
    // Storage can be unavailable in private modes; the game still works.
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
