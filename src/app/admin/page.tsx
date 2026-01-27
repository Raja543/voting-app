"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import { type ContentSubmission } from "@/components/admin/UserDetailsModal";

const AdminTabs = dynamic(
  () => import("@/components/admin").then((m) => m.AdminTabs),
  { ssr: false }
);
const PostsTab = dynamic(
  () => import("@/components/admin").then((m) => m.PostsTab),
  { ssr: false }
);
const UsersTab = dynamic(
  () => import("@/components/admin").then((m) => m.UsersTab),
  { ssr: false }
);
const AssetsTab = dynamic(
  () => import("@/components/admin").then((m) => m.AssetsTab),
  { ssr: false }
);
const RecordingsTab = dynamic(
  () => import("@/components/admin").then((m) => m.RecordingsTab),
  { ssr: false }
);
const AnnouncementsTab = dynamic(
  () => import("@/components/admin").then((m) => m.AnnouncementsTab),
  { ssr: false }
);
const SubmissionsTab = dynamic(
  () => import("@/components/admin").then((m) => m.SubmissionsTab),
  { ssr: false }
);
const UserDetailsModal = dynamic(
  () => import("@/components/admin").then((m) => m.UserDetailsModal),
  { ssr: false }
);

import { useAdminData } from "@/hooks/useAdminData";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAdmin = Boolean((session?.user as any)?.isAdmin);

  const {
    users,
    posts,
    assets,
    recordings,
    announcements,
    contentSubmissions,
    newPost,
    setNewPost,
    newAsset,
    setNewAsset,
    assetFiles,
    setAssetFiles,
    newRecording,
    setNewRecording,
    newAnnouncement,
    setNewAnnouncement,

    // Search states
    postSearch,
    setPostSearch,
    userSearch,
    setUserSearch,
    assetSearch,
    setAssetSearch,
    recordingSearch,
    setRecordingSearch,
    announcementSearch,
    setAnnouncementSearch,
    submissionSearch,
    setSubmissionSearch,

    // Other states
    isVotingActive,
    currentPeriod,
    isLoading,
    activeTab,
    setActiveTab,
    selectedUser,
    showUserDetails,

    // Functions
    whitelistUser,
    removeWhitelist,
    addPost,
    deletePost,
    startVoting,
    stopVoting,
    addAsset,
    deleteAsset,
    addRecording,
    deleteRecording,
    addAnnouncement,
    deleteAnnouncement,
    updateSubmissionStatus,
    deleteSubmission,
    viewUserDetails,
    closeUserDetails,
  } = useAdminData();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    if (status === "authenticated" && !isAdmin) {
      router.replace("/");
    }
  }, [status, isAdmin, router]);

  if (status === "loading") return <div>Loading...</div>;

  if (status === "unauthenticated" || !isAdmin) {
    return <div>Access Denied</div>;
  }

  return (
    <>
      <Sidebar />

      <div className="min-h-screen bg-[#0D1117] text-gray-100 px-4 py-6 sm:px-8 sm:py-8">
        <div className="container px-0 sm:px-4 py-8">
          {/* Tab Navigation */}
          <AdminTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Tab Content */}
          {activeTab === "posts" && (
            <PostsTab
              posts={posts}
              newPost={newPost}
              setNewPost={setNewPost}
              addPost={addPost}
              deletePost={deletePost}
              postSearch={postSearch}
              setPostSearch={setPostSearch}
              isVotingActive={isVotingActive}
              currentPeriod={currentPeriod}
              startVoting={startVoting}
              stopVoting={stopVoting}
              isLoading={isLoading}
            />
          )}

          {activeTab === "users" && (
            <UsersTab
              users={users}
              userSearch={userSearch}
              setUserSearch={setUserSearch}
              whitelistUser={whitelistUser}
              removeWhitelist={removeWhitelist}
              viewUserDetails={viewUserDetails}
            />
          )}

          {activeTab === "assets" && (
            <AssetsTab
              assets={assets}
              newAsset={newAsset}
              setNewAsset={setNewAsset}
              addAsset={addAsset}
              assetFiles={assetFiles}
              setAssetFiles={setAssetFiles}
              deleteAsset={deleteAsset}
              assetSearch={assetSearch}
              setAssetSearch={setAssetSearch}
            />
          )}

          {activeTab === "recordings" && (
            <RecordingsTab
              recordings={recordings}
              newRecording={newRecording}
              setNewRecording={setNewRecording}
              addRecording={addRecording}
              deleteRecording={deleteRecording}
              recordingSearch={recordingSearch}
              setRecordingSearch={setRecordingSearch}
            />
          )}

          {activeTab === "announcements" && (
            <AnnouncementsTab
              announcements={announcements}
              newAnnouncement={newAnnouncement}
              setNewAnnouncement={setNewAnnouncement}
              addAnnouncement={addAnnouncement}
              deleteAnnouncement={deleteAnnouncement}
              announcementSearch={announcementSearch}
              setAnnouncementSearch={setAnnouncementSearch}
            />
          )}

          {activeTab === "submissions" && (
            <SubmissionsTab
              contentSubmissions={contentSubmissions}
              updateSubmissionStatus={updateSubmissionStatus} // Ensure this is passed
              deleteSubmission={deleteSubmission}
              submissionSearch={submissionSearch}
              setSubmissionSearch={setSubmissionSearch}
            />
          )}

          {/* User Details Modal */}
          <UserDetailsModal
            selectedUser={selectedUser}
            showUserDetails={showUserDetails}
            closeUserDetails={closeUserDetails}
            contentSubmissions={contentSubmissions}
            removeWhitelist={removeWhitelist}
            whitelistUser={whitelistUser}
          />
        </div>
      </div>
    </>
  );
}