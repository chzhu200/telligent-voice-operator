const ALERTS = [
  { id: 1, title: "Payment service returned 503 errors", time: "2:14 AM", count: "47 errors", severity: "high" },
  { id: 2, title: "DB query timeout spike on /api/users", time: "4:51 AM", count: "12 slow queries", severity: "medium" },
];

export default function AlertList() {
  return (
    <div className="min-w-0 w-full">
      <p className="text-sm font-medium text-gray-700 mb-3">⚠️ <strong>2 issues</strong> detected overnight:</p>
      <div className="space-y-2">
        {ALERTS.map((a) => (
          <div key={a.id} className={`flex items-start gap-3 p-3 rounded-xl border ${a.severity === "high" ? "bg-red-50 border-red-100" : "bg-yellow-50 border-yellow-100"}`}>
            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.severity === "high" ? "bg-red-500" : "bg-yellow-500"}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{a.title}</p>
              <div className="flex gap-3 mt-0.5">
                <span className="text-xs text-gray-500">🕐 {a.time}</span>
                <span className={`text-xs font-medium ${a.severity === "high" ? "text-red-600" : "text-yellow-700"}`}>{a.count}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-2">Both services recovered by 6 AM. No action needed.</p>
    </div>
  );
}
