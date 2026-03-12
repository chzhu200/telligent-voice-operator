const PRS = [
  { id: 142, title: "Add OAuth2 refresh token support", author: "sarah_k", status: "Review requested", color: "yellow" },
  { id: 138, title: "Fix memory leak in audio pipeline", author: "dev_mike", status: "Approved", color: "green" },
  { id: 131, title: "Upgrade Next.js to 14.2", author: "auto-bot", status: "Checks running", color: "blue" },
];

const STATUS_COLORS: Record<string, string> = {
  yellow: "bg-yellow-50 text-yellow-700",
  green: "bg-green-50 text-green-700",
  blue: "bg-blue-50 text-blue-700",
};

export default function PRList() {
  return (
    <div className="min-w-0 w-full">
      <p className="text-sm font-medium text-gray-700 mb-3">You have <strong>3 open pull requests</strong>:</p>
      <div className="space-y-2">
        {PRS.map((pr) => (
          <div key={pr.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-6 h-6 rounded-md bg-purple-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">#{pr.id} {pr.title}</p>
              <p className="text-xs text-gray-500">by {pr.author}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[pr.color]}`}>
              {pr.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
