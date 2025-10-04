"use client";


interface Announcement {
  _id: string;
  title: string;
  content: string;
  priority: "low" | "medium" | "high";
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

interface NewAnnouncement {
  title: string;
  content: string;
  priority: "low" | "medium" | "high";
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


export default function AnnouncementsTab({
  announcements = [],
  newAnnouncement,
  setNewAnnouncement,
  addAnnouncement,
  deleteAnnouncement,
  announcementSearch,
  setAnnouncementSearch,
}: AnnouncementsTabProps) {
  // Defensive: filter only if announcements is an array
  const filteredAnnouncements = Array.isArray(announcements)
    ? announcements.filter(announcement =>
        (announcement.title || "").toLowerCase().includes(announcementSearch.toLowerCase()) ||
        (announcement.content || "").toLowerCase().includes(announcementSearch.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Add Announcement Form */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-green-400">Add New Announcement</h2>
        <form onSubmit={addAnnouncement} className="space-y-4">
          <input
            type="text"
            placeholder="Announcement Title"
            value={newAnnouncement.title}
            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
            required
            className="w-full rounded-lg bg-gray-700 text-gray-100 px-3 py-2 border border-gray-600 focus:border-green-500 focus:outline-none"
          />
          <select
            value={newAnnouncement.priority}
            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value as "low" | "medium" | "high" })}
            className="w-full rounded-lg bg-gray-700 text-gray-100 px-3 py-2 border border-gray-600 focus:border-green-500 focus:outline-none"
          >
            <option value="low">🟢 Low Priority</option>
            <option value="medium">🟡 Medium Priority</option>
            <option value="high">🔴 High Priority</option>
          </select>
          <textarea
            placeholder="Announcement Content"
            value={newAnnouncement.content}
            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
            required
            className="w-full rounded-lg bg-gray-700 text-gray-100 px-3 py-2 border border-gray-600 focus:border-green-500 focus:outline-none"
            rows={4}
          />
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-semibold transition"
          >
            ➕ Add Announcement
          </button>
        </form>
      </div>

      {/* Announcements List */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-orange-400">Announcements</h2>
          <input
            type="text"
            placeholder="Search announcements..."
            value={announcementSearch}
            onChange={(e) => setAnnouncementSearch(e.target.value)}
            className="mt-4 w-full rounded-lg bg-gray-700 text-gray-100 px-3 py-2 border border-gray-600 focus:border-green-500 focus:outline-none"
          />
        </div>
        <div className="max-h-96 overflow-y-auto">
          {filteredAnnouncements.length === 0 ? (
            <div className="p-4 text-gray-400">No announcements found.</div>
          ) : (
            filteredAnnouncements.map((announcement) => (
              <div key={announcement._id} className="p-4 border-b border-gray-700 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg text-blue-400">{announcement.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        announcement.priority === "high" ? "bg-red-100 text-red-800" :
                        announcement.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                        "bg-green-100 text-green-800"
                      }`}>
                        {announcement.priority.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        announcement.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}>
                        {announcement.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-2 whitespace-pre-wrap">{announcement.content}</p>
                    <div className="text-sm text-gray-400">
                      <span>By {announcement.createdBy}</span>
                      <span className="ml-4">📅 {announcement.createdAt ? new Date(announcement.createdAt).toLocaleDateString() : ""}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteAnnouncement(announcement._id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
