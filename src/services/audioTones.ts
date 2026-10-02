/**
 * Web Audio API synthesizer for phone ringtones, dial tones, roger beeps, and disconnect sounds.
 * Fully client-side, zero external audio asset loading errors.
 */

class AudioTonesService {
  private ctx: AudioContext | null = null;
  private ringOscillator1: OscillatorNode | null = null;
  private ringOscillator2: OscillatorNode | null = null;
  private ringGain: GainNode | null = null;
  private isRinging: boolean = false;
  private ringInterval: number | null = null;

  private getContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Play standard North American/International Dual-Tone Ringback (440Hz + 480Hz)
   */
  startRinging(isIncoming: boolean = false) {
    if (this.isRinging) return;
    this.isRinging = true;

    try {
      const ctx = this.getContext();

      const playBurst = () => {
        if (!this.isRinging) return;
        const now = ctx.currentTime;

        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        // Dual frequencies for telephone bell
        if (isIncoming) {
          osc1.frequency.setValueAtTime(520, now); // Higher chime for incoming call
          osc2.frequency.setValueAtTime(660, now);
        } else {
          osc1.frequency.setValueAtTime(440, now); // Standard dial tone / ringback
          osc2.frequency.setValueAtTime(480, now);
        }

        osc1.type = 'sine';
        osc2.type = 'sine';

        // Envelope: 1.5 seconds ring, then fade out
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.exponentialRampToValueAtTime(0.15, now + 0.1);
        gain.gain.setValueAtTime(0.15, now + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.5);
        osc2.stop(now + 1.5);
      };

      playBurst();
      this.ringInterval = window.setInterval(() => {
        playBurst();
      }, 3500);
    } catch (e) {
      console.warn('Audio tone error:', e);
    }
  }

  stopRinging() {
    this.isRinging = false;
    if (this.ringInterval !== null) {
      clearInterval(this.ringInterval);
      this.ringInterval = null;
    }
  }

  /**
   * Sound effect when call is connected
   */
  playConnectedChime() {
    try {
      this.stopRinging();
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(0.2, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // Ignore
    }
  }

  /**
   * Sound effect when call is ended / disconnected
   */
  playDisconnectTone() {
    try {
      this.stopRinging();
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // 3 rapid descending beeps
      [0, 0.15, 0.3].forEach((delay, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(480 - index * 60, now + delay);

        gain.gain.setValueAtTime(0.12, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + 0.1);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Tactical Radio "Roger" / Squelch beep for Push-to-Talk (PTT)
   */
  playRogerBeep() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1040, now);
      osc.frequency.setValueAtTime(1200, now + 0.04);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // Ignore
    }
  }
}

export const audioTones = new AudioTonesService();
