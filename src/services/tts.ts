// Browser Web Speech API reader for immersive story playback in Spanish

class StoryNarrator {
  private isSpeaking = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private onStateChange: ((speaking: boolean) => void) | null = null;

  public setListener(cb: (speaking: boolean) => void) {
    this.onStateChange = cb;
  }

  public speak(text: string) {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported on this browser.');
      return;
    }

    this.stop();

    // Clean brackets and formatting for clean voice reading
    const cleanText = text
      .replace(/---/g, '')
      .replace(/\*\*.*?\*\*/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/[#*_]/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'es-ES';
    utterance.rate = 0.95; // slightly deliberate, immersive storyteller pace
    utterance.pitch = 0.98;

    // Pick best Spanish voice if available
    const voices = window.speechSynthesis.getVoices();
    const esVoice = voices.find(v => v.lang.startsWith('es') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Neural'))) 
      || voices.find(v => v.lang.startsWith('es'));
    if (esVoice) {
      utterance.voice = esVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.onStateChange?.(true);
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.onStateChange?.(false);
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.onStateChange?.(false);
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  public pause() {
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
    }
  }

  public resume() {
    if ('speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }

  public stop() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      this.onStateChange?.(false);
    }
  }

  public isNarrating(): boolean {
    return this.isSpeaking;
  }
}

export const narrator = new StoryNarrator();
