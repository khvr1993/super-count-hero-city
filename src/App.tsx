import { useEffect, useState } from 'react';
import { setSoundEnabled, sfx, unlockAudio } from './game/audio';
import { applyOutcome } from './game/generator';
import { clearSave, defaultSave, loadSave, persistSave } from './game/save';
import { BADGES } from './game/types';
import type { RaceResult, SaveData, Settings, Tier } from './game/types';
import { BadgesScreen } from './screens/BadgesScreen';
import { CapePicker } from './screens/CapePicker';
import { Home } from './screens/Home';
import { LevelSelect } from './screens/LevelSelect';
import { Race } from './screens/Race';
import { RaceEnd, type Medal } from './screens/RaceEnd';

type Screen = 'home' | 'cape' | 'race' | 'end' | 'badges' | 'levels';

interface EndState {
  result: RaceResult;
  badgeId: string | null;
  bonus: number;
  medal: Medal;
  cleanCount: number;
}

export default function App() {
  const [boot] = useState(loadSave);
  const [save, setSave] = useState<SaveData>(boot);
  const [screen, setScreen] = useState<Screen>(boot.cape ? 'home' : 'cape');
  const [end, setEnd] = useState<EndState | null>(null);
  const [raceKey, setRaceKey] = useState(0);

  useEffect(() => {
    persistSave(save);
  }, [save]);

  useEffect(() => {
    setSoundEnabled(save.settings.sound);
  }, [save.settings.sound]);

  useEffect(() => {
    const unlock = () => {
      unlockAudio();
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    return () => window.removeEventListener('pointerdown', unlock);
  }, []);

  function patchSave(patch: Record<string, unknown>) {
    setSave((prev) => {
      const settings = patch.settings
        ? { ...prev.settings, ...(patch.settings as Partial<Settings>) }
        : prev.settings;
      const next = { ...prev, ...patch, settings } as SaveData;
      if (patch.tier) next.points = 0;
      return next;
    });
  }

  function confirmCape(cape: NonNullable<SaveData['cape']>) {
    unlockAudio();
    sfx('fanfare');
    setSave((prev) => ({ ...prev, cape }));
    setScreen('home');
  }

  function startRace(tier?: Tier) {
    unlockAudio();
    if (tier) {
      setSave((prev) => ({ ...prev, tier, points: 0 }));
    }
    setRaceKey((k) => k + 1);
    setScreen('race');
  }

  function finishRace(result: RaceResult) {
    const cleanGates = result.gates.filter((g) => g.outcome === 'clean');
    const cleanCount = cleanGates.length;

    let tier = save.tier;
    let points = save.points;
    for (const gate of result.gates) {
      const next = applyOutcome(tier, points, gate.outcome);
      tier = next.tier;
      points = next.points;
    }

    let avgSolveMs = save.avgSolveMs;
    if (cleanGates.length > 0) {
      const mean = cleanGates.reduce((sum, g) => sum + g.solveMs, 0) / cleanGates.length;
      avgSolveMs = avgSolveMs == null ? mean : avgSolveMs * 0.7 + mean * 0.3;
    }

    const unowned = BADGES.filter((b) => !save.badges.includes(b.id));
    const badgeId = unowned.length > 0 ? unowned[0].id : null;
    const bonus = unowned.length > 0 ? 0 : 5;

    const medal: Medal =
      cleanCount === result.gates.length
        ? 'gold'
        : cleanCount >= Math.ceil(result.gates.length * 0.66)
          ? 'silver'
          : 'bronze';

    setEnd({ result, badgeId, bonus, medal, cleanCount });
    setSave((prev) => ({
      ...prev,
      bolts: prev.bolts + result.bolts + bonus,
      badges: badgeId ? [...prev.badges, badgeId] : prev.badges,
      tier,
      points,
      races: prev.races + 1,
      avgSolveMs,
    }));
    setScreen('end');
  }

  function resetProgress() {
    clearSave();
    const fresh = defaultSave();
    setSave(fresh);
    setEnd(null);
    setScreen('cape');
  }

  return (
    <div className="app">
      <div className="app-halftone" aria-hidden="true" />

      {screen === 'home' ? (
        <Home
          save={save}
          onStart={startRace}
          onLevels={() => setScreen('levels')}
          onBadges={() => setScreen('badges')}
          onPatch={patchSave}
          onReset={resetProgress}
        />
      ) : null}

      {screen === 'cape' ? <CapePicker initial={save.cape} onConfirm={confirmCape} /> : null}

      {screen === 'race' ? (
        <Race
          key={raceKey}
          save={save}
          onFinish={finishRace}
          onQuit={() => setScreen('home')}
        />
      ) : null}

      {screen === 'end' && end ? (
        <RaceEnd
          save={save}
          result={end.result}
          badgeId={end.badgeId}
          bonusBolts={end.bonus}
          medal={end.medal}
          cleanCount={end.cleanCount}
          onAgain={startRace}
          onHome={() => setScreen('home')}
          onBadges={() => setScreen('badges')}
        />
      ) : null}

      {screen === 'badges' ? (
        <BadgesScreen
          badges={save.badges}
          onBack={() => setScreen(end ? 'end' : 'home')}
        />
      ) : null}

      {screen === 'levels' ? (
        <LevelSelect
          current={save.tier}
          onPick={startRace}
          onBack={() => setScreen('home')}
        />
      ) : null}
    </div>
  );
}
