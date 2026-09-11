# NO-IDLE ORCHESTRATION — keep the GPU fed without spamming anyone

**Date:** 2026-09-09 · **Author:** Claude Fable 5 (planning session for Jonathan) · **Implementer:** Alice
**Status:** PLAN — ready to implement. L3 renderer is currently live (`render_lesson03_v3_shots.py`, shot-01 in flight); implement around it, do not restart anything.

---

## 1. What broke (diagnosis, one section)

At 11:56 the conveyor tick finished L3 Whisper — a light CPU stage — while the GPU was idle. The conveyor prompt said **"one stage per tick,"** so the agent obediently exited and deferred beats → stills → H3 to the next 12-minute tick. Exiting updated `last_tick`, so the 12:00 watchdog (which only checks heartbeat *age*) saw a fresh heartbeat and stayed silent. Result: ~15–20 minutes of idle GPU with every monitor reporting "healthy," until Jonathan asked.

Three distinct defects, all policy, none crash:

1. **Pacing defect:** the 12-minute LLM cadence was allowed to become the gap between a light stage and the heavy it unblocks. Light stages take seconds; treating one as a full tick converts "cheap prep" into "12 minutes of dead GPU."
2. **Monitoring defect:** the watchdog measures *liveness* (heartbeat age), not *productivity*. A conveyor that ticks punctually while the GPU starves is exactly the failure it can't see. `last_tick` fresh + GPU idle + lesson incomplete + no renderer PID = invisible stall.
3. **Mechanism defect:** the anti-idle rule lived only in an LLM prompt (and in the long-running-campaigns skill, which "one stage per tick" directly contradicted). A rule the LLM must remember is a hope, not a mechanism.

The renderer scripts already chain shot N→N+1 with no cron involvement, and already skip existing mp4s. So the *only* holes are: (a) the window **before** a renderer starts, and (b) a renderer **dying** mid-lesson. Both are closed below with a deterministic script, not a smarter prompt.

## 2. Primary anti-idle mechanism: a script-only kicker

**One new file: `~/.hermes/scripts/gtm_kicker.py`.** Plain Python, no LLM, idempotent, safe to run any number of times from anywhere. Its whole job:

> If no GTM renderer is running and the next incomplete lesson has everything a renderer needs, start that renderer. Otherwise say (in a state file) exactly what it's blocked on. Never do anything else.

It runs from **two triggers**:

- **Its own cron, every 5 minutes** (same silent-script mechanism as the watchdog cron `1cb498b0626e`). This bounds *any* idle gap — renderer death, conveyor amnesia, whatever — at ≤5 minutes once inputs exist.
- **The conveyor calls it as its mandatory last action every tick** (see §4). This makes "kick before exit" a command, not a memory.

### Kicker logic (canonical)

```
flock /tmp/gtm_kicker.lock (non-blocking; if held, exit 0)        # never two kickers
read ops/campaign-state.json READ-ONLY
if status in {done, blocked}: exit 0
if pgrep matches ops/render_lesson.*_shots.py (this repo path): exit 0   # heavy already running
N = lowest lesson number whose film is not assembled/approved
eligible(N) =  ops/render_lessonNN_v3_shots.py exists
           AND ops/out/lesson-NN/v3/beats.json exists
           AND ops/out/lesson-NN/v3/still-s{1,2,3}-h3.png all exist
           AND ops/out/lesson-NN/tts/voice.wav exists
if eligible(N):
    setsid nohup python3 ops/render_lessonNN_v3_shots.py \
        >> ops/out/lesson-NN/v3/render.log 2>&1 &
    write ops/kicker-state.json {action: "started", lesson: N, pid, at}
    print one line: "GTM kicker: started render_lessonNN (pid P)"    # low-noise signal, not spam
else:
    write ops/kicker-state.json {action: "blocked", lesson: N, blocked_on: [missing items], at}
    exit 0 silently                                                  # semantic work is the LLM's job
```

Opinionated defaults baked in:

