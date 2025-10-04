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

interface UsersTabProps {
  users: User[];
  userSearch: string;
  setUserSearch: (search: string) => void;
  whitelistUser: (email: string) => void;
  removeWhitelist: (email: string) => void;
  viewUserDetails: (user: User) => void;
}

export default function UsersTab({
  users,
  userSearch,
  setUserSearch,
  whitelistUser,
  removeWhitelist,
  viewUserDetails,
}: UsersTabProps) {
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-blue-400">Users</h2>
        <input
          type="text"
          placeholder="Search users..."
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
          className="mt-4 w-full rounded-lg bg-gray-700 text-gray-100 px-3 py-2 border border-gray-600 focus:border-green-500 focus:outline-none"
        />
      </div>
      <div className="max-h-96 overflow-y-auto">
        {filteredUsers.map((user) => (
          <div key={user._id} className="p-4 border-b border-gray-700 last:border-b-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-100">{user.name}</p>
                  <p className="text-sm text-gray-400">{user.email}</p>
                  <div className="flex gap-2 mt-1">
                    {user.isAdmin && (
                      <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">Admin</span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user.isWhitelisted ? "bg-green-600 text-white" : "bg-gray-600 text-white"
                    }`}>
                      {user.isWhitelisted ? "Whitelisted" : "Not Whitelisted"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => viewUserDetails(user)}
                  className="px-3 py-1 rounded-lg font-semibold text-white bg-purple-600 hover:bg-purple-700 transition"
                >
                  Details
                </button>
                <button
                  onClick={() => user.isWhitelisted ? removeWhitelist(user.email) : whitelistUser(user.email)}
                  className={`px-3 py-1 rounded-lg font-semibold text-white transition ${
                    user.isWhitelisted ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {user.isWhitelisted ? "Remove" : "Whitelist"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
