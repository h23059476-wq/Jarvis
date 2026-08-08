import React from 'react';
import { PushAlert } from '../types';
import { Bell, CheckCircle2, AlertTriangle, Mic, Info, X, ShieldCheck } from 'lucide-react';
import { playAlertChime } from '../utils/audio';

interface NotificationToasterProps {
  alerts: PushAlert[];
  onDismiss: (id: string) => void;
  onClearAll: () => void;
  onRequestBrowserPermission?: () => void;
  browserPermissionState?: NotificationPermission;
}

export const NotificationToaster: React.FC<NotificationToasterProps> = ({
  alerts,
  onDismiss,
  onClearAll,
  onRequestBrowserPermission,
  browserPermissionState,
}) => {
  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-auto">
      <div className="flex items-center justify-between px-3 py-1 bg-surface-container-high/70 backdrop-blur-md rounded border border-outline-variant/30 text-xs">
        <div className="flex items-center gap-2 text-primary-fixed-dim font-label-caps">
          <Bell className="w-3.5 h-3.5" />
          <span>SYSTEM_ALERTS ({alerts.length})</span>
        </div>
        <div className="flex items-center gap-2">
          {browserPermissionState !== 'granted' && onRequestBrowserPermission && (
            <button
              onClick={onRequestBrowserPermission}
              className="text-[10px] text-primary-fixed hover:underline bg-primary-fixed-dim/20 px-1.5 py-0.5 rounded font-data-mono"
            >
              Enable OS Push
            </button>
          )}
          <button
            onClick={onClearAll}
            className="text-[10px] text-on-surface-variant hover:text-on-surface font-data-mono"
          >
            CLEAR_ALL
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {alerts.slice(0, 4).map((alert) => {
          return (
            <div
              key={alert.id}
              className="glass-panel p-3 rounded-lg border-l-4 border-l-primary-fixed-dim bg-surface-container-high/80 backdrop-blur-xl shadow-2xl flex items-start justify-between gap-3 animate-slide-in text-on-surface"
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 text-primary-fixed-dim">
                  {alert.type === 'task_complete' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : alert.type === 'security_warning' ? (
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  ) : alert.type === 'voice_alert' ? (
                    <Mic className="w-4 h-4 text-purple-400" />
                  ) : (
                    <Info className="w-4 h-4 text-primary-fixed-dim" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-headline-md font-semibold text-primary">
                    {alert.title}
                  </div>
                  <div className="text-[12px] text-on-surface-variant leading-relaxed mt-0.5">
                    {alert.message}
                  </div>
                  <div className="text-[10px] font-data-mono text-outline mt-1 opacity-70">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <button
                onClick={() => onDismiss(alert.id)}
                className="text-on-surface-variant hover:text-on-surface p-0.5 rounded hover:bg-white/10"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
