// Zero-dependency atmospheric procedural soundscape using Web Audio API

class SoundscapeManager {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentGenre: string | null = null;
  private volumeNode: GainNode | null = null;
  private activeNodes: (AudioNode | number)[] = [];
  private volumeLevel = 0.25;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.volumeNode = this.ctx.createGain();
        this.volumeNode.gain.setValueAtTime(this.volumeLevel, this.ctx.currentTime);
        this.volumeNode.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volumeLevel = Math.max(0, Math.min(1, vol));
    if (this.volumeNode && this.ctx) {
      this.volumeNode.gain.setTargetAtTime(this.volumeLevel, this.ctx.currentTime, 0.1);
    }
  }

  public getVolume(): number {
    return this.volumeLevel;
  }

  public isMuted(): boolean {
    return !this.isPlaying;
  }

  public stop() {
    this.cleanupNodes();
    this.isPlaying = false;
  }

  private cleanupNodes() {
    for (const item of this.activeNodes) {
      if (typeof item === 'number') {
        window.clearInterval(item);
      } else {
        try {
          (item as any).stop?.();
          item.disconnect();
        } catch (e) {
          // ignore already stopped
        }
      }
    }
    this.activeNodes = [];
  }

  public playGenreAtmosphere(genre: string) {
    this.initContext();
    if (!this.ctx || !this.volumeNode) return;

    this.cleanupNodes();
    this.currentGenre = genre;
    this.isPlaying = true;

    const g = genre.toLowerCase();

    if (g.includes('polic')) {
      this.generateRainCityScape();
    } else if (g.includes('cienc')) {
      this.generateSciFiRumble();
    } else if (g.includes('fant')) {
      this.generateMysticCampfire();
    } else {
      this.generateVictorianMystery();
    }
  }

  public toggle(genre: string): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.playGenreAtmosphere(genre);
      return true;
    }
  }

  // Policial: Rain sound + distant low city drone
  private generateRainCityScape() {
    if (!this.ctx || !this.volumeNode) return;

    // Pink noise buffer for rain
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.08;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);

    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0.4, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(this.volumeNode);
    whiteNoise.start();

    // Distant dark drone
    const drone = this.ctx.createOscillator();
    drone.type = 'sawtooth';
    drone.frequency.setValueAtTime(55, this.ctx.currentTime); // A1 note

    const droneFilter = this.ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(120, this.ctx.currentTime);

    const droneGain = this.ctx.createGain();
    droneGain.gain.setValueAtTime(0.15, this.ctx.currentTime);

    drone.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(this.volumeNode);
    drone.start();

    this.activeNodes.push(whiteNoise, filter, rainGain, drone, droneFilter, droneGain);
  }

  // Misterio: Victorian mansion clock tick + eerie low cello drone
  private generateVictorianMystery() {
    if (!this.ctx || !this.volumeNode) return;

    // Deep mystery drone
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(65.4, this.ctx.currentTime); // C2

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(77.78, this.ctx.currentTime); // Eb2 (minor third)

    const droneGain = this.ctx.createGain();
    droneGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    osc1.connect(droneGain);
    osc2.connect(droneGain);
    droneGain.connect(this.volumeNode);
    osc1.start();
    osc2.start();

    this.activeNodes.push(osc1, osc2, droneGain);

    // Subtle clock ticking every 1.0 second
    const interval = window.setInterval(() => {
      if (!this.ctx || !this.volumeNode || !this.isPlaying) return;
      try {
        const tickOsc = this.ctx.createOscillator();
        const tickGain = this.ctx.createGain();
        tickOsc.type = 'triangle';
        tickOsc.frequency.setValueAtTime(800, this.ctx.currentTime);
        tickOsc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.04);

        tickGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        tickGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

        tickOsc.connect(tickGain);
        tickGain.connect(this.volumeNode);
        tickOsc.start();
        tickOsc.stop(this.ctx.currentTime + 0.05);
      } catch (e) {
        // ignore tick error
      }
    }, 1000);

    this.activeNodes.push(interval);
  }

  // Ciencia Ficción: Reactor drone + high telemetry harmonics
  private generateSciFiRumble() {
    if (!this.ctx || !this.volumeNode) return;

    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(45, this.ctx.currentTime);

    const humOsc = this.ctx.createOscillator();
    humOsc.type = 'sawtooth';
    humOsc.frequency.setValueAtTime(90, this.ctx.currentTime);

    const humFilter = this.ctx.createBiquadFilter();
    humFilter.type = 'lowpass';
    humFilter.frequency.setValueAtTime(160, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    subOsc.connect(gain);
    humOsc.connect(humFilter);
    humFilter.connect(gain);
    gain.connect(this.volumeNode);

    subOsc.start();
    humOsc.start();

    this.activeNodes.push(subOsc, humOsc, humFilter, gain);
  }

  // Fantasía: Campfire crackle + mystical wind
  private generateMysticCampfire() {
    if (!this.ctx || !this.volumeNode) return;

    // Wind sweep
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.1;
    }

    const windNoise = this.ctx.createBufferSource();
    windNoise.buffer = noiseBuffer;
    windNoise.loop = true;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(350, this.ctx.currentTime);
    bandpass.Q.setValueAtTime(3, this.ctx.currentTime);

    const windGain = this.ctx.createGain();
    windGain.gain.setValueAtTime(0.3, this.ctx.currentTime);

    windNoise.connect(bandpass);
    bandpass.connect(windGain);
    windGain.connect(this.volumeNode);
    windNoise.start();

    // Deep ancient ground tone
    const bass = this.ctx.createOscillator();
    bass.type = 'triangle';
    bass.frequency.setValueAtTime(73.4, this.ctx.currentTime); // D2

    const bassGain = this.ctx.createGain();
    bassGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

    bass.connect(bassGain);
    bassGain.connect(this.volumeNode);
    bass.start();

    this.activeNodes.push(windNoise, bandpass, windGain, bass, bassGain);
  }
}

export const soundscape = new SoundscapeManager();
