// src/components/admin/AdminDashboard2.jsx → FINAL ULTIMATE VERSION

import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { Users, MessageCircle, Eye, Search, Send } from "lucide-react";

const AdminDashboard2 = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userMessages, setUserMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [visitorStats, setVisitorStats] = useState({});
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [adminMessage, setAdminMessage] = useState("");

  // Load visitor stats
  useEffect(() => {
    const loadStats = async () => {
      const stats = {};
      for (const user of users) {
        try {
          const res = await api.get(`/admin/user-visitor-stats/${user._id}`);
          if (res.data.success) {
            stats[user._id] = {
              total: res.data.totalVisits,
              unique: res.data.uniqueVisitors,
              today: res.data.todayVisits,
            };
          }
        } catch (err) {
          stats[user._id] = { total: 0, unique: 0, today: 0 };
        }
      }
      setVisitorStats(stats);
    };

    if (users.length > 0) loadStats();
  }, [users]);

  // Load all users
  useEffect(() => {
    loadAllUsers();
  }, []);

  const loadAllUsers = async () => {
    try {
      const res = await api.get("/admin/all-users");
      setUsers(res.data.users || []);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // View user messages
  const viewUserMessages = async (userId) => {
    try {
      const res = await api.get(`/admin/user-messages/${userId}`);
      setUserMessages(res.data.messages || []);
      setSelectedUser(users.find(u => u._id === userId));
      setReplyText("");
      setReplyingTo(null);
      setAdminMessage("");
    } catch (err) {
      toast.error("Failed to load messages");
    }
  };

  // Reply to specific message
  const sendReply = async (messageId) => {
    if (!replyText.trim()) return toast.error("Write a reply first");

    try {
      await api.post(`/admin/support/reply/${messageId}`, { reply: replyText });
      toast.success("Reply sent!");

      setUserMessages(prev => prev.map(msg =>
        msg._id === messageId
          ? { ...msg, adminReply: replyText, repliedAt: new Date() }
          : msg
      ));

      setReplyText("");
      setReplyingTo(null);
    } catch (err) {
      toast.error("Failed to send reply");
    }
  };

  // Admin sends direct message to user
  const sendAdminMessage = async () => {
    if (!adminMessage.trim()) return;

    try {
      await api.post("/admin/send-message-to-user", {
        userId: selectedUser._id,
        message: adminMessage.trim()
      });

      toast.success("Message bhej diya user ko!");

      // Add to chat instantly
      setUserMessages(prev => [{
        _id: Date.now() + Math.random(),
        message: `[ADMIN]: ${adminMessage.trim()}`,
        adminReply: adminMessage.trim(),
        repliedAt: new Date(),
        createdAt: new Date()
      }, ...prev]);

      setAdminMessage("");
    } catch (err) {
      toast.error("Message nahi gaya");
    }
  };

  // Impersonate user
  const impersonateUser = (userId) => {
    localStorage.setItem("impersonateUserId", userId);
    localStorage.setItem("isImpersonating", "true");
    toast.success(`Now viewing as ${users.find(u => u._id === userId)?.name || 'User'}`);
    window.location.href = "/";
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <h1 className="text-4xl font-bold text-gray-800 mb-8 flex items-center gap-3">
          <Users size={40} className="text-red-600" /> Admin Panel - All Users
        </h1>

        {/* Search */}
        <div className="mb-8 relative">
          <Search className="absolute left-4 top-4 text-gray-400" size={24} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-5 border-2 border-gray-200 rounded-2xl text-lg focus:ring-4 focus:ring-red-300 focus:border-red-500 transition"
          />
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {filteredUsers.map((user) => (
            <div key={user._id} className="bg-white rounded-3xl shadow-xl p-8 border-2 border-transparent hover:border-red-500 transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{user.name}</h3>
                  <p className="text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="space-y-4 text-lg">
                <p>Earnings: <b className="text-green-600">₹{Number(user.totalEarnings || 0).toFixed(2)}</b></p>
                <p>Clicks: <b className="text-blue-600">{user.totalClicks || 0}</b></p>
                <p>Links: <b className="text-purple-600">{user.linkCount || 0}</b></p>
                <p>Referrals: <b className="text-orange-600">{user.referralStats?.directReferralCount || 0}</b></p>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t-2 border-gray-100">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{visitorStats[user._id]?.total || 0}</p>
                  <p className="text-xs text-gray-500">Total Visits</p>
                </div>
                <div className="text-center border-x-2 border-gray-200">
                  <p className="text-2xl font-bold text-green-600">{visitorStats[user._id]?.unique || 0}</p>
                  <p className="text-xs text-gray-500">Unique</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{visitorStats[user._id]?.today || 0}</p>
                  <p className="text-xs text-gray-500">Today</p>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => viewUserMessages(user._id)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-2xl font-bold hover:from-blue-700 hover:to-blue-800 flex items-center justify-center gap-3 shadow-lg transform hover:scale-105 transition"
                >
                  <MessageCircle size={22} /> Messages
                </button>
                <button
                  onClick={() => impersonateUser(user._id)}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-2xl font-bold hover:from-red-700 hover:to-red-800 flex items-center justify-center gap-3 shadow-lg transform hover:scale-105 transition"
                >
                  <Eye size={22} /> View Account
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* MESSAGES MODAL */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-4xl">
              <div className="sticky top-0 bg-white border-b-2 border-gray-100 p-8 flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800">
                  Chat with <span className="text-red-600">{selectedUser.name}</span>
                </h2>
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setUserMessages([]);
                    setReplyText("");
                    setReplyingTo(null);
                    setAdminMessage("");
                  }}
                  className="text-4xl text-gray-500 hover:text-gray-800 transition"
                >
                  ×
                </button>
              </div>

              <div className="p-8">
                {userMessages.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-2xl text-gray-500">No messages yet</p>
                    <p className="text-gray-400 mt-4">Start the conversation below!</p>
                  </div>
                ) : (
                  <div className="space-y-8 mb-12">
                    {userMessages.map((msg) => (
                      <div key={msg._id} className="space-y-6">

                        {/* USER MESSAGE */}
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-3xl border-l-8 border-blue-600 shadow-md">
                          <p className="text-lg font-medium text-gray-800">{msg.message}</p>
                          <p className="text-sm text-gray-500 mt-3">
                            {new Date(msg.createdAt).toLocaleString()}
                          </p>
                        </div>

                        {/* ADMIN REPLY */}
                        {msg.adminReply && (
                          <div className="space-y-4">
                            {/* Success Banner */}
                            <div className="p-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-3xl shadow-xl flex items-center gap-4 animate-pulse">
                              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <div>
                                <p className="text-xl font-bold">Reply Sent!</p>
                                <p>User ko message chala gaya</p>
                              </div>
                            </div>

                            {/* Reply Card */}
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-3xl border-l-8 border-green-600 ml-12 relative shadow-xl">
                              <div className="flex items-start gap-5">
                                <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-700 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-2xl">
                                  A
                                </div>
                                <div className="flex-1">
                                  <p className="text-xl font-bold text-green-800 mb-2">Admin Reply</p>
                                  <p className="text-lg text-gray-800 leading-relaxed">{msg.adminReply}</p>
                                  <p className="text-sm text-gray-500 mt-4">
                                    {msg.repliedAt ? new Date(msg.repliedAt).toLocaleString() : "Just now"}
                                  </p>
                                </div>
                              </div>
                              <div className="absolute -top-5 -right-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-8 py-4 rounded-full text-lg font-bold shadow-2xl border-4 border-white animate-bounce">
                                REPLY SENT
                              </div>
                            </div>
                          </div>
                        )}

                        {/* REPLY BOX (only if no reply yet) */}
                        {!msg.adminReply && (
                          <div className="ml-12 flex gap-4 items-end">
                            <textarea
                              placeholder="Reply likho yahan..."
                              value={replyingTo === msg._id ? replyText : ""}
                              onChange={(e) => {
                                setReplyingTo(msg._id);
                                setReplyText(e.target.value);
                              }}
                              className="flex-1 p-5 border-2 border-gray-300 rounded-2xl resize-none h-32 text-lg focus:border-green-500 focus:ring-4 focus:ring-green-200 transition"
                            />
                            <button
                              onClick={() => sendReply(msg._id)}
                              disabled={!replyText.trim() || replyingTo !== msg._id}
                              className="px-10 py-8 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-bold text-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 shadow-2xl transform hover:scale-110 transition flex items-center gap-3"
                            >
                              <Send size={28} /> SEND
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* ADMIN DIRECT MESSAGE BOX - ALWAYS AT BOTTOM */}
                <div className="mt-16 p-10 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-3xl shadow-2xl border-8 border-white">
                  <h3 className="text-4xl font-bold text-white text-center mb-8 drop-shadow-lg">
                    Message Bhejo {selectedUser.name} Ko
                  </h3>
                  <div className="flex gap-6">
                    <input
                      type="text"
                      value={adminMessage}
                      onChange={(e) => setAdminMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendAdminMessage()}
                      placeholder="Yahan likho aur Enter daba do..."
                      className="flex-1 p-6 text-xl rounded-3xl focus:ring-8 focus:ring-white/30 outline-none shadow-2xl font-medium"
                    />
                    <button
                      onClick={sendAdminMessage}
                      disabled={!adminMessage.trim()}
                      className="px-16 py-6 bg-white text-purple-700 font-bold text-2xl rounded-3xl hover:bg-gray-100 transform hover:scale-110 transition shadow-2xl disabled:opacity-50 flex items-center gap-4"
                    >
                      <Send size={32} /> SEND
                    </button>
                  </div>
                  <p className="text-center text-white/90 mt-6 text-lg font-medium">
                    Ye message user ko turant dikhega — jaise WhatsApp!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard2;