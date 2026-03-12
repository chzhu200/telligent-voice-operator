"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import MessageBubble from "./MessageBubble";
import MicButton from "./MicButton";
import StatusBar from "./StatusBar";
import Header from "./Header";

export type MessageRole = "user" | "assistant";
export type MessageStatus = "sending" | "done" | "error";

export interface Message {
  id: string;
  role: MessageRole;
  content: string | React.ReactNode;
  timestamp: Date;
  status?: MessageStatus;
  richType?: "prs" | "alerts" | "deploy" | "metric" | "ticket";
}

type AppState = "idle" | "listening" | "thinking" | "done";

const DEMO_RESPONSES: Record<string, { content: string; richType?: Message["richType"] }> = {
  "show my open pull requests": {
    richType: "prs",
    content: "",
  },
  "what failed overnight": {
    richType: "alerts",
    content: "",
  },
  "deploy to staging": {
    richType: "deploy",
    content: "",
  },
  "how many signups today": {
    richType: "metric",
    content: "📈 **47 new signups today** — that's +12% compared to yesterday. Your best day this week!",
  },
  "create a ticket for the login bug": {
    richType: "ticket",
    content: "",
  },
};

function matchDemoCommand(input: string): { content: string; richType?: Message["richType"] } | null {
  const normalized = input.toLowerCase().replace(/[?.!]/g, "").trim();
  for (const [key, val] of Object.entries(DEMO_RESPONSES)) {
    if (normalized.includes(key)) return val;
  }
  return null;
}

function generateId() {
  return Math.random().toString(36).slice(2);
}

export default function VoiceChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "👋 Hi! I'm your Telligent AI Operator. You can speak or type a command — like \"show my open pull requests\" or \"what failed overnight?\"",
      timestamp: new Date(),
      status: "done",
    },
  ]);
  const [appState, setAppState] = useState<AppState>("idle");
  const [inputText, setInputText] = useState("");
  const [showDeployConfirm, setShowDeployConfirm] = useState(false);
  const [_deploying, setDeploying] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = useCallback((msg: Omit<Message, "id" | "timestamp">) => {
    const newMsg: Message = { ...msg, id: generateId(), timestamp: new Date() };
    setMessages((prev) => [...prev, newMsg]);
    return newMsg.id;
  }, []);

  const updateMessage = useCallback((id: string, updates: Partial<Message>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  }, []);

  const handleCommand = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      // Add user message
      addMessage({ role: "user", content: text, status: "done" });
      setInputText("");
      setAppState("thinking");

      await new Promise((r) => setTimeout(r, 900));

      const match = matchDemoCommand(text);

      if (!match) {
        setAppState("done");
        addMessage({
          role: "assistant",
          content: `I heard you say: "${text}". I can handle commands like "show my open pull requests", "what failed overnight?", "deploy to staging", "how many signups today?", or "create a ticket for the login bug". Try one of those!`,
          status: "done",
        });
        setTimeout(() => setAppState("idle"), 1500);
        return;
      }

      if (match.richType === "deploy") {
        setAppState("idle");
        setShowDeployConfirm(true);
        return;
      }

      setAppState("done");
      addMessage({ role: "assistant", content: match.content || "", richType: match.richType, status: "done" });
      setTimeout(() => setAppState("idle"), 1500);
    },
    [addMessage]
  );

  const handleDeployConfirm = useCallback(async () => {
    setShowDeployConfirm(false);
    setDeploying(true);
    const id = addMessage({ role: "assistant", content: "🚀 Deploying to staging…", status: "sending" });
    await new Promise((r) => setTimeout(r, 2500));
    updateMessage(id, {
      content: "✅ **Deployed to staging successfully!** Build #4821 is live at staging.telligenttech.com. Took 2m 14s.",
      status: "done",
      richType: undefined,
    });
    setDeploying(false);
  }, [addMessage, updateMessage]);

  const handleDeployCancel = () => {
    setShowDeployConfirm(false);
    addMessage({ role: "assistant", content: "Got it — deploy cancelled. Let me know when you're ready.", status: "done" });
  };

  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser doesn't support voice input. Please type your command instead.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => setAppState("listening");
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setAppState("idle");
      handleCommand(transcript);
    };
    recognition.onerror = () => setAppState("idle");
    recognition.onend = () => {
      if (appState === "listening") setAppState("idle");
    };

    recognition.start();
  }, [appState, handleCommand]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    if (appState === "listening") setAppState("idle");
  }, [appState]);

  const handleSubmitText = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) handleCommand(inputText.trim());
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-2xl mx-auto">
      <Header />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {appState === "thinking" && (
          <div className="flex items-start gap-3 slide-in-left">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">T</div>
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
              <div className="flex gap-1 items-center h-5">
                <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Deploy Confirm Modal */}
      {showDeployConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="text-2xl mb-2">🚀</div>
            <h3 className="font-semibold text-gray-900 text-lg mb-1">Deploy to Staging?</h3>
            <p className="text-gray-500 text-sm mb-5">This will push the latest build to staging.telligenttech.com. Are you sure?</p>
            <div className="flex gap-3">
              <button
                onClick={handleDeployCancel}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeployConfirm}
                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                Deploy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status bar */}
      <StatusBar state={appState} />

      {/* Input area */}
      <div className="px-4 pb-6 pt-2 bg-white border-t border-gray-100">
        <div className="flex items-center gap-3">
          {/* Text input */}
          <form onSubmit={handleSubmitText} className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a command…"
              disabled={appState === "listening" || appState === "thinking"}
              className="w-full bg-gray-100 rounded-full px-5 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-50"
            />
            {inputText && (
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </form>

          {/* Mic button */}
          <MicButton
            state={appState}
            onStart={startListening}
            onStop={stopListening}
          />
        </div>

        {/* Hint chips */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
          {["Show PRs", "What failed?", "Deploy to staging", "Signups today"].map((hint) => (
            <button
              key={hint}
              onClick={() => handleCommand(hint.toLowerCase())}
              disabled={appState === "thinking" || appState === "listening"}
              className="flex-shrink-0 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-full hover:bg-blue-100 transition-colors disabled:opacity-40"
            >
              {hint}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
