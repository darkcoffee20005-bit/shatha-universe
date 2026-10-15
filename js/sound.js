/**
 * Optional ambient music. Off by default; only ever started from a user
 * gesture. If the configured file is missing or fails, a quiet generated
 * pad (Web Audio) is used instead so the toggle still does what it says.
 */

export function createSound({ src, volume }, { onFallback, onUnavailable } = {}) {
  let enabled = false;
  let audio = null;
  let audioFailed = !src;
  let ctx = null;
  let pad = null;

  function getContext() {
    if (ctx) return ctx;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
    return ctx;
  }

  /** Soft drone: three detuned sines through a low-pass filter with slow breathing. */
  function startPad() {
    const ac = getContext();
    if (!ac) {
      onUnavailable?.();
      return false;
    }
    ac.resume?.();
    if (pad) return true;
    const master = ac.createGain();
    master.gain.value = 0;
    master.gain.linearRampToValueAtTime(0.05 * volume * 2, ac.currentTime + 2.5);
    const filter = ac.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    filter.connect(master).connect(ac.destination);

    const oscillators = [110, 164.81, 220.5, 277.18].map((freq, i) => {
      const osc = ac.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const gain = ac.createGain();
      gain.gain.value = i === 3 ? 0.18 : 0.35;
      const lfo = ac.createOscillator();
      const lfoGain = ac.createGain();
      lfo.frequency.value = 0.05 + i * 0.03;
      lfoGain.gain.value = 0.15;
      lfo.connect(lfoGain).connect(gain.gain);
      osc.connect(gain).connect(filter);
      osc.start();
      lfo.start();
      return [osc, lfo];
    });
    pad = { master, oscillators };
    return true;
  }

  function stopPad() {
    if (!pad || !ctx) return;
    const { master, oscillators } = pad;
    pad = null;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
    setTimeout(() => oscillators.flat().forEach((o) => o.stop()), 900);
  }

  async function playFile() {
    if (audioFailed) return false;
    if (!audio) {
      audio = new Audio(src);
      audio.loop = true;
      audio.preload = 'none';
      audio.volume = volume;
      audio.addEventListener('error', () => {
        audioFailed = true;
        if (enabled) fallBack();
      });
    }
    try {
      await audio.play();
      return true;
    } catch (error) {
      // NotAllowedError = no gesture yet; anything else = file problem.
      if (error?.name !== 'NotAllowedError') audioFailed = true;
      return false;
    }
  }

  function fallBack() {
    audio?.pause();
    if (startPad()) onFallback?.();
  }

  return {
    get enabled() {
      return enabled;
    },
    /** Must be called from a user gesture (click / keypress). */
    async enable() {
      enabled = true;
      // Create/resume the context inside the gesture so chimes work later.
      getContext()?.resume?.();
      const ok = await playFile();
      if (!enabled) {
        audio?.pause();
        return;
      }
      if (!ok) fallBack();
    },
    disable() {
      enabled = false;
      audio?.pause();
      stopPad();
    },
    /** A short sparkle used for small successes. Silent when sound is off. */
    chime(step = 0) {
      if (!enabled) return;
      const ac = getContext();
      if (!ac) return;
      const now = ac.currentTime;
      const notes = [659.25, 783.99, 880, 987.77, 1174.66, 1318.51];
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'triangle';
      osc.frequency.value = notes[step % notes.length];
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.08 * volume * 2, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
      osc.connect(gain).connect(ac.destination);
      osc.start(now);
      osc.stop(now + 0.65);
    },
  };
}
