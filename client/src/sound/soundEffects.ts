class SoundEffects {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // AudioContext will be initialized on first user interaction to satisfy browser autoplay policies
    const saved = localStorage.getItem('agilepoint_sound_enabled');
    if (saved !== null) {
      this.enabled = saved === 'true';
    }
  }

  private initContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    localStorage.setItem('agilepoint_sound_enabled', String(enabled));
  }

  public toggle(): boolean {
    this.setEnabled(!this.enabled);
    if (this.enabled) {
      this.playCardPick();
    }
    return this.enabled;
  }

  // Soft tactile pop when selecting a card
  public playCardPick(): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(680, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // AudioContext failure gracefully ignored
    }
  }

  // Pleasant chime on reveal
  public playReveal(): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + idx * 0.06;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.15, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.35);
      });
    } catch {
      // Ignore
    }
  }

  // Celebration fanfare on unanimous consensus
  public playConsensusFanfare(): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const chords = [
        { freqs: [523.25, 659.25, 783.99], delay: 0, dur: 0.15 },       // C Maj
        { freqs: [587.33, 739.99, 880.00], delay: 0.16, dur: 0.15 },     // D Maj
        { freqs: [659.25, 830.61, 987.77], delay: 0.32, dur: 0.15 },     // E Maj
        { freqs: [783.99, 987.77, 1174.66, 1567.98], delay: 0.5, dur: 0.6 } // G Maj big resolution
      ];

      chords.forEach(({ freqs, delay, dur }) => {
        const start = ctx.currentTime + delay;
        freqs.forEach(freq => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, start);

          gain.gain.setValueAtTime(0, start);
          gain.gain.linearRampToValueAtTime(0.1, start + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(start);
          osc.stop(start + dur);
        });
      });
    } catch {
      // Ignore
    }
  }

  // Timer countdown warning tick
  public playTick(): void {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Ignore
    }
  }
}

export const soundEffects = new SoundEffects();