- **"GPU idle" is defined as "no GTM renderer/h3 PID," not `nvidia-smi` utilization.** `h3-native.py` already serializes the GPU globally via its lock (`--lock-wait 300`); if another campaign holds the GPU, our renderer simply queues on that lock. Checking utilization would wrongly block us and adds a fragile dependency. The one-heavy rule is: *at most one GTM renderer process*, enforced by the pgrep check + flock.
- **The kicker never writes `campaign-state.json`.** The conveyor LLM owns that file; concurrent writes from a 5-minute cron would eventually clobber it. The kicker owns `ops/kicker-state.json` exclusively.
- **The kicker never spends money and never publishes.** No xAI calls (stills stay with the conveyor under the $5 cap and QA judgment), no YouTube, no deploys, no assembly. It launches local renderers, full stop. All approval gates (`youtube.after_approval_only`) are untouched.
- **Crash-loop guard:** kicker-state keeps `restarts` (list of timestamps per lesson). If it has started the same lesson's renderer ≥3 times in 60 minutes, it stops restarting, writes `action: "crash_loop"`, and prints `GTM kicker: render_lessonNN crash-looping, giving up` — which the cron pipe turns into a Telegram alert. This is the *only* case where the kicker escalates instead of acting.

### Renderer-death recovery (requirement 5)

Falls out for free: renderer dies → next kicker run (≤5 min) finds no PID, lesson still incomplete, inputs still on disk → relaunches the same script → the script's existing `skip existing shot-NN.mp4` logic resumes at the first missing shot. No new resume code needed. The crash-loop guard prevents infinite thrash if the renderer is dying deterministically (e.g. corrupt anchor).

## 3. Watchdog v2: detect *productive stall*, not just dead heartbeat

Patch `~/.hermes/scripts/gtm_watchdog.py` (keep it silent-when-healthy). Current logic checks only `last_tick` age. Add a second, independent check that fires **even when `last_tick` is fresh**:

```
PRODUCTIVE-STALL := status == "running"
                AND next incomplete lesson exists
                AND no ops/render_lesson.*_shots.py PID
                AND NOT waiting-on-Jonathan          # next lesson's film assembled & pending approval
```

Waiting on Jonathan's film approval is a *legitimate* quiet state — the watchdog must not nag about it (that's what keeps Telegram quiet when healthy).

**Debounce with a marker file**, because there is a legitimate few-minute window while the conveyor does light stages: first run that observes PRODUCTIVE-STALL writes `ops/stall-marker.json` with a timestamp and stays silent. If the condition still holds on a later run and the marker is >10 minutes old, print:

```
GTM STALLED (productive): GPU has no GTM render PID for 14m, lesson 04 incomplete,
kicker blocked_on: ["beats.json", "still-s1-h3.png"], last_tick fresh (3m)
```

Any healthy observation deletes the marker. The `blocked_on` detail comes straight from `ops/kicker-state.json`, so the Telegram message says exactly what semantic work the conveyor owes — Jonathan sees *what* is stuck, not just *that* something is.

Also alert (immediately, no debounce) on `kicker-state.action == "crash_loop"`.

Keep the existing heartbeat check as-is (18 min) — it still covers "conveyor cron itself died."

**Worst-case detection math:** watchdog every 12 min + 10-min marker debounce ⇒ a true productive stall alerts within ~22 minutes even if *every* other layer fails. But with the kicker cron at 5 min, the watchdog should essentially never fire on stage-gap idleness — it's the backstop for "kicker blocked on missing semantic inputs and the conveyor isn't producing them."

## 4. Same-tick rule: patch the conveyor prompt (drain-until-heavy)

Replace **"one stage per tick"** in conveyor cron `3b8548510eb6` with:

> **Drain-until-heavy.** In a single tick, keep executing stages for the next incomplete lesson — TTS, Whisper, beat plan, xAI stills (≤$0.02 each, respect the $5 cap), still QA — until one of: (a) a `render_lessonNN_v3_shots.py` process is running, (b) you are blocked on Jonathan's approval or the budget cap, or (c) you have written the next lesson's renderer script and its inputs and started it. Finishing a light stage while no renderer runs is **not** a stopping point — "one stage per tick" is revoked.
>
> **Mandatory last action of every tick, no exceptions:** run `python3 ~/.hermes/scripts/gtm_kicker.py`, then read `ops/kicker-state.json`. If it says `blocked`, the listed `blocked_on` items are *your* work — do them now, in this tick, and run the kicker again. Only exit once kicker-state says `started`, a renderer PID is confirmed live, or the blocker is genuinely non-semantic (approval / budget / done).
>
> If h3/renderer is already live for GTM: [SILENT] as before.

