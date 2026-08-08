import React, { useEffect, useState } from 'react';
import {
  ScreenMode,
  VoiceStatus,
  LogEntry,
  TelemetryData,
  SystemSettingsData,
} from '../types';
import {
  Mic,
  MicOff,
  Terminal,
  Cpu,
  Wifi,
  BatteryCharging,
  Globe,
  MessageSquare,
  Shield,
  User,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Sparkles,
  Play,
  Maximize2,
  Volume2,
} from 'lucide-react';
import { playConfirmBeep, playWakeChime } from '../utils/audio';

interface AmbientHUDProps {
  currentMode: ScreenMode;
  onSelectMode: (mode: ScreenMode) => void;
  voiceStatus: VoiceStatus;
  onToggleMic: () => void;
  liveTranscript: string;
  interimTranscript: string;
  logs: LogEntry[];
  telemetry: TelemetryData;
  settings: SystemSettingsData;
  onUpdateSettings: (newSettings: Partial<SystemSettingsData>) => void;
  onExecuteQuickCommand: (command: string) => void;
  audioAmplitude: number;
  silenceCountdown?: number;
  isSilenceAutoPaused?: boolean;
  onResetSilenceAutoPaused?: () => void;
}

export const AmbientHUD: React.FC<AmbientHUDProps> = ({
  currentMode,
  onSelectMode,
  voiceStatus,
  onToggleMic,
  liveTranscript,
  interimTranscript,
  logs,
  telemetry,
  settings,
  onUpdateSettings,
  onExecuteQuickCommand,
  audioAmplitude,
  silenceCountdown = 5,
  isSilenceAutoPaused = false,
  onResetSilenceAutoPaused,
}) => {
  const [clock, setClock] = useState<string>('00:00:00');
  const [showTelemetryModal, setShowTelemetryModal] = useState<boolean>(false);
  const [quickInput, setQuickInput] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isListening = voiceStatus === 'listening';
  const isSpeaking = voiceStatus === 'speaking';
  const isProcessing = voiceStatus === 'processing';

  const quickPrompts = [
    'Research breakthrough AI papers on arXiv',
    'Find nonstop flights from JFK to Tokyo Haneda',
    'Monitor tech deals on Sony headphones',
    'Check BTC & Nvidia real-time ticker',
    'Audit offline privacy & redact confidential PII',
  ];

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-6 sm:p-10 pointer-events-none select-none z-10 font-sans">
      {/* Top Header Status Bar */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
        {/* Left Status Pills */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-2.5 glass-panel px-3.5 py-1.5 rounded-lg border border-slate-800 text-slate-200">
            <span
              className={`w-2 h-2 rounded-full ${
                isListening
                  ? 'bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,1)] animate-ping'
                  : isSpeaking
                  ? 'bg-indigo-400 shadow-[0_0_10px_rgba(99,102,241,1)] animate-pulse'
                  : 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse'
              }`}
            />
            <span className="font-mono text-xs text-cyan-400 font-bold tracking-widest">
              SYSTEM: {isListening ? 'VOICE_ACTIVE' : isSpeaking ? 'SYNTHESIZING' : 'AMBIENT'}
            </span>
          </div>

          {/* Automatic Silence Detector Indicator Pill */}
          {isListening && settings.autoSilenceDetectionEnabled && (
            <div className="flex items-center gap-2 glass-panel px-3 py-1.5 rounded-lg border border-cyan-500/40 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-mono text-xs font-bold">
                AUTO_SILENCE: {silenceCountdown}s
              </span>
            </div>
          )}

          {isSilenceAutoPaused && (
            <button
              onClick={() => {
                playWakeChime();
                if (onResetSilenceAutoPaused) onResetSilenceAutoPaused();
                onToggleMic();
              }}
              className="flex items-center gap-2 glass-panel px-3.5 py-1.5 rounded-lg border border-amber-500/50 bg-amber-950/40 text-amber-300 hover:bg-amber-900/50 transition-all cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.3)] animate-pulse"
              title="Microphone paused to save CPU/Battery. Click to resume listening."
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="font-mono text-xs font-bold">
                [AUTO-PAUSED: SILENCE DETECTED &bull; CLICK TO RESUME]
              </span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 glass-panel px-3.5 py-1.5 rounded-lg border border-slate-800 text-slate-300">
            <span className="material-symbols-outlined text-[16px] text-cyan-400 animate-pulse">
              graphic_eq
            </span>
            <span className="font-mono text-xs tracking-wider">
              VOICE_LINK: {voiceStatus === 'muted' ? 'MUTED' : 'READY'}
            </span>
          </div>

          {/* Navigation Bar Pills */}
          <nav className="flex items-center gap-1 glass-panel p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => {
                playConfirmBeep();
                onSelectMode('ambient');
              }}
              className={`px-3 py-1 rounded-md text-xs font-mono transition-all cursor-pointer ${
                currentMode === 'ambient'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              HUD
            </button>
            <button
              onClick={() => {
                playConfirmBeep();
                onSelectMode('automation');
              }}
              className={`px-3 py-1 rounded-md text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                currentMode === 'automation'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>BROWSER_AUTO</span>
            </button>
            <button
              onClick={() => {
                playConfirmBeep();
                onSelectMode('chat');
              }}
              className={`px-3 py-1 rounded-md text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                currentMode === 'chat'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              <span>VOICE_CHAT</span>
            </button>
            <button
              onClick={() => {
                playConfirmBeep();
                onSelectMode('security');
              }}
              className={`px-3 py-1 rounded-md text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                currentMode === 'security'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>OFFLINE_VAULT</span>
            </button>
            <button
              onClick={() => {
                playConfirmBeep();
                onSelectMode('profile');
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all cursor-pointer ${
                currentMode === 'profile'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
              title="User Biometric Profile"
            >
              <User className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                playConfirmBeep();
                onSelectMode('settings');
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all cursor-pointer ${
                currentMode === 'settings'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
              title="System Settings"
            >
              <SettingsIcon className="w-3.5 h-3.5" />
            </button>
          </nav>
        </div>

        {/* Right Status (Clock & Theme) */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Light / Dark Mode switch */}
          <button
            onClick={() => {
              playConfirmBeep();
              onUpdateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
            }}
            className="glass-panel px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-1.5 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors text-xs font-mono cursor-pointer"
            title="Toggle Light / Dark Mode"
          >
            {settings.theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">VOID_DARK</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-cyan-600" />
                <span className="hidden sm:inline">CYBER_LIGHT</span>
              </>
            )}
          </button>

          <div className="glass-panel px-4 py-2 rounded-lg border border-slate-800 flex items-center gap-2">
            <span className="font-mono text-xs text-slate-300 tracking-wider">
              {clock}
            </span>
          </div>
        </div>
      </header>

      {/* Center Holographic Voice Pulse Core */}
      <section className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-auto">
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center">
          {/* Concentric Holographic Pulse Rings */}
          <div
            className={`absolute inset-0 rounded-full border border-cyan-500/30 voice-pulse transition-all duration-500 ${
              isListening ? 'scale-125 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)]' : ''
            }`}
          />
          <div
            className="absolute inset-3 rounded-full border border-indigo-500/30 voice-pulse"
            style={{ animationDelay: '0.6s' }}
          />
          <div
            className="absolute inset-7 rounded-full border border-cyan-500/40 voice-pulse"
            style={{ animationDelay: '1.2s' }}
          />

          {/* Dynamic Audio Visualizer Ringlets */}
          {audioAmplitude > 0.05 && (
            <div
              className="absolute inset-0 rounded-full border-2 border-cyan-300 animate-ping opacity-60 pointer-events-none"
              style={{ transform: `scale(${1 + audioAmplitude * 1.5})` }}
            />
          )}

          {/* Core Interactive Mic Orb */}
          <button
            onClick={() => {
              playWakeChime();
              onToggleMic();
            }}
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-2xl relative z-10 ${
              isListening
                ? 'bg-cyan-500/30 border-2 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.8)] scale-110'
                : isSpeaking
                ? 'bg-indigo-900/40 border-2 border-indigo-400 shadow-[0_0_25px_rgba(99,102,241,0.7)]'
                : 'bg-slate-900/90 backdrop-blur-xl border border-cyan-500/50 hover:border-cyan-400 hover:scale-105 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
            }`}
            title={isListening ? 'Click to pause listening' : 'Click to activate voice input'}
          >
            {isListening ? (
              <Mic className="w-8 h-8 text-cyan-400 glow-text animate-pulse" />
            ) : voiceStatus === 'muted' ? (
              <MicOff className="w-7 h-7 text-slate-500" />
            ) : (
              <Mic className="w-8 h-8 text-cyan-400 glow-text" />
            )}
          </button>
        </div>

        {/* Live Audio Status Text & Subtitle Stream */}
        <div className="mt-6 flex flex-col items-center max-w-lg text-center">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-cyan-400 tracking-widest font-bold">
              {isListening
                ? settings.autoSilenceDetectionEnabled
                  ? `LISTENING... (AUTO-PAUSE IN ${silenceCountdown}s)`
                  : 'LISTENING... (SAY COMMAND OR "AETHERIS")'
                : isProcessing
                ? 'NEURAL EXECUTION IN PROGRESS...'
                : isSpeaking
                ? 'VOCALIZING RESPONSE'
                : isSilenceAutoPaused
                ? 'MICROPHONE AUTO-PAUSED (SILENCE DETECTED — SAVED CPU/BATTERY)'
                : 'TAP MIC OR SPEAK TO AUTOMATE'}
            </span>
          </div>

          {/* Silence countdown visual bar when listening */}
          {isListening && settings.autoSilenceDetectionEnabled && (
            <div className="w-52 h-1.5 bg-slate-900/90 rounded-full mt-2 overflow-hidden border border-cyan-500/30">
              <div
                className="h-full bg-cyan-400 transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.9)]"
                style={{
                  width: `${Math.min(
                    100,
                    (silenceCountdown / (settings.silenceTimeoutSeconds || 5)) * 100
                  )}%`,
                }}
              />
            </div>
          )}

          {(liveTranscript || interimTranscript) && (
            <div className="mt-3 px-4 py-2 rounded-lg bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 text-slate-100 font-sans text-sm sm:text-base animate-slide-in shadow-xl">
              <span className="text-cyan-300">"{liveTranscript || interimTranscript}"</span>
            </div>
          )}

          {/* Quick Voice Command Suggestion Chips */}
          <div className="mt-4 flex flex-wrap justify-center gap-2 max-w-xl">
            {quickPrompts.slice(0, 3).map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  playConfirmBeep();
                  onExecuteQuickCommand(prompt);
                }}
                className="glass-panel px-3 py-1 rounded-full text-[11px] font-mono text-slate-300 hover:text-cyan-300 hover:border-cyan-500/60 hover:bg-cyan-500/10 transition-all border border-slate-800 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>{prompt}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Area: Automation Log + Hardware Telemetry */}
      <footer className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 w-full">
        {/* Bottom Left: Automation Log Terminal */}
        <div className="glass-panel rounded-xl w-full sm:w-96 h-52 flex flex-col overflow-hidden pointer-events-auto border-l-2 border-l-cyan-500 border-slate-800 bg-slate-900/70 backdrop-blur-2xl shadow-2xl">
          <div className="px-3 py-2 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono text-[11px] text-slate-300 font-bold tracking-wider">
                AUTOMATION_LOG
              </span>
            </div>
            <button
              onClick={() => onSelectMode('automation')}
              className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>BROWSER_STAGE</span>
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>

          <div className="p-3 flex-1 overflow-y-auto no-scrollbar font-mono text-[12px] text-slate-300 flex flex-col gap-1.5">
            {logs.map((log, idx) => (
              <div
                key={log.id || idx}
                className={`log-entry ${
                  log.type === 'cyan'
                    ? 'text-cyan-400 font-semibold'
                    : log.type === 'success'
                    ? 'text-emerald-400'
                    : log.type === 'warning'
                    ? 'text-amber-300'
                    : log.type === 'dim'
                    ? 'opacity-60 text-slate-500'
                    : 'text-slate-200'
                }`}
              >
                {log.text}
              </div>
            ))}
            <div className="text-cyan-400 animate-pulse">&gt; AWAITING_INPUT_</div>
          </div>

          {/* Quick CLI input bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (quickInput.trim()) {
                onExecuteQuickCommand(quickInput.trim());
                setQuickInput('');
              }
            }}
            className="px-2 py-1.5 border-t border-slate-800 bg-slate-950/40 flex items-center gap-2"
          >
            <span className="text-cyan-400 font-mono text-xs">&gt;</span>
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="Type command or speak..."
              className="flex-1 bg-transparent text-xs text-slate-100 placeholder:text-slate-500 outline-none font-mono"
            />
            <button
              type="submit"
              className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono hover:bg-cyan-500/30 border border-cyan-500/30 cursor-pointer"
            >
              EXEC
            </button>
          </form>
        </div>

        {/* Bottom Right: Hardware Telemetry Widgets */}
        <div className="flex gap-2 pointer-events-auto self-end sm:self-auto">
          {/* CPU */}
          <button
            onClick={() => {
              playConfirmBeep();
              setShowTelemetryModal(!showTelemetryModal);
            }}
            className="glass-panel p-2.5 rounded-lg flex flex-col items-center justify-center min-w-[70px] gap-1 hover:bg-slate-800/60 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer"
            title="CPU Core Utilization"
          >
            <Cpu className="w-4 h-4 text-slate-400" />
            <span className="font-mono text-xs text-slate-200 font-bold">
              {telemetry.cpuUsage}%
            </span>
          </button>

          {/* Network Ping */}
          <button
            onClick={() => {
              playConfirmBeep();
              setShowTelemetryModal(!showTelemetryModal);
            }}
            className="glass-panel p-2.5 rounded-lg flex flex-col items-center justify-center min-w-[70px] gap-1 hover:bg-slate-800/60 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer"
            title="Encrypted Ping Latency"
          >
            <Wifi className="w-4 h-4 text-cyan-400 glow-text" />
            <span className="font-mono text-xs text-cyan-400 font-bold">
              {telemetry.networkLatency}ms
            </span>
          </button>

          {/* Battery / Power */}
          <button
            onClick={() => {
              playConfirmBeep();
              setShowTelemetryModal(!showTelemetryModal);
            }}
            className="glass-panel p-2.5 rounded-lg flex flex-col items-center justify-center min-w-[70px] gap-1 hover:bg-slate-800/60 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer"
            title="Power Grid Architecture"
          >
            <BatteryCharging className="w-4 h-4 text-slate-400" />
            <span className="font-mono text-xs text-slate-200 font-bold">
              {telemetry.powerSource}
            </span>
          </button>
        </div>
      </footer>

      {/* Expandable Telemetry Diagnostic Modal */}
      {showTelemetryModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 pointer-events-auto">
          <div className="glass-panel rounded-2xl max-w-md w-full p-6 border border-slate-800 shadow-[0_0_40px_rgba(6,182,212,0.25)] text-slate-100 animate-scale-in bg-slate-900/90">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-base font-mono">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <span>SYSTEM HARDWARE TELEMETRY</span>
              </div>
              <button
                onClick={() => setShowTelemetryModal(false)}
                className="text-slate-400 hover:text-slate-100 font-mono text-sm px-2 py-1 cursor-pointer"
              >
                [ESC]
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="text-slate-500">CPU UTILIZATION</div>
                <div className="text-lg font-bold text-cyan-400 mt-1">{telemetry.cpuUsage}%</div>
                <div className="text-[10px] text-emerald-400">8 Cores Active</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="text-slate-500">RAM MEMORY</div>
                <div className="text-lg font-bold text-cyan-400 mt-1">{telemetry.memoryUsage} MB</div>
                <div className="text-[10px] text-indigo-400">V8 Isolated Heap</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="text-slate-500">ENCRYPTED LATENCY</div>
                <div className="text-lg font-bold text-cyan-400 mt-1">{telemetry.networkLatency} ms</div>
                <div className="text-[10px] text-cyan-300">TLS 1.3 Airgap Ready</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="text-slate-500">SECURITY ENCRYPTION</div>
                <div className="text-lg font-bold text-cyan-300 mt-1">{telemetry.encryptionBit}-BIT</div>
                <div className="text-[10px] text-emerald-400">Zero Leak Guard</div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-slate-950/40 border border-slate-800 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>ACOUSTIC NLP ENGINE:</span>
                <span className="text-cyan-400">{telemetry.speechModel}</span>
              </div>
              <div className="flex justify-between text-slate-400 mt-1">
                <span>OFFLINE PACKETS BLOCKED:</span>
                <span className="text-emerald-400">{telemetry.offlinePacketsBlocked} trackers</span>
              </div>
              <div className="flex justify-between text-slate-400 mt-1">
                <span>ACTIVE LOCALE:</span>
                <span className="text-cyan-300">{telemetry.activeLanguage.toUpperCase()}</span>
              </div>
            </div>

            {/* Silence Detector & Resource Conservation Widget */}
            <div className="mt-4 p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/30 text-xs font-mono">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                <span className="text-cyan-300 font-bold">SILENCE DETECTOR (RESOURCE GUARD)</span>
                <button
                  onClick={() =>
                    onUpdateSettings({
                      autoSilenceDetectionEnabled: !settings.autoSilenceDetectionEnabled,
                    })
                  }
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                    settings.autoSilenceDetectionEnabled
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {settings.autoSilenceDetectionEnabled ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              <div className="mt-2 text-slate-400 text-[11px] flex justify-between items-center">
                <span>Auto-Pause Timeout:</span>
                <div className="flex gap-1">
                  {[2, 3, 5, 10, 15].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => onUpdateSettings({ silenceTimeoutSeconds: sec })}
                      className={`px-1.5 py-0.5 rounded text-[10px] border cursor-pointer ${
                        settings.silenceTimeoutSeconds === sec
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-cyan-300'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-2 text-[10px] text-emerald-400 flex items-center justify-between">
                <span>Idle Resource Preservation:</span>
                <span>~65% CPU / Battery Saved</span>
              </div>
            </div>

            <button
              onClick={() => setShowTelemetryModal(false)}
              className="mt-6 w-full py-2.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)] cursor-pointer"
            >
              CLOSE_DIAGNOSTICS
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
