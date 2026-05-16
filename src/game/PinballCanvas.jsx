import { useEffect, useRef, useState } from "react";
import { createEngine } from "./engine";

function PinballCanvas() {
  const sceneRef = useRef(null);
  const engineRef = useRef(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const { render, destroy, restart } = createEngine(sceneRef.current, {
      onScoreChange: setScore,
    });
    engineRef.current = { restart };

    return () => {
      engineRef.current = null;
      destroy();
      render.canvas.remove();
    };
  }, []);

  return (
    <section
      id="game"
      className="min-w-0 flex-1 overflow-hidden px-3 py-3 text-cyan-100 sm:px-4 sm:py-4"
    >
      <div className="flex h-full min-w-0 gap-3 rounded-[28px] border border-cyan-300/15 bg-[linear-gradient(180deg,rgba(9,14,29,0.95),rgba(4,6,12,0.98))] p-3 shadow-[0_0_40px_rgba(33,82,147,0.18)] sm:gap-4 sm:p-4">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-center justify-between rounded-2xl border border-cyan-300/15 bg-[#0c1328] px-4 py-3">
            {/* <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg border border-cyan-300/35 bg-cyan-400/10 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
                XP
              </div>
              <div className="text-left">
                <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-100/55">
                  Launch Ramp To Accept
                </div>
                <div className="text-sm font-medium text-white/95">
                  Launch Training
                </div>
              </div>
            </div> */}
            <div className="rounded-full border border-fuchsia-400/25 bg-fuchsia-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-fuchsia-100/85">
              Ball 1
            </div>
          </div>
          <div className="flex min-h-0 flex-1 items-start justify-center rounded-[24px] border border-cyan-300/10 bg-black/45 p-3">
            <div className="relative h-full w-full max-w-[720px] overflow-hidden rounded-[22px] border border-cyan-300/15 bg-slate-950/30 shadow-[inset_0_0_28px_rgba(73,192,255,0.08)]">
              <div
                ref={sceneRef}
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
        <aside className="flex w-[280px] min-w-[280px] max-w-[280px] flex-col gap-3">
          <div className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-2xl border border-cyan-300/20 bg-[#0c1328] px-4 py-3 shadow-[0_0_24px_rgba(58,119,255,0.12)]">
            <div>
              <div className="text-[10px] uppercase tracking-[0.26em] text-cyan-100/45">Score</div>
              <div className="mt-1 text-4xl font-semibold leading-none tabular-nums text-white">{score}</div>
            </div>
            <div className="rounded-lg border border-fuchsia-400/25 bg-fuchsia-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-fuchsia-100/80">
              Live
            </div>
          </div>
          <div className="rounded-2xl border border-cyan-300/15 bg-[#0b1021] px-4 py-4 text-left">
            <div className="text-[10px] uppercase tracking-[0.28em] text-cyan-100/45">Controls</div>
            <div className="mt-3 space-y-2 text-xs uppercase tracking-[0.18em] text-cyan-100/72">
              <div>Left / Right flip</div>
              <div>Space charge launch</div>
              <div>R restart game</div>
            </div>
          </div>
          <div className="rounded-2xl border border-cyan-300/15 bg-[#0b1021] px-4 py-4 text-left">
            <div className="text-[10px] uppercase tracking-[0.28em] text-cyan-100/45">Mode</div>
            <div className="mt-3 text-sm font-medium text-white/90">Arcade Portfolio Run</div>
            <div className="mt-2 text-xs leading-5 text-cyan-100/55">
              Keep the ball alive, route shots through the upper lanes, and build score off neon inserts.
            </div>
          </div>
          <div>
            <iframe data-testid="embed-iframe" style={{ borderRadius: 12 }} src="https://open.spotify.com/embed/playlist/1EyBwdbE8M27eqzwIcIe3H?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
          </div>
          <div className="mt-auto rounded-2xl border border-cyan-300/15 bg-[#0b1021] p-3">
            <button
              type="button"
              onClick={() => engineRef.current?.restart()}
              className="w-full rounded-xl border border-cyan-300/40 bg-cyan-400/10 px-4 py-3 text-sm font-medium uppercase tracking-[0.18em] text-cyan-100 shadow-[0_0_22px_rgba(74,222,255,0.14)] transition hover:border-cyan-200/70 hover:bg-cyan-400/15"
            >
              Restart Game
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default PinballCanvas;
