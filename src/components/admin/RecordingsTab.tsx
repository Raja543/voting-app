"use client";


interface TownhallRecording {
  _id: string;
  title: string;
  description?: string;
  gdriveLink: string;
  recordingDate: string;
  thumbnailUrl?: string;
  duration?: string;
  createdAt: string;
}

interface NewRecording {
  title: string;
  description: string;
  gdriveLink: string;
  recordingDate: string;
  thumbnailUrl: string;
  duration: string;
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
  // Defensive: filter only if recordings is an array
  const filteredRecordings = Array.isArray(recordings)
    ? recordings.filter(recording =>
        (recording.title || "").toLowerCase().includes(recordingSearch.toLowerCase()) ||
        (recording.description || "").toLowerCase().includes(recordingSearch.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Add Recording Form */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-green-400">Add New Recording</h2>
        <form onSubmit={addRecording} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Recording Title"
            value={newRecording.title}
            onChange={(e) => setNewRecording({ ...newRecording, title: e.target.value })}
            required
            className="rounded-lg bg-gray-700 text-gray-100 px-3 py-2 border border-gray-600 focus:border-green-500 focus:outline-none"
          />
          <input
            type="datetime-local"
            value={newRecording.recordingDate}
            onChange={(e) => setNewRecording({ ...newRecording, recordingDate: e.target.value })}
            required
            className="rounded-lg bg-gray-700 text-gray-100 px-3 py-2 border border-gray-600 focus:border-green-500 focus:outline-none"
          />
          <input
            type="url"
            placeholder="GDrive Link"
            value={newRecording.gdriveLink}
            onChange={(e) => setNewRecording({ ...newRecording, gdriveLink: e.target.value })}
            required
            className="rounded-lg bg-gray-700 text-gray-100 px-3 py-2 border border-gray-600 focus:border-green-500 focus:outline-none"
          />
          <input
            type="url"
            placeholder="Thumbnail URL (optional)"
            value={newRecording.thumbnailUrl}
            onChange={(e) => setNewRecording({ ...newRecording, thumbnailUrl: e.target.value })}
            className="rounded-lg bg-gray-700 text-gray-100 px-3 py-2 border border-gray-600 focus:border-green-500 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Duration (optional)"
            value={newRecording.duration}
            onChange={(e) => setNewRecording({ ...newRecording, duration: e.target.value })}
            className="rounded-lg bg-gray-700 text-gray-100 px-3 py-2 border border-gray-600 focus:border-green-500 focus:outline-none"
          />
          <textarea
            placeholder="Description (optional)"
            value={newRecording.description}
            onChange={(e) => setNewRecording({ ...newRecording, description: e.target.value })}
            className="md:col-span-2 rounded-lg bg-gray-700 text-gray-100 px-3 py-2 border border-gray-600 focus:border-green-500 focus:outline-none"
            rows={2}
          />
          <button
            type="submit"
            className="md:col-span-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-semibold transition"
          >
            ➕ Add Recording
          </button>
        </form>
      </div>

      {/* Recordings List */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-purple-400">Recordings</h2>
          <input
            type="text"
            placeholder="Search recordings..."
            value={recordingSearch}
            onChange={(e) => setRecordingSearch(e.target.value)}
            className="mt-4 w-full rounded-lg bg-gray-700 text-gray-100 px-3 py-2 border border-gray-600 focus:border-green-500 focus:outline-none"
          />
        </div>
        <div className="max-h-96 overflow-y-auto">
          {filteredRecordings.length === 0 ? (
            <div className="p-4 text-gray-400">No recordings found.</div>
          ) : (
            filteredRecordings.map((recording) => (
              <div key={recording._id} className="p-4 border-b border-gray-700 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-blue-400 mb-2">{recording.title}</h3>
                    {recording.description && (
                      <p className="text-gray-300 mb-2">{recording.description}</p>
                    )}
                    <div className="text-sm text-gray-400 mb-2">
                      <span>📅 {recording.recordingDate ? new Date(recording.recordingDate).toLocaleDateString() : ""}</span>
                      {recording.duration && (
                        <span className="ml-4">⏱️ {recording.duration}</span>
                      )}
                    </div>
                    <a
                      href={recording.gdriveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-300 text-sm"
                    >
                      {recording.gdriveLink}
                    </a>
                  </div>
                  <button
                    onClick={() => deleteRecording(recording._id)}
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
