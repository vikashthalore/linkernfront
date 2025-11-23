// LinkRedirect.jsx — FINAL STABLE VERSION (Sync with new AdPage.jsx)

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import AdPage from "./AdPage";

const LinkRedirect = () => {
  const { linkId } = useParams();

  const [page, setPage] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [totalPages, setTotalPages] = useState(3);
  const [clickId, setClickId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Timer from backend
  const [timer, setTimer] = useState(5);

  const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  useEffect(() => {
    startFirstClick();
  }, [linkId]);

  /* ----------------------------------------------------
     1) FIRST CLICK → get first ad page + clickId
  ----------------------------------------------------- */
  const startFirstClick = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await axios.post(`${API}/links/${linkId}/click`);

      setPage(data.page);
      setPageCount(1);
      setTotalPages(data.totalPages);
      setClickId(data.clickId);

      // timer from backend? you can attach earning config also
      setTimer(data.minDisplayTime || 5);

    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired link");
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------------------------
     2) NEXT PAGE → controlled by AdPage.jsx UI
  ----------------------------------------------------- */
 const loadNext = async () => {
  if (!page || !clickId) return;

  try {
    setLoading(true);
    setError("");

    const { data } = await axios.post(`${API}/links/${linkId}/next`, {
      currentPageId: page._id,
      clickId,
    });

    // Completed → redirect
    if (data.completed && data.redirectUrl) {
      window.location.href = data.redirectUrl;
      return;
    }

    // NOT Completed → Next Page
    setPage(data.page);

    // INCREMENT PAGE COUNT MANUALLY (IMPORTANT!)
    setPageCount(prev => prev + 1);

    setTimer(data.minDisplayTime || 5);

  } catch (err) {
    setError(err.response?.data?.message || "Error loading next page");
  } finally {
    setLoading(false);
  }
};

  /* ----------------------------------------------------
     LOADING UI
  ----------------------------------------------------- */
  if (loading && !page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-indigo-700 font-medium">Preparing content…</p>
        </div>
      </div>
    );
  }

  /* ----------------------------------------------------
     ERROR UI
  ----------------------------------------------------- */
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm border border-red-200">
          <p className="font-bold text-xl text-red-700">Link Error!</p>
          <p className="mt-2 text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  /* ----------------------------------------------------
     MAIN RENDER → AdPage component
  ----------------------------------------------------- */
  return (
    <AdPage
      page={page}
      pageCount={pageCount}
      totalPages={totalPages}
      earningPerPage={0.05}       // backend se bhi laa sakte ho
      timer={timer}               // countdown synced
      onNext={loadNext}           // final action
    />
  );
};

export default LinkRedirect;
