import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard, FileText, Users, IndianRupee, LogOut, Bell, Search, Menu, X, Shield,
  TrendingUp, Moon, Sun, Clock, Loader2, MessageCircle, Zap, Send
} from 'lucide-react';

import { logout } from '../../store/slices/userSlice.js';
import api from "../../utils/api.js";

// Lazy Load All Pages
const LazyAdminDashboard = lazy(() => import('./AdminDashboard.jsx'));
const LazyPagesManagement = lazy(() => import('./PagesManagement.jsx'));
const LazyUsersManagement = lazy(() => import('./UsersManagement.jsx'));
const LazyEarningsSettings = lazy(() => import('./EarningsSettings.jsx'));
const LazyUserWithdrawals = lazy(() => import('./UserWithdrawals.jsx'));
const LazyAdminDashboard2 = lazy(() => import('./AdminDashboard2.jsx'));
const LazyAdminFraudAnalytics = lazy(() => import('./AdminFraudAnalytics.jsx'));

const AdminPanel = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user) || {};

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [userMessages, setUserMessages] = useState([]);           // ← Support Messages
  const [stats, setStats] = useState({ totalUsers: 0, totalEarnings: 0 });
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Navigation Menu
  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Pages', href: '/admin/pages', icon: FileText },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Earnings', href: '/admin/earnings', icon: IndianRupee },
    { name: 'Fraud Analytics', href: '/admin/analytics', icon: TrendingUp },
    { name: 'Withdrawals', href: '/admin/withdrawals', icon: IndianRupee },
    { name: 'User Control Panel', href: '/admin/users-control', icon: Shield },
  ];

  // Real-time Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatIST = (date) => date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  // Fetch Live Stats
  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      if (res.data.success) {
        setStats({
          totalUsers: res.data.stats.totalUsers || 0,
          totalEarnings: res.data.stats.totalEarnings || 0
        });
      }
    } catch (err) { }
  };

  // Fetch Clicks Notifications
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/admin/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) { }
  };

  // Fetch User Messages (SupportMessage)
  const fetchUserMessages = async () => {
    try {
      const res = await api.get('/admin/contact-messages');
      if (res.data.success) {
        setUserMessages(res.data.messages.slice(0, 10));
      }
    } catch (err) { }
  };

  // Initial Load + Live Updates Every 20 Seconds
  useEffect(() => {
    fetchStats();
    fetchNotifications();
    fetchUserMessages();

    const interval = setInterval(() => {
      fetchStats();
      fetchNotifications();
      fetchUserMessages();
    }, 600000);

    return () => clearInterval(interval);
  }, []);

  // Dark Mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/admin/users?search=${encodeURIComponent(searchQuery)}`);
  };

  const clearSearch = () => setSearchQuery('');

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${darkMode ? 'bg-gray-800' : 'bg-white'} border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={`flex items-center justify-between h-16 px-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">LinkEarn</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Admin Panel</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden">
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* Admin Info */}
          <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{user?.name || 'Admin'}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${user?.isMainAdmin ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                  {user?.isMainAdmin ? 'Main Admin' : 'Admin'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${isActive(item.href) ? 'bg-indigo-100 text-indigo-700 font-bold shadow-md border border-indigo-200' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Live Stats */}
          <div className={`p-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-5 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl border">
                <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                  {stats.totalUsers.toLocaleString()}
                </div>
                <div className="flex items-center justify-center gap-2 mt-2 text-blue-600 dark:text-blue-400">
                  <Users className="h-5 w-5" />
                  <span>Total Users</span>
                </div>
              </div>
              <div className="text-center p-5 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl border">
                <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                  ₹{Number(stats.totalEarnings).toLocaleString('en-IN')}
                </div>
                <div className="flex items-center justify-center gap-2 mt-2 text-green-600 dark:text-green-400">
                  <IndianRupee className="h-5 w-5" />
                  <span>Revenue</span>
                </div>
              </div>
            </div>
          </div>

          {/* Logout */}
          <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition">
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b">
          <div className="flex items-center justify-between px-6 h-16">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden">
              <Menu className="h-6 w-6 text-gray-600" />
            </button>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-12 pr-12 py-3 rounded-xl border bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500"
                />
                {searchQuery && (
                  <button type="button" onClick={clearSearch} className="absolute right-4 top-1/2 -translate-y-1/2">
                    <X className="h-5 w-5 text-gray-400" />
                  </button>
                )}
              </div>
            </form>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm">
                <Clock className="h-5 w-5" />
                {formatIST(currentTime)}
              </div>

              {/* NOTIFICATION DROPDOWN - 2 ICONS + EMAIL */}
              <div className="relative">
                <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Bell className="h-6 w-6" />
                  {(userMessages.length + notifications.length) > 0 && (
                    <span className="absolute top-1 right-1 h-6 w-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse ring-4 ring-red-500/30">
                      {userMessages.length + notifications.length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border overflow-hidden z-50">
                    <div className="p-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                      <h3 className="text-xl font-bold">Live Activity</h3>
                      <p className="text-sm opacity-90">{userMessages.length} Messages • {notifications.length} Clicks</p>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {/* USER MESSAGES - RED ICON + EMAIL */}
                      {userMessages.map(msg => (
                        <div key={msg._id} className="p-5 border-b bg-red-50 dark:bg-red-900/20 hover:bg-red-100 transition group">
                          <div className="flex gap-4">
                            <div className="p-3 bg-red-500 rounded-2xl text-white flex-shrink-0">
                              <MessageCircle className="h-7 w-7" />
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-red-700 dark:text-red-300">{msg.name || "User"}</p>
                              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Email: {msg.email || "N/A"}</p>
                              <p className="text-sm mt-2 line-clamp-2">{msg.message}</p>
                              <p className="text-xs text-gray-500 mt-2">{new Date(msg.createdAt).toLocaleString('en-IN')}</p>
                              <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition">
                                {msg.phone && (
                                  <a href={`https://wa.me/91${msg.phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2">
                                    <Send className="h-4 w-4" />WhatsApp
                                  </a>
                                )}
                                {msg.email && (
                                  <a href={`mailto:${msg.email}`} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold">Email</a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* CLICKS - PURPLE ZAP ICON */}
                      {notifications.map(notif => (
                        <div key={notif.id} className="p-5 border-b hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                          <div className="flex gap-4">
                            <div className="p-3 bg-purple-500 rounded-2xl text-white flex-shrink-0">
                              <Zap className="h-7 w-7" />
                            </div>
                            <div>
                              <p className="font-bold text-purple-700 dark:text-purple-300">New Click!</p>
                              <p className="text-sm">{notif.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {userMessages.length === 0 && notifications.length === 0 && (
                        <p className="p-12 text-center text-gray-500">No new activity</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Dark Mode */}
              <button onClick={() => setDarkMode(!darkMode)} className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                {darkMode ? <Sun className="h-6 w-6 text-yellow-400" /> : <Moon className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </header>

        {/* Page Title */}
        <div className="bg-white dark:bg-gray-800 border-b">
          <div className="max-w-7xl mx-auto px-6 py-5">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {location.pathname === '/admin' && 'Dashboard'}
                {location.pathname.includes('/pages') && 'Pages Management'}
                {location.pathname.includes('/users') && !location.pathname.includes('control') && 'Users Management'}
                {location.pathname.includes('/users-control') && 'User Control Panel'}
                {location.pathname.includes('/earnings') && 'Earnings Settings'}
                {location.pathname.includes('/analytics') && 'Fraud Analytics'}
                {location.pathname.includes('/withdrawals') && 'Withdrawal Requests'}
              </h1>
              <span className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                Live System
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="py-8">
          <div className="max-w-7xl mx-auto px-6">
            <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="h-16 w-16 animate-spin text-indigo-600" /></div>}>
              <Routes>
                <Route path="/" element={<LazyAdminDashboard />} />
                <Route path="/pages" element={<LazyPagesManagement />} />
                <Route path="/users" element={<LazyUsersManagement />} />
                <Route path="/earnings" element={<LazyEarningsSettings />} />
                <Route path="/withdrawals" element={<LazyUserWithdrawals />} />
                <Route path="/users-control" element={<LazyAdminDashboard2 />} />
                <Route path="/analytics" element={<LazyAdminFraudAnalytics />} />
              </Routes>
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;


// ////////////////////////


// import React, { useState, useEffect, Suspense, lazy } from 'react';
// import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import {
//   LayoutDashboard, FileText, Users, IndianRupee, LogOut,
//   Bell, Search, Menu, X, Shield, TrendingUp, Moon, Sun, Clock, Loader2,
//   MessageCircle, Send, UserCheck
// } from 'lucide-react';

// import { logout } from '../../store/slices/userSlice.js';
// import api from "../../utils/api.js";

// // Lazy Load All Pages
// const LazyAdminDashboard = lazy(() => import('./AdminDashboard.jsx'));
// const LazyPagesManagement = lazy(() => import('./PagesManagement.jsx'));
// const LazyUsersManagement = lazy(() => import('./UsersManagement.jsx'));
// const LazyEarningsSettings = lazy(() => import('./EarningsSettings.jsx'));
// const LazyUserWithdrawals = lazy(() => import('./UserWithdrawals.jsx'));
// const LazyAdminDashboard2 = lazy(() => import('./AdminDashboard2.jsx'));
// const LazyAdminFraudAnalytics = lazy(() => import('./AdminFraudAnalytics.jsx'));

// const AdminPanel = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { user } = useSelector(state => state.user) || {};

//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [notifications, setNotifications] = useState([]);
//   const [userMessages, setUserMessages] = useState([]);           // ← USER MESSAGES
//   const [stats, setStats] = useState({ totalUsers: 0, totalEarnings: 0 }); // ← LIVE STATS
//   const [showNotifications, setShowNotifications] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [darkMode, setDarkMode] = useState(false);
//   const [currentTime, setCurrentTime] = useState(new Date());

//   // Navigation Menu
//   const navigation = [
//     { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
//     { name: 'Pages', href: '/admin/pages', icon: FileText },
//     { name: 'Users', href: '/admin/users', icon: Users },
//     { name: 'Earnings', href: '/admin/earnings', icon: IndianRupee },
//     { name: 'Fraud Analytics', href: '/admin/analytics', icon: TrendingUp },
//     { name: 'Withdrawals', href: '/admin/withdrawals', icon: IndianRupee },
//     { name: 'User Control Panel', href: '/admin/users-control', icon: Shield },
//   ];

//   // Real-time Clock
//   useEffect(() => {
//     const timer = setInterval(() => setCurrentTime(new Date()), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   const formatIST = (date) => date.toLocaleString('en-IN', {
//     timeZone: 'Asia/Kolkata',
//     hour: '2-digit',
//     minute: '2-digit',
//     second: '2-digit',
//     hour12: true
//   });

//   // Fetch Live Stats (Users + Revenue)
//   const fetchStats = async () => {
//     try {
//       const res = await api.get('/admin/stats');
//       if (res.data.success) {
//         setStats({
//           totalUsers: res.data.stats.totalUsers || 0,
//           totalEarnings: res.data.stats.totalEarnings || 0
//         });
//       }
//     } catch (err) { }
//   };

//   // Fetch Notifications
//   const fetchNotifications = async () => {
//     try {
//       const res = await api.get('/admin/notifications');
//       setNotifications(res.data.notifications || []);
//     } catch (err) {
//       setNotifications([{ id: 1, message: 'System running smoothly', time: 'Now' }]);
//     }
//   };

//   // Fetch User Messages (Same API as User Control Panel)
//   const fetchUserMessages = async () => {
//     try {
//       const res = await api.get('/admin/contact-messages');
//       if (res.data.success) {
//         setUserMessages(res.data.messages.slice(0, 10));
//       }
//     } catch (err) { }
//   };

//   // Fetch All Data on Mount + Every 30 Sec
//   useEffect(() => {
//     fetchStats();
//     fetchNotifications();
//     fetchUserMessages();

//     const interval = setInterval(() => {
//       fetchStats();
//       fetchNotifications();
//       fetchUserMessages();
//     }, 30000);

//     return () => clearInterval(interval);
//   }, []);

//   // Dark Mode Toggle
//   useEffect(() => {
//     document.documentElement.classList.toggle('dark', darkMode);
//   }, [darkMode]);

//   const isActive = (path) => {
//     if (path === '/admin') return location.pathname === '/admin';
//     return location.pathname.startsWith(path);
//   };

//   const handleLogout = () => {
//     dispatch(logout());
//     navigate('/login');
//   };

//   const handleSearch = (e) => {
//     e.preventDefault();
//     if (!searchQuery.trim()) return;
//     navigate(`/admin/users?search=${encodeURIComponent(searchQuery)}`);
//   };

//   const clearSearch = () => setSearchQuery('');

//   return (
//     <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
//       {/* Mobile Backdrop */}
//       {sidebarOpen && (
//         <div className="fixed inset-0 z-40 md:hidden" onClick={() => setSidebarOpen(false)}>
//           <div className="fixed inset-0 bg-black bg-opacity-50" />
//         </div>
//       )}

//       {/* Sidebar */}
//       <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition duration-300 md:translate-x-0 ${
//         sidebarOpen ? 'translate-x-0' : '-translate-x-full'
//       } ${darkMode ? 'bg-gray-800' : 'bg-white'} border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
//         <div className="flex flex-col h-full">

//           {/* Logo */}
//           <div className={`flex items-center justify-between h-16 px-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
//             <div className="flex items-center gap-3">
//               <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center">
//                 <Shield className="h-6 w-6 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold text-gray-900 dark:text-white">LinkEarn</h1>
//                 <p className="text-xs text-gray-500 dark:text-gray-400">Admin Panel</p>
//               </div>
//             </div>
//             <button onClick={() => setSidebarOpen(false)} className="md:hidden">
//               <X className="h-6 w-6 text-gray-500" />
//             </button>
//           </div>

//           {/* Admin Info */}
//           <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
//             <div className="flex items-center gap-4">
//               <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
//                 {user?.name?.[0]?.toUpperCase() || 'A'}
//               </div>
//               <div>
//                 <p className="font-semibold text-gray-900 dark:text-white">{user?.name || 'Admin'}</p>
//                 <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
//                 <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${
//                   user?.isMainAdmin ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
//                 }`}>
//                   {user?.isMainAdmin ? 'Main Admin' : 'Admin'}
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Navigation */}
//           <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
//             {navigation.map((item) => (
//               <Link
//                 key={item.name}
//                 to={item.href}
//                 onClick={() => setSidebarOpen(false)}
//                 className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
//                   isActive(item.href)
//                     ? 'bg-indigo-100 text-indigo-700 font-semibold shadow-md border border-indigo-200'
//                     : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
//                 }`}
//               >
//                 <item.icon className="h-5 w-5" />
//                 <span>{item.name}</span>
//               </Link>
//             ))}
//           </nav>

//           {/* LIVE STATS - NO MORE HARD CODED VALUES */}
//           <div className={`p-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="text-center p-5 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl border border-blue-200 dark:border-blue-800">
//                 <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
//                   {stats.totalUsers.toLocaleString()}
//                 </div>
//                 <div className="flex items-center justify-center gap-2 mt-2 text-blue-600 dark:text-blue-400">
//                   <Users className="h-3 w-3" />
//                   <span className="font-medium">Total Users</span>
//                 </div>
//               </div>
//               <div className="text-center p-2 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl border border-green-200 dark:border-green-800">
//                 <div className="text-xl font-bold text-green-700 dark:text-green-300">
//                   ₹{Number(stats.totalEarnings).toLocaleString('en-IN')}
//                 </div>
//                 <div className="flex items-center justify-center gap-2 mt-2 text-green-600 dark:text-green-400">
//                   <IndianRupee className="h-3 w-3" />
//                   <span className="font-medium">Platform Revenue</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Logout */}
//           <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
//             <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition">
//               <LogOut className="h-5 w-5" />
//               <span className="font-medium">Sign Out</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="md:pl-64">
//         {/* Header */}
//         <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
//           <div className="flex items-center justify-between px-6 h-16">
//             {/* Mobile Menu */}
//             <button onClick={() => setSidebarOpen(true)} className="md:hidden">
//               <Menu className="h-6 w-6 text-gray-600" />
//             </button>

//             {/* Search */}
//             <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4">
//               <div className="relative">
//                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                 <input
//                   id="search-input"
//                   type="text"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   placeholder="Search users... (Ctrl+/)"
//                   className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                 />
//                 {searchQuery && (
//                   <button type="button" onClick={clearSearch} className="absolute right-4 top-1/2 -translate-y-1/2">
//                     <X className="h-5 w-5 text-gray-400" />
//                   </button>
//                 )}
//               </div>
//             </form>

//             {/* Right Side */}
//             <div className="flex items-center gap-4">
//               {/* Clock */}
//               <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
//                 <Clock className="h-5 w-5" />
//                 {formatIST(currentTime)}
//               </div>

//               {/* Notifications Dropdown */}
//               <div className="relative">
//                 <button
//                   onClick={() => setShowNotifications(!showNotifications)}
//                   className="relative p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
//                 >
//                   <Bell className="h-6 w-6 text-gray-600 dark:text-gray-300" />
//                   {(userMessages.length + notifications.length) > 0 && (
//                     <span className="absolute top-1 right-1 h-6 w-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
//                       {userMessages.length + notifications.length}
//                     </span>
//                   )}
//                 </button>

//                 {/* Notification Panel */}
//                 {showNotifications && (
//                   <div className="absolute right-0 mt-3 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
//                     <div className="p-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
//                       <h3 className="text-lg font-bold">Notifications</h3>
//                       {userMessages.length > 0 && (
//                         <p className="text-sm mt-1 opacity-90">{userMessages.length} New Messages</p>
//                       )}
//                     </div>

//                     <div className="max-h-96 overflow-y-auto">
//                       {/* USER MESSAGES FIRST */}
//                       {userMessages.map(msg => (
//                         <div key={msg._id} className="p-5 border-b border-red-100 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 transition">
//                           <div className="flex items-start justify-between gap-4">
//                             <div className="flex-1">
//                               <div className="flex items-center gap-3">
//                                 <MessageCircle className="h-6 w-6 text-red-600" />
//                                 <p className="font-bold text-red-700 dark:text-red-300">{msg.name}</p>
//                               </div>
//                               <p className="text-sm mt-2 text-gray-800 dark:text-gray-200">{msg.message}</p>
//                               <p className="text-xs text-gray-500 mt-2">
//                                 {new Date(msg.createdAt).toLocaleString('en-IN')}
//                               </p>
//                             </div>
//                             <div className="flex flex-col gap-2">
//                               {msg.phone && (
//                                 <a
//                                   href={`https://wa.me/91${msg.phone.replace(/\D/g, '')}`}
//                                   target="_blank"
//                                   rel="noreferrer"
//                                   className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"
//                                 >
//                                   <Send className="h-4 w-4" /> WhatsApp
//                                 </a>
//                               )}
//                               {msg.email && (
//                                 <a href={`mailto:${msg.email}`} className="text-blue-600 hover:underline text-sm">
//                                   Reply Email
//                                 </a>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       ))}

//                       {/* Regular Notifications */}
//                       {notifications.map(notif => (
//                         <div key={notif.id} className="p-5 border-b hover:bg-gray-50 dark:hover:bg-gray-700 transition">
//                           <p className="font-medium text-gray-800 dark:text-gray-200">{notif.message}</p>
//                           <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
//                         </div>
//                       ))}

//                       {userMessages.length === 0 && notifications.length === 0 && (
//                         <p className="p-10 text-center text-gray-500">No new notifications</p>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Dark Mode */}
//               <button onClick={() => setDarkMode(!darkMode)} className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
//                 {darkMode ? <Sun className="h-6 w-6 text-yellow-400" /> : <Moon className="h-6 w-6 text-gray-600" />}
//               </button>
//             </div>
//           </div>
//         </header>

//         {/* Page Title */}
//         <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
//           <div className="max-w-7xl mx-auto px-6 py-5">
//             <div className="flex items-center justify-between">
//               <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
//                 {location.pathname === '/admin' && 'Dashboard'}
//                 {location.pathname.includes('/pages') && 'Pages Management'}
//                 {location.pathname.includes('/users') && !location.pathname.includes('control') && 'Users Management'}
//                 {location.pathname.includes('/users-control') && 'User Control Panel'}
//                 {location.pathname.includes('/earnings') && 'Earnings Settings'}
//                 {location.pathname.includes('/analytics') && 'Fraud Analytics'}
//                 {location.pathname.includes('/withdrawals') && 'Withdrawal Requests'}
//               </h1>
//               <span className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
//                 <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
//                 Live System
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Main Content */}
//         <main className="flex-1 py-8">
//           <div className="max-w-7xl mx-auto px-6">
//             <Suspense fallback={
//               <div className="flex justify-center py-20">
//                 <Loader2 className="h-16 w-16 animate-spin text-indigo-600" />
//               </div>
//             }>
//               <Routes>
//                 <Route path="/" element={<LazyAdminDashboard />} />
//                 <Route path="/pages" element={<LazyPagesManagement />} />
//                 <Route path="/users" element={<LazyUsersManagement />} />
//                 <Route path="/earnings" element={<LazyEarningsSettings />} />
//                 <Route path="/withdrawals" element={<LazyUserWithdrawals />} />
//                 <Route path="/users-control" element={<LazyAdminDashboard2 />} />
//                 <Route path="/analytics" element={<LazyAdminFraudAnalytics />} />
//               </Routes>
//             </Suspense>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default AdminPanel;



// /////////////////////

