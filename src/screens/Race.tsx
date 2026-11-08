import { useEffect, useRef, useState } from 'react';
import { CityTrack } from '../components/CityTrack';
import { ComicBurst } from '../components/ComicBurst';
import { Confetti } from '../components/Confetti';
import { GateObjects } from '../components/GateObjects';
import { NumberChoices } from '../components/NumberChoices';
import { PowerCore } from '../components/PowerCore';
import { sfx } from '../game/audio';
import { generateRace, numberWord } from '../game/generator';
import { COMIC_WORDS, randomOf } from '../game/missions';
import { stopSpeaking, speak } from '../game/voice';
import type { GateOutcome, GateRecord, GateSpec, RaceResult, SaveData } from '../game/types';

type Phase = 'countdown' | 'play' | 'helper' | 'correct' | 'finish';

interface RaceProps {
  save: SaveData;
  onFinish: (result: RaceResult) => void;
  onQuit: () => void;
}

export function Race({ save, onFinish, onQuit }: RaceProps) {
  const [gates] = useState<GateSpec[]>(() => generateRace(save.tier, save.avgSolveMs, 4));
  const [gateIndex, setGateIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('countdown');
  const [countdown, setCountdown] = useState<number | null>(3);
  const [counted, setCounted] = useState<Record<number, number>>({});
  const [remaining, setRemaining] = useState<number>(gates[0].timeLimitMs ?? 0);
  const [timerOn, setTimerOn] = useState<boolean>(
    save.settings.timer && gates[0].timeLimitMs != null,
  );
  const [wrongValue, setWrongValue] = useState<number | null>(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [highlight, setHighlight] = useState<number | null>(null);
  const [wiggleId, setWiggleId] = useState<number | null>(null);
  const [gateBolts, setGateBolts] = useState(0);
  const [bolts, setBolts] = useState(0);
  const [burst, setBurst] = useState<{ word: string; token: number } | null>(null);
  const [confetti, setConfetti] = useState(false);
  const [paused, setPaused] = useState(false);

  const gate = gates[gateIndex];

  const timeouts = useRef<number[]>([]);
  const lastTick = useRef<number | null>(null);
  const elapsed = useRef(0);
  const answerLocked = useRef(false);
  const helperRunning = useRef(false);
  const promptedGate = useRef(-1);
  const startAt = useRef(Date.now());
  const helperUsedRef = useRef(false);
  const timedOutRef = useRef(false);
  const wrongCountRef = useRef(0);
  const boltsRef = useRef(0);
  const recordsRef = useRef<GateRecord[]>([]);
  const timeoutHandler = useRef<() => void>(() => {});
  const didMount = useRef(false);

  function schedule(fn: () => void, ms: number) {
    const id = window.setTimeout(() => {
      timeouts.current = timeouts.current.filter((t) => t !== id);
      fn();
    }, ms);
    timeouts.current.push(id);
  }

  useEffect(() => {
    return () => {
      timeouts.current.forEach((id) => window.clearTimeout(id));
      timeouts.current = [];
      stopSpeaking();
    };
  }, []);

  /* ---------------------------------------------------------------- countdown */
  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      sfx('tick');
    } else {
      sfx('engine');
    }
    const t = window.setTimeout(() => {
      if (countdown > 0) setCountdown(countdown - 1);
      else {
        setCountdown(null);
        setPhase('play');
      }
    }, 760);
    return () => window.clearTimeout(t);
  }, [countdown, save.spokenName]);

  /* ------------------------------------------------------------------ new gate */
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    answerLocked.current = false;
    helperRunning.current = false;
    promptedGate.current = -1;
    helperUsedRef.current = false;
    timedOutRef.current = false;
    wrongCountRef.current = 0;
    elapsed.current = 0;
    lastTick.current = null;
    const limit = gates[gateIndex].timeLimitMs;
    setCounted({});
    setWrongValue(null);
    setWrongCount(0);
    setReveal(false);
    setHighlight(null);
    setWiggleId(null);
    setGateBolts(0);
    setBurst(null);
    setConfetti(false);
    setRemaining(limit ?? 0);
    setTimerOn(save.settings.timer && limit != null);
    setPhase('play');
    startAt.current = Date.now();
  }, [gateIndex, gates, save.settings.timer]);

  /* -------------------------------------------------------------------- prompt */
  useEffect(() => {
    if (phase !== 'play' || paused) return;
    if (promptedGate.current === gateIndex) return;
    promptedGate.current = gateIndex;
    const g = gates[gateIndex];
    startAt.current = Date.now();
    speak(`${g.mission.intro} ${g.mission.question}`);
  }, [phase, gateIndex, gates, paused]);

  /* --------------------------------------------------------------------- timer */
  useEffect(() => {
    const limit = gate.timeLimitMs;
    if (phase !== 'play' || paused || !timerOn || !limit) return;
    lastTick.current = performance.now();
    const iv = window.setInterval(() => {
      const now = performance.now();
      const last = lastTick.current ?? now;
      elapsed.current += now - last;
      lastTick.current = now;
      const left = Math.max(0, limit - elapsed.current);
      setRemaining(left);
      if (left <= 0) {
        window.clearInterval(iv);
        timeoutHandler.current();
      }
    }, 100);
    return () => {
      window.clearInterval(iv);
      lastTick.current = null;
    };
  }, [phase, paused, timerOn, gate.timeLimitMs, gateIndex]);

  /* ------------------------------------------------------------------- helpers */
  function runHelper(fromTimeout = false) {
    if (helperRunning.current) return;
    helperRunning.current = true;
    answerLocked.current = true;
    helperUsedRef.current = true;
    setPhase('helper');
    setTimerOn(false);
    setHighlight(null);
    sfx('whoosh');

    const count = gate.count;
    for (let i = 0; i < count; i++) {
      schedule(
        () => {
          setHighlight(i);
          setCounted((prev) => ({ ...prev, [i]: i + 1 }));
          sfx('pop');
          speak(numberWord(i + 1), { interrupt: false });
        },
        850 + i * 620,
      );
    }

    schedule(
      () => {
        setHighlight(null);
        setPhase('play');
        answerLocked.current = false;
        helperRunning.current = false;
        if (!fromTimeout && wrongCountRef.current >= 2) {
          setReveal(true);
        }
      },
      850 + count * 620 + 300,
    );
  }

  function handleTimeout() {
    if (phase !== 'play' || helperRunning.current) return;
    timedOutRef.current = true;
    setRemaining(0);
    setTimerOn(false);
    runHelper(true);
  }
  timeoutHandler.current = handleTimeout;

  function finishRace() {
    setPhase('finish');
    sfx('fanfare');
    onFinish({ bolts: boltsRef.current, gates: recordsRef.current });
  }

  /* -------------------------------------------------------------- interactions */
  function handleObjectTap(index: number) {
    if (phase !== 'play' || paused) return;
    if (counted[index] !== undefined) {
      sfx('pop');
      setWiggleId(index);
      schedule(() => setWiggleId((w) => (w === index ? null : w)), 420);
      return;
    }
    const next = Object.values(counted).reduce((max, v) => Math.max(max, v), 0) + 1;
    setCounted((prev) => ({ ...prev, [index]: next }));
    sfx('squeak');
    if (gate.aids.speakCount) speak(numberWord(next), { interrupt: false });
  }

  function handlePick(value: number) {
    if (phase !== 'play' || paused || answerLocked.current) return;

    if (value === gate.count) {
      answerLocked.current = true;
      const usedHelp = helperUsedRef.current || timedOutRef.current;
      const limit = gate.timeLimitMs;
      const fast = !usedHelp && limit != null && limit - remaining < limit * 0.6;
      const earned = 1 + (!usedHelp ? 1 : 0) + (fast ? 1 : 0);

      boltsRef.current += earned;
      setBolts(boltsRef.current);
      setGateBolts(earned);
      setConfetti(true);
      setBurst({ word: randomOf(COMIC_WORDS), token: Date.now() });
      setPhase('correct');
      sfx('correct');

      const outcome: GateOutcome = timedOutRef.current
        ? 'timeout'
        : helperUsedRef.current
          ? 'helped'
          : 'clean';
      recordsRef.current.push({
        outcome,
        solveMs: Math.max(0, Date.now() - startAt.current),
        bolts: earned,
      });

      schedule(() => {
        setConfetti(false);
        if (gateIndex + 1 >= gates.length) finishRace();
        else setGateIndex((i) => i + 1);
      }, 1700);
      return;
    }

    answerLocked.current = true;
    setTimerOn(false);
    setWrongValue(value);
    setWrongCount((c) => c + 1);
    wrongCountRef.current += 1;
    sfx('wrong');
    schedule(() => {
      setWrongValue(null);
      runHelper();
    }, 1000);
  }

  /* ---------------------------------------------------------------------- view */
  const completed = gateIndex + (phase === 'correct' || phase === 'finish' ? 1 : 0);
  const filled = Object.keys(counted).length;
  const choicesDisabled = phase !== 'play' || paused;

  return (
    <div className="screen race">
      <div className="hud">
        <button
          type="button"
          className="hud-pause"
          onClick={() => {
            setPaused(true);
            stopSpeaking();
          }}
          aria-label="Pause"
        >
          ❚❚
        </button>

        <div className="hud-dots" aria-hidden="true">
          {gates.map((_, i) => (
            <span
              key={i}
              className={`hud-dot ${
                i < gateIndex || (i === gateIndex && phase === 'correct') ? 'hud-dot--done' : ''
              } ${i === gateIndex && phase !== 'correct' ? 'hud-dot--current' : ''}`}
            />
          ))}
        </div>

        <div className="hud-bolts">
          <span className="hud-bolt-icon">⚡</span>
          <b>{bolts}</b>
          {gateBolts > 0 ? (
            <span key={`${gateIndex}-${gateBolts}`} className="hud-bolt-pop">
              +{gateBolts}
            </span>
          ) : null}
        </div>
      </div>

      <CityTrack
        cape={save.cape}
        completed={Math.min(completed, gates.length)}
        total={gates.length}
        finished={phase === 'finish'}
      />

      <div className="timer-slot">
        {gate.timeLimitMs != null && timerOn ? (
          <div className={`timer ${remaining < 5000 ? 'timer--urgent' : ''}`}>
            <div
              className="timer-fill"
              style={{ width: `${(remaining / gate.timeLimitMs) * 100}%` }}
            />
          </div>
        ) : (
          <div className="timer timer--idle">
            <div className="timer-fill timer-fill--idle" />
          </div>
        )}
      </div>

      <div className="prompt" key={gateIndex}>
        <span className="prompt-emoji">{gate.mission.emoji}</span>
        <span className="prompt-text">{gate.mission.question}</span>
      </div>

      <GateObjects
        gate={gate}
        counted={counted}
        highlight={highlight}
        wiggleId={wiggleId}
        disabled={phase !== 'play' || paused}
        onTap={handleObjectTap}
      />

      {gate.aids.showTray ? (
        <PowerCore filled={filled} total={10} emoji={gate.mission.emoji} />
      ) : (
        <div className="core core--empty" aria-hidden="true">
          <span className="core-empty-text">Count them in your head, hero!</span>
        </div>
      )}

      <NumberChoices
        choices={gate.choices}
        disabled={choicesDisabled}
        reveal={reveal}
        answer={gate.count}
        wrongValue={wrongValue}
        onPick={handlePick}
      />

      {countdown !== null ? (
        <div className="countdown" aria-hidden="true">
          <div className="countdown-inner">
            <span className="countdown-word" key={countdown}>
              {countdown > 0 ? countdown : 'GO!'}
            </span>
          </div>
        </div>
      ) : null}

      {burst ? <ComicBurst word={burst.word} token={burst.token} /> : null}
      {confetti ? <Confetti /> : null}

      {paused ? (
        <div className="pause-overlay">
          <div className="pause-card">
            <h2>Paused</h2>
            <button type="button" className="btn btn--green" onClick={() => setPaused(false)}>
              KEEP RACING
            </button>
            <button type="button" className="btn btn--ghost" onClick={onQuit}>
              GO HOME
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
