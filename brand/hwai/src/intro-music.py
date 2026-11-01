"""Original soundtrack for the hwai intro video (premium cut), synthesised with musiclib.py (no samples,
nothing to license), and muxed into the video.

Usage (repo root, after intro-video.cjs):  python3 brand/hwai/src/intro-music.py brand/hwai
It replaces the audio of brand/hwai/social/hwai-intro-1920x1080.mp4 (the video stream is copied).

120 BPM, a bar is 2 s, and every scene of intro-video.cjs starts on a bar. A Chinese colour from the minor
pentatonic (A C D E G): a dark drone and a reversed swell into the stamp at 1.95 s, which lands with a sub
boom, an impact and a gong; guzheng-like glissandi; taiko on the downbeats; a plucked pentatonic lead over a
modern groove from the drop at 12 s; a ratchet under each number that counts; whooshes into each scene and
each card; coin dings as the payouts land; and a last boom, gong and chord as the lockup lands at 44.5 s.
"""

import os
import sys

import numpy as np

from musiclib import SR, Track, at, clap, ding, env, hat, impact, kick, midi, mux, pluck, rng, saw, sweep, tick

DUR = 52.0
BEAT = 0.5
BAR = 4 * BEAT
STAMP = 1.95
DROP = 12.0
END_GROOVE = 44.0
LAND = 44.5
PAYOUTS = (27.2, 28.8, 30.4)
tr = Track(DUR)

AM, F, C, G = (57, 60, 64, 69), (53, 57, 60, 65), (55, 60, 64, 67), (55, 59, 62, 67)
ROOT = {AM: 33, F: 29, C: 36, G: 31}
ARP = {AM: (69, 72, 76, 81), F: (65, 69, 72, 77), C: (67, 72, 76, 79), G: (67, 71, 74, 79)}
PENTA = (57, 60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84)


def zheng(m, cutoff=6500, decay=0.45):
    """A plucked string with a long tail (musiclib's pluck stops at 0.32 s, which would click here)."""
    n = at(decay * 5)
    t = np.arange(n) / SR
    f = midi(m)
    x = 0.6 * saw(f, n, cutoff) + 0.4 * np.sin(2 * np.pi * f * t)
    return x * np.exp(-t / decay) * np.minimum(1, t / 0.002)


def bell(m, decay):
    """musiclib's ding, with a buffer as long as its decay needs."""
    n = at(max(1.6, decay * 5))
    t = np.arange(n) / SR
    f = midi(m)
    out = np.zeros(n)
    for ratio, amp, d in ((1, 1, decay), (2.0, 0.35, decay * 0.6), (3.01, 0.18, decay * 0.4), (4.2, 0.1, decay * 0.25)):
        out += amp * np.sin(2 * np.pi * f * ratio * t) * np.exp(-t / d)
    return out * np.minimum(1, t / 0.002)


def gong(m, dur=5.0):
    """A low gong: inharmonic partials, the upper ones blooming a moment after the strike."""
    n = at(dur)
    t = np.arange(n) / SR
    f = midi(m)
    out = np.zeros(n)
    for ratio, amp, d, bloom in ((1, 1, 2.0, 0.0), (1.48, 0.6, 1.5, 0.05), (2.03, 0.45, 1.2, 0.12), (2.76, 0.3, 0.9, 0.2), (3.61, 0.2, 0.6, 0.25)):
        out += amp * np.sin(2 * np.pi * f * ratio * t * (1 - 0.004 * np.exp(-t / 0.4))) * np.exp(-t / d) * (1 - np.exp(-t / (bloom + 0.003)))
    fade = np.ones(n)
    fade[-at(0.3):] = np.linspace(1, 0, at(0.3))
    return out * fade


def boom(dur=1.6):
    """A cinematic sub drop: a sine falling from 70 to 32 Hz."""
    n = at(dur)
    t = np.arange(n) / SR
    f = 32 + 38 * np.exp(-t / 0.18)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.55) * np.minimum(1, t / 0.004)


def taiko(gain_pitch=1.0):
    """A taiko hit: a falling low tone with a skin slap."""
    n = at(0.6)
    t = np.arange(n) / SR
    f = (95 + 70 * np.exp(-t / 0.03)) * gain_pitch
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.22)
    slap = rng.standard_normal(n) * np.exp(-t / 0.012) * 0.35
    return (body + slap) * np.minimum(1, t / 0.001)


def ratchet(t0, dur, gain):
    """Fast ticks speeding up then slowing, under a number that counts."""
    t, step = t0, 0.028
    while t < t0 + dur:
        k = (t - t0) / dur
        tr.place(tr.fx, tick(2600 + 900 * k), t, gain * (1 - 0.7 * k), rng.uniform(-0.2, 0.2))
        t += step * (1 + 3 * k * k)


