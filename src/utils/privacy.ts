// Local Confidential Data & Privacy Engine for Aetheris OS

import { EncryptedVaultItem } from '../types';

// 1. PII Masking and Data Redaction Engine
export interface RedactionResult {
  redactedText: string;
  redactionsFound: number;
  detectedTypes: string[];
}

export function redactSensitivePII(input: string): RedactionResult {
  let text = input;
  let count = 0;
  const types: Set<string> = new Set();

  // Credit Card Numbers
  const ccRegex = /\b(?:\d{4}[ -]?){3}\d{4}\b/g;
  if (ccRegex.test(text)) {
    types.add('CREDIT_CARD');
    text = text.replace(ccRegex, (match) => {
      count++;
      return `[REDACTED_CARD_****${match.slice(-4)}]`;
    });
  }

  // Social Security Numbers (SSN)
  const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/g;
  if (ssnRegex.test(text)) {
    types.add('SSN');
    text = text.replace(ssnRegex, () => {
      count++;
      return '[REDACTED_SSN_***-**-****]';
    });
  }

  // Passwords & Secret Keys
  const secretRegex = /\b(?:password|secret|key|api_key|token|bearer)\s*[:=]\s*([^\s,;]+)/gi;
  if (secretRegex.test(text)) {
    types.add('CREDENTIALS');
    text = text.replace(secretRegex, (match, val) => {
      count++;
      return match.replace(val, '[REDACTED_CONFIDENTIAL_KEY]');
    });
  }

  // Email Addresses
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  if (emailRegex.test(text)) {
    types.add('EMAIL');
    text = text.replace(emailRegex, (match) => {
      count++;
      const parts = match.split('@');
      return `[REDACTED_${parts[0].slice(0, 2)}***@${parts[1]}]`;
    });
  }

  // Phone Numbers
  const phoneRegex = /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
  if (phoneRegex.test(text)) {
    types.add('PHONE');
    text = text.replace(phoneRegex, () => {
      count++;
      return '[REDACTED_PHONE_***-***-****]';
    });
  }

  return {
    redactedText: text,
    redactionsFound: count,
    detectedTypes: Array.from(types),
  };
}

// 2. Client-Side Encrypted Memory Vault
const VAULT_STORAGE_KEY = 'aetheris_confidential_vault_v1';
const VAULT_SECRET_SALT = 'AETHERIS_LOCAL_4096_OFFLINE_SECRET_KEY';

function simpleEncrypt(text: string, key: string = VAULT_SECRET_SALT): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(unescape(encodeURIComponent(result)));
}

function simpleDecrypt(cipher: string, key: string = VAULT_SECRET_SALT): string {
  try {
    const raw = decodeURIComponent(escape(atob(cipher)));
    let result = '';
    for (let i = 0; i < raw.length; i++) {
      result += String.fromCharCode(raw.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  } catch (e) {
    return '[ENCRYPTION_CORRUPT]';
  }
}

export function loadVaultItems(): EncryptedVaultItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(VAULT_STORAGE_KEY);
    if (!raw) {
      // Initialize with default demo secure items
      const initial: EncryptedVaultItem[] = [
        {
          id: 'v-1',
          title: 'Google Flights Session Cookie & Passport ID',
          category: 'browser_cookie',
          encryptedValue: simpleEncrypt('ID# 9482-A721 // EXP: 2030 // CONFIDENTIAL'),
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          isLocked: true,
        },
        {
          id: 'v-2',
          title: 'Autonomous Payment Vault Token (Stripe / Bank)',
          category: 'token',
          encryptedValue: simpleEncrypt('tok_offline_virtual_secure_9921'),
          createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
          isLocked: true,
        },
        {
          id: 'v-3',
          title: 'ArXiv & GitHub Personal Access Token',
          category: 'credential',
          encryptedValue: simpleEncrypt('ghp_local_confidential_automation_agent_key'),
          createdAt: new Date().toISOString(),
          isLocked: true,
        },
      ];
      localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveVaultItem(title: string, value: string, category: EncryptedVaultItem['category']): EncryptedVaultItem {
  const current = loadVaultItems();
  const newItem: EncryptedVaultItem = {
    id: `v-${Date.now()}`,
    title,
    category,
    encryptedValue: simpleEncrypt(value),
    createdAt: new Date().toISOString(),
    isLocked: true,
  };
  const updated = [newItem, ...current];
  localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(updated));
  return newItem;
}

export function deleteVaultItem(id: string): EncryptedVaultItem[] {
  const current = loadVaultItems().filter((item) => item.id !== id);
  localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(current));
  return current;
}

export function revealVaultItem(id: string): string {
  const item = loadVaultItems().find((v) => v.id === id);
  if (!item) return '';
  return simpleDecrypt(item.encryptedValue);
}

// 3. Privacy Audit Telemetry
export function calculatePrivacyHealth(itemsCount: number, strictOffline: boolean): { score: number; rating: string; status: string } {
  let score = 92;
  if (strictOffline) score += 7;
  if (itemsCount > 0) score += 1;
  score = Math.min(100, score);

  return {
    score,
    rating: score >= 98 ? 'MILITARY_AIRGAP' : score >= 90 ? 'ENTERPRISE_SECURE' : 'STANDARD',
    status: strictOffline ? 'ZERO_EXTERNAL_LEAK_ACTIVE' : 'HYBRID_SECURE_TUNNEL',
  };
}
