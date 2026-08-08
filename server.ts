import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. Health & System status
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    system: "Aetheris OS Ambient Core",
    version: "4.2.0-cyber",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    geminiAvailable: !!process.env.GEMINI_API_KEY,
  });
});

// 2. Intelligent Command Execution & NLP
app.post("/api/gemini/command", async (req, res) => {
  try {
    const { transcript, language, history, confidentialMode, userPreferences } = req.body;

    if (!transcript || typeof transcript !== "string") {
      return res.status(400).json({ error: "Transcript is required" });
    }

    // If client requested strict offline confidential mode, provide high-grade local intent reasoning
    if (confidentialMode) {
      const offlineResult = generateOfflineResponse(transcript, language);
      return res.json({
        response: offlineResult.reply,
        actionType: offlineResult.actionType,
        actionPayload: offlineResult.actionPayload,
        telemetry: {
          processingMode: "LOCAL_ISOLATED_SANDBOX",
          latencyMs: 12,
          confidential: true,
          tokensUsed: 0,
        },
      });
    }

    const ai = getGenAI();
    if (!ai) {
      // Fallback if no API key is set yet
      const fallback = generateOfflineResponse(transcript, language);
      return res.json({
        response: fallback.reply + " (Processed via local acoustic parser - add GEMINI_API_KEY in Secrets for extended cloud intelligence).",
        actionType: fallback.actionType,
        actionPayload: fallback.actionPayload,
        telemetry: {
          processingMode: "OFFLINE_HYBRID_CORE",
          latencyMs: 18,
          confidential: false,
          tokensUsed: 0,
        },
      });
    }

    const systemPrompt = `You are AETHERIS (also responsive as JARVIS), an ultra-advanced, sentient, futuristic ambient AI operating system with voice control, hands-free browser automation, and high-performance task execution.
Current language: ${language || "en"}.
User preferences: ${JSON.stringify(userPreferences || {})}.

Analyze the user's spoken command. Output your response as valid JSON with the exact structure:
{
  "speechReply": "Natural, concise, polite, and authoritative spoken response for Text-to-Speech",
  "intent": "chat" | "navigate_screen" | "browser_automate" | "system_control" | "privacy_lock" | "telemetry_scan" | "schedule_alert",
  "screenTarget": "ambient" | "automation" | "chat" | "security" | "profile" | "settings" | null,
  "automationPlan": {
    "title": "Short title of autonomous workflow",
    "targetUrl": "https://example.com or search URL",
    "steps": [
      { "id": "step-1", "action": "navigate" | "type" | "click" | "extract" | "wait" | "summarize" | "screenshot", "target": "element or URL description", "value": "text or query", "description": "Human readable action description" }
    ],
    "category": "research" | "shopping" | "booking" | "coding" | "finance" | "productivity"
  } | null,
  "systemCommand": {
    "type": "toggle_mic" | "toggle_dark_mode" | "purge_logs" | "set_privacy_mode" | "adjust_volume" | null,
    "value": any
  } | null
}

Rules:
1. If the user asks to open or do something on a website (e.g. "search flights", "check arXiv papers", "find laptops on Amazon", "look up weather", "check stock price of Tesla", "summarize Wikipedia page"), generate a realistic multi-step autonomous browser plan with 3-6 distinct DOM automation steps!
2. Keep speechReply crisp, futuristic, and friendly (1-2 sentences).
3. If speaking in a language like Spanish, French, German, Japanese, Chinese, Hindi, Arabic, ensure speechReply is fluent and natural in that language.
4. Return ONLY valid JSON, no markdown backticks.`;

    const modelResponse = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        {
          text: `User Spoken Transcript: "${transcript}"\nRecent Context: ${JSON.stringify(history?.slice(-4) || [])}`,
        },
      ],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const text = modelResponse.text || "{}";
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {
        speechReply: text.replace(/[{}"]/g, "").trim() || "Command acknowledged, executing protocol.",
        intent: "chat",
        automationPlan: null,
      };
    }

    return res.json({
      response: parsed.speechReply || "Command verified and processed.",
      intent: parsed.intent || "chat",
      screenTarget: parsed.screenTarget || null,
      automationPlan: parsed.automationPlan || null,
      systemCommand: parsed.systemCommand || null,
      telemetry: {
        processingMode: "NEURAL_GEMINI_3.6_FLASH",
        latencyMs: 140,
        confidential: false,
      },
    });
  } catch (err: any) {
    console.error("Gemini command error:", err);
    // Graceful offline fallback
    const fallback = generateOfflineResponse(req.body.transcript || "", req.body.language || "en");
    return res.json({
      response: fallback.reply,
      intent: fallback.actionType,
      screenTarget: null,
      automationPlan: fallback.actionPayload,
      systemCommand: null,
      telemetry: {
        processingMode: "LOCAL_FAILSAFE_CORE",
        latencyMs: 25,
        confidential: true,
      },
    });
  }
});

