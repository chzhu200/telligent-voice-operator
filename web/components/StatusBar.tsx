"use client";

type AppState = "idle" | "listening" | "thinking" | "speaking" | "done";

function WaveformBars() {
  return (
    <div className="flex items-end gap-0.5 h-4">
      {[3, 5, 8, 5, 3, 7, 4, 6, 3, 5].map((h, i) => (
        <div
          key={i}
          className="w-1 bg-red-500 rounded-full waveform-bar"
          style={{
            height: `${h * 2}px`,
            animationDelay: `${i * 0.08}s`,
          }}
        />
      ))}
    </div>
  );
}

const STATUS_MESSAGES: Record<AppState, string | null> = {
  speaking: "🔊 Speaking…",
  idle: null,
  listening: null, // handled custom below
  thinking: "✨ Thinking…",
  done: "✅ Done!",
};

export default function StatusBar({ state }: { state: AppState }) {
  if (state === "listening") {
    return (
      <div className="h-8 flex items-center justify-center gap-2">
        <WaveformBars />
        <span className="text-xs font-semibold text-red-600 tracking-wide">Listening…</span>
        <WaveformBars />
      </div>
    );
  }

  const msg = STATUS_MESSAGES[state];
  if (!msg) return <div className="h-8" />;

  return (
    <div className="h-8 flex items-center justify-center">
      <span
        className={`text-xs font-medium px-3 py-1 rounded-full ${
          state === "thinking"
            ? "bg-blue-50 text-blue-700"
            : state === "speaking"
            ? "bg-purple-50 text-purple-700"
            : "bg-green-50 text-green-700"
        }`}
      >
        {msg}
      </span>
    </div>
  );
}
