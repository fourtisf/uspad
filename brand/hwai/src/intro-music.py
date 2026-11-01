"""Original soundtrack for the hwai intro video, synthesised with musiclib.py (no samples, nothing to license),
and muxed into the video.

Usage (repo root, after intro-video.cjs):  python3 brand/hwai/src/intro-music.py brand/hwai
It replaces the audio of brand/hwai/social/hwai-intro-1920x1080.mp4 (the video stream is copied).

120 BPM, so a bar is 2 s and every scene of intro-video.cjs starts on a bar. A Chinese colour from the minor
pentatonic (A C D E G): a gong when the seal is stamped, guzheng-like glissandi into the wordmark and the
closing scene, and a plucked pentatonic lead over a modern groove. Cues follow the scenes: the stamp at
0.62 s, a riser and a snare roll under "Until now.", the drop on hwai at 10 s, whooshes into each scene,
a pluck per fee segment, clock ticks and a coin ding per payout row, and the closing chord at 40 s.
"""

import os
import sys

import numpy as np

from musiclib import SR, Track, at, clap, ding, env, hat, impact, kick, midi, mux, pluck, rng, saw, sweep, tick

DUR = 46.0
BEAT = 0.5
BAR = 4 * BEAT
STAMP = 0.62
DROP = 10.0
END_GROOVE = 40.0
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


def gong(m, dur=4.5):
    """A low gong: inharmonic partials, the upper ones blooming a moment after the strike."""
    n = at(dur)
    t = np.arange(n) / SR
    f = midi(m)
    out = np.zeros(n)
    for ratio, amp, d, bloom in ((1, 1, 1.8, 0.0), (1.48, 0.6, 1.4, 0.05), (2.03, 0.45, 1.1, 0.12), (2.76, 0.3, 0.8, 0.2), (3.61, 0.2, 0.6, 0.25)):
        out += amp * np.sin(2 * np.pi * f * ratio * t * (1 - 0.004 * np.exp(-t / 0.4))) * np.exp(-t / d) * (1 - np.exp(-t / (bloom + 0.003)))
    fade = np.ones(n)
    fade[-at(0.3):] = np.linspace(1, 0, at(0.3))
    return out * fade


def gliss(t, lo, hi, dur, gain, pan=0.0):
    """A guzheng-style sweep up the pentatonic from lo to hi (MIDI), over dur seconds."""
    notes = [m for m in PENTA if lo <= m <= hi]
    for i, m in enumerate(notes):
        d = zheng(m, decay=0.5)
        tr.place(tr.music, d, t + i * dur / len(notes), gain * (0.7 + 0.3 * i / len(notes)), pan + (i / len(notes) - 0.5) * 0.6)
        tr.place(tr.send, d, t + i * dur / len(notes), gain * 0.5)


# Chords: Am under the stamp, F and G under "pays you nothing", then Am F C G from the drop.
chords = [(0.0, 5.0, AM, 700), (5.0, 7.5, F, 900), (7.5, DROP, G, 1200)]
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
        tr.place(arp, pluck(ARP[notes][(0, 1, 2, 3, 2, 1, 2, 3)[i % 8]]), s, 0.12, -0.35 if i % 2 else 0.35)
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
t = 16.0
while t < END_GROOVE - 1e-6:
    for b, m in LEAD:
        if t + b * BEAT >= END_GROOVE:
            break
        d = zheng(m, cutoff=7000, decay=0.42)
        tr.place(tr.music, d, t + b * BEAT, 0.2, 0.15)
        tr.place(tr.send, d, t + b * BEAT, 0.22)
    t += 4 * BAR

# Drums: a soft pulse from 6 s, the groove from the drop until the closing scene.
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
    if t >= 16.0:
        for q in (1, 3):
            tr.place(tr.drums, hat(0.02), t + q * BEAT / 4, 0.065, -0.25)
    t += BEAT
    beat += 1
for i in range(6):
    tr.place(tr.drums, kick(soft=True), 7.0 + i * BEAT, 0.42)
