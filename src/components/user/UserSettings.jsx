// src/components/user/UserSettings.jsx → FINAL WHATSAPP STYLE CHAT + SUPPORT

import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { MessageCircle, X, Send } from "lucide-react";

const UserSettings = () => {
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [messages, setMessages] = useState([]); // ← AB HISTORY BHI DIKHEGI
  const [chatMessage, setChatMessage] = useState("");

  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    loadProfile();
    loadChatHistory(); // ← AB HISTORY BHI LOAD HOGI
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get("/user/profile");
      setProfile({ name: res.data.user.name, email: res.data.user.email });
    } catch (err) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  // Load chat history + admin replies
  const loadChatHistory = async () => {
    try {
      const res = await api.get("/support/my-messages");
      setMessages(res.data.messages || []);
      
      // Count unread replies
      const unread = res.data.messages.filter(m => m.adminReply && !m.readByUser).length;
      setUnreadCount(unread);
    } catch (err) {
      console.log("No chat history");
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error("Passwords do not match!");
    }
    if (passwords.newPassword.length < 6) {
      return toast.error("Password must be 6+ characters");
    }

    try {
      await api.post("/user/change-password", passwords);
      toast.success("Password changed!");
      setPasswords({ newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const sendMessageToAdmin = async () => {
    if (!chatMessage.trim()) return toast.error("Message likho pehle");

    try {
      await api.post("/support/message", { message: chatMessage.trim() });
      toast.success("Message bheja gaya! Admin jaldi reply karega");

      // Add to local chat
      setMessages(prev => [{
        _id: Date.now(),
        message: chatMessage.trim(),
        createdAt: new Date(),
        adminReply: null
      }, ...prev]);

      setChatMessage("");
      loadChatHistory(); // Refresh unread count
    } catch (err) {
      toast.error("Message nahi gaya");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-8 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 relative min-h-screen pb-32">

      <h2 className="text-4xl font-bold text-gray-800 text-center">Account Settings</h2>

      {/* Profile Info */}
      <div className="bg-white p-10 rounded-3xl shadow-2xl border-2 border-gray-100">
        <h3 className="text-2xl font-bold mb-8 text-indigo-600 flex items-center gap-3">
          Profile Information
        </h3>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-gray-600 font-medium">Full Name</label>
            <div className="p-5 bg-gray-50 rounded-2xl border-2 border-gray-200 text-lg font-semibold">
              {profile.name}
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-gray-600 font-medium">Email Address</label>
            <div className="p-5 bg-gray-50 rounded-2xl border-2 border-gray-200 text-lg font-semibold">
              {profile.email}
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white p-10 rounded-3xl shadow-2xl border-2 border-gray-100">
        <h3 className="text-2xl font-bold mb-8 text-indigo-600">Change Password</h3>
        <form onSubmit={changePassword} className="space-y-6 max-w-lg">
          <input
            type="password"
            placeholder="New Password (min 6 chars)"
            value={passwords.newPassword}
            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
            className="w-full p-5 border-2 rounded-2xl text-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition"
            required
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={passwords.confirmPassword}
            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
            className="w-full p-5 border-2 rounded-2xl text-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition"
            required
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-5 rounded-2xl font-bold text-xl hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition shadow-xl"
          >
            Update Password
          </button>
        </form>
      </div>

      {/* Floating WhatsApp Style Chat Button */}
      <button
        onClick={() => {
          setShowChat(true);
          setUnreadCount(0); // Mark as read
        }}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-6 rounded-full shadow-2xl z-50 transition-all transform hover:scale-110 animate-bounce"
      >
        <MessageCircle size={40} />
        {unreadCount > 0 && (
          <span className="absolute -top-3 -right-3 bg-red-600 text-white text-lg rounded-full h-10 w-10 flex items-center justify-center font-bold shadow-2xl animate-pulse border-4 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Chat Window - WhatsApp Style */}
      {showChat && (
        <div className="fixed bottom-28 right-8 w-96 h-[600px] bg-white rounded-3xl shadow-3xl border-4 border-green-500 z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-5 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Admin Support</h3>
                <p className="text-sm opacity-90">Usually replies within hours</p>
              </div>
            </div>
            <button onClick={() => setShowChat(false)} className="hover:bg-white/20 p-2 rounded-full">
              <X size={28} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50 to-white">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-20">
                <MessageCircle size={64} className="mx-auto mb-4 opacity-30" />
                <p className="text-lg">Start chatting with admin</p>
                <p className="text-sm">Your messages are 100% private</p>
              </div>
            ) : (
              [...messages].reverse().map((msg) => (
                <div key={msg._id}>
                  {/* User Message */}
                  <div className="bg-blue-600 text-white p-5 rounded-3xl rounded-tr-none max-w-xs ml-auto shadow-lg">
                    <p className="text-lg">{msg.message}</p>
                    <p className="text-xs opacity-70 mt-2 text-right">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>

                  {/* Admin Reply */}
                  {msg.adminReply && (
                    <div className="bg-gray-200 text-gray-800 p-5 rounded-3xl rounded-tl-none max-w-xs mr-auto mt-4 shadow-lg border-l-4 border-green-500">
                      <p className="font-bold text-green-700 mb-1">Admin Reply</p>
                      <p className="text-lg">{msg.adminReply}</p>
                      <p className="text-xs opacity-70 mt-2">
                        {msg.repliedAt ? new Date(msg.repliedAt).toLocaleTimeString() : "Just now"}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 bg-gray-100 border-t-4 border-green-500">
            <div className="flex gap-3">
              <textarea
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessageToAdmin())}
                placeholder="Type your message..."
                className="flex-1 p-5 rounded-3xl border-2 border-gray-300 focus:border-green-500 focus:ring-4 focus:ring-green-200 resize-none text-lg"
                rows="2"
              />
              <button
                onClick={sendMessageToAdmin}
                disabled={!chatMessage.trim()}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-5 rounded-full hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 shadow-2xl transform hover:scale-110 transition"
              >
                <Send size={32} />
              </button>
            </div>
            <p className="text-center text-xs text-gray-500 mt-3">
              Press Enter to send • Your chat is end-to-end private
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSettings;