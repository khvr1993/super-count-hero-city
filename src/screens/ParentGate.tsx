import { useEffect, useRef, useState } from 'react';

interface ParentGateProps {
  sound: boolean;
  timer: boolean;
  name: string;
  tier: number;
  onPatch: (patch: Record<string, unknown>) => void;
  onReset: () => void;
}

const TIER_LABELS = ['Rookie', 'Hero', 'Super', 'Turbo'];

export function ParentGate({
  sound,
  timer,
  name,
  tier,
  onPatch,
  onReset,
}: ParentGateProps) {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [confirmReset, setConfirmReset] = useState(false);
  const holdTimer = useRef<number | null>(null);
  const holdStart = useRef(0);

  function stopHold() {
    if (holdTimer.current !== null) {
      window.clearInterval(holdTimer.current);
      holdTimer.current = null;
    }
    setProgress(0);
  }

  function startHold() {
    if (open) return;
    holdStart.current = Date.now();
    holdTimer.current = window.setInterval(() => {
      const p = Math.min(1, (Date.now() - holdStart.current) / 1600);
      setProgress(p);
      if (p >= 1) {
        stopHold();
        setOpen(true);
      }
    }, 50);
  }

  useEffect(() => {
    return () => {
      if (holdTimer.current !== null) window.clearInterval(holdTimer.current);
    };
  }, []);

  return (
    <>
      <button
        type="button"
        className="parent-gear"
        style={{ ['--hold' as string]: `${progress * 360}deg` }}
        onPointerDown={startHold}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        onPointerCancel={stopHold}
        onContextMenu={(e) => e.preventDefault()}
        aria-label="Grown-ups: hold to open settings"
      >
        <span className="parent-gear-ring" />
        <span className="parent-gear-icon">⚙️</span>
        <span className="parent-gear-label">grown-ups</span>
      </button>

      {open ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setOpen(false)}>
          <div
            className="parent-card"
            role="dialog"
            aria-modal="true"
            aria-label="Grown-up settings"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="parent-head">
              <h2>Grown-ups</h2>
              <button
                type="button"
                className="btn btn--small btn--green"
                onClick={() => setOpen(false)}
              >
                DONE
              </button>
            </div>

            <div className="parent-body">
              <label className="parent-field">
                <span>Hero name</span>
                <input
                  type="text"
                  value={name}
                  maxLength={14}
                  onChange={(e) => onPatch({ name: e.target.value })}
                />
              </label>

              <div className="parent-toggle-row">
                <span>Sound effects</span>
                <button
                  type="button"
                  className={`switch ${sound ? 'switch--on' : ''}`}
                  onClick={() => onPatch({ settings: { sound: !sound } })}
                  aria-pressed={sound}
                >
                  <span className="switch-knob" />
                </button>
              </div>

              <div className="parent-toggle-row">
                <span>Countdown timer</span>
                <button
                  type="button"
                  className={`switch ${timer ? 'switch--on' : ''}`}
                  onClick={() => onPatch({ settings: { timer: !timer } })}
                  aria-pressed={timer}
                >
                  <span className="switch-knob" />
                </button>
              </div>

              <div className="parent-tier">
                <span>Challenge</span>
                <div className="tier-row">
                  {[1, 2, 3, 4].map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`tier-btn ${tier === t ? 'tier-btn--active' : ''}`}
                      onClick={() => onPatch({ tier: t, points: 0 })}
                    >
                      <b>{t}</b>
                      <small>{TIER_LABELS[t - 1]}</small>
                    </button>
                  ))}
                </div>
              </div>

              <div className="parent-reset">
                {confirmReset ? (
                  <div className="reset-confirm">
                    <span>Erase all stars and badges?</span>
                    <div className="reset-actions">
                      <button
                        type="button"
                        className="btn btn--small btn--red"
                        onClick={() => {
                          setConfirmReset(false);
                          setOpen(false);
                          onReset();
                        }}
                      >
                        ERASE
                      </button>
                      <button
                        type="button"
                        className="btn btn--small btn--ghost"
                        onClick={() => setConfirmReset(false)}
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn btn--small btn--ghost"
                    onClick={() => setConfirmReset(true)}
                  >
                    RESET PROGRESS
                  </button>
                )}
              </div>

              <p className="parent-note">
                Progress saves automatically on this device. No ads, no accounts, no internet needed.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
