"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import MessageBubble from "./MessageBubble";
import MicButton from "./MicButton";
import StatusBar from "./StatusBar";
import Header from "./Header";
import { sendMessage, checkHealth, HistoryItem } from "@/lib/api";
import { matchDemo, getFallbackResponse, RichType } from "@/lib/demo";

export type MessageRole = "user" | "assistant";
export type MessageStatus = "sending" | "done" | "error";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  richType?: RichType;
  timestamp: Date;
  status?: MessageStatus;
}

type AppState = "idle" | "listening" | "thinking" | "speaking" | "done";

function generateId() {
  return Math.random().toString(36).slice(2);
}

function speak(text: string, onEnd?: () => void) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 1.05;
  utt.pitch = 1.0;
  utt.volume = 1.0;
  // Prefer a natural-sounding voice
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find((v) =>
    ["Samantha", "Karen", "Daniel", "Google US English"].includes(v.name)
  );
  if (preferred) utt.voice = preferred;
  utt.onend = () => onEnd?.();
  utt.onerror = () => onEnd?.();
  window.speechSynthesis.speak(utt);
}

export default function VoiceChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "👋 Hi! I'm Telligent — your Voice AI Operator. Just speak or type a command. Try \"show my open pull requests\", \"what failed overnight?\", or \"deploy to staging\".",
      timestamp: new Date(),
      status: "done",
    },
  ]);
  const [appState, setAppState] = useState<AppState>("idle");
  const [inputText, setInputText] = useState("");
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const historyRef = useRef<HistoryItem[]>([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check backend on mount
  useEffect(() => {
    checkHealth().then(setBackendOnline);
  }, []);

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
      if (!text.trim() || appState === "thinking" || appState === "listening") return;

      const userText = text.trim();
      addMessage({ role: "user", content: userText, status: "done" });
      setInputText("");
      setAppState("thinking");

      // Build history for context
      const history = historyRef.current.slice(-6);

      // Check demo patterns first (works without backend)
      const demo = matchDemo(userText);
      let response: string;
      let richType: RichType | undefined;

      if (demo) {
        response = demo.text;
        richType = demo.richType;
        // Simulate brief "thinking" delay for realism
        await new Promise((r) => setTimeout(r, 800));
      } else {
        response = await sendMessage(userText, history);
        // If backend is down, use fallback
        if (response.includes("can't reach the backend")) {
          response = getFallbackResponse();
        }
      }

      // Update history
      historyRef.current = [
        ...historyRef.current,
        { role: "user" as const, content: userText },
        { role: "assistant" as const, content: response },
      ].slice(-20);

      const id = addMessage({ role: "assistant", content: response, richType, status: "done" });
      setAppState("speaking");

      speak(response, () => {
        setAppState("idle");
      });

      // Safety fallback if TTS doesn't fire
      setTimeout(() => {
        setAppState((s) => (s === "speaking" ? "idle" : s));
      }, 15000);

      void id;
    },
    [addMessage, appState]
  );

  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      addMessage({
        role: "assistant",
        content: "Voice input isn't supported in this browser. Try Chrome! You can still type below.",
        status: "done",
      });
      return;
    }

    const recognition = new SR();
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

    recognition.onerror = (event: any) => {
      console.error("Speech error:", event.error);
      setAppState("idle");
      if (event.error === "not-allowed") {
        addMessage({
          role: "assistant",
          content: "Microphone access was denied. Please allow microphone access in your browser settings.",
          status: "error",
        });
      }
    };

    recognition.onend = () => {
      if (appState === "listening") setAppState("idle");
    };

    recognition.start();
  }, [addMessage, appState, handleCommand]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setAppState("idle");
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) handleCommand(inputText);
  };

  const HINTS = [
    "Show my open pull requests",
    "What failed overnight?",
    "Deploy to staging",
    "How many signups today?",
    "Create a ticket for the login bug",
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-2xl mx-auto">
      <Header />

      {/* Backend status banner */}
      {backendOnline === false && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-sm text-amber-700">
          ⚠️ Backend offline — add your Gemini key and start:{" "}
          <code className="bg-amber-100 px-1 rounded text-xs">cd backend && echo "GEMINI_API_KEY=your_key" &gt; .env && bash start.sh</code>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {appState === "thinking" && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              T
            </div>
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

      <StatusBar state={appState} />

      {/* Input */}
      <div className="px-4 pb-6 pt-2 bg-white border-t border-gray-100">
        <div className="flex items-center gap-3">
          <form onSubmit={handleSubmit} className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={appState === "listening" ? "Listening…" : appState === "speaking" ? "Speaking…" : "Type or speak a command…"}
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
          <MicButton state={appState} onStart={startListening} onStop={stopListening} />
        </div>

        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {HINTS.map((hint) => (
            <button
              key={hint}
              onClick={() => handleCommand(hint)}
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
