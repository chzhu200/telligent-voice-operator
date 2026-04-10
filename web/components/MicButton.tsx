"use client";

import { useRef } from "react";

type AppState = "idle" | "listening" | "thinking" | "speaking" | "done";

interface Props {
  state: AppState;
  onStart: () => void;
  onStop: () => void;
}

export default function MicButton({ state, onStart, onStop }: Props) {
  const isListening = state === "listening";
  const isDisabled = state === "thinking" || state === "speaking";
  const holdRef = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isDisabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    holdRef.current = true;
    onStart();
  };

  const handlePointerUp = () => {
    if (!holdRef.current) return;
    holdRef.current = false;
    if (isListening) onStop();
  };

  const handleClick = () => {
    // fallback tap-to-toggle for browsers that don't support pointerdown well
    if (isDisabled) return;
    if (isListening) {
      onStop();
    } else {
      onStart();
    }
  };

  return (
    <button
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={handleClick}
      disabled={isDisabled}
      className="relative flex-shrink-0 select-none touch-none"
      aria-label={isListening ? "Release to stop" : "Hold to speak"}
    >
      {/* Animated rings when listening */}
      {isListening && (
        <>
          <span className="absolute inset-0 rounded-full bg-red-400 opacity-25 mic-pulse scale-125 pointer-events-none" />
          <span
            className="absolute inset-0 rounded-full bg-red-400 opacity-15 mic-pulse scale-150 pointer-events-none"
            style={{ animationDelay: "0.35s" }}
          />
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
          /* Stop / waveform icon */
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          /* Mic icon */
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
      </div>

      {/* Tap-to-speak label */}
      <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 whitespace-nowrap font-medium">
        {isListening ? "release" : "hold"}
      </span>
    </button>
  );
}
