import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import {
  Users,
  FileText,
  MousePointerClick,
  IndianRupee,
  TrendingUp,
  RefreshCw,
  DollarSign,
  UserCheck,
  MessageCircle,
  Zap,
  BellRing
} from "lucide-react";
import api from "../../utils/api";

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.user);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPages: 0,
    todayClicks: 0,
    totalEarnings: 0,
    totalReferralBonus: 0,
    totalWithdrawals: 0,
    pendingWithdrawals: 0
  });

  const [topPages, setTopPages] = useState([]);
  const [topReferrers, setTopReferrers] = useState([]);
  const [latestClick, setLatestClick] = useState(null);
  const [latestMessage, setLatestMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // FETCH ALL DATA
  const fetchDashboardData = async () => {
    setRefreshing(true);
    try {
      const [statsRes, pagesRes, referrersRes, clickRes, msgRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/top-pages"),
        api.get("/admin/top-referrers"),
        api.get("/admin/notifications"), // Latest Click
        api.get("/admin/contact-messages") // Latest Message
      ]);

      // Stats
      setStats(statsRes.data?.stats || {});

      // Top Pages & Referrers
      setTopPages(pagesRes.data?.pages || []);
      setTopReferrers(referrersRes.data?.referrers || []);

      // Latest Click
      const clicks = clickRes.data?.notifications || [];
      if (clicks.length > 0) {
        setLatestClick({
          ...clicks[0],
          type: "click",
          timeAgo: getTimeAgo(clicks[0].time || new Date())
        });
      }

      // Latest Message
      const messages = msgRes.data?.messages || [];
      if (messages.length > 0) {
        const msg = messages[0];
        setLatestMessage({
          name: msg.name,
          message: msg.message.substring(0, 60) + (msg.message.length > 60 ? "..." : ""),
          timeAgo: getTimeAgo(msg.createdAt),
          type: "message"
        });
      }

      if (!loading) toast.success("Dashboard Live Updated!");
    } catch (err) {
      console.error("Dashboard load error:", err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Time Ago Function
  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hour ago`;
    return `${Math.floor(seconds / 86400)} day ago`;
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 600000); // Har 15 sec update
    return () => clearInterval(interval);
  }, []);

  // Reusable Card
  const StatCard = ({ title, value, icon: Icon, color, prefix = "", warning = false }) => (
    <div className={`bg-white rounded-2xl shadow-lg border p-6 hover:shadow-xl transition relative overflow-hidden ${warning ? 'border-orange-200 bg-orange-50' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium uppercase tracking-wide">{title}</p>
          <p className={`text-3xl font-bold mt-2 ${warning ? 'text-orange-600' : 'text-gray-900'}`}>
            {prefix}
            {value !== undefined && value !== null 
              ? Number(value).toLocaleString("en-IN") 
              : "0"}
          </p>
        </div>
        <div className={`p-4 rounded-2xl ${color} bg-opacity-10`}>
          <Icon className={`h-8 w-8 ${color.replace("bg-", "text-")}`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <RefreshCw className="h-16 w-16 animate-spin text-indigo-600 mb-4" />
        <span className="text-xl text-gray-600 font-medium">Loading Dashboard...</span>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="p-6 space-y-8 min-h-screen bg-gray-50/50">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600 mt-1 text-lg">
              Welcome back, <span className="font-bold text-indigo-600">{user?.name || "Admin"}</span>!
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold hover:shadow-2xl flex items-center gap-3 shadow-lg transition active:scale-95"
          >
            <RefreshCw className={`h-6 w-6 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Updating..." : "Refresh Live Data"}
          </button>
        </div>

        {/* LIVE ACTIVITY BAR — 2 ICONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Latest Click */}
          {latestClick && (
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-2xl shadow-xl flex items-center gap-5 animate-pulse">
              <div className="p-4 bg-white/20 rounded-2xl">
                <Zap className="h-10 w-10 animate-ping" />
              </div>
              <div>
                <p className="text-lg font-bold flex items-center gap-2">
                  <MousePointerClick className="h-6 w-6" />
                  New Click Detected!
                </p>
                <p className="text-sm opacity-90">₹{latestClick.message.match(/₹([\d.]+)/)?.[1] || "0"} earned</p>
                <p className="text-xs mt-1 opacity-80">{latestClick.timeAgo}</p>
              </div>
            </div>
          )}

          {/* ////////////////// */}


          


          {/* ////////////////// */}

          {/* Latest Message */}
          {latestMessage && (
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-2xl shadow-xl flex items-center gap-5 animate-pulse">
              <div className="p-4 bg-white/20 rounded-2xl">
                <BellRing className="h-10 w-10 animate-ping" />
              </div>
              <div>
                <p className="text-lg font-bold flex items-center gap-2">
                  <MessageCircle className="h-6 w-6" />
                  New Message from {latestMessage.name}
                </p>
                <p className="text-sm opacity-90 line-clamp-1">{latestMessage.message}</p>
                <p className="text-xs mt-1 opacity-80">{latestMessage.timeAgo}</p>
              </div>
            </div>
          )}
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="text-blue-600" />
          <StatCard title="Today's Clicks" value={stats.todayClicks} icon={MousePointerClick} color="text-purple-600" />
          <StatCard title="User Earnings" value={Number(stats.totalEarnings || 0).toFixed(2)} icon={IndianRupee} prefix="₹" color="text-green-600" />
          <StatCard title="Referral Bonus" value={Number(stats.totalReferralBonus || 0).toFixed(2)} icon={DollarSign} prefix="₹" color="text-pink-600" />
          <StatCard title="Pending Withdrawals" value={stats.pendingWithdrawals} icon={FileText} color="text-orange-600" warning={stats.pendingWithdrawals > 0} />
        </div>

        {/* Top Pages & Referrers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Pages */}
          <div className="bg-white rounded-2xl shadow-xl border p-8">
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-6">
              <TrendingUp className="h-8 w-8 text-green-600" />
              Top Performing Pages
            </h2>
            {topPages.length === 0 ? (
              <p className="text-center text-gray-500 py-10">No data yet</p>
            ) : (
              <div className="space-y-4">
                {topPages.slice(0, 6).map((page, i) => (
                  <div key={i} className="flex justify-between items-center p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl hover:shadow-md transition">
                    <div className="flex items-center gap-4">
                      <span className={`text-2xl font-bold ${i < 3 ? 'text-yellow-600' : 'text-gray-600'}`}>#{i + 1}</span>
                      <div>
                        <p className="font-bold text-gray-800">{page.title}</p>
                        <p className="text-sm text-gray-600">{Number(page.clicks).toLocaleString()} clicks</p>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-green-600">
                      ₹{Number(page.earnings || 0).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Referrers */}
          <div className="bg-white rounded-2xl shadow-xl border p-8">
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-6">
              <UserCheck className="h-8 w-8 text-purple-600" />
              Top Referrers
            </h2>
            {topReferrers.length === 0 ? (
              <p className="text-center text-gray-500 py-10">No referrals yet</p>
            ) : (
              <div className="space-y-4">
                {topReferrers.slice(0, 6).map((ref, i) => (
                  <div key={i} className="flex justify-between items-center p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl hover:shadow-md transition">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-500' : i === 2 ? 'bg-orange-500' : 'bg-indigo-500'}`}>
                        {ref.name?.[0] || "U"}
                        {i < 3 && <span className="absolute -top-2 -right-2 text-2xl">Crown</span>}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{ref.name || "User"}</p>
                        <p className="text-sm text-gray-600">{ref.referralCount} referrals</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-purple-700">
                        ₹{Number(ref.referralIncome || 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-purple-600 font-bold">Earned</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;

// /////////////////////////


// // components/admin/AdminDashboard.jsx (FINAL + CLEAN + GLOBAL API CLIENT)

// import React, { useState, useEffect } from "react";
// import toast, { Toaster } from "react-hot-toast";
// import {
//   Users, FileText, MousePointer, IndianRupee, TrendingUp,
//   RefreshCw
// } from "lucide-react";

// import { useSelector } from "react-redux";
// // import api from "../../../utils/api"; // ← GLOBAL API CLIENT
// import api from "../../lib/api.js"; // ← GLOBAL API CLIENT

// const AdminDashboard = () => {
//   const { user } = useSelector((state) => state.user);

//   const [stats, setStats] = useState({
//     totalUsers: 0,
//     totalPages: 0,
//     totalClicks: 0,
//     totalPayout: 0,
//     todayClicks: 0,
//   });

//   const [topPages, setTopPages] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     setRefreshing(true);
//     try {
//       const [statsRes] = await Promise.all([
//         api.get("/admin/stats"),
//       ]);

//       setStats(statsRes.data.stats || {});

//       // Mock Top Pages
//       setTopPages([
//         { title: "Best Offers 2025", clicks: 1250, earnings: 62.5 },
//         { title: "Recharge Tricks", clicks: 980, earnings: 49 },
//         { title: "Earn ₹500 Daily", clicks: 750, earnings: 37.5 }
//       ]);

//       toast.success("Dashboard updated!");
//     } catch (err) {
//       toast.error("Failed to load dashboard");
//       console.error(err);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const StatCard = ({ title, value, icon: Icon, color }) => (
//     <div className="bg-white rounded-xl shadow-sm border p-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-sm text-gray-600">{title}</p>
//           <p className="text-3xl font-bold">{value}</p>
//         </div>
//         <div className={`p-3 rounded-xl bg-opacity-10 ${color}`}>
//           <Icon className="h-7 w-7" />
//         </div>
//       </div>
//     </div>
//   );

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <RefreshCw className="h-12 w-12 animate-spin text-indigo-600" />
//       </div>
//     );
//   }

//   return (
//     <>
//       <Toaster />
//       <div className="p-6 space-y-8">

//         {/* Header */}
//         <div className="flex justify-between items-center">
//           <div>
//             <h1 className="text-3xl font-bold">Admin Dashboard</h1>
//             <p className="text-gray-600">
//               Welcome back, {user?.name || "Admin"}!
//             </p>
//           </div>

//           <button
//             onClick={fetchDashboardData}
//             disabled={refreshing}
//             className="px-4 py-2 bg-white border rounded-lg flex items-center"
//           >
//             <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
//             Refresh
//           </button>
//         </div>

//         {/* Stats */}
//         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
//           <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="text-blue-600" />
//           <StatCard title="Pages" value={stats.totalPages} icon={FileText} color="text-green-600" />
//           <StatCard title="Today's Clicks" value={stats.todayClicks} icon={MousePointer} color="text-purple-600" />
//           <StatCard title="Total Revenue" value={`₹${stats.totalPayout}`} icon={IndianRupee} color="text-yellow-600" />
//         </div>

//         {/* Top Pages */}
//         <div className="bg-white border rounded-xl p-6">
//           <h2 className="text-lg font-bold mb-4 flex items-center">
//             <TrendingUp className="h-5 w-5 mr-2" /> Top Pages
//           </h2>

//           {topPages.map((p, i) => (
//             <div key={i} className="flex justify-between py-3 border-b">
//               <span>{i + 1}. {p.title}</span>
//               <span>{p.clicks} clicks — ₹{p.earnings}</span>
//             </div>
//           ))}
//         </div>

//       </div>
//     </>
//   );
// };

// export default AdminDashboard;
