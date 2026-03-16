"use client";

import { Message } from "./VoiceChat";
import PRList from "./rich/PRList";
import AlertList from "./rich/AlertList";
import MetricCard from "./rich/MetricCard";
import TicketCard from "./rich/TicketCard";
import DeployCard from "./rich/DeployCard";

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function renderContent(message: Message) {
  const richType = message.richType;
  if (richType === "prs") return <PRList />;
  if (richType === "alerts") return <AlertList />;
  if (richType === "metric") return <MetricCard />;
  if (richType === "ticket") return <TicketCard />;
  if (richType === "deploy") return <DeployCard />;
  return <MarkdownText text={message.content as string} />;
}

function MarkdownText({ text }: { text: string }) {
  // Simple bold/italic support
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <p className="text-sm leading-relaxed text-gray-800">
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          part
        )
      )}
    </p>
  );
}

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end slide-in-right">
        <div className="max-w-xs sm:max-w-sm">
          <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-sm">
            <p className="text-sm">{message.content as string}</p>
          </div>
          <p className="text-xs text-gray-400 mt-1 text-right">{formatTime(message.timestamp)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 slide-in-left">
      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 mt-1">
        T
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100 inline-block max-w-full">
          {renderContent(message)}
        </div>
        <p className="text-xs text-gray-400 mt-1">{formatTime(message.timestamp)}</p>
      </div>
    </div>
  );
}
