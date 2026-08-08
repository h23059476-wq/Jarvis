import React, { useState, useEffect } from 'react';
import { AutomationTask, AutomationStep } from '../types';
import { PRESET_AUTOMATION_TEMPLATES, createCustomAutomationTask } from '../utils/automationEngine';
import {
  Globe,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Download,
  Terminal,
  Search,
  Lock,
  Layers,
  MousePointer,
  ChevronRight,
  FileCode,
  ShieldCheck,
} from 'lucide-react';
import { playConfirmBeep, playStepClick } from '../utils/audio';

interface AutonomousBrowserProps {
  activeTask: AutomationTask | null;
  onStartTask: (task: AutomationTask) => void;
  onUpdateTask: (task: AutomationTask) => void;
  onVoiceTriggerPrompt?: (prompt: string) => void;
}

export const AutonomousBrowser: React.FC<AutonomousBrowserProps> = ({
  activeTask,
  onStartTask,
  onUpdateTask,
}) => {
  const [currentTask, setCurrentTask] = useState<AutomationTask>(() => {
    return (
      activeTask || {
        ...PRESET_AUTOMATION_TEMPLATES[0],
        id: 'task-arxiv-default',
        status: 'idle',
        currentStepIndex: 0,
        createdAt: new Date().toISOString(),
        autonomousLog: ['[SYS] Autonomous Web Automation Workspace initialized.'],
      }
    );
  });

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 30, y: 40 });
  const [cursorVisible, setCursorVisible] = useState<boolean>(false);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number>(0);
  const [executionSpeed, setExecutionSpeed] = useState<number>(1000); // ms per step

  useEffect(() => {
    if (activeTask) {
      setCurrentTask(activeTask);
    }
  }, [activeTask]);

  // Automated step-by-step execution simulation
  useEffect(() => {
    let timer: any;
    if (isRunning && currentTask.status === 'running') {
      const stepIdx = currentTask.currentStepIndex;
      if (stepIdx < currentTask.steps.length) {
        // Move simulated cursor
        setCursorVisible(true);
        const randomX = 20 + Math.floor(Math.random() * 60);
        const randomY = 20 + Math.floor(Math.random() * 50);
        setCursorPos({ x: randomX, y: randomY });
        playStepClick();

        timer = setTimeout(() => {
          const updatedSteps = [...currentTask.steps];
          updatedSteps[stepIdx] = {
            ...updatedSteps[stepIdx],
            status: 'completed',
            durationMs: executionSpeed,
          };

          const isLastStep = stepIdx === currentTask.steps.length - 1;
          const nextIndex = stepIdx + 1;

          const updatedTask: AutomationTask = {
            ...currentTask,
            steps: updatedSteps,
            currentStepIndex: nextIndex,
            status: isLastStep ? 'completed' : 'running',
            completedAt: isLastStep ? new Date().toISOString() : undefined,
            autonomousLog: [
              ...currentTask.autonomousLog,
              `[${new Date().toLocaleTimeString()}] STEP_${stepIdx + 1} COMPLETED: ${
                updatedSteps[stepIdx].description
              }`,
            ],
          };

          setCurrentTask(updatedTask);
          onUpdateTask(updatedTask);

          if (isLastStep) {
            setIsRunning(false);
            setCursorVisible(false);
          }
        }, executionSpeed);
      } else {
        setIsRunning(false);
        setCursorVisible(false);
      }
    }

    return () => clearTimeout(timer);
  }, [isRunning, currentTask, executionSpeed]);

  const handleStartTemplate = (index: number) => {
    playConfirmBeep();
    setSelectedTemplateIndex(index);
    const template = PRESET_AUTOMATION_TEMPLATES[index];
    const newTask: AutomationTask = {
      ...template,
      id: `task-${Date.now()}`,
      status: 'idle',
      currentStepIndex: 0,
      createdAt: new Date().toISOString(),
      autonomousLog: [
        `[${new Date().toLocaleTimeString()}] Loaded template: "${template.title}"`,
        `[${new Date().toLocaleTimeString()}] Target portal: ${template.targetUrl}`,
      ],
    };
    setCurrentTask(newTask);
    onStartTask(newTask);
    setIsRunning(true);
    newTask.status = 'running';
  };

  const handleRunCustomPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    playConfirmBeep();
    const newTask = createCustomAutomationTask(customPrompt.trim(), customUrl.trim() || undefined);
    setCurrentTask(newTask);
    onStartTask(newTask);
    setIsRunning(true);
    newTask.status = 'running';
  };

  const handleReset = () => {
    playConfirmBeep();
    setIsRunning(false);
    setCursorVisible(false);
    const resetSteps = currentTask.steps.map((s) => ({
      ...s,
      status: 'pending' as const,
    }));
    const resetTask: AutomationTask = {
      ...currentTask,
      status: 'idle',
      currentStepIndex: 0,
      steps: resetSteps,
      autonomousLog: [
        ...currentTask.autonomousLog,
        `[${new Date().toLocaleTimeString()}] Task reset to initial state.`,
      ],
    };
    setCurrentTask(resetTask);
    onUpdateTask(resetTask);
  };

  const handleDownloadResults = () => {
    playConfirmBeep();
    const jsonStr = JSON.stringify(
      {
        task: currentTask.title,
        url: currentTask.targetUrl,
        completedAt: currentTask.completedAt || new Date().toISOString(),
        extractedData: currentTask.extractedData,
        logs: currentTask.autonomousLog,
      },
      null,
      2
    );
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aetheris-automation-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="w-full h-full p-4 sm:p-8 flex flex-col gap-5 overflow-y-auto font-sans text-slate-100 z-10">
      {/* Top Banner: Autonomous Mode Overview */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/80 backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-cyan-300">
            <Globe className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2 font-mono">
              <span>AUTONOMOUS HANDS-FREE BROWSER</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/40">
                ACTIVE DOM ENGINE
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Execute complex web browsing, flight search, academic research, and shopping autonomously on your behalf.
            </p>
          </div>
        </div>

        {/* Speed and Action Controls */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <div className="flex items-center gap-1 glass-panel px-2.5 py-1 rounded-lg border border-slate-800 text-xs font-mono">
            <span className="text-slate-500 text-[11px]">SPEED:</span>
            <button
              onClick={() => setExecutionSpeed(1500)}
              className={`px-1.5 py-0.5 rounded cursor-pointer ${
                executionSpeed === 1500 ? 'bg-cyan-500/30 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1x
            </button>
            <button
              onClick={() => setExecutionSpeed(800)}
              className={`px-1.5 py-0.5 rounded cursor-pointer ${
                executionSpeed === 800 ? 'bg-cyan-500/30 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2x
            </button>
            <button
              onClick={() => setExecutionSpeed(300)}
              className={`px-1.5 py-0.5 rounded cursor-pointer ${
                executionSpeed === 300 ? 'bg-cyan-500/30 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              TURBO
            </button>
          </div>

          <button
            onClick={() => {
              playConfirmBeep();
              setIsRunning(!isRunning);
              if (!isRunning && currentTask.status === 'idle') {
                const started = { ...currentTask, status: 'running' as const };
                setCurrentTask(started);
                onUpdateTask(started);
              }
            }}
            className={`px-4 py-2 rounded-lg font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              isRunning
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30'
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>PAUSE_TASK</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>RUN_AUTONOMOUS</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-lg glass-panel hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
            title="Reset Workflow"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preset Tasks Gallery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {PRESET_AUTOMATION_TEMPLATES.map((tmpl, idx) => (
          <button
            key={idx}
            onClick={() => handleStartTemplate(idx)}
            className={`glass-panel p-3 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
              selectedTemplateIndex === idx
                ? 'border-cyan-500 bg-cyan-500/15 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                : 'border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900/60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-cyan-300 font-bold uppercase">
                  {tmpl.category}
                </span>
                <span className="text-[10px] font-mono text-slate-500">{tmpl.steps.length} STEPS</span>
              </div>
              <div className="text-xs font-semibold text-slate-100 mt-1 line-clamp-2">{tmpl.title}</div>
            </div>
            <div className="mt-2 text-[10px] font-mono text-slate-400 truncate">
              {tmpl.targetUrl}
            </div>
          </button>
        ))}
      </div>

      {/* Custom Task Prompt Form */}
      <form
        onSubmit={handleRunCustomPrompt}
        className="glass-panel p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center gap-2 bg-slate-900/60"
      >
        <div className="flex items-center gap-2 flex-1 w-full">
          <Search className="w-4 h-4 text-cyan-400 shrink-0 ml-2" />
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Command autonomous task (e.g. 'Search flights from SFO to Paris in October', 'Scrape news on AI chip tech')..."
            className="w-full bg-transparent text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 outline-none font-sans"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="Target URL (Optional)"
            className="w-full sm:w-48 px-2.5 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs font-mono text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-500/50"
          />
          <button
            type="submit"
            className="px-4 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-mono text-xs font-bold hover:bg-cyan-400 transition-colors shrink-0 cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.3)]"
          >
            DISPATCH
          </button>
        </div>
      </form>

      {/* Main Execution Grid: Virtual Browser Viewport + Live Action Steps Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[460px]">
        {/* Left 7 cols: Virtual Browser Viewport */}
        <div className="lg:col-span-7 flex flex-col rounded-xl overflow-hidden border border-slate-800 glass-panel bg-slate-900/80 backdrop-blur-2xl">
          {/* Virtual Browser Top Address Bar */}
          <div className="px-3 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
            </div>

            <div className="flex items-center gap-2 flex-1 max-w-md px-3 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-200 truncate">
              <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="text-cyan-300 truncate">{currentTask.targetUrl}</span>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] hidden sm:inline">SANDBOXED_TLS</span>
            </div>
          </div>

          {/* Virtual Browser Interactive DOM Render Area */}
          <div className="relative flex-1 p-5 overflow-hidden bg-slate-950/80 min-h-[300px] flex flex-col justify-between select-text">
            {/* Simulated Animated Cursor */}
            {cursorVisible && (
              <div
                className="absolute z-30 pointer-events-none transition-all duration-700 ease-out flex items-center gap-1"
                style={{ left: `${cursorPos.x}%`, top: `${cursorPos.y}%` }}
              >
                <MousePointer className="w-5 h-5 text-cyan-400 fill-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,1)]" />
                <span className="text-[9px] font-mono bg-black/80 px-1 py-0.5 rounded text-cyan-300 border border-cyan-400/50">
                  AUTONOMOUS_ACTOR
                </span>
              </div>
            )}

            {/* Render Simulated Website View based on template */}
            <div className="w-full h-full flex flex-col gap-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center font-bold text-xs text-cyan-300 font-mono">
                    A
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-100">{currentTask.title}</div>
                    <div className="text-[10px] font-mono text-slate-500">
                      STATUS: {currentTask.status.toUpperCase()} // STEP {currentTask.currentStepIndex}/{currentTask.steps.length}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono">
                    SECURE_AGENT_SANDBOX
                  </span>
                </div>
              </div>

              {/* Dynamic Mock DOM Component Content */}
              <div className="flex-1 rounded-lg bg-slate-900/60 p-4 border border-slate-800 flex flex-col gap-3 font-mono text-xs">
                {currentTask.category === 'research' && (
                  <div className="space-y-2 text-slate-300">
                    <div className="text-cyan-300 font-bold text-sm flex items-center gap-2">
                      <span>arXiv.org // Recent AI & Quantum Reasoning Submissions</span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800 text-[11px]">
                      <div className="text-cyan-300 font-semibold">[arXiv:2608.01942] Self-Evolving Code Synthesis</div>
                      <div className="text-slate-500 text-[10px] mt-0.5">Authors: Vaswani, Jarvis et al. • Submissions: Aug 2026</div>
                      <div className="text-slate-200 mt-1">Autonomous reasoning model outperforms traditional tokenizers by 34%.</div>
                    </div>
                    <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800 text-[11px]">
                      <div className="text-cyan-300 font-semibold">[arXiv:2608.08311] Zero-Latency Ambient Operating Systems</div>
                      <div className="text-slate-500 text-[10px] mt-0.5">Authors: Aetheris Core Team • DeepMind Robotics</div>
                      <div className="text-slate-200 mt-1">Procedural audio synthesis & client-side encrypted vector memory.</div>
                    </div>
                  </div>
                )}

                {currentTask.category === 'booking' && (
                  <div className="space-y-2 text-slate-300">
                    <div className="text-cyan-300 font-bold text-sm">Google Flights // Roundtrip JFK → HND Tokyo</div>
                    <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                      <div className="p-2 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-bold">
                        <div>ANA All Nippon</div>
                        <div className="text-lg text-cyan-300">$842</div>
                        <div className="text-[9px] text-emerald-400">Nonstop (Best)</div>
                      </div>
                      <div className="p-2 rounded bg-slate-950/80 border border-slate-800">
                        <div>Japan Airlines</div>
                        <div className="text-lg text-slate-200">$879</div>
                        <div className="text-[9px] text-slate-500">Nonstop</div>
                      </div>
                      <div className="p-2 rounded bg-slate-950/80 border border-slate-800">
                        <div>United Airlines</div>
                        <div className="text-lg text-slate-200">$910</div>
                        <div className="text-[9px] text-slate-500">1 Stop (SFO)</div>
                      </div>
                    </div>
                  </div>
                )}

                {currentTask.category === 'shopping' && (
                  <div className="space-y-2 text-slate-300">
                    <div className="text-cyan-300 font-bold text-sm">Amazon.com // Prime Verified Headphone Deals</div>
                    <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800 flex justify-between items-center text-[11px]">
                      <div>
                        <div className="text-cyan-300 font-bold">Sony WH-1000XM5 Noise Cancelling</div>
                        <div className="text-slate-500 text-[10px]">Prime Free 1-Day Delivery • 4.8 / 5 Stars</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-emerald-400">$298.00</div>
                        <div className="text-[10px] text-rose-400 line-through">$399.99 (-28%)</div>
                      </div>
                    </div>
                  </div>
                )}

                {currentTask.category !== 'research' &&
                  currentTask.category !== 'booking' &&
                  currentTask.category !== 'shopping' && (
                    <div className="space-y-2">
                      <div className="text-cyan-300 font-bold text-sm">Target Portal: {currentTask.targetUrl}</div>
                      <div className="p-3 rounded bg-slate-950/80 border border-slate-800 text-slate-300 text-[11px]">
                        Executing autonomous tasks and parsing DOM tree structure securely.
                      </div>
                    </div>
                  )}

                {/* Live Step Progress Indicator */}
                <div className="mt-auto pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <div className="text-cyan-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span>
                      ACTIVE STEP: {currentTask.steps[currentTask.currentStepIndex]?.description || 'TASK COMPLETE'}
                    </span>
                  </div>
                  <div className="text-slate-500">
                    {Math.round((currentTask.currentStepIndex / currentTask.steps.length) * 100)}% COMPLETED
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 cols: Step-by-Step Action Pipeline & Extracted Intel */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Step Timeline Card */}
          <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col flex-1 bg-slate-900/80 backdrop-blur-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-slate-100 font-mono font-bold text-sm">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>EXECUTION PIPELINE</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {currentTask.steps.filter((s) => s.status === 'completed').length}/{currentTask.steps.length} DONE
              </span>
            </div>

            <div className="mt-3 flex-1 flex flex-col gap-2 overflow-y-auto max-h-60 no-scrollbar font-mono text-xs">
              {currentTask.steps.map((step, idx) => {
                const isCurrent = idx === currentTask.currentStepIndex && currentTask.status === 'running';
                const isDone = step.status === 'completed';

                return (
                  <div
                    key={step.id}
                    className={`p-2.5 rounded-lg border transition-all flex items-start gap-2.5 ${
                      isCurrent
                        ? 'border-cyan-500 bg-cyan-500/15 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                        : isDone
                        ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
                        : 'border-slate-800/80 bg-slate-950/40 text-slate-400 opacity-75'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : isCurrent ? (
                        <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px] text-slate-500">
                          {idx + 1}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px] uppercase tracking-wider text-cyan-300">
                          {step.action}
                        </span>
                        {step.durationMs && (
                          <span className="text-[10px] text-slate-500">{step.durationMs}ms</span>
                        )}
                      </div>
                      <div className="text-[11px] leading-relaxed text-slate-200 mt-0.5 font-sans">
                        {step.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Extracted Intel Summary Card */}
            {currentTask.extractedData && (
              <div className="mt-3 p-3 rounded-lg bg-slate-950/80 border border-cyan-500/30">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[10px] text-cyan-300 font-bold">
                    EXTRACTED_INTEL_DIGEST
                  </span>
                  <button
                    onClick={handleDownloadResults}
                    className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>EXPORT_JSON</span>
                  </button>
                </div>
                <p className="text-xs text-slate-200 mt-1.5 leading-relaxed font-sans">
                  {currentTask.extractedData.summary}
                </p>

                {currentTask.extractedData.metrics && (
                  <div className="mt-2 grid grid-cols-3 gap-2 font-mono text-center">
                    {currentTask.extractedData.metrics.map((m, i) => (
                      <div key={i} className="p-1.5 rounded bg-slate-900 border border-slate-800">
                        <div className="text-[10px] text-slate-500">{m.label}</div>
                        <div className="text-xs font-bold text-cyan-300 mt-0.5">{m.value}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