# Snare roll into the drop: 16ths, then 32nds, getting louder; silence for the last 0.16 s.
s, step = 8.5, BEAT / 4
while s < DROP - 0.16:
    if s > DROP - BEAT:
        step = BEAT / 8
    tr.place(tr.drums, clap(), s, 0.08 + 0.3 * (s - 8.5) / (DROP - 8.5))
    s += step

# The stamp: a whoosh into it, an impact and a low gong ringing out, then a glissando under the wordmark.
w = sweep(0.55, 300, 6000)
tr.place(tr.fx, w, STAMP - 0.55, 0.18)
tr.place(tr.fx, impact(), STAMP, 0.85)
tr.place(tr.send, impact(), STAMP, 0.4)
g = gong(40)
tr.place(tr.fx, g, STAMP, 0.55)
tr.place(tr.send, g, STAMP, 0.45)
gliss(1.1, 57, 81, 0.9, 0.2)

# Riser under "Until now." into the drop, and impacts on the drop and the closing scene.
r = sweep(DROP - 0.16 - 7.5, 250, 7000)
tr.place(tr.fx, r, 7.5, 0.26)
tr.place(tr.send, r, 7.5, 0.14)
for t_hit, g in ((DROP, 0.9), (END_GROOVE, 0.8)):
    tr.place(tr.fx, impact(), t_hit, g)
    tr.place(tr.send, impact(), t_hit, 0.35)

# Whooshes into the fee, hourly, fair and product scenes.
for t_scene in (16.0, 22.0, 28.0, 34.0):
    w = sweep(0.5, 600, 5000)
    tr.place(tr.fx, w, t_scene - 0.5, 0.13)
    tr.place(tr.send, w, t_scene - 0.5, 0.11)

# A pluck per fee segment as it grows (16 s + 0.9 s + 0.35 s each).
for i, m in enumerate((81, 76, 79, 72)):
    d = bell(m + 7, 0.5)
    tr.place(tr.fx, d, 16.0 + 0.9 + i * 0.35, 0.16, (-0.3, 0.3)[i % 2])

# The clock: tick-tock on eighths while the hand turns (22 s + 0.6 s, three turns of 2 s).
t, i = 22.6, 0
while t < 28.4:
    tr.place(tr.fx, tick(2100 if i % 2 == 0 else 1550), t, 0.1, 0.3 if i % 2 else -0.3)
    t += BEAT / 2
    i += 1
# A coin ding for each payout row (22 s + 1.2 s + 1 s each).
for i in range(3):
    d = ding(88 + (0, 3, 7)[i])
    tr.place(tr.fx, d, 22.0 + 1.2 + i * 1.0 + 0.2, 0.22)
    tr.place(tr.send, d, 22.0 + 1.2 + i * 1.0 + 0.2, 0.3)

# The fair cards: a soft bell each (28 s + 0.5 s + 0.3 s each).
for k in range(3):
    d = bell(76 + (0, 3, 7)[k], 0.6)
    tr.place(tr.fx, d, 28.0 + 0.5 + k * 0.3, 0.12, (-0.3, 0, 0.3)[k])

# Closing scene: a wide A minor add9, a glissando and a bell arpeggio, ringing out.
tr.pad(END_GROOVE, DUR, (45, 52, 57, 60, 64, 71), 2600, 0.75, 0.05)
n = at(DUR - END_GROOVE)
tr.place(tr.music, np.sin(2 * np.pi * midi(33) * np.arange(n) / SR) * env(n, 0.01, 1.8, 1.4), END_GROOVE, 0.4)
gliss(END_GROOVE + 0.1, 57, 84, 1.0, 0.18)
for i, m in enumerate((69, 72, 76, 81, 84)):
    d = bell(m, 0.9)
    tr.place(tr.fx, d, END_GROOVE + 1.2 + i * BEAT / 2, 0.14, (-0.4, 0.4)[i % 2])
    tr.place(tr.send, d, END_GROOVE + 1.2 + i * BEAT / 2, 0.32)

tr.duck(kicks)
video = os.path.join(sys.argv[1], "social", "hwai-intro-1920x1080.mp4")
mux(tr.render(fade_from=44.0, gaps=[(DROP - 0.16, DROP)]), video)
print(video)
