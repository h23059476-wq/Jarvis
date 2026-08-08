import React, { useState } from 'react';
import { UserProfileData } from '../types';
import {
  User,
  ShieldCheck,
  Mic,
  Key,
  Award,
  Sliders,
  CheckCircle2,
  Lock,
  Volume2,
  Sparkles,
} from 'lucide-react';
import { playConfirmBeep } from '../utils/audio';

interface UserProfileModalProps {
  profile: UserProfileData;
  onUpdateProfile: (updated: Partial<UserProfileData>) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  profile,
  onUpdateProfile,
}) => {
  const [callsign, setCallsign] = useState(profile.callsign);
  const [name, setName] = useState(profile.name);
  const [preferredLang, setPreferredLang] = useState(profile.preferredLanguage);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    playConfirmBeep();
    onUpdateProfile({ callsign, name, preferredLanguage: preferredLang });
  };

  return (
    <div className="w-full h-full p-4 sm:p-8 flex flex-col gap-6 overflow-y-auto max-w-4xl mx-auto font-sans text-slate-100 z-10 select-text">
      {/* Top Banner */}
      <div className="glass-panel p-5 rounded-xl border border-slate-800 flex justify-between items-center bg-slate-900/80 backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-300 font-bold text-xl font-mono">
            {callsign.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2 font-mono">
              <span>{callsign}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-400/40 text-cyan-300 font-mono">
                {profile.clearanceLevel}
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Biometric Voiceprint ID: <span className="font-mono text-cyan-300">{profile.biometricId}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 glass-panel px-3 py-1.5 rounded-lg border border-emerald-500/30 text-emerald-400 font-mono text-xs">
          <ShieldCheck className="w-4 h-4" />
          <span>VOICEPRINT_MATCHED</span>
        </div>
      </div>

      {/* Voice Biometric Waveform Card */}
      <div className="glass-panel p-5 rounded-xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl flex flex-col gap-4 font-mono text-xs">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-slate-100 font-bold">
            <Mic className="w-4 h-4 text-cyan-400" />
            <span>BIOMETRIC ACOUSTIC SIGNATURE</span>
          </div>
          <span className="text-slate-500 text-[11px]">{profile.voiceSampleCount} CALIBRATED SAMPLES</span>
        </div>

        {/* Visual Simulated Harmonic Spectrum Bars */}
        <div className="h-16 flex items-center justify-between gap-1 px-4 py-2 rounded-lg bg-slate-950/80 border border-cyan-500/20">
          {Array.from({ length: 32 }).map((_, i) => {
            const h = 20 + Math.sin(i * 0.4) * 15 + Math.cos(i * 0.8) * 12;
            return (
              <div
                key={i}
                className="w-1.5 rounded-full bg-cyan-400/80 transition-all duration-300 hover:bg-cyan-300"
                style={{ height: `${h}px` }}
              />
            );
          })}
        </div>
      </div>

      {/* Profile Form & Permissions */}
      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-5 rounded-xl border border-slate-800 bg-slate-900/70 flex flex-col gap-4 text-xs font-mono">
          <div className="text-slate-100 font-bold text-sm">USER IDENTITY CONFIG</div>

          <div>
            <label className="text-slate-500 text-[11px] block mb-1">OPERATOR CALLSIGN</label>
            <input
              type="text"
              value={callsign}
              onChange={(e) => setCallsign(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-100 outline-none focus:border-cyan-500/50"
            />
          </div>

          <div>
            <label className="text-slate-500 text-[11px] block mb-1">REAL NAME</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-100 outline-none focus:border-cyan-500/50"
            />
          </div>

          <div>
            <label className="text-slate-500 text-[11px] block mb-1">PREFERRED VOICE LANGUAGE</label>
            <select
              value={preferredLang}
              onChange={(e) => setPreferredLang(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-100 outline-none focus:border-cyan-500/50"
            >
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="es-ES">Spanish (Español)</option>
              <option value="fr-FR">French (Français)</option>
              <option value="de-DE">German (Deutsch)</option>
              <option value="ja-JP">Japanese (日本語)</option>
              <option value="zh-CN">Chinese (中文)</option>
              <option value="hi-IN">Hindi (हिन्दी)</option>
              <option value="ar-SA">Arabic (العربية)</option>
              <option value="pt-BR">Portuguese (Português)</option>
            </select>
          </div>

          <button
            type="submit"
            className="mt-2 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-colors cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.3)]"
          >
            SAVE_PROFILE
          </button>
        </div>

        {/* Autonomous Permissions Card */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 bg-slate-900/70 flex flex-col gap-4 text-xs font-mono">
          <div className="text-slate-100 font-bold text-sm">AUTONOMOUS AGENT PERMISSIONS</div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div>
              <div className="text-slate-200 font-semibold">AUTO-APPROVE LOW-RISK WEB ACTIONS</div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Automatically navigates, scrapes, and searches without confirmation.
              </div>
            </div>
            <input
              type="checkbox"
              checked={profile.autoApproveLowRiskActions}
              onChange={(e) =>
                onUpdateProfile({ autoApproveLowRiskActions: e.target.checked })
              }
              className="w-4 h-4 accent-cyan-400 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div>
              <div className="text-slate-200 font-semibold">STRICT LOCAL ONLY PROCESSING</div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Forbids any external model calls; limits AI to browser offline rules.
              </div>
            </div>
            <input
              type="checkbox"
              checked={profile.strictLocalProcessing}
              onChange={(e) =>
                onUpdateProfile({ strictLocalProcessing: e.target.checked })
              }
              className="w-4 h-4 accent-cyan-400 cursor-pointer"
            />
          </div>

          <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-cyan-200">
            Security Clearance Level: <strong>Level 5 (Sentient Full Agent Control)</strong>. Autonomous browser actions are sandboxed within the secure container.
          </div>
        </div>
      </form>
    </div>
  );
};
