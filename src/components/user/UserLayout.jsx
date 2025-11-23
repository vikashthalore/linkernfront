// components/user/UserPanel.jsx (FINAL CLEAN + REDUX + GLOBAL API)

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";

import {
  BarChart3,
  Link2,
  DollarSign,
  Users,
  Settings,
  LogOut,
} from "lucide-react";

import { logout } from "../../store/slices/userSlice";
import api from "../../lib/api";

// ✅ Correct path (fixed)
// import WithdrawalRequest from "./WithdrawalRequest";
import WithdrawalRequest from "../shared/WithdrawalRequest";
import UserDashboard from "./UserDashboard";
import UserLinks from "./UserLinks";
import UserEarnings from "./UserEarnings";
import UserReferrals from "./UserReferrals";
import UserSettings from "./UserSettings";

const UserLayout = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.user);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [links, setLinks] = useState([]);
  const [stats, setStats] = useState({
    totalClicks: 0,
    totalEarnings: 0,
    todayClicks: 0,
    todayEarnings: 0,
  });

  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);

  const [newLink, setNewLink] = useState({
    originalUrl: "",
    title: "",
    pageCount: 10,
  });

  useEffect(() => {
  const impersonateId = localStorage.getItem("impersonateIserId");
  const isImpersonating = localStorage.getItem("isImpersonating");

  if (impersonateId && isImpersonating === "true") {
   
    toast.success("You are viewing as a user (Admin Mode)", { duration: 8000 });
    
    // Optional: Top bar mein dikha do
    document.body.classList.add("impersonate-mode");
  }
}, []);

  // =============================
  // LOAD ALL DATA
  // =============================
  useEffect(() => {
    if (token && user) {
      fetchUserStats();
      fetchUserLinks();
      if (activeTab === "earnings") fetchWithdrawals();
    }
  }, [token, user, activeTab]);

  const fetchUserStats = async () => {
    try {
      const res = await api.get("/user/stats");
      setStats(res.data);
    } catch {
      toast.error("Failed to load stats");
    }
  };

  const fetchUserLinks = async () => {
    try {
      const res = await api.get("/user/links");
      setLinks(res.data.links || []);
    } catch {
      toast.error("Failed to load links");
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const res = await api.get("/withdrawals");
      setWithdrawals(res.data.withdrawals || []);
    } catch {
      toast.error("Failed to load withdrawals");
    }
  };

  const handleCreateLink = async (e) => {
    e.preventDefault();

    if (!newLink.originalUrl)
      return toast.error("Please enter URL");

    if (newLink.pageCount < 1 || newLink.pageCount > 50)
      return toast.error("Page count must be 1 – 50");

    setLoading(true);
    try {
      const res = await api.post("/user/links", {
        name: newLink.title || `Link ${Date.now()}`,
        redirectUrl: newLink.originalUrl,
        pageCount: newLink.pageCount,
      });

      if (res.data.success) {
        setLinks([res.data.link, ...links]);
        fetchUserStats();
        setNewLink({ originalUrl: "", title: "", pageCount: 10 });
        document.getElementById("create-link-modal")?.close();

        toast.success("Link created!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out");
    setTimeout(() => (window.location.href = "/"), 400);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  const deleteLink = async (id) => {
    if (!confirm("Delete this link?")) return;

    try {
      await api.delete(`/user/links/${id}`);
      setLinks(links.filter((l) => l._id !== id));
      fetchUserStats();
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <>
      <Toaster />

      <div className="min-h-screen bg-gray-50 flex">

        {/* =============================
            SIDEBAR
        ============================= */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6 border-b">
            <h1 className="text-xl font-bold">LinkEarn</h1>
            <p className="text-sm text-gray-600">Hi, {user?.name}</p>
          </div>

          <nav className="mt-6">
            {[ 
              { id: "dashboard", name: "Dashboard", icon: BarChart3 },
              { id: "links", name: "My Links", icon: Link2 },
              { id: "earnings", name: "Earnings", icon: DollarSign },
              { id: "referrals", name: "Referrals", icon: Users },
              { id: "settings", name: "Settings", icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-6 py-3 text-left ${
                  activeTab === item.id
                    ? "bg-indigo-50 text-indigo-600 border-r-2 border-indigo-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </button>
            ))}

            <button
              onClick={handleLogout}
              className="w-full flex items-center px-6 py-3 text-left text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </nav>
        </div>

        {/* =============================
            CONTENT AREA
        ============================= */}
        <div className="flex-1 p-8">


{activeTab === "dashboard" && <UserDashboard />}

{activeTab === "links" && <UserLinks />}

{activeTab === "earnings" && <UserEarnings />}

{activeTab === "referrals" && <UserReferrals />}

{activeTab === "settings" && <UserSettings /> }


        </div>
      </div>
    </>
  );
};



export default UserLayout
