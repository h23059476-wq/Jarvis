// Web Audio API & Speech Synthesis / Recognition Engine for Aetheris OS

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// 1. Futuristic Sound Synthesis Effects
export function playWakeChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(1174.66, now + 0.12); // D6

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, now + 0.05); // A5
    osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.22); // A6

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.05);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  } catch (e) {
    console.debug('Audio chime suppressed', e);
  }
}

export function playConfirmBeep() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(1800, now + 0.08);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  } catch (e) {
    console.debug(e);
  }
}

export function playPulseHum() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(65.41, now); // C2

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.exponentialRampToValueAtTime(600, now + 0.2);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.5);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  } catch (e) {
    console.debug(e);
  }
}

export function playStepClick() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2400, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.03);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  } catch (e) {
    console.debug(e);
  }
}

export function playAlertChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    [0, 0.1, 0.2].forEach((delay, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880 + i * 220, now + delay);
      gain.gain.setValueAtTime(0.06, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.12);
    });
  } catch (e) {
    console.debug(e);
  }
}

// 2. Text-to-Speech Engine
export function speakText(
  text: string,
  options: {
    lang?: string;
    voiceName?: string;
    rate?: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
  } = {}
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options.onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();

  const cleanText = text.replace(/[*_#`~[\]]/g, '').trim();
  if (!cleanText) {
    options.onEnd?.();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = options.lang || 'en-US';
  utterance.rate = options.rate || 1.05;
  utterance.pitch = options.pitch || 1.0;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    // Try to match requested language or persona
    const matchingVoice =
      voices.find((v) => options.voiceName && v.name.toLowerCase().includes(options.voiceName.toLowerCase())) ||
      voices.find((v) => v.lang.startsWith(utterance.lang.slice(0, 2))) ||
      voices[0];
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }
  }

  utterance.onstart = () => {
    options.onStart?.();
  };

  utterance.onend = () => {
    options.onEnd?.();
  };

  utterance.onerror = (e) => {
    console.warn('Speech synthesis error:', e);
    options.onEnd?.();
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// 3. Speech Recognition Engine
export class SpeechRecognitionManager {
  private recognition: any = null;
  private isListening: boolean = false;
  private lang: string = 'en-US';
  private onResultCallback: (text: string, isFinal: boolean) => void = () => {};
  private onErrorCallback: (error: string) => void = () => {};
  private onStatusChangeCallback: (listening: boolean) => void = () => {};
  private silenceTimer: any = null;
  private autoSilenceEnabled: boolean = true;
  private silenceTimeoutMs: number = 5000;
  private onSilenceAutoPauseCallback: () => void = () => {};

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        this.recognition = new SpeechRec();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;

        this.recognition.onstart = () => {
          this.isListening = true;
          this.onStatusChangeCallback(true);
          this.resetSilenceTimer();
        };

        this.recognition.onspeechstart = () => {
          this.resetSilenceTimer();
        };

        this.recognition.onspeechend = () => {
          this.resetSilenceTimer();
        };

        this.recognition.onsoundstart = () => {
          this.resetSilenceTimer();
        };

        this.recognition.onaudiostart = () => {
          this.resetSilenceTimer();
        };

        this.recognition.onresult = (event: any) => {
          this.resetSilenceTimer();
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          if (finalTranscript) {
            this.onResultCallback(finalTranscript.trim(), true);
          } else if (interimTranscript) {
            this.onResultCallback(interimTranscript.trim(), false);
          }
        };

        this.recognition.onerror = (event: any) => {
          console.warn('Speech recognition notice:', event.error);
          this.onErrorCallback(event.error);
        };

        this.recognition.onend = () => {
          this.clearSilenceTimer();
          this.isListening = false;
          this.onStatusChangeCallback(false);
        };
      }
    }
  }

  public isSupported(): boolean {
    return !!this.recognition;
  }

  public setLanguage(langCode: string) {
    this.lang = langCode;
    if (this.recognition) {
      this.recognition.lang = langCode;
    }
  }

  public setAutoSilenceConfig(enabled: boolean, timeoutSeconds: number, onAutoPause?: () => void) {
    this.autoSilenceEnabled = enabled;
    this.silenceTimeoutMs = Math.max(2, timeoutSeconds) * 1000;
    if (onAutoPause) {
      this.onSilenceAutoPauseCallback = onAutoPause;
    }
    if (this.isListening) {
      this.resetSilenceTimer();
    }
  }

  public resetSilenceTimer() {
    this.clearSilenceTimer();
    if (!this.autoSilenceEnabled || !this.isListening) return;

    this.silenceTimer = setTimeout(() => {
      if (this.isListening) {
        console.debug(`[SilenceDetector] No audio detected for ${this.silenceTimeoutMs}ms. Pausing mic to preserve resources.`);
        this.stop();
        this.onSilenceAutoPauseCallback();
      }
    }, this.silenceTimeoutMs);
  }

  public clearSilenceTimer() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  public start(
    onResult: (text: string, isFinal: boolean) => void,
    onStatusChange?: (listening: boolean) => void,
    onError?: (err: string) => void
  ) {
    this.onResultCallback = onResult;
    if (onStatusChange) this.onStatusChangeCallback = onStatusChange;
    if (onError) this.onErrorCallback = onError;

    if (!this.recognition) {
      this.onErrorCallback('Speech recognition is not supported in this browser environment.');
      return false;
    }

    try {
      this.recognition.lang = this.lang;
      this.recognition.start();
      playWakeChime();
      this.resetSilenceTimer();
      return true;
    } catch (err: any) {
      console.warn('Recognition start exception:', err);
      return false;
    }
  }

  public stop() {
    this.clearSilenceTimer();
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.debug(e);
      }
    }
    this.isListening = false;
    this.onStatusChangeCallback(false);
  }

  public getListeningState(): boolean {
    return this.isListening;
  }
}

export const speechManager = new SpeechRecognitionManager();
