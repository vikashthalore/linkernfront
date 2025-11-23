import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { Copy, Trash2, Plus, MousePointerClick, DollarSign, Link2 } from "lucide-react";

const UserLinks = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);

  const [newLink, setNewLink] = useState({
    title: "",
    originalUrl: "",
    pageCount: 10,
  });

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    try {
      const res = await api.get("/user/links");
      if (res.data.success && res.data.links) {
        setLinks(res.data.links);
      }
    } catch (err) {
      toast.error("Failed to load links");
      console.error(err);
    }
  };

  const createLink = async (e) => {
    e.preventDefault();

    if (!newLink.originalUrl.trim()) {
      return toast.error("Please enter redirect URL");
    }

    setLoading(true);
    try {
      const res = await api.post("/user/links", {
        name: newLink.title.trim() || `My Link ${new Date().toLocaleDateString()}`,
        redirectUrl: newLink.originalUrl.trim(),
        pageCount: Number(newLink.pageCount) || 10,
      });

      if (res.data.success) {
        toast.success("Link created successfully!");
        setNewLink({ title: "", originalUrl: "", pageCount: 10 });
        loadLinks(); // Refresh list
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create link");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const deleteLink = async (id) => {
    if (!window.confirm("Are you sure you want to delete this link?")) return;

    try {
      await api.delete(`/user/links/${id}`); // Fixed: correct endpoint
      setLinks(links.filter((l) => l._id !== id));
      toast.success("Link deleted");
    } catch (err) {
      toast.error("Failed to delete link");
    }
  };

  // Safe function to format money (string ya number dono handle karega)
  const formatEarnings = (amount) => {
    const num = parseFloat(amount || 0);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-4">

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">My Links</h2>
        <span className="text-sm text-gray-500">{links.length} links</span>
      </div>

      {/* Create New Link Form */}
      <form
        onSubmit={createLink}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 p-6 space-y-5"
      >
        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Link Title (optional)"
            value={newLink.title}
            onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            type="url"
            required
            placeholder="https://yourwebsite.com"
            value={newLink.originalUrl}
            onChange={(e) => setNewLink({ ...newLink, originalUrl: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            type="number"
            min="1"
            max="50"
            value={newLink.pageCount}
            onChange={(e) => setNewLink({ ...newLink, pageCount: e.target.value })}
            placeholder="Pages (1-50)"
            className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-3 hover:from-indigo-700 hover:to-purple-700 transition transform hover:scale-105 disabled:opacity-70"
        >
          <Plus size={22} />
          {loading ? "Creating..." : "Create New Link"}
        </button>
      </form>

      {/* Links List */}
      <div className="space-y-4">
        {links.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <Link2 size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No links yet. Create your first link above!</p>
          </div>
        ) : (
          links.map((link) => (
            <div
              key={link._id}
              className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800">{link.name}</h3>
                  <a
                    href={link.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:underline break-all mt-1 inline-flex items-center gap-1"
                  >
                    <Link2 size={16} />
                    {link.shortUrl}
                  </a>

                  <div className="flex gap-8 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MousePointerClick className="text-indigo-600" size={18} />
                      <span className="font-semibold">{link.clicks || 0}</span>
                      <span className="text-gray-500">clicks</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <DollarSign className="text-green-600" size={18} />
                      <span className="font-bold text-green-600">
                        ₹{formatEarnings(link.earnings)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => copyToClipboard(link.shortUrl)}
                    className="p-3 bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 transition"
                    title="Copy link"
                  >
                    <Copy size={20} />
                  </button>

                  <button
                    onClick={() => deleteLink(link._id)}
                    className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition"
                    title="Delete link"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserLinks;


// ///////////////////

// import React, { useEffect, useState } from "react";
// import api from "../../lib/api";
// import toast from "react-hot-toast";
// import { Copy, Trash2, Plus, MousePointerClick, DollarSign } from "lucide-react";

// const UserLinks = () => {
//   const [links, setLinks] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const [newLink, setNewLink] = useState({
//     title: "",
//     originalUrl: "",
//     pageCount: 10,
//   });

//   useEffect(() => {
//     loadLinks();
//   }, []);

//   const loadLinks = async () => {
//     try {
//       const res = await api.get("/user/links");
//       setLinks(res.data.links || []);
//     } catch {
//       toast.error("Failed to load links");
//     }
//   };

//   const createLink = async (e) => {
//     e.preventDefault();

//     if (!newLink.originalUrl) return toast.error("Enter Redirect URL");

//     setLoading(true);
//     try {
//       const res = await api.post("/user/links", {
//         name: newLink.title || `Link ${Date.now()}`,
//         redirectUrl: newLink.originalUrl,
//         pageCount: Number(newLink.pageCount), // ⭐ FIX #1
//       });

//       toast.success("Link created!");
//       setNewLink({ title: "", originalUrl: "", pageCount: 10 });
//       loadLinks();
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Failed to create link");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const copyToClipboard = (text) => {
//     navigator.clipboard.writeText(text);
//     toast.success("Copied!");
//   };

//   const deleteLink = async (id) => {
//   if (!confirm("Delete this link?")) return;

//   try {
//     await api.delete(`/user/${id}`);
//     setLinks(links.filter((l) => l._id !== id));
//     toast.success("Link deleted");
//   } catch {
//     toast.error("Failed to delete");
//   }
// };


//   return (
//     <div className="space-y-8">
//       <h2 className="text-2xl font-bold">My Links</h2>

//       {/* Create Link */}
//       <form
//         onSubmit={createLink}
//         className="bg-white p-6 rounded-xl border shadow space-y-4"
//       >
//         <input
//           type="text"
//           placeholder="Link Title (Optional)"
//           value={newLink.title}
//           className="w-full border p-3 rounded"
//           onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
//         />

//         <input
//           type="text"
//           placeholder="Redirect URL (https://...)"
//           value={newLink.originalUrl}
//           className="w-full border p-3 rounded"
//           onChange={(e) =>
//             setNewLink({ ...newLink, originalUrl: e.target.value })
//           }
//         />

//         <input
//           type="number"
//           placeholder="Page Count"
//           value={newLink.pageCount}
//           min={1}
//           max={50}
//           className="w-full border p-3 rounded"
//           onChange={(e) =>
//             setNewLink({ ...newLink, pageCount: Number(e.target.value) })
//           }
//         />

//         <button
//           disabled={loading}
//           className="bg-indigo-600 text-white py-3 px-6 rounded-lg flex items-center"
//         >
//           <Plus className="h-5 w-5 mr-2" />
//           Create Link
//         </button>
//       </form>

//       {/* Link List */}
//       <div className="grid gap-4">
//         {links.map((link) => (
//           <div
//             className="bg-white p-5 border rounded-xl shadow flex items-center justify-between"
//             key={link._id}
//           >
//             <div>
//               <p className="font-bold text-lg">{link.name}</p>

//               <p className="text-xs text-gray-500 break-all">
//                 {link.shortUrl || "—"}
//               </p>

//               {/* Stats */}
//               <div className="flex gap-6 mt-2 text-sm text-gray-700">
//                 <span className="flex items-center gap-1">
//                   <MousePointerClick className="h-4 w-4 text-indigo-600" />
//                   {link.clicks} clicks
//                 </span>

//                 <span className="flex items-center gap-1">
//                   <DollarSign className="h-4 w-4 text-green-600" />
//                   ₹{(link.earnings || 0).toFixed(2)}
//                 </span>
//               </div>
//             </div>

//             <div className="flex gap-3">
//               <button
//                 onClick={() => copyToClipboard(link.shortUrl)}
//                 className="p-2 bg-gray-100 rounded"
//               >
//                 <Copy className="h-5 w-5" />
//               </button>

//               <button
//                 onClick={() => deleteLink(link._id)}
//                 className="p-2 bg-red-100 text-red-600 rounded"
//               >
//                 <Trash2 className="h-5 w-5" />
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default UserLinks;
