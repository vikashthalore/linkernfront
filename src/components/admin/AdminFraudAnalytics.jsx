// src/components/admin/AdminFraudAnalytics.jsx → FRAUD DETECTION GOD MODE

import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { AlertTriangle, Skull, Zap, Shield, Activity, Ban } from "lucide-react";

const AdminFraudAnalytics = () => {
  const [fraudLinks, setFraudLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFraudData();
    const interval = setInterval(loadFraudData, 600000); // Har 10 sec refresh
    return () => clearInterval(interval);
  }, []);

  const loadFraudData = async () => {
    try {
      const res = await api.get("/admin/fraud-detection");
      setFraudLinks(res.data.fraudLinks || []);
    } catch (err) {
      toast.error("Fraud data load nahi hua");
    } finally {
      setLoading(false);
    }
  };

  const blockUser = async (userId) => {
    if (!confirm("User ko permanently block kar de?")) return;
    try {
      await api.post("/admin/block-user", { userId });
      toast.success("User block kar diya gaya!");
      loadFraudData();
    } catch (err) {
      toast.error("Block nahi hua");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-amber-50 to-red-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black text-red-600 flex items-center justify-center gap-6">
            <Skull size={70} className="animate-pulse" />
            FRAUD DETECTION CENTER
            <Skull size={70} className="animate-pulse" />
          </h1>
          <p className="text-2xl text-gray-700 mt-4 font-bold">
            Real-time Fraud Monitoring • {fraudLinks.length} Active Threats
          </p>
        </div>

        {/* LIVE FRAUD ALERTS */}
        {fraudLinks.length === 0 ? (
          <div className="text-center py-20">
            <Shield size={100} className="mx-auto text-green-600 mb-6" />
            <p className="text-3xl font-bold text-green-600">No Fraud Detected Right Now</p>
            <p className="text-xl text-gray-600 mt-4">System 100% Clean & Safe</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {fraudLinks.map((link) => (
              <div
                key={link._id}
                className="bg-gradient-to-br from-red-600 to-pink-700 text-white rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition-all duration-300 border-4 border-red-800"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <AlertTriangle size={50} className="text-yellow-300 animate-pulse" />
                    <div>
                      <p className="text-3xl font-black">FRAUD ALERT</p>
                      <p className="text-sm opacity-90">High Risk Activity</p>
                    </div>
                  </div>
                  <Zap size={40} className="text-yellow-400 animate-ping" />
                </div>

                <div className="space-y-4 text-lg">
                  <p><span className="font-bold">User:</span> {link.userId.name}</p>
                  <p><span className="font-bold">Email:</span> {link.userId.email}</p>
                  <p><span className="font-bold">Link:</span> {link.name}</p>
                  <p><span className="font-bold">Short URL:</span> 
                    <a href={link.shortUrl} target="_blank" className="underline ml-2">
                      {link.shortUrl}
                    </a>
                  </p>
                  <p><span className="font-bold text-yellow-300">Today Clicks:</span> {link.totalClicks}</p>
                  <p><span className="font-bold text-yellow-300">Lifetime Clicks:</span> {link.lifetimeClicks}</p>
                  <p className="text-2xl font-black text-yellow-300 animate-pulse">
                    {Object.values(link.recentClicksFromIPs || {}).reduce((a, b) => a + b, 0)} clicks in last 30 min!
                  </p>
                </div>

                <div className="mt-8 flex gap-4">
                  <button
                    onClick={() => blockUser(link.userId._id)}
                    className="flex-1 bg-black text-white py-4 rounded-2xl font-bold text-xl hover:bg-gray-900 transform hover:scale-110 transition flex items-center justify-center gap-3 shadow-2xl"
                  >
                    <Ban size={28} /> BLOCK USER
                  </button>
                  <a
                    href={`/admin/user/${link.userId._id}`}
                    className="flex-1 bg-white text-red-600 py-4 rounded-2xl font-bold text-xl hover:bg-gray-100 transform hover:scale-110 transition text-center shadow-2xl"
                  >
                    View Profile
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LIVE STATS */}
        <div className="mt-16 text-center">
          <p className="text-2xl font-bold text-gray-700 flex items-center justify-center gap-4">
            <Activity size={40} className="text-red-600" />
            System Monitoring Active • Auto Refresh Every 10 Sec
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminFraudAnalytics;