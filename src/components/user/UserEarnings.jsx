import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import WithdrawalRequest from "../shared/WithdrawalRequest";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { Copy, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";

const UserEarnings = () => {
  const [info, setInfo] = useState({
    totalEarnings: 0,
    todayEarnings: 0,
  });

  const [refData, setRefData] = useState({
    referrerEarnings: 0,
    refereeBonusEarnings: 0,
    referrerBonusExpiry: null,
    refereeBonusExpiry: null,
  });

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState("");

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      loadEarnings(),
      loadReferralEarnings(),
      loadHistory()
    ]);
    setLoading(false);
  };

  /* MAIN EARNINGS */
  const loadEarnings = async () => {
    try {
      const res = await api.get("/user/stats");
      setInfo({
        totalEarnings: parseFloat(res.data.totalEarnings || 0).toFixed(2),
        todayEarnings: parseFloat(res.data.todayEarnings || 0).toFixed(2),
      });
    } catch (err) {
      console.log("earnings error", err);
      toast.error("Failed to load earnings");
    }
  };

  /* REFERRAL EARNINGS */
  const loadReferralEarnings = async () => {
    try {
      const res = await api.get("/user/referrals");
      setRefData({
        referrerEarnings: parseFloat(res.data.referrerEarnings || 0).toFixed(2),
        refereeBonusEarnings: parseFloat(res.data.refereeBonusEarnings || 0).toFixed(2),
        referrerBonusExpiry: res.data.referrerBonusExpiry || null,
        refereeBonusExpiry: res.data.refereeBonusExpiry || null,
      });
    } catch (err) {
      console.log("referral earnings error", err);
      // toast.error("Failed to load referral data");
    }
  };

  /* WITHDRAWAL HISTORY - FIXED URL */
  const loadHistory = async () => {
    try {
      const res = await api.get("/withdrawals/"); // FIXED: Sahi route
      setHistory(res.data.withdrawals || []);
    } catch (err) {
      console.log("withdraw history error", err);
      toast.error("Failed to load withdrawal history");
      setHistory([]);
    }
  };


  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.success("Copied!");
    setTimeout(() => setCopiedId(""), 2000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
      case "paid":
      case "processing":
        return (
          <span className="flex items-center gap-1 text-green-600 bg-green-100 px-3 py-1 rounded-full text-xs font-medium">
            <CheckCircle size={14} />
            Approved
          </span>
        );
      case "pending":
        return (
          <span className="flex items-center gap-1 text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full text-xs font-medium">
            <Clock size={14} />
            Pending
          </span>
        );
      case "rejected":
        return (
          <span className="flex items-center gap-1 text-red-600 bg-red-100 px-3 py-1 rounded-full text-xs font-medium">
            <XCircle size={14} />
            Rejected
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-xs font-medium">
            <AlertCircle size={14} />
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 pb-10">

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">My Earnings</h2>
        <button
          onClick={loadAllData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-4 border-blue-600"></div>
        </div>
      ) : (

        <>
          {/* MAIN EARNINGS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-8 rounded-2xl shadow-lg">
              <p className="text-blue-100 text-sm">Total Earnings</p>
              <h1 className="text-4xl font-bold mt-2">₹{info.totalEarnings}</h1>
              <p className="text-blue-100 text-xs mt-2">Withdrawable Balance</p>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-8 rounded-2xl shadow-lg">
              <p className="text-green-100 text-sm">Today's Earnings</p>
              <h1 className="text-4xl font-bold mt-2">₹{info.todayEarnings}</h1>
              <p className="text-green-100 text-xs mt-2">Keep earning!</p>
            </div>
          </div>

          {/* REFERRAL EARNINGS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-purple-200 p-6 rounded-2xl shadow">
              <p className="text-gray-600 text-sm">Referral Earnings</p>
              <h1 className="text-3xl font-bold text-purple-600">₹{refData.referrerEarnings}</h1>
              {refData.referrerBonusExpiry && (
                <p className="text-xs text-gray-500 mt-2">
                  Bonus expires: {format(new Date(refData.referrerBonusExpiry), "dd MMM yyyy")}
                </p>
              )}
            </div>

            <div className="bg-white border-2 border-indigo-200 p-6 rounded-2xl shadow">
              <p className="text-gray-600 text-sm">Your Join Bonus</p>
              <h1 className="text-3xl font-bold text-indigo-600">₹{refData.refereeBonusEarnings}</h1>
              {refData.refereeBonusExpiry && (
                <p className="text-xs text-gray-500 mt-2">
                  Bonus expires: {format(new Date(refData.refereeBonusExpiry), "dd MMM yyyy")}
                </p>
              )}
            </div>
          </div>

          {/* WITHDRAWAL REQUEST FORM */}
          <div className="bg-white rounded-2xl border shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Request Withdrawal</h3>
            <WithdrawalRequest
              userEarnings={parseFloat(info.totalEarnings)}
              onSuccess={() => {
                toast.success("Withdrawal requested!");
                loadHistory();
                loadEarnings();
              }}
            />
          </div>

          {/* WITHDRAWAL HISTORY */}
          <div className="bg-white rounded-2xl border shadow-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h3 className="text-xl font-bold text-gray-800">Withdrawal History</h3>
            </div>

            <div className="p-6">
              {history.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg">No withdrawal requests yet</p>
                  <p className="text-sm mt-2">Your first withdrawal will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((h) => (
                    <div
                      key={h._id}
                      className="border rounded-xl p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-4">
                            <h4 className="text-2xl font-bold text-gray-800">₹{h.amount}</h4>
                            {getStatusBadge(h.status)}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {h.method} • {format(new Date(h.requestedAt), "dd MMM yyyy, hh:mm a")}
                          </p>
                          {h.transactionId && (
                            <div className="flex items-center gap-2 mt-2">
                              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {h.transactionId}
                              </code>
                              <button
                                onClick={() => copyToClipboard(h.transactionId)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {copiedId === h.transactionId ? <CheckCircle size={16} /> : <Copy size={16} />}
                              </button>
                            </div>
                          )}
                          {h.adminNote && (
                            <p className="text-xs text-red-600 mt-2 italic">Note: {h.adminNote}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserEarnings;