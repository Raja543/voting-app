"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import {
  AdminTabs,
  PostsTab,
  UsersTab,
  AssetsTab,
  RecordingsTab,
  AnnouncementsTab,
  SubmissionsTab,
  UserDetailsModal,
} from "@/components/admin";
import { useAdminData } from "@/hooks/useAdminData";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const {
    // Data
    users,
    posts,
    assets,
    recordings,
    announcements,
    contentSubmissions,
    
    // Form states
    newPost,
    setNewPost,
    newAsset,
    setNewAsset,
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

  // Redirect logic
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    if (status === "authenticated" && session?.user && !session.user.isAdmin) {
      router.replace("/");
    }
  }, [status, session, router]);

  // Loading state
  if (status === "loading") return <div>Loading...</div>;

  // Not authenticated or not admin
  if (status === "unauthenticated") return <div>Access Denied</div>;
  if (!session?.user?.isAdmin) return <div>Access Denied</div>;

  return (
    <>
      <Navbar showAdminHeading={true} />
      
      <div className="min-h-screen bg-gray-900 text-gray-100 pt-20">
        <div className="container mx-auto px-4 py-8">
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
              updateSubmissionStatus={updateSubmissionStatus}
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