"""The review video's soundtrack, synthesized here (no samples, nothing licensed): a warm, modern track at
100 BPM in C, Fmaj7 / G6 / Am7 / Em7, one chord a bar (2.4 s). The video's scenes change on its bar lines
(stage.html, SCENES), so cuts land on the downbeat.

  bars 0-2    pad and a bell: the mark
  bars 2-5    pad, arpeggio in eighths, hats
  bars 5-27   full: kick, bass, sixteenth arpeggio, clap; the pad ducks under the kick
  bars 27-29  pad and bell, then the last chord rings out

  python3 brand/jinniu/video/src/music.py <out.wav>
"""
import sys
import wave

import numpy as np

SR = 44100
BPM = 100
BEAT = 60 / BPM
BAR = 4 * BEAT
BARS = 29
TAIL = 2.4
N = int(SR * (BARS * BAR + TAIL))
rng = np.random.default_rng(7)

CHORDS = [  # (pad notes, bass root), MIDI
    ([53, 57, 60, 64], 41),  # Fmaj7
    ([55, 59, 62, 64], 43),  # G6
    ([57, 60, 64, 67], 45),  # Am7
    ([52, 55, 59, 62], 40),  # Em7
]


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def at(t):
    return int(round(t * SR))


def lowpass(x, cutoff, width=0.35):
    """Zero-phase lowpass in the frequency domain, with a smooth (raised-cosine) roll-off above cutoff."""
    n = 1 << int(np.ceil(np.log2(len(x) + 1)))
    X = np.fft.rfft(x, n)
    f = np.fft.rfftfreq(n, 1 / SR)
    hi = cutoff * (1 + width)
    g = np.clip((hi - f) / (hi - cutoff), 0, 1)
    g = 0.5 - 0.5 * np.cos(np.pi * g)
    return np.fft.irfft(X * g, n)[: len(x)]


def highpass(x, cutoff, width=0.35):
    return x - lowpass(x, cutoff, width)


def convolve(x, ir):
    n = 1 << int(np.ceil(np.log2(len(x) + len(ir))))
    return np.fft.irfft(np.fft.rfft(x, n) * np.fft.rfft(ir, n), n)[: len(x)]


def add(buf, start, sig, gain=1.0):
    i = at(start)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += gain * sig[: j - i]


L = np.zeros(N)
R = np.zeros(N)
pad = np.zeros((2, N))
arp = np.zeros((2, N))
bass = np.zeros(N)
drums = np.zeros((2, N))
bell = np.zeros((2, N))
kick_env = np.zeros(N)

# --- pad: detuned saws, one chord a bar, overlapping so the changes glide -----------------------------
for bar in range(BARS):
    notes, _ = CHORDS[bar % 4]
    start, dur = bar * BAR, BAR + 0.9
    t = np.arange(at(dur)) / SR
    env = np.minimum(1, t / 0.45) * np.clip((dur - t) / 0.9, 0, 1)
    for ch, cents in ((0, -7), (1, 7)):
        s = np.zeros_like(t)
        for m in notes:
            for d in (cents, -cents * 0.4):
                f = hz(m) * 2 ** (d / 1200)
                ph = rng.random()
                s += 2 * ((t * f + ph) % 1) - 1
        add(pad[ch], start, s * env, 0.06)
pad = np.stack([lowpass(pad[0], 1700), lowpass(pad[1], 1700)])

# --- arpeggio: plucked chord tones an octave up, eighths from bar 2, sixteenths from bar 5 ------------
def pluck(f, dur=0.5):
    t = np.arange(at(dur)) / SR
    env = np.exp(-t / 0.16) * np.minimum(1, t / 0.004)
    return env * (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.12 * np.sin(6 * np.pi * f * t))


for bar in range(2, 27):
    notes, _ = CHORDS[bar % 4]
    tones = [n + 12 for n in notes] + [notes[1] + 24]
    step = BEAT / 2 if bar < 5 else BEAT / 4
    order = [0, 2, 1, 3, 4, 3, 1, 2]
    for k in range(int(round(BAR / step))):
        m = tones[order[k % len(order)]]
        pan = 0.3 if k % 2 else -0.3
        vel = 0.9 if k % 4 == 0 else 0.6
        s = pluck(hz(m))
        add(arp[0], bar * BAR + k * step, s, 0.05 * vel * (1 - pan))
        add(arp[1], bar * BAR + k * step, s, 0.05 * vel * (1 + pan))
# a dotted-eighth echo, crossed between the channels
d = at(BEAT * 0.75)
for _ in range(3):
    echo0 = np.concatenate([np.zeros(d), arp[1][:-d]]) * 0.32
    echo1 = np.concatenate([np.zeros(d), arp[0][:-d]]) * 0.32
    arp[0] += echo0
    arp[1] += echo1
arp = np.stack([lowpass(arp[0], 6000), lowpass(arp[1], 6000)])

# --- drums ---------------------------------------------------------------------------------------------
def kick():
    t = np.arange(at(0.45)) / SR
    f = 48 + 110 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t / 0.16) + 0.25 * np.exp(-t / 0.004) * rng.standard_normal(len(t))