Note the layering: even if the LLM ignores all of this, the kicker cron independently starts any renderer whose inputs exist within 5 minutes, and the watchdog flags within ~22 minutes the one case scripts can't fix (missing semantic inputs). The prompt patch is the *optimization* (zero-gap handoff in the same tick); the scripts are the *guarantee*.

One more conveyor duty: **for lesson N+1, write `render_lessonNN_v3_shots.py` early** (it's a mechanical clone of the L3 script with new paths/beats — the conveyor should generate it during the beats stage, not after). The kicker can only start scripts that exist.

## 5. Files and commands (implement in this order)

Everything is additive; nothing touches the live L3 render.

1. **`~/.hermes/scripts/gtm_kicker.py`** — new, per §2. ~80 lines: `fcntl.flock` on `/tmp/gtm_kicker.lock`, read-only `campaign-state.json`, `pgrep -f 'game-theory-microcourse/ops/render_lesson.*_shots\.py'` via `subprocess`, eligibility check on the four input paths, `subprocess.Popen([...], start_new_session=True, stdout=render.log)`, write `ops/kicker-state.json` atomically (write tmp + `os.replace`).
2. **`ops/kicker-state.json`** — created by the kicker on first run. Schema: `{"action": "started|blocked|noop|crash_loop", "lesson": N, "pid": int|null, "blocked_on": [str], "restarts": {"03": [iso...]}, "at": iso}`.
3. **Patch `~/.hermes/scripts/gtm_watchdog.py`** — add the productive-stall check + `ops/stall-marker.json` debounce + crash-loop alert per §3. Keep existing heartbeat logic and the silent-when-healthy contract.
4. **New cron:** every 5 min, `python3 /home/nvidia/.hermes/scripts/gtm_kicker.py`, same silent-script/empty-stdout-means-no-Telegram mechanism as watchdog cron `1cb498b0626e`. Output only on `started` / `crash_loop` — one line, rare, worth seeing.
5. **Patch conveyor cron `3b8548510eb6` prompt** per §4 (revoke one-stage-per-tick; add mandatory kicker call + drain rule + write-next-renderer-early duty).
6. **Smoke test (run once L3's current render finishes a few shots, or on a scratch copy):**
   - `python3 gtm_kicker.py` while renderer live → expect silent noop, no second process.
   - `kill -9 <renderer pid>` → run kicker → renderer relaunches, log shows `skip existing shot-01.mp4 …` then resumes at first missing shot.
   - Delete/rename `beats.json` for a fake lesson dir → kicker writes `blocked_on: ["beats.json"]`, silent; age the stall marker >10 min → watchdog prints the productive-stall line.
   - Run two kickers concurrently → second exits on flock.

## 6. Invariants (what this design promises)

| Guarantee | Enforced by |
|---|---|
| GPU idle with renderable inputs on disk: **≤5 min** | kicker cron |
| Renderer death mid-lesson: resumed **≤5 min**, skip-existing | kicker + renderer's own skip logic |
| Light-stage finish → renderer start: **same tick, zero gap** | conveyor drain rule + mandatory kicker call |
| Stall the scripts can't fix (missing semantic inputs): **Telegram ≤~22 min**, message names the missing items | watchdog v2 + kicker-state |
| Never two GTM heavies | kicker flock + pgrep; h3's own GPU lock serializes cross-campaign |
| No money spent, nothing published, by any script | kicker scope (local renderers only); approval gates unchanged |
| Telegram quiet when healthy or waiting on Jonathan | watchdog silence conditions + 10-min debounce |
| Crash-looping renderer doesn't thrash forever | ≥3 restarts/60 min → stop + alert |

The principle, stated once so it survives into future campaigns: **the LLM decides *what* is next; a dumb script guarantees *that* something is next.** Cadence belongs to deterministic code. Prompts optimize; mechanisms guarantee.
