import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { useUser } from "../../contexts/UserContext";

const UsersManagement = () => {
  const { user: currentUser } = useUser();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  console.log("🔥 currentUser:", currentUser);
}, [currentUser]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users"); // always authenticated
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const promoteToAdmin = async (userId) => {
    if (!confirm("Promote this user to admin?")) return;
    try {
      await api.put(`/admin/users/${userId}/promote`);
      fetchUsers();
    } catch (err) {
      console.error("Error promoting user:", err);
    }
  };

  const updateEarningsRate = async (userId, newRate) => {
    try {
      await api.put(`/admin/users/${userId}/earnings`, {
        earningsRate: newRate,
      });
      fetchUsers();
    } catch (err) {
      console.error("Error updating earnings:", err);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.put(`/admin/users/${userId}/status`, {
        isActive: !currentStatus,
      });
      fetchUsers();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // ---------------- SAFE GUARD ----------------
  if (!currentUser) {
    return (
      <div className="p-10 text-center text-gray-500">
        Loading user...
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // ------------------------------------------------------

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
        <p className="text-gray-600">Manage all users and permissions</p>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">All Users ({users.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Earnings Rate</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Joined</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.role}
                      {user.isMainAdmin && " (Main)"}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">₹{user.earningsRate || 1}</span>

                      {currentUser?.isMainAdmin && user.role === "user" && (
                        <button
                          onClick={() => {
                            const rate = prompt(
                              "Enter new earnings rate:",
                              user.earningsRate || 1
                            );
                            if (rate && !isNaN(rate)) {
                              updateEarningsRate(user._id, parseFloat(rate));
                            }
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        user.isActive !== false
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.isActive !== false ? "Active" : "Suspended"}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4 space-x-2 text-sm">
                    {currentUser?.isMainAdmin && user.role === "user" && (
                      <button
                        onClick={() => promoteToAdmin(user._id)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        Make Admin
                      </button>
                    )}

                    <button
                      onClick={() =>
                        toggleUserStatus(user._id, user.isActive !== false)
                      }
                      className={`${
                        user.isActive !== false
                          ? "text-orange-600 hover:text-orange-900"
                          : "text-green-600 hover:text-green-900"
                      }`}
                    >
                      {user.isActive !== false ? "Suspend" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 text-2xl">👥</div>
          <div className="ml-4">
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-2xl font-bold">{users.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600 text-2xl">👑</div>
          <div className="ml-4">
            <p className="text-sm text-gray-600">Admins</p>
            <p className="text-2xl font-bold">
              {users.filter((u) => u.role === "admin").length}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm flex items-center">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600 text-2xl">💰</div>
          <div className="ml-4">
            <p className="text-sm text-gray-600">Active Today</p>
            <p className="text-2xl font-bold">
              {users.filter((u) => u.isActive !== false).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersManagement;
