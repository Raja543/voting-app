"use client";

interface TownhallRecording {
  _id: string;
  title: string;
  description?: string;
  gdriveLink: string;
  createdAt?: string;
  authorName?: string;
}

interface NewRecording {
  title: string;
  description: string;
  gdriveLink: string;
}

interface RecordingsTabProps {
  recordings?: TownhallRecording[];
  newRecording: NewRecording;
  setNewRecording: (recording: NewRecording) => void;
  addRecording: (e: React.FormEvent<HTMLFormElement>) => void;
  deleteRecording: (id: string) => void;
  recordingSearch: string;
  setRecordingSearch: (search: string) => void;
}

export default function RecordingsTab({
  recordings = [],
  newRecording,
  setNewRecording,
  addRecording,
  deleteRecording,
  recordingSearch,
  setRecordingSearch,
}: RecordingsTabProps) {
  const filteredRecordings = recordings.filter(
    (rec) =>
      rec.title.toLowerCase().includes(recordingSearch.toLowerCase()) ||
      (rec.description || "")
        .toLowerCase()
        .includes(recordingSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* ADD VIDEO */}
      <div className="bg-[#11161c] border border-gray-800 p-4 sm:p-6">
        <h2 className="text-xs sm:text-sm text-[#3aa0d8] mb-4">
          Add Video
        </h2>

        <form onSubmit={addRecording} className="space-y-3">
          <input
            type="text"
            placeholder="Title"
            value={newRecording.title}
            onChange={(e) =>
              setNewRecording({ ...newRecording, title: e.target.value })
            }
            required
            className="w-full bg-[#0b0f14] border border-gray-800 px-3 py-2 text-xs sm:text-sm text-white focus:outline-none"
          />

          <input
            type="url"
            placeholder="GDrive link"
            value={newRecording.gdriveLink}
            onChange={(e) =>
              setNewRecording({ ...newRecording, gdriveLink: e.target.value })
            }
            required
            className="w-full bg-[#0b0f14] border border-gray-800 px-3 py-2 text-xs sm:text-sm text-white focus:outline-none"
          />

          <textarea
            placeholder="Description"
            value={newRecording.description}
            onChange={(e) =>
              setNewRecording({ ...newRecording, description: e.target.value })
            }
            rows={3}
            className="w-full bg-[#0b0f14] border border-gray-800 px-3 py-2 text-xs sm:text-sm text-white focus:outline-none"
          />

          <button
            type="submit"
            className="bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2 text-xs sm:text-sm font-medium"
          >
            Add Video
          </button>
        </form>
      </div>

      {/* RECORDINGS LIST */}
      <div className="bg-[#11161c] border border-gray-800 overflow-x-hidden">

        {/* Search */}
        <div className="p-3 sm:p-4 border-b border-gray-800">
          <input
            type="text"
            placeholder="Search"
            value={recordingSearch}
            onChange={(e) => setRecordingSearch(e.target.value)}
            className="w-full bg-[#0b0f14] border border-gray-800 px-3 py-2 text-xs sm:text-sm text-white focus:outline-none"
          />
        </div>

        {/* List */}
        <div className="divide-y divide-gray-800">
          {filteredRecordings.length === 0 ? (
            <div className="p-6 text-gray-500 text-xs sm:text-sm">
              No recordings found
            </div>
          ) : (
            filteredRecordings.map((rec) => (
              <div
                key={rec._id}
                className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6"
              >
                {/* CONTENT */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-[#3aa0d8] text-sm sm:text-base font-medium mb-1 break-words">
                    {rec.title}
                  </h3>

                  {rec.description && (
                    <p className="text-gray-300 text-xs sm:text-sm mb-2 break-words">
                      {rec.description}
                    </p>
                  )}

                  <a
                    href={rec.gdriveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#10B981] text-xs sm:text-sm break-all block mb-2"
                  >
                    {rec.gdriveLink}
                  </a>

                  {rec.createdAt && (
                    <div className="text-[10px] sm:text-xs text-gray-500">
                      {new Date(rec.createdAt).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* ACTION */}
                <div className="flex sm:items-start">
                  <button
                    onClick={() => deleteRecording(rec._id)}
                    className="bg-[#E40041] hover:bg-[#B0003A] text-white px-4 py-1 text-xs sm:text-sm w-full sm:w-auto"
                  >
                    Remove
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
