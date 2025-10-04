"use client";

interface AdminTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function AdminTabs({ activeTab, setActiveTab }: AdminTabsProps) {
  const tabs = [
    { id: "posts", label: "📝 Posts", color: "text-yellow-400" },
    { id: "users", label: "👥 Users", color: "text-blue-400" },
    { id: "assets", label: "📁 Assets", color: "text-green-400" },
    { id: "recordings", label: "🎥 Recordings", color: "text-purple-400" },
    { id: "announcements", label: "📢 Announcements", color: "text-orange-400" },
    { id: "submissions", label: "📤 Submissions", color: "text-pink-400" },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-700">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-4 py-2 rounded-t-lg font-medium transition ${
            activeTab === tab.id
              ? "bg-gray-800 text-white border-b-2 border-blue-500"
              : "bg-gray-700 text-gray-400 hover:bg-gray-600"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
