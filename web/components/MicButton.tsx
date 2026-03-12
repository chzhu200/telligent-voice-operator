"use client";

type AppState = "idle" | "listening" | "thinking" | "done";

interface Props {
  state: AppState;
  onStart: () => void;
  onStop: () => void;
}

export default function MicButton({ state, onStart, onStop }: Props) {
  const isListening = state === "listening";
  const isDisabled = state === "thinking";

  return (
    <button
      onMouseDown={!isDisabled ? (isListening ? undefined : onStart) : undefined}
      onMouseUp={!isDisabled ? (isListening ? onStop : undefined) : undefined}
      onTouchStart={!isDisabled ? (isListening ? undefined : (e) => { e.preventDefault(); onStart(); }) : undefined}
      onTouchEnd={!isDisabled ? (isListening ? (e) => { e.preventDefault(); onStop(); } : undefined) : undefined}
      onClick={!isDisabled && !isListening ? onStart : isListening ? onStop : undefined}
      disabled={isDisabled}
      className="relative flex-shrink-0"
      aria-label={isListening ? "Stop listening" : "Start listening"}
    >
      {/* Pulse ring when listening */}
      {isListening && (
        <>
          <span className="absolute inset-0 rounded-full bg-red-400 opacity-30 mic-pulse scale-125" />
          <span className="absolute inset-0 rounded-full bg-red-400 opacity-20 mic-pulse scale-150" style={{ animationDelay: "0.3s" }} />
        </>
      )}

      <div
        className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
          isListening
            ? "bg-red-500 scale-110"
            : isDisabled
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95"
        }`}
      >
        {isListening ? (
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
      </div>
    </button>
  );
}
