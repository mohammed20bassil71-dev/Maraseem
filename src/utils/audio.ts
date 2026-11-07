// Web Audio synthesizer for ambient luxury background chords and sound effects
class SoundEngine {
  private ctx: AudioContext | null = null;
  private isPlayingBgm = false;
  private bgmInterval: any = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private customAudioEl: HTMLAudioElement | null = null;
  private currentVolume = 0.6;

  setVolume(vol: number) {
    this.currentVolume = Math.max(0, Math.min(1, vol));
    if (this.customAudioEl) {
      this.customAudioEl.volume = this.currentVolume;
    }
  }

  // Soft chime/harp note
  playChime(freq = 523.25, duration = 1.2, volumeScale = 1.0) {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const targetGain = 0.2 * this.currentVolume * volumeScale;
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.001, targetGain), this.ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  // Envelope open paper rustle sound
  playEnvelopeOpen() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      // Synthesize soft paper friction using noise buffer
      const bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.15 * this.currentVolume, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();

      // Play soft harmonic bell at the same time
      setTimeout(() => this.playChime(659.25, 1.5), 100);
      setTimeout(() => this.playChime(880.00, 1.8), 250);
    } catch {}
  }

  // Candle blowing puff sound
  playCandleBlow() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const bufferSize = this.ctx.sampleRate * 0.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, this.ctx.currentTime);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2 * this.currentVolume, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
    } catch {}
  }

  // Celebratory harp arpeggio
  playCelebrationFanfare() {
    const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playChime(freq, 1.5);
      }, idx * 120);
    });
  }

  // Ambient luxury background music (preset synthesizers or custom uploaded audio)
  startAmbientMusic(genre: string = 'romantic_piano', customUrl?: string) {
    this.stopAmbientMusic();

    // If custom audio file uploaded
    if ((genre === 'custom_upload' || !genre) && customUrl) {
      try {
        this.customAudioEl = new Audio(customUrl);
        this.customAudioEl.loop = true;
        this.customAudioEl.volume = this.currentVolume;
        this.customAudioEl.play().catch(() => {});
        this.isPlayingBgm = true;
        return;
      } catch {
        // Fallback to synthesized romantic piano if audio fails
      }
    }

    if (genre === 'none') return;

    this.initCtx();
    this.isPlayingBgm = true;

    const chords: { [key: string]: number[][] } = {
      romantic_piano: [
        [261.63, 329.63, 392.00, 523.25], // C major
        [220.00, 261.63, 329.63, 440.00], // A minor
        [174.61, 220.00, 261.63, 349.23], // F major
        [196.00, 246.94, 293.66, 392.00], // G major
      ],
      royal_oud: [
        [220.00, 277.18, 329.63, 440.00], // A Bayati feel
        [196.00, 246.94, 293.66, 392.00],
        [164.81, 207.65, 246.94, 329.63],
        [220.00, 261.63, 329.63, 440.00],
      ],
      festive_traditional: [
        [293.66, 369.99, 440.00, 587.33], // D major
        [220.00, 277.18, 329.63, 440.00],
        [246.94, 311.13, 369.99, 493.88],
        [293.66, 369.99, 440.00, 587.33],
      ],
      cinematic_strings: [
        [130.81, 196.00, 261.63, 392.00],
        [110.00, 164.81, 220.00, 329.63],
        [87.31, 130.81, 174.61, 261.63],
        [98.00, 146.83, 196.00, 293.66],
      ],
      epic_trailer_score: [
        [146.83, 220.00, 293.66, 349.23, 440.00], // D minor epic brass/strings
        [116.54, 174.61, 233.08, 293.66, 349.23], // Bb major heroic lift
        [130.81, 196.00, 261.63, 329.63, 392.00], // C major triumphant swell
        [110.00, 164.81, 220.00, 277.18, 329.63], // A major resolution
      ],
      romantic_cinema_orchestra: [
        [196.00, 293.66, 369.99, 493.88, 587.33], // Gmaj7 lush cinema strings
        [164.81, 246.94, 329.63, 392.00, 493.88], // Em7 emotional swell
        [130.81, 196.00, 246.94, 329.63, 392.00], // Cmaj7 widescreen horizon
        [146.83, 220.00, 293.66, 369.99, 440.00], // D major grand cadence
      ],
      calm_acoustic: [
        [164.81, 196.00, 246.94, 329.63], // E minor
        [196.00, 246.94, 293.66, 392.00], // G major
        [261.63, 329.63, 392.00, 523.25], // C major
        [146.83, 220.00, 293.66, 369.99], // D major
      ],
      zen_harp: [
        [349.23, 440.00, 523.25, 659.25], // F major
        [261.63, 329.63, 392.00, 523.25], // C major
        [196.00, 246.94, 293.66, 392.00], // G major
        [220.00, 261.63, 329.63, 440.00], // A minor
      ],
      bday_romantic: [
        [261.63, 329.63, 493.88, 523.25], // Cmaj7
        [220.00, 261.63, 392.00, 440.00], // Am7
        [174.61, 220.00, 329.63, 349.23], // Fmaj7
        [196.00, 246.94, 293.66, 392.00], // G
      ],
      bday_calm: [
        [293.66, 369.99, 440.00, 587.33],
        [246.94, 329.63, 392.00, 493.88],
        [196.00, 246.94, 293.66, 392.00],
        [220.00, 277.18, 329.63, 440.00],
      ],
      bday_playful: [
        [392.00, 440.00, 392.00, 523.25], // Happy Birthday motif feel
        [493.88, 392.00, 440.00, 587.33],
        [523.25, 659.25, 783.99, 659.25],
        [523.25, 493.88, 440.00, 523.25],
      ],
      bday_cinematic: [
        [196.00, 293.66, 392.00, 587.33],
        [220.00, 329.63, 440.00, 659.25],
        [174.61, 261.63, 349.23, 523.25],
        [261.63, 392.00, 523.25, 783.99],
      ],
      bday_music_box: [
        [523.25, 659.25, 783.99, 1046.50],
        [440.00, 523.25, 659.25, 880.00],
        [349.23, 440.00, 523.25, 698.46],
        [392.00, 493.88, 587.33, 783.99],
      ],
    };

    const progression = chords[genre] || chords.romantic_piano;
    let step = 0;

    const isTrailerGenre = genre === 'epic_trailer_score' || genre === 'romantic_cinema_orchestra';

    const playProgressionStep = () => {
      if (!this.isPlayingBgm || !this.ctx) return;
      const currentChord = progression[step % progression.length];
      if (isTrailerGenre) {
        // Add deep cinematic bass pulse on downbeat
        this.playChime(currentChord[0] * 0.5, 3.8, 0.75);
      }
      currentChord.forEach((note, i) => {
        setTimeout(() => {
          if (!this.isPlayingBgm) return;
          this.playChime(note, isTrailerGenre ? 3.8 : 3.4, isTrailerGenre ? 0.85 : 1.0);
        }, i * (isTrailerGenre ? 140 : 190));
      });
      step++;
    };

    playProgressionStep();
    this.bgmInterval = setInterval(playProgressionStep, isTrailerGenre ? 3600 : 4000);
  }

  // Movie Trailer Deep Brass / Sub-Bass Impact ("BRAAAM" + Anamorphic Shimmer)
  playTrailerBraaam() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Sub-bass impact drop
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(110, now);
      subOsc.frequency.exponentialRampToValueAtTime(38, now + 1.4);
      subGain.gain.setValueAtTime(0.001, now);
      subGain.gain.linearRampToValueAtTime(0.32 * this.currentVolume, now + 0.06);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 1.65);

      // Warm low-filtered brass saw swell
      const brassOsc = this.ctx.createOscillator();
      const brassFilter = this.ctx.createBiquadFilter();
      const brassGain = this.ctx.createGain();
      brassOsc.type = 'sawtooth';
      brassOsc.frequency.setValueAtTime(73.42, now); // D2
      brassFilter.type = 'lowpass';
      brassFilter.frequency.setValueAtTime(180, now);
      brassFilter.frequency.exponentialRampToValueAtTime(640, now + 0.45);
      brassFilter.frequency.exponentialRampToValueAtTime(140, now + 1.5);
      brassGain.gain.setValueAtTime(0.001, now);
      brassGain.gain.linearRampToValueAtTime(0.16 * this.currentVolume, now + 0.15);
      brassGain.gain.exponentialRampToValueAtTime(0.001, now + 1.55);
      brassOsc.connect(brassFilter);
      brassFilter.connect(brassGain);
      brassGain.connect(this.ctx.destination);
      brassOsc.start(now);
      brassOsc.stop(now + 1.6);

      // High golden shimmer chord
      [293.66, 440.0, 587.33, 880.0].forEach((freq, idx) => {
        setTimeout(() => this.playChime(freq, 1.8, 0.45), 90 + idx * 70);
      });
    } catch {}
  }

  // Movie Trailer Dramatic Section Transition Whoosh & Hit
  playTrailerWhooshHit() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const dur = 0.48;
      const bufferSize = Math.floor(this.ctx.sampleRate * dur);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const t = i / bufferSize;
        data[i] = (Math.random() * 2 - 1) * Math.sin(t * Math.PI);
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(260, now);
      filter.frequency.exponentialRampToValueAtTime(2200, now + dur * 0.65);
      filter.frequency.exponentialRampToValueAtTime(380, now + dur);
      filter.Q.setValueAtTime(1.8, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.24 * this.currentVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.002, now + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);

      // Low cinematic thud at peak of whoosh
      setTimeout(() => {
        this.playChime(146.83, 0.9, 0.75);
        this.playChime(293.66, 1.1, 0.55);
      }, 160);
    } catch {}
  }

  private sfxEnabled = true;

  setSfxEnabled(enabled: boolean) {
    this.sfxEnabled = enabled;
  }

  isSfxEnabled() {
    return this.sfxEnabled;
  }

  // 1. Wax Seal Crack & Fracture Sound (صوت كسر ختم الشمع)
  playWaxSealCrack() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Crisp brittle snap transient
      const snapDuration = 0.14;
      const bufferSize = Math.floor(this.ctx.sampleRate * snapDuration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const env = Math.exp(-i / (bufferSize * 0.14));
        data[i] = (Math.random() * 2 - 1) * env;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2400, now);
      filter.Q.setValueAtTime(2.5, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.32 * this.currentVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + snapDuration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);

      // Secondary brittle crackle 65ms later
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now + 0.05);
      osc.frequency.exponentialRampToValueAtTime(95, now + 0.16);
      oscGain.gain.setValueAtTime(0.22 * this.currentVolume, now + 0.05);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(now + 0.05);
      osc.stop(now + 0.18);
    } catch {}
  }

  // 2. Luxury Envelope Flap & Card Slide Sound (صوت فتح الظرف وخروج البطاقة)
  playEnvelopePaperUnfold() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const dur = 0.55;
      const bufferSize = Math.floor(this.ctx.sampleRate * dur);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const t = i / bufferSize;
        const env = Math.sin(t * Math.PI) * Math.exp(-t * 1.8);
        data[i] = (Math.random() * 2 - 1) * env;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(950, now);
      filter.frequency.linearRampToValueAtTime(1650, now + dur);
      filter.Q.setValueAtTime(1.4, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.22 * this.currentVolume, now);
      gain.gain.linearRampToValueAtTime(0.005, now + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);

      setTimeout(() => this.playChime(587.33, 1.3, 0.55), 180);
      setTimeout(() => this.playChime(880.0, 1.6, 0.65), 340);
    } catch {}
  }

  // 3. Velvet Engagement Ring Box Hinge & Diamond Shimmer (صوت فتح علبة الخاتم المخملية)
  playRingBoxOpen() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Soft damped spring hinge click
      const clickOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      clickOsc.type = 'sine';
      clickOsc.frequency.setValueAtTime(190, now);
      clickOsc.frequency.exponentialRampToValueAtTime(420, now + 0.09);
      clickGain.gain.setValueAtTime(0.18 * this.currentVolume, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
      clickOsc.connect(clickGain);
      clickGain.connect(this.ctx.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.12);

      // Crystalline diamond light reflection shimmer
      const shimmerNotes = [1046.5, 1318.51, 1567.98, 2093.0];
      shimmerNotes.forEach((freq, idx) => {
        setTimeout(() => this.playChime(freq, 1.4, 0.48), 160 + idx * 95);
      });
    } catch {}
  }

  // 4. Royal Palace Doors Unlatch & Grand Swing (صوت فتح الأبواب الملكية)
  playRoyalDoorsOpen() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Metallic brass handle unlatch click
      const latchOsc = this.ctx.createOscillator();
      const latchGain = this.ctx.createGain();
      latchOsc.type = 'triangle';
      latchOsc.frequency.setValueAtTime(620, now);
      latchOsc.frequency.exponentialRampToValueAtTime(180, now + 0.08);
      latchGain.gain.setValueAtTime(0.24 * this.currentVolume, now);
      latchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      latchOsc.connect(latchGain);
      latchGain.connect(this.ctx.destination);
      latchOsc.start(now);
      latchOsc.stop(now + 0.1);

      // Deep resonant palace door swing & warm golden light swell
      const dur = 0.85;
      const bufferSize = Math.floor(this.ctx.sampleRate * dur);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const t = i / bufferSize;
        data[i] = (Math.random() * 2 - 1) * Math.sin(t * Math.PI) * 0.6;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, now + 0.12);
      filter.frequency.linearRampToValueAtTime(520, now + dur);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18 * this.currentVolume, now + 0.12);
      gain.gain.linearRampToValueAtTime(0.002, now + dur);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now + 0.12);

      // Warm golden chord swell
      const royalChord = [261.63, 329.63, 392.0, 523.25, 659.25];
      royalChord.forEach((freq, idx) => {
        setTimeout(() => this.playChime(freq, 2.0, 0.55), 240 + idx * 90);
      });
    } catch {}
  }

  // 5. Silk Ribbon Untie & Satin Slide (صوت انفكاك وانزلاق الشريط الحريري)
  playSilkRibbonSlide() {
    if (!this.sfxEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const dur = 0.62;
      const bufferSize = Math.floor(this.ctx.sampleRate * dur);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const t = i / bufferSize;
        const env = Math.sin(t * Math.PI);
        data[i] = (Math.random() * 2 - 1) * env;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.frequency.exponentialRampToValueAtTime(3400, now + dur);
      filter.Q.setValueAtTime(3.2, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.16 * this.currentVolume, now);
      gain.gain.linearRampToValueAtTime(0.002, now + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);

      setTimeout(() => this.playChime(659.25, 1.3, 0.5), 150);
      setTimeout(() => this.playChime(987.77, 1.5, 0.55), 310);
    } catch {}
  }

  // Gift box pop & sparkle effect
  playGiftOpen() {
    if (!this.sfxEnabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playChime(freq, 0.9, 0.9), idx * 75);
    });
  }

  // Secret lock unlock chime
  playSecretUnlock() {
    if (!this.sfxEnabled) return;
    this.playChime(440, 0.4, 0.8);
    setTimeout(() => this.playChime(554.37, 0.5, 0.85), 110);
    setTimeout(() => this.playChime(659.25, 0.8, 0.9), 220);
    setTimeout(() => this.playChime(880, 1.2, 1.0), 340);
  }

  // Heart tap warm chime
  playHeartPop() {
    if (!this.sfxEnabled) return;
    this.playChime(587.33, 0.6, 0.7);
    setTimeout(() => this.playChime(880, 1.1, 0.85), 100);
  }

  // Curtain or door reveal sweep
  playCurtainDoorOpen() {
    if (!this.sfxEnabled) return;
    const sweep = [329.63, 392.0, 493.88, 587.33, 659.25, 783.99];
    sweep.forEach((freq, idx) => {
      setTimeout(() => this.playChime(freq, 1.1, 0.65), idx * 90);
    });
  }

  stopAmbientMusic() {
    this.isPlayingBgm = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    if (this.customAudioEl) {
      this.customAudioEl.pause();
      this.customAudioEl.currentTime = 0;
      this.customAudioEl = null;
    }
  }

  isMusicPlaying() {
    return this.isPlayingBgm;
  }
}

export const soundEngine = new SoundEngine();