def gliss(t, lo, hi, dur, gain, pan=0.0):
    """A guzheng-style sweep up the pentatonic from lo to hi (MIDI), over dur seconds."""
    notes = [m for m in PENTA if lo <= m <= hi]
    for i, m in enumerate(notes):
        d = zheng(m, decay=0.5)
        tr.place(tr.music, d, t + i * dur / len(notes), gain * (0.7 + 0.3 * i / len(notes)), pan + (i / len(notes) - 0.5) * 0.6)
        tr.place(tr.send, d, t + i * dur / len(notes), gain * 0.5)


def whoosh(t_end, dur, gain):
    w = sweep(dur, 500, 6000)
    tr.place(tr.fx, w, t_end - dur, gain)
    tr.place(tr.send, w, t_end - dur, gain * 0.8)


# Cold open: a dark drone (A1 and a fifth) and a reversed swell that lands on the stamp.
n = at(STAMP + 0.4)
tt = np.arange(n) / SR
drone = (np.sin(2 * np.pi * midi(33) * tt) + 0.5 * np.sin(2 * np.pi * midi(40) * tt) + 0.2 * saw(midi(45), n, 400)) * env(n, 1.2, STAMP, 0.4)
tr.place(tr.music, drone, 0.0, 0.3)
whoosh(STAMP, 1.6, 0.3)

# Chords: Am after the stamp, F and G under "pays you nothing", then Am F C G from the drop.
chords = [(STAMP, 6.0, AM, 800), (6.0, 9.0, F, 900), (9.0, DROP, G, 1300)]
t, k = DROP, 0
while t < END_GROOVE - 1e-6:
    chords.append((t, min(t + BAR, END_GROOVE), (AM, F, C, G)[k % 4], 3000))
    t += BAR
    k += 1
for t0, t1, notes, cut in chords:
    tr.pad(t0, t1, notes, cut, 0.5, 0.9 if t0 < DROP else 0.12)

# Bass: held notes before the drop, eighths after.
for t0, t1, notes, _ in chords:
    f = midi(ROOT[notes] + 12)
    if t0 < DROP:
        n = at(t1 - t0)
        tr.place(tr.music, (np.sin(2 * np.pi * f * np.arange(n) / SR) + 0.15 * saw(f, n, 500)) * env(n, 0.3, t1 - t0 - 0.3, 0.1), t0, 0.26)
        continue
    s = t0
    while s < t1 - 1e-6:
        n = at(0.24)
        x = np.sin(2 * np.pi * f * np.arange(n) / SR) + 0.35 * saw(f, n, 900)
        tr.place(tr.music, x * env(n, 0.004, 0.15, 0.05), s, 0.32)
        s += BEAT / 2

# Arp from the second bar after the drop: 16ths through the chord, ping-pong, with echoes.
arp = np.zeros((2, tr.n))
for t0, t1, notes, _ in chords:
    if t0 < DROP + BAR:
        continue
    s, i = t0, 0
    while s < t1 - 1e-6:
        tr.place(arp, pluck(ARP[notes][(0, 1, 2, 3, 2, 1, 2, 3)[i % 8]]), s, 0.11, -0.35 if i % 2 else 0.35)
        s += BEAT / 4
        i += 1
echo = tr.echo(arp, BEAT * 0.75)
tr.music += echo
tr.send += 0.3 * echo

# The pentatonic lead, four bars long (beat, MIDI), from the fee scene to the closing one.
LEAD = [
    (0, 76), (1, 74), (1.5, 72), (2, 69), (3, 72),
    (4, 74), (5, 72), (6, 69), (6.5, 67), (7, 69),
    (8, 76), (8.5, 79), (9, 76), (10, 74), (11, 72),
    (12, 74), (13, 76), (14, 79), (15, 81),
]
t = 20.0
while t < END_GROOVE - 1e-6:
    for b, m in LEAD:
        if t + b * BEAT >= END_GROOVE:
            break
        d = zheng(m, cutoff=7000, decay=0.42)
        tr.place(tr.music, d, t + b * BEAT, 0.2, 0.15)
        tr.place(tr.send, d, t + b * BEAT, 0.22)
    t += 4 * BAR

# Drums: a heartbeat under "pays you nothing", the groove from the drop, taiko on every downbeat.
kicks = []
t, beat = DROP, 0
while t < END_GROOVE - 1e-6:
    kicks.append(t)
    tr.place(tr.drums, kick(), t, 0.95)
    if beat % 2 == 1:
        c = clap()
        tr.place(tr.drums, c, t, 0.4)
        tr.place(tr.send, c, t, 0.22)
    tr.place(tr.drums, hat(), t + BEAT / 2, 0.15, 0.25)
    if t >= 20.0:
        for q in (1, 3):
            tr.place(tr.drums, hat(0.02), t + q * BEAT / 4, 0.065, -0.25)
    if beat % 4 == 0:
        tr.place(tr.drums, taiko(), t, 0.32, -0.15)
        tr.place(tr.send, taiko(), t, 0.12)
    t += BEAT
    beat += 1
for i in range(5):
    tr.place(tr.drums, kick(soft=True), 6.5 + i * 2 * BEAT, 0.45)
    tr.place(tr.drums, kick(soft=True), 6.5 + i * 2 * BEAT + 0.22, 0.3)
