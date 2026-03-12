export default function MetricCard() {
  return (
    <div className="min-w-0">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
        <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">New signups today</p>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-bold text-gray-900">47</span>
          <span className="text-sm font-medium text-green-600">+12% vs yesterday</span>
        </div>
        <div className="mt-3 flex gap-4 text-xs text-gray-500">
          <span>Yesterday: 42</span>
          <span>This week: 287</span>
        </div>
      </div>
    </div>
  );
}
