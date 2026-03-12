"use client";
import { useState, useEffect } from "react";

export default function TicketCard() {
  const [phase, setPhase] = useState<"creating" | "done">("creating");

  useEffect(() => {
    const t = setTimeout(() => setPhase("done"), 1500);
    return () => clearTimeout(t);
  }, []);

  if (phase === "creating") {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        Creating ticket…
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-green-500">✅</span>
        <span className="text-sm font-medium text-gray-900">Ticket created!</span>
      </div>
      <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">JIRA-1847</span>
          <span className="text-xs text-gray-500">just now</span>
        </div>
        <p className="text-sm font-medium text-gray-900 mt-1">Login bug: users unable to sign in after password reset</p>
        <div className="flex gap-3 mt-2 text-xs text-gray-500">
          <span>🏷️ Bug</span>
          <span>👤 Unassigned</span>
          <span>🔥 High priority</span>
        </div>
      </div>
    </div>
  );
}
