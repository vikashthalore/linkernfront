// components/admin/UserWithdrawals.jsx  (Ya AdminWithdrawals.jsx)
import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { Check, X, Copy, Clock, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

const AdminWithdrawals = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    try {
      const res = await api.get("/withdrawals/admin/all"); // SAHI URL
      setList(res.data.withdrawals || []);
    } catch (err) {
      console.log("ADMIN LOAD ERROR", err);
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id) => {
    if (!confirm("Approve this withdrawal? Balance will be deducted.")) return;
    try {
      await api.patch(`/withdrawals/admin/approve/${id}`);
      toast.success("Approved & balance deducted!");
      loadAll();
    } catch {
      toast.error("Failed to approve");
    }
  };

  const reject = async (id) => {
    const reason = prompt("Reason for rejection (optional):");
    try {
      await api.patch(`/withdrawals/admin/reject/${id}`, {
        adminNote: reason || "Rejected by admin",
      });
      toast.success("Rejected");
      loadAll();
    } catch {
      toast.error("Failed to reject");
    }
  };

  const copyDetails = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  useEffect(() => {
    loadAll();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading requests...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <h2 className="text-2xl font-bold">Withdrawal Requests</h2>
          <p className="text-indigo-100">Total: {list.length} pending/completed</p>
        </div>

        {list.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <Clock size={48} className="mx-auto mb-4 opacity-50" />
            <p>No withdrawal requests yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {list.map((w) => (
              <div key={w._id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-lg">{w.userId?.name || "User"}</h3>
                      <span className="text-2xl font-bold text-green-600">₹{w.amount}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        w.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        w.status === "approved" ? "bg-green-100 text-green-800" :
                        w.status === "rejected" ? "bg-red-100 text-red-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {w.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mt-1">
                      {w.userId?.email} • Requested on {new Date(w.requestedAt).toLocaleDateString()}
                    </p>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <strong>Method:</strong> <span className="font-medium">{w.method}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <strong>Details:</strong>
                        <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg font-mono text-sm">
                          {w.details || w.accountInfo}
                          <button onClick={() => copyDetails(w.details || w.accountInfo)}>
                            <Copy size={16} className="text-blue-600 hover:text-blue-800" />
                          </button>
                        </div>
                      </div>
                      {w.adminNote && (
                        <p className="text-xs italic text-red-600 mt-2">
                          Note: {w.adminNote}
                        </p>
                      )}
                    </div>
                  </div>

                  {w.status === "pending" && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => approve(w._id)}
                        className="px-5 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center gap-2 font-medium shadow-lg"
                      >
                        <CheckCircle size={18} />
                        Approve
                      </button>
                      <button
                        onClick={() => reject(w._id)}
                        className="px-5 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 flex items-center gap-2 font-medium shadow-lg"
                      >
                        <XCircle size={18} />
                        Reject
                      </button>
                    </div>
                  )}

                  {w.status === "approved" && (
                    <span className="text-green-600 font-bold">Approved & Deducted</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminWithdrawals;