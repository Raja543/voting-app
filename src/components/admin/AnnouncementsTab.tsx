"use client";

interface Announcement {
  _id: string;
  title: string;
  content: string;
  priority: "CRITICAL" | "GENERAL" | "CONTENT_FOCUS";
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

interface NewAnnouncement {
  title: string;
  content: string;
  priority: "CRITICAL" | "GENERAL" | "CONTENT_FOCUS";
}

interface AnnouncementsTabProps {
  announcements?: Announcement[];
  newAnnouncement: NewAnnouncement;
  setNewAnnouncement: (announcement: NewAnnouncement) => void;
  addAnnouncement: (e: React.FormEvent<HTMLFormElement>) => void;
  deleteAnnouncement: (id: string) => void;
  announcementSearch: string;
  setAnnouncementSearch: (search: string) => void;
}

const priorityMap: Record<
  Announcement["priority"],
  { label: string; text: string; bg: string }
> = {
  CRITICAL: {
    label: "CRITICAL",
    text: "#E40041",
    bg: "rgba(228, 0, 65, 0.15)",
  },
  GENERAL: {
    label: "GENERAL",
    text: "#027DA4",
    bg: "rgba(2, 125, 164, 0.15)",
  },
  CONTENT_FOCUS: {
    label: "CONTENT FOCUS",
    text: "#10B981",
    bg: "rgba(16, 185, 129, 0.15)",
  },
};

export default function AnnouncementsTab({
  announcements = [],
  newAnnouncement,
  setNewAnnouncement,
  addAnnouncement,
  deleteAnnouncement,
  announcementSearch,
  setAnnouncementSearch,
}: AnnouncementsTabProps) {
  const filteredAnnouncements = announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(announcementSearch.toLowerCase()) ||
      a.content.toLowerCase().includes(announcementSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 overflow-x-hidden">

      {/* CREATE ANNOUNCEMENT */}
      <div className="bg-[#11161c] border border-gray-800 p-4 sm:p-6 overflow-x-hidden">
        <h2 className="text-[#10B981] text-base sm:text-lg mb-4">
          Create Announcement
        </h2>

        <form onSubmit={addAnnouncement} className="space-y-4">
          <input
            type="text"
            placeholder="Announcement title"
            value={newAnnouncement.title}
            onChange={(e) =>
              setNewAnnouncement({ ...newAnnouncement, title: e.target.value })
            }
            className="w-full bg-[#0b0f14] border border-gray-700 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none"
            required
          />

          <select
            value={newAnnouncement.priority}
            onChange={(e) =>
              setNewAnnouncement({
                ...newAnnouncement,
                priority: e.target.value as NewAnnouncement["priority"],
              })
            }
            className="w-full bg-[#0b0f14] border border-gray-700 px-3 py-2 text-sm text-gray-200 focus:outline-none"
          >
            <option value="CRITICAL">CRITICAL</option>
            <option value="GENERAL">GENERAL</option>
            <option value="CONTENT_FOCUS">CONTENT FOCUS</option>
          </select>

          <textarea
            placeholder="Content"
            value={newAnnouncement.content}
            onChange={(e) =>
              setNewAnnouncement({ ...newAnnouncement, content: e.target.value })
            }
            rows={4}
            className="w-full bg-[#0b0f14] border border-gray-700 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none"
            required
          />

          <button
            type="submit"
            className="bg-[#10B981] hover:bg-[#059669] px-4 py-2 text-sm text-white font-medium"
          >
            Add Announcement
          </button>
        </form>
      </div>

      {/* ANNOUNCEMENTS LIST */}
      <div className="bg-[#11161c] border border-gray-800 overflow-x-hidden">

        {/* Search */}
        <div className="p-3 sm:p-4 border-b border-gray-800">
          <input
            type="text"
            placeholder="Search"
            value={announcementSearch}
            onChange={(e) => setAnnouncementSearch(e.target.value)}
            className="w-full sm:w-1/2 bg-[#0b0f14] px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none"
          />
        </div>

        {/* List */}
        <div className="divide-y divide-gray-800 max-h-[420px] overflow-y-auto overflow-x-hidden">
          {filteredAnnouncements.length === 0 && (
            <div className="p-4 text-gray-500 text-sm">
              No announcements found
            </div>
          )}

          {filteredAnnouncements.map((a) => {
            const priority = priorityMap[a.priority];

            return (
              <div key={a._id} className="p-4 overflow-x-hidden">
                <div className="flex flex-col sm:flex-row gap-4 min-w-0">

                  {/* CONTENT */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3
                        className="text-[#3aa0d8] text-sm sm:text-xl font-medium break-words break-all sm:break-words max-w-full ">
                        {a.title}
                      </h3>


                      <span
                        className="text-[11px] px-2 py-[2px] font-medium whitespace-nowrap"
                        style={{
                          background: priority.bg,
                          color: priority.text,
                        }}
                      >
                        {priority.label}
                      </span>
                    </div>

                    <p className="text-gray-300 text-sm leading-relaxed break-words">
                      {a.content}
                    </p>

                    <div className="mt-2 text-xs text-gray-500">
                      {new Date(a.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {/* ACTION */}
                  <div className="flex sm:items-start">
                    <button
                      onClick={() => deleteAnnouncement(a._id)}
                      className="
                        bg-[#E40041] hover:bg-[#B0003A]
                        text-xs
                        px-3 py-1
                        text-white
                        h-fit
                        w-fit
                      "
                    >
                      Remove
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
