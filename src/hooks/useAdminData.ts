"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Post {
  _id: string;
  title: string;
  description: string;
  link?: string;
  votes: number;
}

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

interface Asset {
  _id: string;
  title: string;
  description?: string;
  gdriveLink: string;
  type: "image" | "video" | "banner";
  category?: string;
  createdAt: string;
}

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

interface Announcement {
  _id: string;
  title: string;
  content: string;
  priority: "low" | "medium" | "high";
  isActive: boolean;
  createdBy: string;
  createdAt: string;
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

export function useAdminData() {
  const { data: session, status } = useSession();
  
  // State for all data
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [recordings, setRecordings] = useState<TownhallRecording[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [contentSubmissions, setContentSubmissions] = useState<ContentSubmission[]>([]);
  
  // Form states
  const [newPost, setNewPost] = useState({ title: "", description: "", link: "" });
  const [newAsset, setNewAsset] = useState<{ title: string; description: string; gdriveLink: string; type: "image" | "video" | "banner"; category: string }>({ title: "", description: "", gdriveLink: "", type: "image", category: "" });
  const [newRecording, setNewRecording] = useState({ title: "", description: "", gdriveLink: "", recordingDate: "", thumbnailUrl: "", duration: "" });
  const [newAnnouncement, setNewAnnouncement] = useState<{ title: string; content: string; priority: "low" | "medium" | "high" }>({ title: "", content: "", priority: "medium" });
  
  // Search states
  const [postSearch, setPostSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [assetSearch, setAssetSearch] = useState("");
  const [recordingSearch, setRecordingSearch] = useState("");
  const [announcementSearch, setAnnouncementSearch] = useState("");
  const [submissionSearch, setSubmissionSearch] = useState("");
  
  // Other states
  const [isVotingActive, setIsVotingActive] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  // Fetch functions
  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      setUsers(data.map((u: User) => ({ ...u, _id: u._id })));
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const fetchPosts = async () => {
    try {
      const postsRes = await fetch("/api/posts?showAll=true&showClosed=false");
      const postsData = await postsRes.json();

      const postsWithSyncedVotes = await Promise.all(
        postsData.map(async (post: Post) => {
          try {
            const votesRes = await fetch(`/api/votes?postId=${post._id}`);
            const votesData = await votesRes.json();
            return { ...post, votes: votesData.count || 0 };
          } catch (err) {
            console.error(`Failed to sync votes for post ${post._id}:`, err);
            return post;
          }
        })
      );

      setPosts(postsWithSyncedVotes);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    }
  };

  const fetchAssets = async () => {
    try {
      const response = await fetch("/api/assets");
      const data = await response.json();
      setAssets(data);
    } catch (err) {
      console.error("Failed to fetch assets:", err);
    }
  };

  const fetchRecordings = async () => {
    try {
      const response = await fetch("/api/townhall-recordings");
      const data = await response.json();
      setRecordings(data);
    } catch (err) {
      console.error("Failed to fetch recordings:", err);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch("/api/announcements");
      const data = await response.json();
      setAnnouncements(data);
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
    }
  };

  const fetchContentSubmissions = async () => {
    try {
      const response = await fetch("/api/content-submissions");
      const data = await response.json();
      console.log("Fetched content submissions:", data);
      setContentSubmissions(data);
    } catch (err) {
      console.error("Failed to fetch content submissions:", err);
    }
  };

  const fetchVotingStatus = async () => {
    try {
      const response = await fetch("/api/voting-status");
      const data = await response.json();
      setIsVotingActive(data.isVotingActive);
      setCurrentPeriod(data.currentPeriod);
    } catch (err) {
      console.error("Failed to fetch voting status:", err);
    }
  };

  // CRUD operations
  const whitelistUser = async (email: string) => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, isWhitelisted: true }),
      });
      const updated = await res.json();
      if (updated.success) {
        setUsers((prev) =>
          prev.map((u) => (u.email === email ? { ...u, isWhitelisted: true } : u))
        );
      }
    } catch (err) {
      console.error("Whitelist user error:", err);
    }
  };

  const removeWhitelist = async (email: string) => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, isWhitelisted: false }),
      });
      const updated = await res.json();
      if (updated.success) {
        setUsers((prev) =>
          prev.map((u) => (u.email === email ? { ...u, isWhitelisted: false } : u))
        );
      }
    } catch (err) {
      console.error("Remove whitelist error:", err);
    }
  };

  const addPost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });

      const post = await res.json();
      if (post._id) {
        setPosts((prev) => [...prev, { ...post, votes: 0 }]);
        setNewPost({ title: "", description: "", link: "" });
      }
    } catch (err) {
      console.error("Add post error:", err);
    }
  };

  const deletePost = async (id: string) => {
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete post");
      setPosts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Delete post error:", err);
    }
  };

  const startVoting = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/voting-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });

      const result = await res.json();
      if (result.success) {
        alert(`Voting started successfully!`);
        fetchVotingStatus();
        window.location.reload();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (err) {
      console.error("Start voting error:", err);
      alert("Failed to start voting. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const stopVoting = async () => {
    if (!confirm("Are you sure you want to close voting? This will hide all posts from users and generate results.")) {
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/voting-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stop" }),
      });

      const result = await res.json();
      if (result.success) {
        alert(`Voting closed successfully! Results have been generated and posts are now hidden from users.`);
        fetchVotingStatus();
        window.location.reload();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (err) {
      console.error("Stop voting error:", err);
      alert("Failed to stop voting. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Asset CRUD operations
  const addAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAsset),
      });
      const asset = await res.json();
      if (asset._id) {
        setAssets(prev => [...prev, asset]);
        setNewAsset({ title: "", description: "", gdriveLink: "", type: "image", category: "" });
      }
    } catch (err) {
      console.error("Add asset error:", err);
    }
  };

  const deleteAsset = async (id: string) => {
    try {
      const res = await fetch(`/api/assets/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete asset");
      setAssets(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      console.error("Delete asset error:", err);
    }
  };

  // Recording CRUD operations
  const addRecording = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/townhall-recordings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecording),
      });
      const recording = await res.json();
      if (recording._id) {
        setRecordings(prev => [...prev, recording]);
        setNewRecording({ title: "", description: "", gdriveLink: "", recordingDate: "", thumbnailUrl: "", duration: "" });
      }
    } catch (err) {
      console.error("Add recording error:", err);
    }
  };

  const deleteRecording = async (id: string) => {
    try {
      const res = await fetch(`/api/townhall-recordings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete recording");
      setRecordings(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      console.error("Delete recording error:", err);
    }
  };

  // Announcement CRUD operations
  const addAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAnnouncement),
      });
      const announcement = await res.json();
      if (announcement._id) {
        setAnnouncements(prev => [...prev, announcement]);
        setNewAnnouncement({ title: "", content: "", priority: "medium" });
      }
    } catch (err) {
      console.error("Add announcement error:", err);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete announcement");
      setAnnouncements(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      console.error("Delete announcement error:", err);
    }
  };

  // Content submission operations
  const updateSubmissionStatus = async (id: string, status: "pending" | "approved" | "rejected", adminNotes?: string) => {
    try {
      const res = await fetch(`/api/content-submissions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes }),
      });
      if (res.ok) {
        setContentSubmissions(prev => 
          prev.map(s => s._id === id ? { ...s, status, adminNotes } : s)
        );
      }
    } catch (err) {
      console.error("Update submission error:", err);
    }
  };

  const deleteSubmission = async (id: string) => {
    try {
      const res = await fetch(`/api/content-submissions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete submission");
      setContentSubmissions(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      console.error("Delete submission error:", err);
    }
  };

  // User details functionality
  const viewUserDetails = async (user: User) => {
    try {
      const response = await fetch(`/api/users/profile?userId=${user._id}`, {
        method: "GET",
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedUser(data.user || user);
      } else {
        setSelectedUser(user);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      setSelectedUser(user);
    }
    
    setShowUserDetails(true);
  };

  const closeUserDetails = () => {
    setSelectedUser(null);
    setShowUserDetails(false);
  };

  // Load all data on mount
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.isAdmin) return;

    fetchUsers();
    fetchPosts();
    fetchAssets();
    fetchRecordings();
    fetchAnnouncements();
    fetchContentSubmissions();
    fetchVotingStatus();
  }, [status, session]);

  return {
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
  };
}