# Taiko roll and snare roll into the drop, getting louder; silence for the last 0.16 s.
for i, tt_ in enumerate(np.arange(10.0, DROP - 0.2, BEAT / 2)):
    tr.place(tr.drums, taiko(1.0 + 0.04 * (i % 2)), tt_, 0.18 + 0.03 * i, (-0.3, 0.3)[i % 2])
s, step = 10.5, BEAT / 4
while s < DROP - 0.16:
    if s > DROP - BEAT:
        step = BEAT / 8
    tr.place(tr.drums, clap(), s, 0.08 + 0.3 * (s - 10.5) / (DROP - 10.5))
    s += step

# The stamp: a sub boom, an impact and a gong; a glissando under the wordmark; a bell on the highlight.
for t_hit, gl in ((STAMP, 1.0), (LAND, 0.95)):
    tr.place(tr.fx, boom(), t_hit, 0.7 * gl)
    tr.place(tr.fx, impact(), t_hit, 0.85 * gl)
    tr.place(tr.send, impact(), t_hit, 0.4 * gl)
    g = gong(40)
    tr.place(tr.fx, g, t_hit, 0.5 * gl)
    tr.place(tr.send, g, t_hit, 0.42 * gl)
gliss(2.6, 57, 81, 0.9, 0.2)
tr.place(tr.fx, bell(88, 0.8), 4.1, 0.1)

# "Until now.": a riser into the drop, a bright streak at 10.05 s, and the drop itself.
r = sweep(DROP - 0.16 - 8.5, 220, 7500)
tr.place(tr.fx, r, 8.5, 0.26)
tr.place(tr.send, r, 8.5, 0.14)
tr.place(tr.fx, bell(93, 1.2), 10.05, 0.12)
tr.place(tr.fx, boom(), DROP, 0.55)
tr.place(tr.fx, impact(), DROP, 0.9)
tr.place(tr.send, impact(), DROP, 0.35)

# Whooshes into the scenes; the closing whoosh sits under the letterbox.
for t_scene in (20.0, 26.0, 32.0, 38.0, 44.0):
    whoosh(t_scene, 0.55, 0.15)

# Meet: a bell per stock token popping in (12 s + 0.4 s + 0.1 s each).
for i in range(6):
    tr.place(tr.fx, bell(PENTA[5 + i % 6] + 12, 0.35), 12.4 + i * 0.1, 0.07, (-0.5, 0.5)[i % 2])

# Fee: a ratchet under the 1.25% (20.6 s), and under each segment's number (21.3 s + 0.4 s each).
ratchet(20.6, 1.2, 0.07)
for i in range(4):
    tr.place(tr.fx, bell((81, 76, 79, 72)[i] + 7, 0.5), 21.1 + i * 0.4, 0.14, (-0.3, 0.3)[i % 2])
    ratchet(21.3 + i * 0.4, 0.6, 0.04)

# Hourly: tick-tock while the dial fills, a coin flying and landing for each payout.
t, i = PAYOUTS[0] - 1.6, 0
while t < PAYOUTS[-1]:
    tr.place(tr.fx, tick(2100 if i % 2 == 0 else 1550), t, 0.09, 0.3 if i % 2 else -0.3)
    t += BEAT / 2
    i += 1
for i, p in enumerate(PAYOUTS):
    w = sweep(0.5, 1200, 7000, swell=False)
    tr.place(tr.fx, w, p, 0.06)
    d = ding(88 + (0, 3, 7)[i])
    tr.place(tr.fx, d, p + 0.5, 0.24)
    tr.place(tr.send, d, p + 0.5, 0.3)

# Fair: a whoosh and a soft bell as each card flips in (32 s + 0.7 s + 0.35 s each).
for k in range(3):
    whoosh(32.7 + k * 0.35 + 0.3, 0.45, 0.08)
    tr.place(tr.fx, bell(76 + (0, 3, 7)[k], 0.6), 32.7 + k * 0.35 + 0.35, 0.11, (-0.3, 0, 0.3)[k])

# Closing scene: a wide A minor add9, a glissando and a bell arpeggio, ringing out.
tr.pad(END_GROOVE, DUR, (45, 52, 57, 60, 64, 71), 2600, 0.75, 0.05)
n = at(DUR - END_GROOVE)
tr.place(tr.music, np.sin(2 * np.pi * midi(33) * np.arange(n) / SR) * env(n, 0.01, 2.2, 1.6), END_GROOVE, 0.4)
gliss(LAND + 0.4, 57, 84, 1.1, 0.18)
for i, m in enumerate((69, 72, 76, 81, 84)):
    d = bell(m, 0.9)
    tr.place(tr.fx, d, LAND + 1.6 + i * BEAT / 2, 0.13, (-0.4, 0.4)[i % 2])
    tr.place(tr.send, d, LAND + 1.6 + i * BEAT / 2, 0.3)

tr.duck(kicks)
video = os.path.join(sys.argv[1], "social", "hwai-intro-1920x1080.mp4")
mux(tr.render(fade_from=49.5, gaps=[(DROP - 0.16, DROP)]), video)
print(video)
