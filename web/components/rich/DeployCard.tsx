"use client";
import { useState, useEffect } from "react";

type Phase = "confirm" | "deploying" | "done";

export default function DeployCard() {
  const [phase, setPhase] = useState<Phase>("confirm");
  const [progress, setProgress] = useState(0);

  const handleDeploy = () => {
    setPhase("deploying");
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => setPhase("done"), 300);
          return 100;
        }
        return p + Math.random() * 15 + 5;
      });
    }, 200);
  };

  if (phase === "confirm") {
    return (
      <div className="min-w-0 w-full">
        <p className="text-sm text-gray-700 mb-3">
          Deploy <strong>main</strong> branch to <strong>staging</strong>?
        </p>
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 mb-3 text-xs text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>Branch</span><span className="font-medium text-gray-800">main @ a3f92bc</span>
          </div>
          <div className="flex justify-between">
            <span>Environment</span><span className="font-medium text-gray-800">staging.telligent.ai</span>
          </div>
          <div className="flex justify-between">
            <span>Last deploy</span><span className="font-medium text-gray-800">2h ago</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDeploy}
            className="flex-1 bg-blue-600 text-white text-sm font-medium py-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            ✅ Confirm Deploy
          </button>
          <button className="px-4 text-sm text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (phase === "deploying") {
    return (
      <div className="min-w-0 w-full">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-gray-800">Deploying to staging…</span>
        </div>
        <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300 rounded-full"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">{Math.round(Math.min(progress, 100))}% complete</p>
      </div>
    );
  }

  return (
    <div className="min-w-0 w-full">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-green-500 text-lg">🚀</span>
        <span className="text-sm font-medium text-gray-900">Deployed successfully!</span>
      </div>
      <div className="bg-green-50 rounded-xl p-3 border border-green-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded">LIVE</span>
          <span className="text-xs text-gray-500">just now</span>
        </div>
        <p className="text-sm text-gray-800 mt-1">staging.telligent.ai is now running <span className="font-mono text-xs bg-gray-100 px-1 rounded">a3f92bc</span></p>
        <div className="flex gap-3 mt-2 text-xs text-gray-500">
          <span>⏱️ 42s</span>
          <span>✅ All health checks passed</span>
        </div>
      </div>
    </div>
  );
}
