import React from "react";
import { Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";

import { UserProvider } from "./contexts/UserContext";

import PublicHome from "./components/PublicHome";
import Login from "./components/Login";
import LinkRedirect from "./components/LinkRedirect";
import NotFound from "./components/NotFound";

import AdminPanel from "./components/admin/AdminPanel";
import PagesManagement from "./components/admin/PagesManagement";
import UserWithdrawals from "./components/admin/UserWithdrawals";

import ProtectedRoute from "./components/ProtectedRoute";

import UserLayout from "./components/user/UserLayout";
import UserDashboard from "./components/user/UserDashboard";
import UserLinks from "./components/user/UserLinks";
import UserEarnings from "./components/user/UserEarnings";
import UserReferrals from "./components/user/UserReferrals";
import UserSettings from "./components/user/UserSettings";

function AppContent() {
  return (
    <>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<PublicHome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Login />} />
        <Route path="/l/:linkId" element={<LinkRedirect />} />

        {/* Admin Protected */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute adminOnly>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/pages" element={<PagesManagement />} />
        <Route path="/admin/withdrawals" element={<UserWithdrawals />} />

        {/* USER PROTECTED */}
        <Route
          path="/user"
          element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserDashboard />} />
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="links" element={<UserLinks />} />
          <Route path="earnings" element={<UserEarnings />} />
          <Route path="referrals" element={<UserReferrals />} />
          <Route path="settings" element={<UserSettings />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <UserProvider>        {/* <-- FIXED: Entire app wrapped here */}
        <AppContent />
      </UserProvider>
    </Provider>
  );
}
