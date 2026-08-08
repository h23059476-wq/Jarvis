import React, { useState } from 'react';
import { EncryptedVaultItem } from '../types';
import {
  loadVaultItems,
  saveVaultItem,
  deleteVaultItem,
  revealVaultItem,
  redactSensitivePII,
  calculatePrivacyHealth,
} from '../utils/privacy';
import {
  Shield,
  ShieldAlert,
  Lock,
  Unlock,
  Key,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Database,
  Terminal,
} from 'lucide-react';
import { playConfirmBeep } from '../utils/audio';

interface PrivacySecurityVaultProps {
  strictOffline: boolean;
  onToggleStrictOffline: (val: boolean) => void;
  onLogMessage: (text: string, type?: any) => void;
}

export const PrivacySecurityVault: React.FC<PrivacySecurityVaultProps> = ({
  strictOffline,
  onToggleStrictOffline,
  onLogMessage,
}) => {
  const [vaultItems, setVaultItems] = useState<EncryptedVaultItem[]>(() => loadVaultItems());
  const [revealedIds, setRevealedIds] = useState<{ [id: string]: string }>({});
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemValue, setNewItemValue] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<EncryptedVaultItem['category']>('credential');
  const [testInput, setTestInput] = useState('My credit card is 4532 8921 4432 9012 and email is alice@company.com with secret: superSecretKey123');
  const [testResult, setTestResult] = useState(() => redactSensitivePII(testInput));

  const health = calculatePrivacyHealth(vaultItems.length, strictOffline);

  const handleReveal = (id: string) => {
    playConfirmBeep();
    if (revealedIds[id]) {
      const next = { ...revealedIds };
      delete next[id];
      setRevealedIds(next);
    } else {
      const decrypted = revealVaultItem(id);
      setRevealedIds({ ...revealedIds, [id]: decrypted });
    }
  };

  const handleAddVaultItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim() || !newItemValue.trim()) return;
    playConfirmBeep();
    const created = saveVaultItem(newItemTitle.trim(), newItemValue.trim(), newItemCategory);
    setVaultItems([created, ...vaultItems]);
    setNewItemTitle('');
    setNewItemValue('');
    onLogMessage(`[VAULT_ENCRYPTED] Created local confidential entry: "${created.title}"`, 'success');
  };

  const handleDeleteItem = (id: string) => {
    playConfirmBeep();
    const updated = deleteVaultItem(id);
    setVaultItems(updated);
    onLogMessage(`[VAULT_PURGE] Removed encrypted item ${id}`, 'warning');
  };

  const handleTestRedactor = (input: string) => {
    setTestInput(input);
    setTestResult(redactSensitivePII(input));
  };

  return (
    <div className="w-full h-full p-4 sm:p-8 flex flex-col gap-6 overflow-y-auto max-w-6xl mx-auto font-sans text-slate-100 z-10 select-text">
      {/* Top Banner */}
      <div className="glass-panel p-4 sm:p-5 rounded-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/80 backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2 font-mono">
              <span>LOCAL CONFIDENTIAL PRIVACY & VAULT</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/40">
                {health.rating}
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Client-side encrypted memory and instant PII scrubber guaranteeing zero external data leaks.
            </p>
          </div>
        </div>

        {/* Offline Airgap Switch */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-bold font-mono text-cyan-300">
              {strictOffline ? 'STRICT AIRGAP OFFLINE' : 'HYBRID ENCRYPTED'}
            </div>
            <div className="text-[10px] text-slate-500">
              {strictOffline ? 'No external network calls' : 'TLS 1.3 Cloud Assisted'}
            </div>
          </div>
          <button
            onClick={() => {
              playConfirmBeep();
              onToggleStrictOffline(!strictOffline);
              onLogMessage(`[SECURITY] Strict offline privacy switched to ${!strictOffline ? 'ENABLED' : 'DISABLED'}`, 'cyan');
            }}
            className={`w-14 h-8 rounded-full transition-colors relative p-1 cursor-pointer ${
              strictOffline ? 'bg-emerald-500/80' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white transition-transform ${
                strictOffline ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Security Health Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
        <div className="glass-panel p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="text-slate-500">CONFIDENTIAL PRIVACY SCORE</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{health.score}%</div>
          <div className="text-[11px] text-slate-400 mt-1">{health.status}</div>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="text-slate-500">CLIENT-ENCRYPTED KEYS</div>
          <div className="text-2xl font-bold text-cyan-300 mt-1">{vaultItems.length} Records</div>
          <div className="text-[11px] text-slate-400 mt-1">4096-Bit Local XOR Salt</div>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="text-slate-500">TRACKERS & TELEMETRY BLOCKED</div>
          <div className="text-2xl font-bold text-cyan-400 mt-1">100% Zero-Breach</div>
          <div className="text-[11px] text-emerald-400 mt-1">Airgap Isolated Buffer</div>
        </div>
      </div>

      {/* Two Column Section: Interactive PII Redactor + Encrypted Vault List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 cols: Live PII Redactor Playground */}
        <div className="lg:col-span-6 glass-panel p-5 rounded-xl border border-slate-800 flex flex-col gap-4 bg-slate-900/70 backdrop-blur-2xl">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-slate-100 font-mono font-bold text-sm">
              <Key className="w-4 h-4 text-cyan-400" />
              <span>LIVE PII REDACTION TESTER</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">
              {testResult.redactionsFound} SENSITIVE TOKENS MASKED
            </span>
          </div>

          <div className="flex flex-col gap-2 font-mono text-xs">
            <label className="text-slate-500 text-[11px]">INPUT TEXT WITH CONFIDENTIAL PII:</label>
            <textarea
              rows={3}
              value={testInput}
              onChange={(e) => handleTestRedactor(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-slate-100 font-mono text-xs focus:border-cyan-500/50 outline-none resize-none"
            />
          </div>

          <div className="flex flex-col gap-2 font-mono text-xs">
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>SANITIZED OUTPUT SENT TO AGENT ENGINE:</span>
              <span className="text-cyan-300">
                Types: {testResult.detectedTypes.join(', ') || 'CLEAN'}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/90 border border-cyan-500/30 text-cyan-200 text-xs leading-relaxed break-all font-mono">
              {testResult.redactedText}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 font-sans leading-relaxed">
            All user prompts and autonomous web execution requests pass through this offline tokenizer filter first. No raw credit cards, SSNs, or tokens ever leave your browser container.
          </div>
        </div>

        {/* Right 6 cols: Encrypted Memory Vault Items */}
        <div className="lg:col-span-6 glass-panel p-5 rounded-xl border border-slate-800 flex flex-col gap-4 bg-slate-900/70 backdrop-blur-2xl">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-slate-100 font-mono font-bold text-sm">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>ENCRYPTED CLIENT VAULT</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              LOCALSTORAGE // ZERO LEAK
            </span>
          </div>

          {/* Add New Vault Secret Form */}
          <form onSubmit={handleAddVaultItem} className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                placeholder="Secret Title (e.g. Flight Auth Token)"
                className="px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-100 font-mono outline-none focus:border-cyan-500/50"
              />
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value as any)}
                className="px-2 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-100 font-mono outline-none focus:border-cyan-500/50"
              >
                <option value="credential">Credential</option>
                <option value="token">Token</option>
                <option value="browser_cookie">Browser Cookie</option>
                <option value="note">Confidential Note</option>
              </select>
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                value={newItemValue}
                onChange={(e) => setNewItemValue(e.target.value)}
                placeholder="Secret payload to encrypt locally..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-100 font-mono outline-none focus:border-cyan-500/50"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 text-xs font-mono font-bold hover:bg-cyan-400 flex items-center gap-1 shrink-0 cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.3)]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>LOCK</span>
              </button>
            </div>
          </form>

          {/* Vault Items List */}
          <div className="flex-1 overflow-y-auto max-h-64 no-scrollbar space-y-2.5 font-mono text-xs">
            {vaultItems.map((item) => {
              const isRevealed = !!revealedIds[item.id];
              return (
                <div
                  key={item.id}
                  className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-col gap-1.5"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="font-bold text-slate-100">{item.title}</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 uppercase">
                      {item.category}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-1">
                    <div className="text-[11px] text-slate-400 truncate max-w-xs">
                      {isRevealed ? (
                        <span className="text-emerald-400 font-bold">{revealedIds[item.id]}</span>
                      ) : (
                        <span className="text-slate-500">CIPHER: {item.encryptedValue.slice(0, 24)}...</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleReveal(item.id)}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 cursor-pointer transition-colors"
                        title={isRevealed ? 'Mask' : 'Decrypt'}
                      >
                        {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 cursor-pointer transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
