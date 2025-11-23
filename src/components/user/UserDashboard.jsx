// components/user/UserDashboard.jsx → FINAL LIVE AUTO-UPDATING VERSION
import React, { useEffect, useState, useCallback } from "react";
import api from "../../lib/api";
import {
  BarChart3,
  MousePointerClick,
  DollarSign,
  TrendingUp,
  Clock,
  Link2,
  RefreshCw,
} from "lucide-react";

const UserDashboard = () => {
  const [stats, setStats] = useState({
    totalClicks: 0,
    todayClicks: 0,
    totalEarnings: 0,
    todayEarnings: 0,
    totalLinks: 0,
  });

  const [recentClicks, setRecentClicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get("/user/stats");
      if (res.data.success) {
        const data = res.data;
        setStats({
          totalClicks: data.totalClicks || 0,
          todayClicks: data.todayClicks || 0,
          totalEarnings: parseFloat(data.totalEarnings || 0),
          todayEarnings: parseFloat(data.todayEarnings || 0),
          totalLinks: data.totalLinks || 0,
        });
      }
    } catch (err) {
      console.error("Stats error:", err);
    }
  }, []);

  // Fetch Recent Clicks
  const fetchRecentClicks = useCallback(async () => {
    try {
      const res = await api.get("/user/recent-clicks");
      if (res.data.success) {
        setRecentClicks(res.data.clicks || []);
      }
    } catch (err) {
      console.error("Recent clicks error:", err);
    }
  }, []);

  // Combined fetch function
  const loadAllData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    setLoading(true);

    await Promise.all([fetchStats(), fetchRecentClicks()]);

    setLoading(false);
    if (isManual) setRefreshing(false);
  }, [fetchStats, fetchRecentClicks]);

  // Auto refresh every 10 seconds
  useEffect(() => {
    loadAllData(); // First load

    const interval = setInterval(() => {
      loadAllData(); // Background mein update hota rahega
    }, 900000); // Har 10 second mein

    return () => clearInterval(interval); // Cleanup
  }, [loadAllData]);

  // Manual refresh button
  const handleManualRefresh = () => {
    loadAllData(true);
    // toast.success("Dashboard updated!");
  };

  const formatMoney = (amount) => {
    const num = parseFloat(amount);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  const formatTime = (dateString) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${Math.floor(diffMins)}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString("en-IN");
  };

  return (
    <div className="space-y-8 p-4 max-w-7xl mx-auto">

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
        <button
          onClick={handleManualRefresh}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            refreshing
              ? "bg-gray-100 text-gray-500"
              : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
          }`}
          disabled={refreshing}
        >
          <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Updating..." : "Refresh"}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Same cards as before – no change */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg hover:scale-105 transition">
          <div className="flex justify-between">
            <div>
              <p className="text-blue-100">Total Clicks</p>
              <h3 className="text-3xl font-bold mt-2">{stats.totalClicks.toLocaleString()}</h3>
            </div>
            <BarChart3 size={40} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg hover:scale-105 transition">
          <div className="flex justify-between">
            <div>
              <p className="text-green-100">Today's Clicks</p>
              <h3 className="text-3xl font-bold mt-2">{stats.todayClicks}</h3>
            </div>
            <MousePointerClick size={40} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg hover:scale-105 transition">
          <div className="flex justify-between">
            <div>
              <p className="text-yellow-100">Total Earnings</p>
              <h3 className="text-3xl font-bold mt-2">₹{formatMoney(stats.totalEarnings)}</h3>
            </div>
            <DollarSign size={40} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-6 rounded-2xl shadow-lg hover:scale-105 transition">
          <div className="flex justify-between">
            <div>
              <p className="text-purple-100">Today's Earnings</p>
              <h3 className="text-3xl font-bold mt-2">₹{formatMoney(stats.todayEarnings)}</h3>
            </div>
            <TrendingUp size={40} className="opacity-80" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock size={20} />
            Recent Activity (Live)
          </h3>
          <span className="text-xs text-gray-500">Updates every 10s</span>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          {recentClicks.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No clicks yet. Share your links!</p>
          ) : (
            <div className="space-y-3">
              {recentClicks.map((click) => (
                <div
                  key={click._id}
                  className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <Link2 size={18} className="text-indigo-600" />
                    <div>
                      <p className="font-medium text-gray-800">
                        {click.linkId?.name || "Unknown Link"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {click.pageName || "Page"} • {formatTime(click.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      +₹{parseFloat(click.earnings || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Live Indicator */}
      <div className="text-center text-xs text-gray-400">
        Dashboard auto-refreshes every 10 seconds • Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default UserDashboard;


// ///////////////////


// // components/user/UserDashboard.jsx

// import React, { useEffect, useState } from "react";
// import api from "../../lib/api";
// import {
//   BarChart3,
//   MousePointer,
//   DollarSign,
//   TrendingUp,
// } from "lucide-react";

// const UserDashboard = () => {
//   const [stats, setStats] = useState({
//     totalClicks: 0,
//     todayClicks: 0,
//     totalEarnings: 0,
//     todayEarnings: 0,
//   });

//   const [recentClicks, setRecentClicks] = useState([]);

//   useEffect(() => {
//     fetchStats();
//     fetchRecentClicks();
//   }, []);

//   const fetchStats = async () => {
//     try {
//       const res = await api.get("/user/stats");

//       // API returns: { success, totalClicks, todayClicks, totalEarnings, todayEarnings }
//       setStats({
//         totalClicks: res.data.totalClicks || 0,
//         todayClicks: res.data.todayClicks || 0,
//         totalEarnings: res.data.totalEarnings || 0,
//         todayEarnings: res.data.todayEarnings || 0,
//       });
//     } catch (err) {
//       console.log("Stats error");
//     }
//   };

//   const fetchRecentClicks = async () => {
//     try {
//       const res = await api.get("/user/recent-clicks");
//       setRecentClicks(res.data.clicks || []);
//     } catch (err) {
//       console.log("Clicks error");
//     }
//   };

//   return (
//     <div className="space-y-8">

//       <h2 className="text-2xl font-bold mb-4">Dashboard Overview</h2>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

//         <div className="p-6 bg-white border rounded-xl shadow">
//           <p className="text-sm text-gray-500">Total Clicks</p>
//           <h1 className="text-3xl font-bold">{stats.totalClicks}</h1>
//           <BarChart3 className="text-indigo-600 mt-2" />
//         </div>

//         <div className="p-6 bg-white border rounded-xl shadow">
//           <p className="text-sm text-gray-500">Today's Clicks</p>
//           <h1 className="text-3xl font-bold">{stats.todayClicks}</h1>
//           <MousePointer className="text-green-600 mt-2" />
//         </div>

//         <div className="p-6 bg-white border rounded-xl shadow">
//           <p className="text-sm text-gray-500">Total Earnings</p>
//           <h1 className="text-3xl font-bold">₹{stats.totalEarnings.toFixed(2)}</h1>
//           <DollarSign className="text-yellow-600 mt-2" />
//         </div>

//         <div className="p-6 bg-white border rounded-xl shadow">
//           <p className="text-sm text-gray-500">Today's Earnings</p>
//           <h1 className="text-3xl font-bold">₹{stats.todayEarnings.toFixed(2)}</h1>
//           <TrendingUp className="text-purple-600 mt-2" />
//         </div>

//       </div>

//       {/* Recent Click Activity */}
//       <div className="bg-white p-6 border rounded-xl shadow">
//         <h3 className="text-lg font-bold mb-4">Recent Click Activity</h3>

//         {recentClicks.length === 0 ? (
//           <p className="text-gray-500">No clicks yet.</p>
//         ) : (
//           <div className="space-y-3">
//             {recentClicks.map((click, i) => (
//               <div
//                 key={i}
//                 className="flex justify-between py-2 border-b text-sm"
//               >
//                 <span>Clicked on {click.pageName || "Unknown Page"}</span>

//                 <span className="text-gray-500">
//                   {click.createdAt
//                     ? new Date(click.createdAt).toLocaleTimeString()
//                     : ""}
//                 </span>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//     </div>
//   );
// };

// export default UserDashboard;
