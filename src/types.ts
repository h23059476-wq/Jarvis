export type ScreenMode = 'ambient' | 'automation' | 'chat' | 'security' | 'profile' | 'settings';

export type VoiceStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'muted' | 'offline_ready';

export interface LogEntry {
  id: string;
  timestamp: string;
  text: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'cyan' | 'dim';
  highlight?: boolean;
}

export interface TelemetryData {
  cpuUsage: number;
  memoryUsage: number;
  networkLatency: number;
  powerSource: 'AC' | 'BATTERY';
  batteryLevel: number;
  encryptionBit: 4096 | 2048;
  offlinePacketsBlocked: number;
  privacyScore: number;
  activeLanguage: string;
  speechModel: string;
}

export interface AutomationStep {
  id: string;
  action: 'navigate' | 'type' | 'click' | 'extract' | 'wait' | 'summarize' | 'screenshot' | 'download';
  target: string;
  value?: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: string;
  durationMs?: number;
}

export interface AutomationTask {
  id: string;
  title: string;
  category: 'research' | 'shopping' | 'booking' | 'finance' | 'productivity' | 'coding';
  targetUrl: string;
  status: 'idle' | 'running' | 'completed' | 'paused' | 'failed';
  steps: AutomationStep[];
  currentStepIndex: number;
  extractedData?: {
    summary: string;
    metrics?: Array<{ label: string; value: string; trend?: string }>;
    rawJson?: any;
    screenshotUrl?: string;
  };
  createdAt: string;
  completedAt?: string;
  autonomousLog: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  language?: string;
  audioUrl?: string;
  processingMode?: 'GEMINI_CLOUD' | 'OFFLINE_CONFIDENTIAL' | 'LOCAL_HYBRID';
  latencyMs?: number;
  automationPlan?: {
    title: string;
    targetUrl: string;
    stepCount: number;
  };
  redactedPiiCount?: number;
}

export interface EncryptedVaultItem {
  id: string;
  title: string;
  category: 'credential' | 'note' | 'token' | 'pii_mask' | 'browser_cookie';
  encryptedValue: string;
  decryptedValue?: string;
  createdAt: string;
  isLocked: boolean;
}

export interface UserProfileData {
  name: string;
  callsign: string;
  biometricId: string;
  voiceprintMatched: boolean;
  clearanceLevel: 'LEVEL_1' | 'LEVEL_3' | 'LEVEL_5_SENTIENT';
  voiceSampleCount: number;
  autoApproveLowRiskActions: boolean;
  strictLocalProcessing: boolean;
  preferredLanguage: string;
  wakeWords: string[];
}

export interface SystemSettingsData {
  theme: 'dark' | 'light' | 'neon' | 'cyber';
  wakeWordEnabled: boolean;
  wakeWord: string;
  speechRecognitionLang: string;
  voicePersona: 'Zephyr' | 'Kore' | 'Puck' | 'Fenrir' | 'CyberVocoder';
  speechRate: number;
  speechPitch: number;
  soundEffectsVolume: number;
  autoExecuteBrowserTasks: boolean;
  browserSimulationSpeed: number; // ms per step
  strictOfflineOnly: boolean;
  autoRedactPII: boolean;
  pushNotificationsEnabled: boolean;
  scanlinesEnabled: boolean;
  ambientShaderSpeed: number;
  autoSilenceDetectionEnabled: boolean;
  silenceTimeoutSeconds: number;
  silenceThresholdPercent: number;
}

export interface PushAlert {
  id: string;
  title: string;
  message: string;
  type: 'task_complete' | 'security_warning' | 'voice_alert' | 'system_info';
  timestamp: string;
  read: boolean;
}
