"use client";

interface ContentSubmission {
  _id: string;
  twitterHandle: string;
  discordUsername: string;
  contentLink: string;
  contentType: "short-form" | "thread" | "video" | "infographics" | "artwork" | "stream-clip";
  title?: string;
  description?: string;
  submittedBy: string;
  status: "pending" | "approved" | "rejected";
  adminNotes?: string;
  createdAt: string;
}

interface SubmissionsTabProps {
  contentSubmissions: ContentSubmission[];
  updateSubmissionStatus: (id: string, status: "pending" | "approved" | "rejected", adminNotes?: string) => void;
  deleteSubmission: (id: string) => void;
  submissionSearch: string;
  setSubmissionSearch: (search: string) => void;
}

export default function SubmissionsTab({
  contentSubmissions,
  updateSubmissionStatus,
  deleteSubmission,
  submissionSearch,
  setSubmissionSearch,
}: SubmissionsTabProps) {
  const filteredSubmissions = contentSubmissions.filter(submission => 
    submission.title?.toLowerCase().includes(submissionSearch.toLowerCase()) ||
    submission.twitterHandle.toLowerCase().includes(submissionSearch.toLowerCase()) ||
    submission.discordUsername.toLowerCase().includes(submissionSearch.toLowerCase()) ||
    submission.contentType.toLowerCase().includes(submissionSearch.toLowerCase())
  );

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-pink-400">Content Submissions</h2>
        <input
          type="text"
          placeholder="Search submissions..."
          value={submissionSearch}
          onChange={(e) => setSubmissionSearch(e.target.value)}
          className="mt-4 w-full rounded-lg bg-gray-700 text-gray-100 px-3 py-2 border border-gray-600 focus:border-green-500 focus:outline-none"
        />
      </div>
      <div className="max-h-96 overflow-y-auto">
        {filteredSubmissions.map((submission) => (
          <div key={submission._id} className="p-4 border-b border-gray-700 last:border-b-0">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg text-blue-400">
                    {submission.title || "Untitled Submission"}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    submission.status === "approved" ? "bg-green-100 text-green-800" :
                    submission.status === "rejected" ? "bg-red-100 text-red-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {submission.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-sm text-gray-400 mb-2">
                  <span>🐦 @{submission.twitterHandle}</span>
                  <span className="ml-4">💬 {submission.discordUsername}</span>
                  <span className="ml-4">📝 {submission.contentType.replace("-", " ").toUpperCase()}</span>
                </div>
                {submission.description && (
                  <p className="text-gray-300 mb-2">{submission.description}</p>
                )}
                <a
                  href={submission.contentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 text-sm"
                >
                  {submission.contentLink}
                </a>
                {submission.adminNotes && (
                  <div className="mt-2 p-2 bg-gray-700 rounded text-sm">
                    <strong>Admin Notes:</strong> {submission.adminNotes}
                  </div>
                )}
                <div className="text-sm text-gray-400 mt-2">
                  <span>By {submission.submittedBy}</span>
                  <span className="ml-4">📅 {new Date(submission.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => updateSubmissionStatus(submission._id, "approved")}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md font-semibold text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateSubmissionStatus(submission._id, "rejected")}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md font-semibold text-sm"
                  >
                    Reject
                  </button>
                </div>
                <button
                  onClick={() => deleteSubmission(submission._id)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-md font-semibold text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
