import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, VoiceStatus } from '../types';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  Copy,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  Zap,
  Globe,
  Trash2,
} from 'lucide-react';
import { speakText, stopSpeaking, playConfirmBeep, playWakeChime } from '../utils/audio';

interface VoiceChatConsoleProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  voiceStatus: VoiceStatus;
  onToggleMic: () => void;
  liveTranscript: string;
  interimTranscript: string;
  onClearHistory: () => void;
  confidentialMode: boolean;
  silenceCountdown?: number;
  isSilenceAutoPaused?: boolean;
}

export const VoiceChatConsole: React.FC<VoiceChatConsoleProps> = ({
  messages,
  onSendMessage,
  voiceStatus,
  onToggleMic,
  liveTranscript,
  interimTranscript,
  onClearHistory,
  confidentialMode,
  silenceCountdown = 5,
  isSilenceAutoPaused = false,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, liveTranscript, interimTranscript]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    playConfirmBeep();
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleReplayAudio = (text: string) => {
    playConfirmBeep();
    speakText(text);
  };

  const isListening = voiceStatus === 'listening';

  return (
    <div className="w-full h-full p-4 sm:p-8 flex flex-col justify-between max-w-5xl mx-auto font-sans text-slate-100 z-10 select-text">
      {/* Top Console Header */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex justify-between items-center bg-slate-900/80 backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-cyan-300">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2 font-mono">
              <span>NEURAL VOICE CONSOLE</span>
              {confidentialMode ? (
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono">
                  LOCAL_AIRGAP_ENCRYPTED
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-mono">
                  GEMINI_3.6_FLASH_REASONING
                </span>
              )}
              {isListening && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400 font-mono animate-pulse">
                  AUTO_SILENCE: {silenceCountdown}s
                </span>
              )}
              {isSilenceAutoPaused && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40 font-mono">
                  AUTO_PAUSED (SAVED_CPU)
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-400">
              Multilingual real-time speech engine with context-aware command automation.
            </p>
          </div>
        </div>

        <button
          onClick={onClearHistory}
          className="p-2 rounded-lg glass-panel hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/40 transition-colors cursor-pointer"
          title="Purge Conversation History"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-2 no-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-75">
            <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-3">
              <Mic className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="font-mono font-semibold text-slate-100 text-base">
              Aetheris Neural Link Standing By
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Speak naturally or type. Supports autonomous web execution, confidential notes, flight checks, and system diagnostics.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-cyan-400" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-xl p-4 shadow-xl border ${
                    isUser
                      ? 'bg-cyan-500/20 border-cyan-500/40 text-slate-100'
                      : 'bg-slate-900/80 border-slate-800 text-slate-100 backdrop-blur-xl'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 pb-1.5 border-b border-slate-800 text-[10px] font-mono text-slate-400">
                    <span>{isUser ? 'USER_VOICE_STREAM' : 'AETHERIS_INTELLIGENCE'}</span>
                    <div className="flex items-center gap-2">
                      {msg.processingMode && (
                        <span className="text-cyan-300">{msg.processingMode}</span>
                      )}
                      {msg.latencyMs && <span>{msg.latencyMs}ms</span>}
                      <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed mt-2 whitespace-pre-wrap font-sans">
                    {msg.text}
                  </p>

                  {/* Automation Plan Card if triggered */}
                  {msg.automationPlan && (
                    <div className="mt-3 p-2.5 rounded-lg bg-slate-950/80 border border-cyan-500/30 font-mono text-xs flex justify-between items-center">
                      <div>
                        <div className="text-cyan-300 font-bold">
                          [TASK_TRIGGERED: {msg.automationPlan.title}]
                        </div>
                        <div className="text-slate-500 text-[10px]">
                          Target Portal: {msg.automationPlan.targetUrl}
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                        {msg.automationPlan.stepCount} STEPS
                      </span>
                    </div>
                  )}

                  {/* Message Action Tools */}
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReplayAudio(msg.text)}
                        className="hover:text-cyan-300 flex items-center gap-1 p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Vocalize response via TTS"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>SPEAK</span>
                      </button>
                      <button
                        onClick={() => navigator.clipboard.writeText(msg.text)}
                        className="hover:text-cyan-300 flex items-center gap-1 p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Copy text"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>COPY</span>
                      </button>
                    </div>
                    {msg.redactedPiiCount ? (
                      <span className="text-emerald-400 text-[10px] flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        {msg.redactedPiiCount} PII Redacted
                      </span>
                    ) : null}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4 text-slate-200" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Interim Voice Typing Bubble */}
        {(liveTranscript || interimTranscript) && (
          <div className="flex justify-end gap-3 animate-pulse">
            <div className="max-w-xl rounded-xl p-3.5 bg-cyan-500/15 border border-cyan-500/50 text-cyan-200 text-sm font-mono">
              <span className="text-[10px] text-cyan-400 block mb-1">
                STREAMING AUDIO ACOUSTICS...
              </span>
              "{liveTranscript || interimTranscript}"
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Area */}
      <form
        onSubmit={handleSubmit}
        className="glass-panel p-2.5 sm:p-3.5 rounded-xl border border-slate-800 flex items-center gap-2 sm:gap-3 bg-slate-900/80 backdrop-blur-2xl"
      >
        <button
          type="button"
          onClick={() => {
            playWakeChime();
            onToggleMic();
          }}
          className={`p-3 rounded-lg transition-all shrink-0 cursor-pointer ${
            isListening
              ? 'bg-cyan-500/40 text-cyan-300 border border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.6)] animate-pulse'
              : 'glass-panel hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-800'
          }`}
          title={isListening ? 'Stop listening' : 'Start Speech Recognition'}
        >
          {isListening ? <Mic className="w-5 h-5 text-cyan-300" /> : <Mic className="w-5 h-5" />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Speak or type a command for Aetheris (e.g. 'Search flights to Tokyo', 'Explain quantum computing')..."
          className="flex-1 bg-transparent text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 outline-none font-sans"
        />

        <button
          type="submit"
          className="px-4 py-2.5 rounded-lg bg-cyan-500 text-slate-950 font-mono text-xs font-bold hover:bg-cyan-400 transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.3)]"
        >
          <span>SEND</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
