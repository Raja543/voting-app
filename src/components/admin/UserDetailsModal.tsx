"use client";

interface User {
  _id: string;
  name: string;
  email: string;
  username?: string;
  bio?: string;
  walletAddress?: string;
  image?: string;
  provider: string;
  isAdmin: boolean;
  isWhitelisted: boolean;
  socialLinks?: {
    twitter?: string;
    discord?: string;
    youtube?: string;
  };
}

interface UserDetailsModalProps {
  selectedUser: User | null;
  showUserDetails: boolean;
  closeUserDetails: () => void;
  removeWhitelist: (email: string) => void;
  whitelistUser: (email: string) => void;
}

export default function UserDetailsModal({
  selectedUser,
  showUserDetails,
  closeUserDetails,
  removeWhitelist,
  whitelistUser,
}: UserDetailsModalProps) {
  if (!showUserDetails || !selectedUser) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
      <div
        className="
          bg-[#11161c] border border-gray-800
          w-full h-full
          sm:h-auto sm:max-h-[90vh] sm:max-w-5xl
          overflow-y-auto flex flex-col
        "
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#11161c] border-b border-gray-800 p-4 sm:p-6 flex justify-between items-center">
          <h2 className="text-sm sm:text-xl font-bold text-white">
            User Profile
          </h2>
          <button
            onClick={closeUserDetails}
            className="text-white hover:opacity-80 text-lg"
          >
            ✕
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">

          {/* User Header */}
          <div className="flex items-center gap-4 bg-[#0b0f14] border border-gray-800 p-4">
            {selectedUser.image && (
              <img
                src={selectedUser.image}
                alt="User avatar"
                className="w-14 h-14 rounded-full border border-gray-700"
              />
            )}

            <div className="flex-1 min-w-0">
              <h3 className="text-white text-base sm:text-lg font-bold truncate">
                {selectedUser.name}
              </h3>
              <p className="text-white text-xs truncate">
                {selectedUser.username
                  ? `@${selectedUser.username}`
                  : selectedUser.email}
              </p>

              <div className="flex flex-wrap gap-2 mt-2">
                <span className="bg-[#027DA4] text-white text-[10px] px-2 py-[2px] font-semibold">
                  {selectedUser.provider}
                </span>

                {selectedUser.isAdmin && (
                  <span className="bg-purple-600 text-white text-[10px] px-2 py-[2px] font-semibold">
                    ADMIN
                  </span>
                )}

                <span
                  className={`text-[10px] px-2 py-[2px] font-semibold ${
                    selectedUser.isWhitelisted
                      ? "bg-[#10B981] text-white"
                      : "bg-[#E40041] text-white"
                  }`}
                >
                  {selectedUser.isWhitelisted ? "WHITELISTED" : "NOT WHITELISTED"}
                </span>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-[#0b0f14] border border-gray-800 p-4">
            <h3 className="text-white text-sm font-bold mb-4">
              User Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <InfoRow label="Name" value={selectedUser.name} />
              <InfoRow label="Email" value={selectedUser.email} />
              <InfoRow label="Username" value={selectedUser.username || "—"} />
              <InfoRow label="Provider" value={selectedUser.provider} />

              <div className="sm:col-span-2">
                <span className="text-white text-xs font-semibold">Bio</span>
                <p className="text-white text-sm mt-1">
                  {selectedUser.bio || "—"}
                </p>
              </div>

              <div className="sm:col-span-2">
                <span className="text-white text-xs font-semibold">Wallet</span>
                <p className="text-white text-xs font-mono break-all mt-1">
                  {selectedUser.walletAddress || "—"}
                </p>
              </div>

              <div className="sm:col-span-2">
                <span className="text-white text-xs font-semibold">User ID</span>
                <p className="text-white text-xs font-mono break-all mt-1">
                  {selectedUser._id}
                </p>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-[#0b0f14] border border-gray-800 p-4">
            <h3 className="text-white text-sm font-bold mb-4">
              Social Links
            </h3>

            <div className="space-y-3 text-sm">
              <SocialRow label="Twitter" value={selectedUser.socialLinks?.twitter} />
              <SocialRow label="YouTube" value={selectedUser.socialLinks?.youtube} />
              <InfoRow label="Discord" value={selectedUser.socialLinks?.discord || "—"} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={() =>
                selectedUser.isWhitelisted
                  ? removeWhitelist(selectedUser.email)
                  : whitelistUser(selectedUser.email)
              }
              className={`px-4 py-2 text-xs font-bold ${
                selectedUser.isWhitelisted
                  ? "bg-[#E40041] hover:bg-[#B0003A]"
                  : "bg-[#10B981] hover:bg-[#059669]"
              } text-white`}
            >
              {selectedUser.isWhitelisted ? "Remove Whitelist" : "Add Whitelist"}
            </button>

            <button
              onClick={closeUserDetails}
              className="px-4 py-2 text-xs font-bold bg-gray-700 hover:bg-gray-600 text-white"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ---------- Helpers ---------- */

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <span className="text-white text-xs font-semibold">{label}</span>
      <div className="text-white text-sm mt-1">{value || "—"}</div>
    </div>
  );
}

function SocialRow({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <span className="text-white text-xs font-semibold">{label}</span>
      {value ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-[#10B981] text-sm break-all mt-1 font-medium"
        >
          {value}
        </a>
      ) : (
        <div className="text-white text-sm mt-1">—</div>
      )}
    </div>
  );
}
