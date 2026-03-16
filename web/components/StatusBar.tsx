"use client";

type AppState = "idle" | "listening" | "thinking" | "speaking" | "done";

const STATUS_MESSAGES: Record<AppState, string | null> = {
  speaking: "🔊 Speaking…",
  idle: null,
  listening: "🎙️ Listening…",
  thinking: "🤔 Thinking…",
  done: "✅ Done!",
};

export default function StatusBar({ state }: { state: AppState }) {
  const msg = STATUS_MESSAGES[state];
  if (!msg) return <div className="h-7" />;

  return (
    <div className="h-7 flex items-center justify-center">
      <span
        className={`text-xs font-medium px-3 py-1 rounded-full ${
          state === "listening"
            ? "bg-red-50 text-red-600"
            : state === "thinking"
            ? "bg-yellow-50 text-yellow-700"
            : "bg-green-50 text-green-700"
        }`}
      >
        {msg}
      </span>
    </div>
  );
}
