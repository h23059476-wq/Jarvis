import React from 'react';
import { SystemSettingsData } from '../types';
import {
  Settings,
  Volume2,
  Globe,
  Sliders,
  Bell,
  Sparkles,
  Zap,
  Mic,
  Sun,
  Moon,
  Play,
  CheckCircle,
} from 'lucide-react';
import { speakText, playWakeChime, playConfirmBeep, playAlertChime } from '../utils/audio';

interface SettingsDashboardProps {
  settings: SystemSettingsData;
  onUpdateSettings: (updated: Partial<SystemSettingsData>) => void;
  onTriggerTestPush: () => void;
}

export const SettingsDashboard: React.FC<SettingsDashboardProps> = ({
  settings,
  onUpdateSettings,
  onTriggerTestPush,
}) => {
  const handleTestSpeech = () => {
    playConfirmBeep();
    speakText('Aetheris OS speech synthesis acoustic test. All systems operational.', {
      rate: settings.speechRate,
      pitch: settings.speechPitch,
      voiceName: settings.voicePersona,
      lang: settings.speechRecognitionLang,
    });
  };

  const languages = [
    { code: 'en-US', label: 'English (US)' },
    { code: 'en-GB', label: 'English (UK)' },
    { code: 'es-ES', label: 'Spanish (Español)' },
    { code: 'fr-FR', label: 'French (Français)' },
    { code: 'de-DE', label: 'German (Deutsch)' },
    { code: 'ja-JP', label: 'Japanese (日本語)' },
    { code: 'zh-CN', label: 'Chinese (中文)' },
    { code: 'hi-IN', label: 'Hindi (हिन्दी)' },
    { code: 'ar-SA', label: 'Arabic (العربية)' },
    { code: 'pt-BR', label: 'Portuguese (Português)' },
    { code: 'ko-KR', label: 'Korean (한국어)' },
    { code: 'it-IT', label: 'Italian (Italiano)' },
  ];

  return (
    <div className="w-full h-full p-4 sm:p-8 flex flex-col gap-6 overflow-y-auto max-w-5xl mx-auto font-body-base text-on-surface z-10 select-text">
      {/* Top Banner */}
      <div className="glass-panel p-5 rounded-xl border border-primary-fixed-dim/30 flex justify-between items-center bg-surface-container-high/60 backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary-fixed-dim/20 border border-primary-fixed-dim/40 text-primary-fixed-dim">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-headline-md font-bold text-primary">
              AETHERIS OS SYSTEM SETTINGS
            </h1>
            <p className="text-xs text-on-surface-variant">
              Configure speech synthesis, multilingual acoustics, browser automation engine, and security parameters.
            </p>
          </div>
        </div>

        <button
          onClick={handleTestSpeech}
          className="px-3.5 py-2 rounded-lg bg-primary-fixed-dim/20 text-primary-fixed-dim border border-primary-fixed-dim/50 hover:bg-primary-fixed-dim/30 font-data-mono text-xs font-bold flex items-center gap-2"
        >
          <Volume2 className="w-4 h-4" />
          <span>TEST_TTS</span>
        </button>
      </div>

      {/* Settings Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-data-mono">
        {/* Audio & Speech Synthesizer Section */}
        <div className="glass-panel p-5 rounded-xl border border-outline-variant/30 bg-surface-container-low/70 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-primary font-bold text-sm pb-2 border-b border-outline-variant/20">
            <Mic className="w-4 h-4 text-cyan-400" />
            <span>VOICE RECOGNITION & SYNTHESIS</span>
          </div>

          <div>
            <label className="text-outline text-[11px] block mb-1">ACOUSTIC LANGUAGE MODEL</label>
            <select
              value={settings.speechRecognitionLang}
              onChange={(e) => onUpdateSettings({ speechRecognitionLang: e.target.value })}
              className="w-full px-3 py-2 rounded bg-surface-container-highest/50 border border-outline-variant/30 text-on-surface outline-none"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-outline text-[11px] block mb-1">VOICE PERSONA</label>
            <select
              value={settings.voicePersona}
              onChange={(e) => onUpdateSettings({ voicePersona: e.target.value as any })}
              className="w-full px-3 py-2 rounded bg-surface-container-highest/50 border border-outline-variant/30 text-on-surface outline-none"
            >
              <option value="Zephyr">Zephyr (Futuristic Sentient)</option>
              <option value="Kore">Kore (Calm Ambient)</option>
              <option value="Puck">Puck (Fast High-Energy)</option>
              <option value="Fenrir">Fenrir (Deep Authoritative)</option>
              <option value="CyberVocoder">CyberVocoder (Robotic Synth)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between text-outline text-[11px] mb-1">
                <span>SPEECH SPEED:</span>
                <span className="text-cyan-300">{settings.speechRate}x</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.5"
                step="0.05"
                value={settings.speechRate}
                onChange={(e) => onUpdateSettings({ speechRate: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400"
              />
            </div>
            <div>
              <div className="flex justify-between text-outline text-[11px] mb-1">
                <span>SPEECH PITCH:</span>
                <span className="text-cyan-300">{settings.speechPitch}x</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.4"
                step="0.05"
                value={settings.speechPitch}
                onChange={(e) => onUpdateSettings({ speechPitch: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded bg-surface-container-high/40 border border-outline-variant/20">
            <div>
              <div className="text-on-surface font-semibold">WAKE WORD RECOGNITION</div>
              <div className="text-[10px] text-outline">Listens for "Hey Aetheris" or "Hey Jarvis"</div>
            </div>
            <input
              type="checkbox"
              checked={settings.wakeWordEnabled}
              onChange={(e) => onUpdateSettings({ wakeWordEnabled: e.target.checked })}
              className="w-4 h-4 accent-cyan-400"
            />
          </div>
        </div>

        {/* Visual & Theme Section */}
        <div className="glass-panel p-5 rounded-xl border border-outline-variant/30 bg-surface-container-low/70 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-primary font-bold text-sm pb-2 border-b border-outline-variant/20">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>THEME & GRAPHICS HUD</span>
          </div>

          <div>
            <label className="text-outline text-[11px] block mb-1">AESTHETIC MODE</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onUpdateSettings({ theme: 'dark' })}
                className={`p-3 rounded-lg border flex items-center gap-2 transition-all ${
                  settings.theme === 'dark'
                    ? 'border-primary-fixed-dim bg-primary-fixed-dim/20 text-primary-fixed-dim font-bold'
                    : 'border-outline-variant/30 text-on-surface-variant hover:bg-white/5'
                }`}
              >
                <Moon className="w-4 h-4 text-cyan-400" />
                <span>VOID_DARK</span>
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ theme: 'light' })}
                className={`p-3 rounded-lg border flex items-center gap-2 transition-all ${
                  settings.theme === 'light'
                    ? 'border-primary-fixed-dim bg-primary-fixed-dim/20 text-primary-fixed-dim font-bold'
                    : 'border-outline-variant/30 text-on-surface-variant hover:bg-white/5'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-300" />
                <span>CYBER_LIGHT</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded bg-surface-container-high/40 border border-outline-variant/20">
            <div>
              <div className="text-on-surface font-semibold">CRT SCANLINE OVERLAY</div>
              <div className="text-[10px] text-outline">Simulates holographic phosphor display scan</div>
            </div>
            <input
              type="checkbox"
              checked={settings.scanlinesEnabled}
              onChange={(e) => onUpdateSettings({ scanlinesEnabled: e.target.checked })}
              className="w-4 h-4 accent-cyan-400"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded bg-surface-container-high/40 border border-outline-variant/20">
            <div>
              <div className="text-on-surface font-semibold">PUSH NOTIFICATIONS & SOUND</div>
              <div className="text-[10px] text-outline">Alerts upon autonomous web task completion</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onTriggerTestPush}
                className="text-[10px] px-2 py-1 rounded bg-primary-fixed-dim/20 text-primary-fixed-dim hover:bg-primary-fixed-dim/30"
              >
                TEST_ALERT
              </button>
              <input
                type="checkbox"
                checked={settings.pushNotificationsEnabled}
                onChange={(e) => onUpdateSettings({ pushNotificationsEnabled: e.target.checked })}
                className="w-4 h-4 accent-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Automatic Silence Detector & Resource Conservation Section */}
        <div className="md:col-span-2 glass-panel p-5 rounded-xl border border-cyan-500/40 bg-surface-container-low/70 flex flex-col gap-4 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>AUTOMATIC SILENCE DETECTOR & RESOURCE PRESERVATION</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
              HARDWARE_PRESERVATION_ENGINE
            </span>
          </div>

          <p className="text-xs text-on-surface-variant">
            Monitors real-time microphone acoustics and automatically suspends the audio context stream when no speech or audio is detected for a configurable timeout. Conserves CPU cycles, RAM buffers, and battery power.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Toggle Card */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-surface-container-high/40 border border-outline-variant/20">
              <div>
                <div className="text-on-surface font-semibold">ENABLE SILENCE AUTO-PAUSE</div>
                <div className="text-[10px] text-outline mt-0.5">
                  Automatically pauses microphone stream during idle periods
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoSilenceDetectionEnabled}
                onChange={(e) => onUpdateSettings({ autoSilenceDetectionEnabled: e.target.checked })}
                className="w-5 h-5 accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Threshold / Noise Gate Slider */}
            <div className="p-4 rounded-lg bg-surface-container-high/40 border border-outline-variant/20">
              <div className="flex justify-between items-center text-[11px] mb-1">
                <span className="text-outline">NOISE GATE / DETECTION THRESHOLD:</span>
                <span className="text-cyan-300 font-bold">{settings.silenceThresholdPercent}% volume</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={settings.silenceThresholdPercent}
                onChange={(e) => onUpdateSettings({ silenceThresholdPercent: parseInt(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                <span>1% (High Sensitivity)</span>
                <span>5% (Balanced)</span>
                <span>10% (Noisy Room)</span>
              </div>
            </div>
          </div>

          {/* Timeout Duration Sliders & Presets */}
          <div className="p-4 rounded-lg bg-surface-container-high/40 border border-outline-variant/20 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-on-surface font-semibold">SILENCE TIMEOUT DURATION</div>
                <div className="text-[10px] text-outline">
                  Microphone pauses after this duration of continuous silence
                </div>
              </div>
              <span className="text-base font-bold text-cyan-300 font-mono px-3 py-1 rounded bg-cyan-950/60 border border-cyan-500/30">
                {settings.silenceTimeoutSeconds} SECONDS
              </span>
            </div>

            <input
              type="range"
              min="2"
              max="30"
              step="1"
              value={settings.silenceTimeoutSeconds}
              onChange={(e) => onUpdateSettings({ silenceTimeoutSeconds: parseInt(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-[10px] text-outline mr-1">QUICK PRESETS:</span>
              {[
                { sec: 2, label: '2s (Ultra Fast)' },
                { sec: 3, label: '3s (Aggressive)' },
                { sec: 5, label: '5s (Balanced / Default)' },
                { sec: 10, label: '10s (Standard)' },
                { sec: 15, label: '15s (Relaxed)' },
                { sec: 30, label: '30s (Extended)' },
              ].map((preset) => (
                <button
                  key={preset.sec}
                  type="button"
                  onClick={() => onUpdateSettings({ silenceTimeoutSeconds: preset.sec })}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all cursor-pointer border ${
                    settings.silenceTimeoutSeconds === preset.sec
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                      : 'bg-surface-container-highest/60 text-slate-300 border-outline-variant/30 hover:border-cyan-500/50 hover:text-cyan-300'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Resource Conservation Benefits Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[11px] font-mono">
            <div className="p-3 rounded bg-slate-950/60 border border-slate-800 flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="text-slate-400">IDLE CPU LOAD</div>
                <div className="text-emerald-400 font-bold">~85% Reduction</div>
              </div>
            </div>
            <div className="p-3 rounded bg-slate-950/60 border border-slate-800 flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <div className="text-slate-400">BATTERY USAGE</div>
                <div className="text-cyan-300 font-bold">Conserved On Silence</div>
              </div>
            </div>
            <div className="p-3 rounded bg-slate-950/60 border border-slate-800 flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <div className="text-slate-400">MEMORY BUFFER</div>
                <div className="text-indigo-300 font-bold">Released When Paused</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
