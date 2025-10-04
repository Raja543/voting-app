"use client";

interface User {
  _id: string;
  name: string;
  email: string;
  username?: string;
  bio?: string;
  walletAddress?: string;
  website?: string;
  location?: string;
  image?: string;
  provider: string;
  isAdmin: boolean;
  isWhitelisted: boolean;
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    discord?: string;
  };
}

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

interface UserDetailsModalProps {
  selectedUser: User | null;
  showUserDetails: boolean;
  closeUserDetails: () => void;
  contentSubmissions: ContentSubmission[];
  removeWhitelist: (email: string) => void;
  whitelistUser: (email: string) => void;
}

export default function UserDetailsModal({
  selectedUser,
  showUserDetails,
  closeUserDetails,
  contentSubmissions,
  removeWhitelist,
  whitelistUser,
}: UserDetailsModalProps) {
  if (!showUserDetails || !selectedUser) return null;

  const userSubmissions = contentSubmissions.filter(s => {
    const submittedByEmail = s.submittedBy === selectedUser.email;
    const submittedById = s.submittedBy === selectedUser._id;
    const submittedByName = s.submittedBy === selectedUser.name;
    return submittedByEmail || submittedById || submittedByName;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">User Profile Details</h2>
            <button
              onClick={closeUserDetails}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ✕
            </button>
          </div>

          {/* User Header */}
          <div className="flex items-center mb-6 p-4 bg-gray-700 rounded-lg">
            {selectedUser.image && (
              <img 
                src={selectedUser.image} 
                alt="User avatar" 
                className="w-16 h-16 rounded-full border border-gray-600 mr-4" 
              />
            )}
            <div>
              <h3 className="text-xl font-bold text-white">{selectedUser.name}</h3>
              <p className="text-gray-400">
                {selectedUser.username ? `@${selectedUser.username}` : selectedUser.email}
              </p>
              <div className="flex gap-2 mt-2">
                <span className="px-2 py-1 text-xs bg-blue-600 rounded">{selectedUser.provider}</span>
                {selectedUser.isAdmin && <span className="px-2 py-1 text-xs bg-purple-600 rounded">Admin</span>}
                <span className={`px-2 py-1 text-xs rounded ${
                  selectedUser.isWhitelisted ? "bg-green-600" : "bg-yellow-600"
                }`}>
                  {selectedUser.isWhitelisted ? "Whitelisted" : "Not Whitelisted"}
                </span>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-400 mb-4">👤 User Information</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400">Full Name:</span>
                  <span className="text-white ml-2 font-medium">{selectedUser.name || "Not provided"}</span>
                </div>
                <div>
                  <span className="text-gray-400">Email:</span>
                  <span className="text-white ml-2 font-medium">{selectedUser.email}</span>
                </div>
                <div>
                  <span className="text-gray-400">Username:</span>
                  <span className="text-white ml-2 font-medium">
                    {selectedUser.username ? `@${selectedUser.username}` : "Not provided"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Bio:</span>
                  <span className="text-white ml-2 mt-1">{selectedUser.bio || "Not provided"}</span>
                </div>
                <div>
                  <span className="text-gray-400">Location:</span>
                  <span className="text-white ml-2 font-medium">{selectedUser.location || "Not provided"}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400">Website:</span>
                  {selectedUser.website ? (
                    <a 
                      href={selectedUser.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 ml-2 font-medium"
                    >
                      {selectedUser.website}
                    </a>
                  ) : (
                    <span className="text-gray-500 ml-2">Not provided</span>
                  )}
                </div>
                <div>
                  <span className="text-gray-400">Wallet Address:</span>
                  <span className="text-white ml-2 font-mono text-sm break-all">
                    {selectedUser.walletAddress || "Not provided"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">User ID:</span>
                  <span className="text-white ml-2 font-mono text-sm break-all">{selectedUser._id}</span>
                </div>
                <div>
                  <span className="text-gray-400">Provider:</span>
                  <span className="text-white ml-2 font-medium capitalize">{selectedUser.provider}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-purple-400 mb-4">🔗 Social Links</h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-400">🐦 Twitter URL:</span>
                {selectedUser.socialLinks?.twitter ? (
                  <a 
                    href={selectedUser.socialLinks.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 ml-2 font-medium"
                  >
                    {selectedUser.socialLinks.twitter}
                  </a>
                ) : (
                  <span className="text-gray-500 ml-2">Not provided</span>
                )}
              </div>
              <div>
                <span className="text-gray-400">🐙 GitHub URL:</span>
                {selectedUser.socialLinks?.github ? (
                  <a 
                    href={selectedUser.socialLinks.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-300 ml-2 font-medium"
                  >
                    {selectedUser.socialLinks.github}
                  </a>
                ) : (
                  <span className="text-gray-500 ml-2">Not provided</span>
                )}
              </div>
              <div>
                <span className="text-gray-400">💼 LinkedIn URL:</span>
                {selectedUser.socialLinks?.linkedin ? (
                  <a 
                    href={selectedUser.socialLinks.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-500 ml-2 font-medium"
                  >
                    {selectedUser.socialLinks.linkedin}
                  </a>
                ) : (
                  <span className="text-gray-500 ml-2">Not provided</span>
                )}
              </div>
              <div>
                <span className="text-gray-400">💬 Discord Username:</span>
                <span className="text-white ml-2 font-medium">
                  {selectedUser.socialLinks?.discord || "Not provided"}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Submissions */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-pink-400">📝 Recent Content Submissions</h3>
              <div className="text-sm text-gray-400">
                Total: {contentSubmissions.length} | User's: {userSubmissions.length}
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              {/* Debug section - remove this after fixing */}
              {contentSubmissions.length > 0 && (
                <div className="mb-4 p-3 bg-gray-600 rounded text-xs">
                  <div className="text-yellow-400 mb-2">Debug Info:</div>
                  <div>Selected User ID: {selectedUser._id}</div>
                  <div>Selected User Email: {selectedUser.email}</div>
                  <div>Selected User Name: {selectedUser.name}</div>
                  <div className="mt-2">All submissions submittedBy values:</div>
                  {contentSubmissions.slice(0, 3).map((s, i) => (
                    <div key={i} className="ml-2">- {s.submittedBy}</div>
                  ))}
                </div>
              )}
              
              {userSubmissions.slice(0, 5).map((submission) => (
                <div key={submission._id} className="border-b border-gray-600 last:border-b-0 py-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-white">
                        {submission.title || "Untitled Submission"}
                      </h4>
                      <div className="text-sm text-gray-400 mt-1">
                        <span>🐦 @{submission.twitterHandle}</span>
                        <span className="ml-4">💬 {submission.discordUsername}</span>
                        <span className="ml-4">📝 {submission.contentType.replace("-", " ").toUpperCase()}</span>
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        📅 {new Date(submission.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      submission.status === "approved" ? "bg-green-100 text-green-800" :
                      submission.status === "rejected" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {submission.status.toUpperCase()}
                    </span>
                  </div>
                  {submission.description && (
                    <p className="text-gray-300 text-sm mt-2 line-clamp-2">
                      {submission.description}
                    </p>
                  )}
                  <a
                    href={submission.contentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 text-sm mt-2 inline-block"
                  >
                    View Content →
                  </a>
                </div>
              ))}
              
              {userSubmissions.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-2">📝</div>
                  <p>No content submissions yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={() => selectedUser.isWhitelisted ? removeWhitelist(selectedUser.email) : whitelistUser(selectedUser.email)}
              className={`px-4 py-2 rounded-lg font-semibold text-white transition ${
                selectedUser.isWhitelisted ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {selectedUser.isWhitelisted ? "Remove from Whitelist" : "Add to Whitelist"}
            </button>
            <button
              onClick={closeUserDetails}
              className="px-4 py-2 rounded-lg font-semibold text-white bg-gray-600 hover:bg-gray-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
