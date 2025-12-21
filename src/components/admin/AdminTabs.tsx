"use client";

interface AdminTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function AdminTabs({
  activeTab,
  setActiveTab,
}: AdminTabsProps) {
  const tabs = [
    { id: "posts", label: "Posts" },
    { id: "users", label: "Users" },
    { id: "assets", label: "Assets" },
    { id: "recordings", label: "Recordings" },
    { id: "announcements", label: "Announcements" },
    { id: "submissions", label: "Submissions" },
  ];

  return (
    <div
      className="
        flex flex-wrap gap-2
        mb-4 sm:mb-6
      "
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="
              transition
              rounded
              text-white
              font-medium
              
              /* Mobile */
              px-3 py-1.5 text-xs
              
              /* Small tablets */
              sm:px-4 sm:py-2 sm:text-sm
              
              /* Desktop */
              md:px-6 md:py-2 md:text-lg
              
              active:scale-[0.98]
            "
            style={{
              backgroundColor: isActive ? "#10B981" : "#027DA4",
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
