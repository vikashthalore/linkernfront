// components/user/UserReferrals.jsx
import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import { Copy, Users, Trophy, IndianRupee } from "lucide-react";
import toast from "react-hot-toast";

const UserReferrals = () => {
  const [data, setData] = useState({
    referralCode: "",
    totalReferred: 0,
    referralIncome: "0.00",
    referredUsers: []
  });

  const inviteLink = `${window.location.origin}/register?ref=${data.referralCode}`;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await api.get("/user/referrals");
      setData(res.data);
    } catch (err) {
      toast.error("Failed to load referral data");
    }
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">

      {/* Hero Section */}
      <div className="text-center py-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl text-white">
        <Trophy size={64} className="mx-auto mb-4" />
        <h1 className="text-4xl font-bold">Referral Program</h1>
        <p className="text-xl mt-3 opacity-90">
          Invite friends & earn <b>5% lifetime</b> from their earnings!
        </p>
      </div>

      {/* Referral Income Card */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-8 rounded-3xl shadow-2xl text-center">
        <IndianRupee size={48} className="mx-auto mb-3" />
        <p className="text-lg opacity-90">Total Referral Income</p>
        <h2 className="text-6xl font-bold mt-2">₹{data.referralIncome}</h2>
        <p className="mt-4 text-xl">
          <Users className="inline mr-2" />
          {data.totalReferred} friends joined
        </p>
      </div>

      {/* Invite Link */}
      <div className="bg-white p-8 rounded-3xl shadow-xl border">
        <h3 className="text-2xl font-bold mb-6">Your Referral Link</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={inviteLink}
            readOnly
            className="flex-1 px-5 py-4 border rounded-xl font-mono text-sm bg-gray-50"
          />
          <button
            onClick={() => copyText(inviteLink)}
            className="px-8 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-3 font-bold"
          >
            <Copy size={20} />
            Copy Link
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Share this link — har friend jo join karega, uski lifetime earning ke Equal 5% aapko <span className="font-bold text-green-400">Extra</span> milega!
        </p>
      </div>

      {/* Referred Users List */}
      {data.referredUsers.length > 0 && (
        <div className="bg-white p-8 rounded-3xl shadow-xl border">
          <h3 className="text-2xl font-bold mb-6">Your Team ({data.totalReferred})</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {data.referredUsers.map((user, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-gray-500">
                    Joined: {new Date(user.joinedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-green-600 font-bold">Active</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserReferrals;

// import React, { useEffect, useState } from "react";
// import api from "../../lib/api";
// import { Copy } from "lucide-react";
// import toast from "react-hot-toast";

// const UserReferrals = () => {
//   const [ref, setRef] = useState({
//     referralCode: "",
//     referrerEarnings: 0,
//     refereeBonusEarnings: 0,
//     referredUsers: [],
//     referrerBonusExpiry: null,
//     refereeBonusExpiry: null,
//   });

//   const baseInviteUrl = `${window.location.origin}/login?ref=`;

//   useEffect(() => {
//     loadReferral();
//   }, []);

//   const loadReferral = async () => {
//     try {
//       const res = await api.get("/user/referrals");
//       setRef(res.data);
//     } catch (err) {
//       console.log("REFERRAL LOAD ERR:", err);
//       toast.error("Failed to load referral data");
//     }
//   };

//   const copy = (text) => {
//     navigator.clipboard.writeText(text);
//     toast.success("Copied!");
//   };

//   return (
//     <div className="space-y-8">

//       <h2 className="text-2xl font-bold">Referral Program</h2>

//       {/* Referral Code */}
//       <div className="bg-white p-6 border rounded-xl shadow">
//         <p className="text-sm text-gray-500">Your Referral Code</p>

//         <div className="flex items-center mt-2">
//           <span className="text-xl font-bold">{ref.referralCode}</span>
//           <button
//             onClick={() => copy(ref.referralCode)}
//             className="ml-3 p-2 bg-gray-100 rounded"
//           >
//             <Copy className="h-5 w-5" />
//           </button>
//         </div>

//         <p className="mt-3 text-sm font-medium">Invite Link:</p>
//         <div className="flex items-center break-all">
//           <span className="text-gray-700">
//             {baseInviteUrl + ref.referralCode}
//           </span>
//           <button
//             onClick={() => copy(baseInviteUrl + ref.referralCode)}
//             className="ml-3 p-2 bg-gray-100 rounded"
//           >
//             <Copy className="h-5 w-5" />
//           </button>
//         </div>
//       </div>

//       {/* Earnings Boxes */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

//         <div className="bg-white p-6 border rounded-xl shadow">
//           <p className="text-sm text-gray-500">Earnings from Referrals</p>
//           <h1 className="text-3xl font-bold">₹{ref.referrerEarnings}</h1>

//           <p className="mt-2 text-xs text-gray-500">
//             Bonus valid until:{" "}
//             {ref.referrerBonusExpiry
//               ? new Date(ref.referrerBonusExpiry).toLocaleDateString()
//               : "—"}
//           </p>
//         </div>

//         <div className="bg-white p-6 border rounded-xl shadow">
//           <p className="text-sm text-gray-500">Your Extra Bonus Earnings</p>
//           <h1 className="text-3xl font-bold">₹{ref.refereeBonusEarnings}</h1>

//           <p className="mt-2 text-xs text-gray-500">
//             Bonus valid until:{" "}
//             {ref.refereeBonusExpiry
//               ? new Date(ref.refereeBonusExpiry).toLocaleDateString()
//               : "—"}
//           </p>
//         </div>

//       </div>

//       {/* Users Referred */}
//       <div className="bg-white p-6 border rounded-xl shadow">
//         <h3 className="text-lg font-bold mb-4">People You Referred</h3>

//         {ref.referredUsers.length === 0 ? (
//           <p className="text-gray-500">No one has joined using your code yet.</p>
//         ) : (
//           <div className="space-y-3">
//             {ref.referredUsers.map((u) => (
//               <div
//                 key={u._id}
//                 className="flex justify-between py-2 border-b text-sm"
//               >
//                 <span>{u.name}</span>
//                 <span className="text-gray-500">
//                   {new Date(u.createdAt).toLocaleDateString()}
//                 </span>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//     </div>
//   );
// };

// export default UserReferrals;