def hat():
    t = np.arange(at(0.09)) / SR
    return highpass(rng.standard_normal(len(t)), 7000) * np.exp(-t / 0.018)


def clap():
    t = np.arange(at(0.3)) / SR
    n = highpass(lowpass(rng.standard_normal(len(t)), 5000), 900)
    env = np.exp(-t / 0.07) * (1 + 0.6 * ((t % 0.011) < 0.004) * (t < 0.035))
    return n * env


K, H, C = kick(), hat(), clap()
for bar in range(2, 27):
    for b in range(4):
        tb = bar * BAR + b * BEAT
        if bar >= 5:
            add(drums[0], tb, K, 0.55)
            add(drums[1], tb, K, 0.55)
            add(kick_env, tb, np.exp(-np.arange(at(0.5)) / SR / 0.14), 1.0)
            if b in (1, 3):
                add(drums[0], tb, C, 0.16)
                add(drums[1], tb, C, 0.13)
        add(drums[0], tb + BEAT / 2, H, 0.07)
        add(drums[1], tb + BEAT / 2, H, 0.09)
        if bar >= 5:
            add(drums[1], tb + BEAT / 4, H, 0.035)
            add(drums[0], tb + 3 * BEAT / 4, H, 0.035)

# --- bass: the root on the off-beat eighths, slightly driven ------------------------------------------
for bar in range(5, 27):
    _, root = CHORDS[bar % 4]
    f = hz(root)
    for k in range(8):
        if k % 2 == 0:
            continue
        t = np.arange(at(BEAT / 2)) / SR
        env = np.minimum(1, t / 0.006) * np.exp(-t / 0.22)
        s = np.tanh(1.6 * (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)))
        add(bass, bar * BAR + k * BEAT / 2, s * env, 0.22)
bass = lowpass(bass, 900)

# --- bells (FM) on the intro and the outro -------------------------------------------------------------
def fmbell(f, dur=3.2):
    t = np.arange(at(dur)) / SR
    idx = 2.2 * np.exp(-t / 0.6)
    return np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * 3.5 * f * t)) * np.exp(-t / 1.1)


for start, m, g in [(0.0, 76, 0.16), (0.6, 79, 0.11), (1.2, 84, 0.09), (BAR, 76, 0.1),
                    (27 * BAR, 76, 0.15), (27 * BAR + 0.6, 79, 0.1), (27 * BAR + 1.2, 84, 0.09), (28 * BAR, 72, 0.14)]:
    s = fmbell(hz(m))
    add(bell[0], start, s, g * 0.9)
    add(bell[1], start, s, g)

# a last, long chord after the final bar
t = np.arange(at(TAIL + 0.5)) / SR
env = np.exp(-t / 1.0)
for m in [48, 55, 60, 64, 67]:
    s = np.sin(2 * np.pi * hz(m) * t) + 0.2 * np.sin(4 * np.pi * hz(m) * t)
    add(pad[0], BARS * BAR - 0.05, s * env, 0.05)
    add(pad[1], BARS * BAR - 0.05, s * env, 0.05)

# --- risers into bar 2 and bar 5 -----------------------------------------------------------------------
# Soft: band-limited noise that opens up and swells into the downbeat, then stops short.
for end, length, g in [(2 * BAR, BAR, 0.012), (5 * BAR, BAR, 0.018)]:
    t = np.arange(at(length)) / SR
    x = t / length
    for ch in (0, 1):
        nz = rng.standard_normal(len(t))
        s = (1 - x) * lowpass(nz, 700) + x * lowpass(highpass(nz, 1200), 8000)
        s *= x ** 3 * np.clip((length - t) / 0.03, 0, 1)
        add(drums[ch], end - length, s, g)

# --- mix: duck the pad and bass under the kick, a room on the melodic parts ---------------------------
duck = 1 - 0.55 * np.clip(kick_env, 0, 1)
ir_t = np.arange(at(1.9)) / SR
irL = rng.standard_normal(len(ir_t)) * np.exp(-ir_t / 0.45)
irR = rng.standard_normal(len(ir_t)) * np.exp(-ir_t / 0.45)
irL, irR = lowpass(irL, 5000) * 0.02, lowpass(irR, 5000) * 0.02
wet_in0 = pad[0] * 0.5 + arp[0] + bell[0]
wet_in1 = pad[1] * 0.5 + arp[1] + bell[1]
L = pad[0] * duck + arp[0] + bell[0] + bass * duck + drums[0] + convolve(wet_in0, irL)
R = pad[1] * duck + arp[1] + bell[1] + bass * duck + drums[1] + convolve(wet_in1, irR)

mix = np.stack([L, R])
mix = np.tanh(1.3 * mix) / np.tanh(1.3)
fade_in = np.minimum(1, np.arange(N) / (0.4 * SR))
fade_out = np.clip((N - np.arange(N)) / (2.2 * SR), 0, 1)
mix *= fade_in * fade_out
mix *= 10 ** (-1 / 20) / np.max(np.abs(mix))

pcm = (np.clip(mix.T, -1, 1) * 32767).astype("<i2")
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"{sys.argv[1]}: {N / SR:.1f} s, {BPM} BPM, {BARS} bars")