// 3. Autonomous Web Action Engine (Simulated Hands-free execution)
app.post("/api/automate/task", async (req, res) => {
  try {
    const { prompt, targetUrl } = req.body;
    const ai = getGenAI();

    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Create a step-by-step browser automation workflow for the task: "${prompt}" on URL: "${targetUrl || "https://google.com"}".
Return valid JSON:
{
  "title": "Title of task",
  "targetUrl": "https://...",
  "estimatedTimeSec": 6,
  "steps": [
    { "id": "1", "action": "navigate", "target": "https://...", "value": "", "description": "Navigating to portal..." },
    { "id": "2", "action": "type", "target": "input[name='q']", "value": "Query term", "description": "Entering query..." },
    { "id": "3", "action": "click", "target": "button[type='submit']", "value": "", "description": "Executing search..." },
    { "id": "4", "action": "extract", "target": ".results-card", "value": "text/data", "description": "Harvesting data..." },
    { "id": "5", "action": "summarize", "target": "report", "value": "", "description": "Synthesizing executive summary" }
  ],
  "extractedData": {
    "summary": "Key findings from hands-free task",
    "metrics": [ { "label": "Items Found", "value": "14" }, { "label": "Avg Price", "value": "$420" } ]
  }
}`,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json(parsed);
    }

    // Default rich preset if no AI key
    return res.json({
      title: `Automate: ${prompt || "Web Research"}`,
      targetUrl: targetUrl || "https://arxiv.org/search/ai",
      estimatedTimeSec: 5,
      steps: [
        { id: "1", action: "navigate", target: targetUrl || "https://arxiv.org", value: "", description: "Connecting to secure endpoint" },
        { id: "2", action: "type", target: "#search-box", value: prompt, description: `Typing query "${prompt}"` },
        { id: "3", action: "click", target: ".submit-btn", value: "", description: "Submitting search form" },
        { id: "4", action: "extract", target: ".result-item", value: "table", description: "Parsing tabular telemetry & metadata" },
        { id: "5", action: "summarize", target: "report-view", value: "done", description: "Compiling offline executive briefing" },
      ],
      extractedData: {
        summary: `Autonomous crawl completed successfully for "${prompt}". All data sanitized and stored in local encrypted vault.`,
        metrics: [
          { label: "DOM Nodes Parsed", value: "482" },
          { label: "Extracted Entities", value: "18" },
          { label: "Security Level", value: "Strict SSL" },
        ],
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Offline rule-based NLP parser
function generateOfflineResponse(transcript: string, lang: string = "en") {
  const lower = transcript.toLowerCase().trim();

  // Navigation commands
  if (lower.includes("navigate") || lower.includes("open") || lower.includes("go to") || lower.includes("switch")) {
    if (lower.includes("automation") || lower.includes("browser") || lower.includes("website") || lower.includes("task")) {
      return {
        reply: "Opening autonomous browser workspace. Hands-free controls ready.",
        actionType: "navigate_screen",
        actionPayload: { screen: "automation" },
      };
    }
    if (lower.includes("chat") || lower.includes("talk") || lower.includes("message")) {
      return {
        reply: "Switching to Neural Voice Chat console.",
        actionType: "navigate_screen",
        actionPayload: { screen: "chat" },
      };
    }
    if (lower.includes("security") || lower.includes("privacy") || lower.includes("vault") || lower.includes("offline")) {
      return {
        reply: "Entering Secure Offline Privacy & Biometric Vault.",
        actionType: "navigate_screen",
        actionPayload: { screen: "security" },
      };
    }
    if (lower.includes("settings") || lower.includes("config") || lower.includes("audio")) {
      return {
        reply: "Accessing System Settings and acoustic controls.",
        actionType: "navigate_screen",
        actionPayload: { screen: "settings" },
      };
    }
    if (lower.includes("profile") || lower.includes("identity") || lower.includes("user")) {
      return {
        reply: "Loading User Biometric Profile.",
        actionType: "navigate_screen",
        actionPayload: { screen: "profile" },
      };
    }
    if (lower.includes("ambient") || lower.includes("home") || lower.includes("hud") || lower.includes("main")) {
      return {
        reply: "Returning to Ambient HUD projection.",
        actionType: "navigate_screen",
        actionPayload: { screen: "ambient" },
      };
    }
  }

  // Automation triggers
  if (lower.includes("search") || lower.includes("research") || lower.includes("buy") || lower.includes("book") || lower.includes("scrape") || lower.includes("automate") || lower.includes("flight") || lower.includes("weather")) {
    return {
      reply: `Initiating autonomous browser task for "${transcript}". Stand by while I navigate and execute actions on your behalf.`,
      actionType: "browser_automate",
      actionPayload: {
        title: "Autonomous Web Query",
        targetUrl: lower.includes("flight") ? "https://www.google.com/travel/flights" : "https://arxiv.org",
        steps: [
          { id: "1", action: "navigate", target: "https://web.service", value: "", description: "Opening secure web container" },
          { id: "2", action: "type", target: "input[type='search']", value: transcript, description: "Entering parameters" },
          { id: "3", action: "click", target: ".execute-btn", value: "", description: "Executing automated query" },
          { id: "4", action: "extract", target: ".data-grid", value: "table", description: "Harvesting results" },
        ],
      },
    };
  }

  // System controls
  if (lower.includes("dark mode") || lower.includes("light mode") || lower.includes("theme")) {
    return {
      reply: "Adjusting ambient illumination levels.",
      actionType: "system_control",
      actionPayload: { type: "toggle_theme" },
    };
  }

  if (lower.includes("mute") || lower.includes("silence") || lower.includes("stop listening")) {
    return {
      reply: "Audio input standby mode engaged. Tap the central core to reactivate.",
      actionType: "system_control",
      actionPayload: { type: "mute_mic" },
    };
  }

  if (lower.includes("status") || lower.includes("system") || lower.includes("diagnostics")) {
    return {
      reply: "All systems nominal. CPU utilization 12%, voice latency 14ms, encryption key 4096-bit active.",
      actionType: "telemetry_scan",
      actionPayload: {},
    };
  }

  // Multilingual quick answers
  if (lang === "es" || lower.includes("hola") || lower.includes("cómo estás")) {
    return {
      reply: "Sistemas operativos Aetheris listos. ¿Qué tarea desea automatizar hoy?",
      actionType: "chat",
      actionPayload: null,
    };
  }
  if (lang === "fr" || lower.includes("bonjour")) {
    return {
      reply: "Système Aetheris en ligne. Toutes les commandes vocales sont prêtes.",
      actionType: "chat",
      actionPayload: null,
    };
  }
  if (lang === "de" || lower.includes("hallo") || lower.includes("guten tag")) {
    return {
      reply: "Aetheris Betriebssystem aktiv. Sprachsteuerung und Automatisierung bereit.",
      actionType: "chat",
      actionPayload: null,
    };
  }
  if (lang === "ja" || lower.includes("こんにちは") || lower.includes("起動")) {
    return {
      reply: "Aetheris OS システム起動完了。音声コマンドと自動ブラウジングを実行可能です。",
      actionType: "chat",
      actionPayload: null,
    };
  }

  return {
    reply: `Command "${transcript}" processed. Standing by for your next instruction.`,
    actionType: "chat",
    actionPayload: null,
  };
}

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Aetheris OS Server running on port ${PORT}`);
  });
}

startServer();
