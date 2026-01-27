"use client";

interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
  provider: string;
  isAdmin: boolean;
  isWhitelisted: boolean;
}

interface UsersTabProps {
  users: User[];
  userSearch: string;
  setUserSearch: (search: string) => void;
  whitelistUser: (email: string) => void;
  removeWhitelist: (email: string) => void;
  viewUserDetails: (user: User) => void | Promise<void>;
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
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="bg-[#11161c] border border-gray-800 overflow-x-hidden">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-[#3aa0d8] text-xs sm:text-sm mb-2">
          Users
        </h2>
        <input
          placeholder="Search users"
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
          className="w-full bg-[#0b0f14] px-3 py-2 text-xs sm:text-sm text-white border border-gray-700 focus:outline-none"
        />
      </div>

      {/* Users List */}
      <div className="divide-y divide-gray-800 max-h-[520px] overflow-y-auto">
        {filteredUsers.map((user) => (
          <div
            key={user._id}
            className="p-4 grid grid-cols-[3fr_1fr] md:flex md:items-center md:justify-between gap-4">
            <div className="flex gap-4 min-w-0">
              <div className="w-16 h-16 bg-gray-500 shrink-0" />
              <div className="min-w-0">
                <div className="text-white text-sm sm:text-base font-medium break-words">
                  {user.name}
                </div>

                <div className="text-gray-400 text-xs sm:text-sm break-all">
                  {user.email}
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {user.isAdmin && (
                    <span className="bg-[#027DA4] text-white text-[10px] sm:text-xs px-2 py-[2px]">
                      admin
                    </span>
                  )}
                  {user.isWhitelisted && (
                    <span className="bg-[#10B981] text-white text-[10px] sm:text-xs px-2 py-[2px]">
                      whitelisted
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div
              className="flex flex-col gap-2 md:flex-row md:gap-3 md:items-center md:justify-end">
              <button
                onClick={() => viewUserDetails(user)}
                className="bg-[#027DA4] hover:bg-[#016381] text-white text-[10px] sm:text-xs md:text-sm px-4 py-1">
                Details
              </button>

              <button
                onClick={() =>
                  user.isWhitelisted
                    ? removeWhitelist(user.email)
                    : whitelistUser(user.email)
                }
                className="bg-[#E40041] hover:bg-[#B0003A] text-white text-[10px] sm:text-xs md:text-sm px-4 py-1">
                {user.isWhitelisted ? "Remove" : "Whitelist"}
              </button>
            </div>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="p-6 text-gray-500 text-xs sm:text-sm">
            No users found
          </div>
        )}
      </div>
    </div>
  );
}
