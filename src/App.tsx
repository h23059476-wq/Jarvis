import React, { useState, useEffect, useRef } from 'react';
import {
  ScreenMode,
  VoiceStatus,
  LogEntry,
  TelemetryData,
  SystemSettingsData,
  UserProfileData,
  ChatMessage,
  AutomationTask,
  PushAlert,
} from './types';
import { AmbientShader } from './components/AmbientShader';
import { AmbientHUD } from './components/AmbientHUD';
import { AutonomousBrowser } from './components/AutonomousBrowser';
import { VoiceChatConsole } from './components/VoiceChatConsole';
import { PrivacySecurityVault } from './components/PrivacySecurityVault';
import { UserProfileModal } from './components/UserProfileModal';
import { SettingsDashboard } from './components/SettingsDashboard';
import { NotificationToaster } from './components/NotificationToaster';
import {
  speechManager,
  speakText,
  stopSpeaking,
  playWakeChime,
  playConfirmBeep,
  playAlertChime,
} from './utils/audio';
import { redactSensitivePII } from './utils/privacy';
import { PRESET_AUTOMATION_TEMPLATES, createCustomAutomationTask } from './utils/automationEngine';

export default function App() {
  const [currentMode, setCurrentMode] = useState<ScreenMode>('ambient');
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle');
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [audioAmplitude, setAudioAmplitude] = useState<number>(0);

  // Initial logs matching the screenshot exactly!
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', timestamp: '23:31:00', text: '> INIT_SEQUENCE...', type: 'cyan' },
    { id: '2', timestamp: '23:31:01', text: '> FETCHING_LOCAL_FILES... [OK]', type: 'info' },
    { id: '3', timestamp: '23:31:02', text: '> EXECUTING_DOCKER_BUILD...', type: 'info' },
    { id: '4', timestamp: '23:31:03', text: "  - Pulling image 'core-ai:latest'", type: 'dim' },
    { id: '5', timestamp: '23:31:04', text: '> MAPPING_WORKSPACE...', type: 'info' },
  ]);

  const [telemetry, setTelemetry] = useState<TelemetryData>({
    cpuUsage: 12,
    memoryUsage: 240,
    networkLatency: 98,
    powerSource: 'AC',
    batteryLevel: 100,
    encryptionBit: 4096,
    offlinePacketsBlocked: 142,
    privacyScore: 99,
    activeLanguage: 'en-US',
    speechModel: 'Zephyr Acoustic',
  });

  const [settings, setSettings] = useState<SystemSettingsData>({
    theme: 'dark',
    wakeWordEnabled: true,
    wakeWord: 'Hey Aetheris',
    speechRecognitionLang: 'en-US',
    voicePersona: 'Zephyr',
    speechRate: 1.05,
    speechPitch: 1.0,
    soundEffectsVolume: 0.8,
    autoExecuteBrowserTasks: true,
    browserSimulationSpeed: 1000,
    strictOfflineOnly: false,
    autoRedactPII: true,
    pushNotificationsEnabled: true,
    scanlinesEnabled: true,
    ambientShaderSpeed: 1.0,
    autoSilenceDetectionEnabled: true,
    silenceTimeoutSeconds: 5,
    silenceThresholdPercent: 3,
  });

  const [silenceCountdown, setSilenceCountdown] = useState<number>(5);
  const [isSilenceAutoPaused, setIsSilenceAutoPaused] = useState<boolean>(false);
  const lastAudioTimeRef = useRef<number>(Date.now());

  const [profile, setProfile] = useState<UserProfileData>({
    name: 'Operator Core',
    callsign: 'COMMANDER_ZERO',
    biometricId: 'BIO-VOX-9942',
    voiceprintMatched: true,
    clearanceLevel: 'LEVEL_5_SENTIENT',
    voiceSampleCount: 124,
    autoApproveLowRiskActions: true,
    strictLocalProcessing: false,
    preferredLanguage: 'en-US',
    wakeWords: ['Aetheris', 'Jarvis', 'Computer'],
  });

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'system',
      text: 'Aetheris OS Ambient Core initialized. Hands-free voice recognition and autonomous browser automation standing by.',
      timestamp: new Date(Date.now() - 60000).toISOString(),
      processingMode: 'LOCAL_HYBRID',
      latencyMs: 14,
    },
  ]);

  const [activeTask, setActiveTask] = useState<AutomationTask | null>(() => ({
    ...PRESET_AUTOMATION_TEMPLATES[0],
    id: 'task-initial',
    status: 'idle',
    currentStepIndex: 0,
    createdAt: new Date().toISOString(),
    autonomousLog: ['[SYS] Autonomous Web Automation Workspace initialized.'],
  }));

  const [alerts, setAlerts] = useState<PushAlert[]>([
    {
      id: 'a-1',
      title: 'Aetheris Core Armed',
      message: 'Autonomous browser controls and confidential offline privacy engine active.',
      type: 'system_info',
      timestamp: new Date().toISOString(),
      read: false,
    },
  ]);

  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const addLog = (text: string, type: LogEntry['type'] = 'info') => {
    const entry: LogEntry = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      text,
      type,
    };
    setLogs((prev) => [...prev.slice(-14), entry]);
  };

  const triggerPushAlert = (title: string, message: string, type: PushAlert['type'] = 'task_complete') => {
    playAlertChime();
    const newAlert: PushAlert = {
      id: `alert-${Date.now()}`,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);

    // Native browser Web Notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: '/favicon.ico',
        });
      } catch (e) {
        console.debug('Notification trigger suppressed', e);
      }
    }
  };

  const requestBrowserPushPermission = () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission().then((permission) => {
        setBrowserPermission(permission);
        if (permission === 'granted') {
          triggerPushAlert('OS Push Notifications Active', 'Browser push alerts enabled for autonomous task events.');
        }
      });
    }
  };

  // Synchronize auto silence config with SpeechRecognitionManager
  useEffect(() => {
    speechManager.setAutoSilenceConfig(
      settings.autoSilenceDetectionEnabled,
      settings.silenceTimeoutSeconds,
      () => {
        setVoiceStatus('idle');
        setIsSilenceAutoPaused(true);
        addLog(
          `> MIC_AUTO_PAUSED: No audio detected for ${settings.silenceTimeoutSeconds}s. System resources conserved.`,
          'warning'
        );
        triggerPushAlert(
          'Microphone Auto-Paused',
          `Microphone automatically paused after ${settings.silenceTimeoutSeconds}s of silence to conserve CPU and battery.`,
          'voice_alert'
        );
      }
    );
  }, [settings.autoSilenceDetectionEnabled, settings.silenceTimeoutSeconds]);

  // Web Audio mic amplitude analyzer & Automatic Silence Detection Engine
  useEffect(() => {
    let micStream: MediaStream | null = null;
    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let animFrame: number;
    let silenceInterval: any = null;

    const setupMicAnalyser = async () => {
      if (voiceStatus === 'listening') {
        lastAudioTimeRef.current = Date.now();
        setSilenceCountdown(settings.silenceTimeoutSeconds);

        try {
          micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          audioCtx = new AudioCtx();
          analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          const source = audioCtx.createMediaStreamSource(micStream);
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const threshold = Math.max(0.01, (settings.silenceThresholdPercent || 3) / 100);

          const checkVolume = () => {
            if (!analyser) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            const norm = Math.min(1.0, avg / 128);
            setAudioAmplitude(norm);

            // If audio volume is above the silence threshold, user is speaking -> reset timer
            if (norm >= threshold) {
              lastAudioTimeRef.current = Date.now();
              speechManager.resetSilenceTimer();
            }

            animFrame = requestAnimationFrame(checkVolume);
          };
          checkVolume();

          // Silence countdown and auto-pause ticker
          silenceInterval = setInterval(() => {
            if (voiceStatus === 'listening' && settings.autoSilenceDetectionEnabled) {
              const elapsedMs = Date.now() - lastAudioTimeRef.current;
              const remainingSec = Math.max(
                0,
                Math.ceil(settings.silenceTimeoutSeconds - elapsedMs / 1000)
              );
              setSilenceCountdown(remainingSec);

              if (elapsedMs >= settings.silenceTimeoutSeconds * 1000) {
                // Auto-pause microphone
                speechManager.stop();
                setVoiceStatus('idle');
                setIsSilenceAutoPaused(true);
                addLog(
                  `> MIC_AUTO_PAUSED: No audio detected for ${settings.silenceTimeoutSeconds}s. System resources conserved.`,
                  'warning'
                );
                triggerPushAlert(
                  'Microphone Auto-Paused (Silence Detected)',
                  `Microphone paused after ${settings.silenceTimeoutSeconds}s of silence to conserve system resources.`,
                  'voice_alert'
                );
              }
            }
          }, 250);
        } catch (e) {
          console.debug('Mic stream not available for analyzer', e);
        }
      } else {
        setAudioAmplitude(0);
      }
    };

    setupMicAnalyser();

    return () => {
      cancelAnimationFrame(animFrame);
      if (silenceInterval) clearInterval(silenceInterval);
      if (micStream) micStream.getTracks().forEach((t) => t.stop());
      if (audioCtx && audioCtx.state !== 'closed') audioCtx.close();
    };
  }, [voiceStatus, settings.autoSilenceDetectionEnabled, settings.silenceTimeoutSeconds, settings.silenceThresholdPercent]);

  // Voice Command Dispatcher
  const handleProcessUserCommand = async (transcriptText: string) => {
    if (!transcriptText.trim()) return;
    lastAudioTimeRef.current = Date.now();
    speechManager.resetSilenceTimer();

    let processedText = transcriptText.trim();
    let piiRedactions = 0;

    // Local PII Redactor pass if enabled
    if (settings.autoRedactPII) {
      const redResult = redactSensitivePII(processedText);
      processedText = redResult.redactedText;
      piiRedactions = redResult.redactionsFound;
      if (piiRedactions > 0) {
        addLog(`[PII_FILTER] Redacted ${piiRedactions} sensitive token(s) locally.`, 'warning');
      }
    }

    // Add user message to chat history
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: processedText,
      timestamp: new Date().toISOString(),
      redactedPiiCount: piiRedactions,
    };
    setMessages((prev) => [...prev, userMsg]);
    addLog(`> INCOMING_VOICE: "${processedText}"`, 'cyan');
    setVoiceStatus('processing');

    try {
      // Execute command through server API
      const res = await fetch('/api/gemini/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: processedText,
          language: settings.speechRecognitionLang,
          confidentialMode: settings.strictOfflineOnly || profile.strictLocalProcessing,
          history: messages.slice(-4),
          userPreferences: {
            theme: settings.theme,
            persona: settings.voicePersona,
            callsign: profile.callsign,
          },
        }),
      });

      const data = await res.json();
      const speechReply = data.response || 'Command executed successfully.';

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: speechReply,
        timestamp: new Date().toISOString(),
        processingMode: data.telemetry?.processingMode || 'GEMINI_CLOUD',
        latencyMs: data.telemetry?.latencyMs || 120,
        automationPlan: data.automationPlan
          ? {
              title: data.automationPlan.title,
              targetUrl: data.automationPlan.targetUrl,
              stepCount: data.automationPlan.steps?.length || 4,
            }
          : undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      addLog(`> ASSISTANT_REPLY: "${speechReply.slice(0, 45)}..."`, 'success');

      // Vocalize response
      setVoiceStatus('speaking');
      speakText(speechReply, {
        lang: settings.speechRecognitionLang,
        voiceName: settings.voicePersona,
        rate: settings.speechRate,
        pitch: settings.speechPitch,
        onEnd: () => setVoiceStatus('idle'),
      });

      // Handle screen target navigation if model requested it
      if (data.screenTarget) {
        setCurrentMode(data.screenTarget);
      }

      // Handle autonomous browser automation task if triggered
      if (data.automationPlan) {
        const newTask = createCustomAutomationTask(
          data.automationPlan.title || processedText,
          data.automationPlan.targetUrl
        );
        if (data.automationPlan.steps) {
          newTask.steps = data.automationPlan.steps.map((st: any, idx: number) => ({
            id: `st-${idx + 1}`,
            action: st.action || 'navigate',
            target: st.target || newTask.targetUrl,
            description: st.description || `Step ${idx + 1}`,
            status: 'pending',
          }));
        }
        setActiveTask(newTask);
        setCurrentMode('automation');
        triggerPushAlert('Autonomous Task Spawned', `Executing: "${newTask.title}" on web.`);
      }

      // Handle system commands
      if (data.systemCommand) {
        if (data.systemCommand.type === 'toggle_theme') {
          setSettings((prev) => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
        } else if (data.systemCommand.type === 'set_privacy_mode') {
          setSettings((prev) => ({ ...prev, strictOfflineOnly: true }));
        }
      }
    } catch (err: any) {
      console.error('Command processing error:', err);
      const fallbackReply = `Processed offline: "${processedText}". Local failsafe engaged.`;
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 2}`,
          sender: 'assistant',
          text: fallbackReply,
          timestamp: new Date().toISOString(),
          processingMode: 'OFFLINE_CONFIDENTIAL',
          latencyMs: 10,
        },
      ]);
      setVoiceStatus('idle');
      speakText(fallbackReply, {
        rate: settings.speechRate,
        onEnd: () => setVoiceStatus('idle'),
      });
    }
  };

  // Toggle Speech Recognition
  const handleToggleMic = () => {
    setIsSilenceAutoPaused(false);
    lastAudioTimeRef.current = Date.now();
    setSilenceCountdown(settings.silenceTimeoutSeconds);

    if (voiceStatus === 'listening') {
      speechManager.stop();
      setVoiceStatus('idle');
      addLog('> VOICE_LINK_STANDBY', 'dim');
    } else {
      playWakeChime();
      speechManager.setLanguage(settings.speechRecognitionLang);
      const started = speechManager.start(
        (text, isFinal) => {
          lastAudioTimeRef.current = Date.now();
          if (isFinal) {
            setLiveTranscript(text);
            setInterimTranscript('');
            handleProcessUserCommand(text);
          } else {
            setInterimTranscript(text);
          }
        },
        (listening) => {
          setVoiceStatus(listening ? 'listening' : 'idle');
          if (listening) {
            setIsSilenceAutoPaused(false);
            lastAudioTimeRef.current = Date.now();
            setSilenceCountdown(settings.silenceTimeoutSeconds);
            addLog('> VOICE_RECOGNITION_ARMED', 'cyan');
          }
        },
        (error) => {
          console.warn('Speech manager notice:', error);
        }
      );
      if (started) {
        setVoiceStatus('listening');
      }
    }
  };

  return (
    <div
      className={`relative w-screen h-screen overflow-hidden select-none transition-colors duration-500 ${
        settings.theme === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-[#020617] text-slate-100'
      }`}
    >
      {/* Background WebGL Shader */}
      <AmbientShader
        isListening={voiceStatus === 'listening'}
        isSpeaking={voiceStatus === 'speaking'}
        theme={settings.theme}
        audioAmplitude={audioAmplitude}
        speedMultiplier={settings.ambientShaderSpeed}
      />

      {/* Cyber Scanline Overlay */}
      {settings.scanlinesEnabled && (
        <div className="scanlines fixed inset-0 pointer-events-none z-0 opacity-30" />
      )}

      {/* Push Notifications & System Toasts */}
      <NotificationToaster
        alerts={alerts}
        onDismiss={(id) => setAlerts((prev) => prev.filter((a) => a.id !== id))}
        onClearAll={() => setAlerts([])}
        onRequestBrowserPermission={requestBrowserPushPermission}
        browserPermissionState={browserPermission}
      />

      {/* Main Viewport Router */}
      <main className="relative z-10 w-full h-full">
        {currentMode === 'ambient' && (
          <AmbientHUD
            currentMode={currentMode}
            onSelectMode={setCurrentMode}
            voiceStatus={voiceStatus}
            onToggleMic={handleToggleMic}
            liveTranscript={liveTranscript}
            interimTranscript={interimTranscript}
            logs={logs}
            telemetry={telemetry}
            settings={settings}
            onUpdateSettings={(updated) => setSettings((prev) => ({ ...prev, ...updated }))}
            onExecuteQuickCommand={(cmd) => handleProcessUserCommand(cmd)}
            audioAmplitude={audioAmplitude}
            silenceCountdown={silenceCountdown}
            isSilenceAutoPaused={isSilenceAutoPaused}
            onResetSilenceAutoPaused={() => setIsSilenceAutoPaused(false)}
          />
        )}

        {currentMode === 'automation' && (
          <div className="w-full h-full flex flex-col">
            {/* Top Navigation Bar Header for child screens */}
            <div className="p-3 sm:px-8 border-b border-slate-800 flex justify-between items-center glass-panel bg-slate-900/80 backdrop-blur-xl">
              <button
                onClick={() => {
                  playConfirmBeep();
                  setCurrentMode('ambient');
                }}
                className="px-3.5 py-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold hover:bg-cyan-500/25 hover:border-cyan-400/50 flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(6,182,212,0.15)] cursor-pointer"
              >
                &larr; BACK_TO_AMBIENT_HUD
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    playConfirmBeep();
                    setCurrentMode('chat');
                  }}
                  className="px-3 py-1.5 rounded-lg glass-panel hover:bg-slate-800/80 text-xs font-mono text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-all cursor-pointer"
                >
                  VOICE_CHAT
                </button>
                <button
                  onClick={() => {
                    playConfirmBeep();
                    setCurrentMode('security');
                  }}
                  className="px-3 py-1.5 rounded-lg glass-panel hover:bg-slate-800/80 text-xs font-mono text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-all cursor-pointer"
                >
                  OFFLINE_VAULT
                </button>
                <button
                  onClick={() => {
                    playConfirmBeep();
                    setCurrentMode('settings');
                  }}
                  className="px-3 py-1.5 rounded-lg glass-panel hover:bg-slate-800/80 text-xs font-mono text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-all cursor-pointer"
                >
                  SETTINGS
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <AutonomousBrowser
                activeTask={activeTask}
                onStartTask={(task) => {
                  setActiveTask(task);
                  addLog(`[BROWSER_AUTO] Started task: "${task.title}"`, 'cyan');
                  triggerPushAlert('Autonomous Task Running', `Navigating to ${task.targetUrl}...`);
                }}
                onUpdateTask={(task) => {
                  setActiveTask(task);
                  if (task.status === 'completed') {
                    addLog(`[BROWSER_AUTO] Task completed: "${task.title}"`, 'success');
                    triggerPushAlert('Task Completed', `Harvested structured data for "${task.title}"`);
                  }
                }}
              />
            </div>
          </div>
        )}

        {currentMode === 'chat' && (
          <div className="w-full h-full flex flex-col">
            <div className="p-3 sm:px-8 border-b border-slate-800 flex justify-between items-center glass-panel bg-slate-900/80 backdrop-blur-xl">
              <button
                onClick={() => {
                  playConfirmBeep();
                  setCurrentMode('ambient');
                }}
                className="px-3.5 py-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold hover:bg-cyan-500/25 hover:border-cyan-400/50 flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(6,182,212,0.15)] cursor-pointer"
              >
                &larr; BACK_TO_AMBIENT_HUD
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    playConfirmBeep();
                    setCurrentMode('automation');
                  }}
                  className="px-3 py-1.5 rounded-lg glass-panel hover:bg-slate-800/80 text-xs font-mono text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-all cursor-pointer"
                >
                  BROWSER_AUTO
                </button>
                <button
                  onClick={() => {
                    playConfirmBeep();
                    setCurrentMode('security');
                  }}
                  className="px-3 py-1.5 rounded-lg glass-panel hover:bg-slate-800/80 text-xs font-mono text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-all cursor-pointer"
                >
                  OFFLINE_VAULT
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <VoiceChatConsole
                messages={messages}
                onSendMessage={handleProcessUserCommand}
                voiceStatus={voiceStatus}
                onToggleMic={handleToggleMic}
                liveTranscript={liveTranscript}
                interimTranscript={interimTranscript}
                onClearHistory={() => setMessages([])}
                confidentialMode={settings.strictOfflineOnly || profile.strictLocalProcessing}
                silenceCountdown={silenceCountdown}
                isSilenceAutoPaused={isSilenceAutoPaused}
              />
            </div>
          </div>
        )}

        {currentMode === 'security' && (
          <div className="w-full h-full flex flex-col">
            <div className="p-3 sm:px-8 border-b border-slate-800 flex justify-between items-center glass-panel bg-slate-900/80 backdrop-blur-xl">
              <button
                onClick={() => {
                  playConfirmBeep();
                  setCurrentMode('ambient');
                }}
                className="px-3.5 py-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold hover:bg-cyan-500/25 hover:border-cyan-400/50 flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(6,182,212,0.15)] cursor-pointer"
              >
                &larr; BACK_TO_AMBIENT_HUD
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    playConfirmBeep();
                    setCurrentMode('automation');
                  }}
                  className="px-3 py-1.5 rounded-lg glass-panel hover:bg-slate-800/80 text-xs font-mono text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-all cursor-pointer"
                >
                  BROWSER_AUTO
                </button>
                <button
                  onClick={() => {
                    playConfirmBeep();
                    setCurrentMode('chat');
                  }}
                  className="px-3 py-1.5 rounded-lg glass-panel hover:bg-slate-800/80 text-xs font-mono text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-all cursor-pointer"
                >
                  VOICE_CHAT
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <PrivacySecurityVault
                strictOffline={settings.strictOfflineOnly}
                onToggleStrictOffline={(val) =>
                  setSettings((prev) => ({ ...prev, strictOfflineOnly: val }))
                }
                onLogMessage={(msg, type) => addLog(msg, type)}
              />
            </div>
          </div>
        )}

        {currentMode === 'profile' && (
          <div className="w-full h-full flex flex-col">
            <div className="p-3 sm:px-8 border-b border-slate-800 flex justify-between items-center glass-panel bg-slate-900/80 backdrop-blur-xl">
              <button
                onClick={() => {
                  playConfirmBeep();
                  setCurrentMode('ambient');
                }}
                className="px-3.5 py-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold hover:bg-cyan-500/25 hover:border-cyan-400/50 flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(6,182,212,0.15)] cursor-pointer"
              >
                &larr; BACK_TO_AMBIENT_HUD
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <UserProfileModal
                profile={profile}
                onUpdateProfile={(updated) => setProfile((prev) => ({ ...prev, ...updated }))}
              />
            </div>
          </div>
        )}

        {currentMode === 'settings' && (
          <div className="w-full h-full flex flex-col">
            <div className="p-3 sm:px-8 border-b border-slate-800 flex justify-between items-center glass-panel bg-slate-900/80 backdrop-blur-xl">
              <button
                onClick={() => {
                  playConfirmBeep();
                  setCurrentMode('ambient');
                }}
                className="px-3.5 py-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold hover:bg-cyan-500/25 hover:border-cyan-400/50 flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(6,182,212,0.15)] cursor-pointer"
              >
                &larr; BACK_TO_AMBIENT_HUD
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <SettingsDashboard
                settings={settings}
                onUpdateSettings={(updated) => setSettings((prev) => ({ ...prev, ...updated }))}
                onTriggerTestPush={() =>
                  triggerPushAlert(
                    'Push Alert Test',
                    'Aetheris autonomous notification subsystem functioning nominally.'
                  )
                }
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
