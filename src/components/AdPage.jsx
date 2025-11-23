import { useEffect, useState } from "react";
import { Clock, ChevronDown, ChevronRight, Loader2, User, LogIn } from "lucide-react";
import { useSelector } from "react-redux";

const AdPage = ({
  page,
  pageCount,
  totalPages,
  earningPerPage = 0.05,
  onNext,
  timer = 5,
}) => {
  const [countdown, setCountdown] = useState(timer);
  const [stepOneCompleted, setStepOneCompleted] = useState(false);
  const [loadingAds, setLoadingAds] = useState(true);

  const { user } = useSelector((state) => state.user) || {};

  const adSlots = [
    "ad_top",
    "ad_left",
    "ad_right",
    "ad_middle",
    "ad_under_title",
    "ad_bottom",
    "ad_footer",
    "ad_footer2",
  ];

  useEffect(() => {
    setCountdown(timer);
    setStepOneCompleted(false);
    loadTimer();
    injectAds();
  }, [page?._id]);

  const loadTimer = () => {
    let interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const injectAds = () => {
    adSlots.forEach((slotId) => {
      const el = document.getElementById(slotId);
      if (el) {
        el.innerHTML = `
          <div style="
            width: 100%;
            min-height: 120px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 18px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          ">Your Ad Here</div>
        `;
      }
    });
    setTimeout(() => setLoadingAds(false), 1200);
  };

  const progress = (pageCount / totalPages) * 100;
  const earned = (pageCount * earningPerPage).toFixed(2);

  return (
    <>
      {/* TOP NAVBAR - LOGIN + USER INFO */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-2xl z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-full font-bold text-lg">
              LinkEarn
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur px-5 py-2 rounded-full">
                <User className="h-5 w-5" />
                <span className="font-medium">{user.name || user.email}</span>
              </div>
            ) : (
              <a
                href="/login"
                className="flex items-center gap-2 bg-white text-indigo-700 px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition"
              >
                <LogIn className="h-5 w-5" />
                Login to Earn
              </a>
            )}
          </div>
        </div>
      </div>

      {/* TOP FIXED PROGRESS BAR */}
      <div className="bg-white shadow sticky top-16 z-40 border-b mt-16">
        <div className="max-w-4xl mx-auto p-3 sm:p-4">
          <div className="flex justify-between text-xs sm:text-sm mb-2">
            <span className="font-semibold text-gray-800">
              Page {pageCount}/{totalPages}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-green-700 font-bold text-lg">
                /{earned}
              </span>
              {countdown > 0 && (
                <span className="bg-orange-100 px-3 py-1 rounded-full text-orange-700 flex items-center gap-1 font-medium">
                  <Clock className="w-4 h-4" /> {countdown}s
                </span>
              )}
            </div>
          </div>
          <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
            <div
              style={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 shadow-lg"
            ></div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">

        {/* TOP AD */}
        <div id="ad_top" className="min-h-[100px] rounded-xl overflow-hidden"></div>

        {/* TITLE + IMAGE + META */}
        <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8 space-y-6 border border-gray-100">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
            {page.title}
          </h1>

          <div className="flex flex-wrap gap-3">
            <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full font-medium">
              {page.category}
            </span>
            {page.tags &&
              page.tags.split(",").map((tag, i) => (
                <span key={i} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm">
                  #{tag.trim()}
                </span>
              ))}
          </div>

          {page.imageUrl && (
            <img
              src={page.imageUrl}
              alt="Banner"
              className="rounded-2xl shadow-xl w-full object-cover max-h-96 border-4 border-white"
            />
          )}

          {page.metaDescription && (
            <p className="text-gray-700 text-lg leading-relaxed bg-gray-50 p-5 rounded-xl">
              {page.metaDescription}
            </p>
          )}
        </div>

        {/* STEP 1 BUTTON */}
        {!stepOneCompleted ? (
          <div className="text-center py-12 bg-gradient-to-b from-indigo-50 to-purple-50 rounded-3xl">
            <button
              disabled={countdown > 0}
              onClick={() => setStepOneCompleted(true)}
              className={`px-16 py-6 text-2xl font-bold rounded-2xl shadow-2xl transition-all transform hover:scale-105 ${
                countdown > 0
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
              }`}
            >
              Continue  
               {/* & Earn ₹{earningPerPage} */}
            </button>
            {countdown > 0 && (
              <p className="text-gray-600 mt-4 text-lg">
                Please wait <strong>{countdown}</strong> seconds...
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-3 text-purple-600 font-bold text-xl animate-bounce">
              <ChevronDown className="h-10 w-10" />
              <span>Scroll down to continue...</span>
              <ChevronDown className="h-10 w-10" />
            </div>
          </div>
        )}

        {/* 3 ADS KE BEECH MEIN BADA BANNER */}
        <div className="space-y-6">
          <div id="ad_under_title" className="min-h-[120px] rounded-xl overflow-hidden"></div>

          {/* BIG CENTER BANNER */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
            <img
              src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=400&fit=crop"
              alt="Featured Offer"
              className="w-full h-64 sm:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
              <div className="p-8 text-white">
                <h2 className="text-3xl sm:text-5xl font-bold mb-2">Limited Time Offer!</h2>
                <p className="text-xl">Earn ₹50XXX Bonus on First Withdrawal!</p>
              </div>
            </div>
          </div>

          <div id="ad_middle" className="min-h-[200px] rounded-xl overflow-hidden"></div>
        </div>

        {/* MAIN ARTICLE */}
        <article
          className="prose prose-lg max-w-none bg-white p-8 rounded-2xl shadow-xl border"
          dangerouslySetInnerHTML={{ __html: page.content }}
        ></article>

        {/* BOTTOM ADS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div id="ad_bottom" className="min-h-[200px] rounded-xl overflow-hidden"></div>
          <div id="ad_footer" className="min-h-[200px] rounded-xl overflow-hidden"></div>
        </div>

        {/* FINAL BEAUTIFUL BOTTOM SECTION */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-3xl p-10 text-center shadow-2xl">
          <h2 className="text-4xl font-bold mb-4">You’ve Earned $1M {"earned"} Worldwide!</h2>
          <p className="text-xl mb-8 opacity-90">
            {pageCount >= totalPages
              ? "Congratulations! You completed the journey."
              : `Only ${totalPages - pageCount} pages left !`}
          </p>

          <div className="flex justify-center gap-8 text-sm opacity-80">
            <div>Trusted by 50,000+ Users</div>
            <div>Instant Payments</div>
            <div>100% Secure</div>
          </div>
        </div>

        {/* NEXT BUTTON */}
        <div className="text-center py-10">
          <button
            disabled={!stepOneCompleted}
            onClick={stepOneCompleted ? onNext : undefined}
            className={`px-20 py-6 text-2xl font-bold rounded-3xl shadow-2xl flex items-center gap-4 mx-auto transition-all transform hover:scale-105 ${
              stepOneCompleted
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                : "bg-gray-400 text-gray-600 cursor-not-allowed"
            }`}
          >
            {pageCount >= totalPages ? "Claim Your Earnings" : "Next Page →"}
            <ChevronRight className="h-8 w-8" />
          </button>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
      <p className="text-gray-700 text-lg leading-relaxed bg-gray-50 p-5 rounded-xl">
              {page.metaDescription}
      </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div id="ad_bottom" className="min-h-[200px] rounded-xl overflow-hidden"></div>
          <div id="ad_footer" className="min-h-[200px] rounded-xl overflow-hidden"></div>
        </div>

      {/* ADS LOADING OVERLAY */}
      {loadingAds && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex justify-center items-center">
          <div className="bg-white p-10 rounded-3xl shadow-3xl text-center">
            <Loader2 className="h-16 w-16 text-indigo-600 animate-spin mx-auto mb-6" />
            <p className="text-2xl font-bold text-gray-800">Loading....</p>
            <p className="text-gray-600 mt-2">Please wait {countdown}s</p>
          </div>
        </div>
      )}
      

            {/* PREMIUM FOOTER - BHAI YE DIKHEGA TO USER BOLEGA "WAH YE TO BADI COMPANY HAI" */}
      <footer className="bg-gradient-to-t from-gray-900 via-gray-800 to-gray-900 text-gray-300 py-16 mt-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10">

          {/* Column 1 */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">Earn Money</h3>
            <ul className="space-y-3 text-sm">
              <li className="hover:text-white transition cursor-pointer flex items-center gap-2">
                <span className="text-green-500">✓</span> Read & Earn Daily
              </li>
              <li className="hover:text-white transition cursor-pointer flex items-center gap-2">
                <span className="text-green-500">✓</span> ₹500 - ₹50000 Per Day
              </li>
              <li className="hover:text-white transition cursor-pointer flex items-center gap-2">
                <span className="text-green-500">✓</span> Instant UPI Withdrawal An Crypto
              </li>
            </ul>
          </div>

          {/* Column 2 */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li className="hover:text-white transition">How It Works</li>
              <li className="hover:text-white transition">Success Stories</li>
              <li className="hover:text-white transition">Payment Proofs</li>
              <li className="hover:text-white transition hover:cursor-pointer"><a href="/login">Contact Support</a></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">Trusted By</h3>
            <div className="flex flex-wrap gap-6 items-center opacity-70">
              <div className="bg-gray-700 w-20 h-12 rounded-lg flex items-center justify-center text-xs font-bold">50K+</div>
              <div className="bg-gray-700 w-20 h-12 rounded-lg flex items-center justify-center text-xs font-bold">₹10Cr+</div>
              <div className="bg-gray-700 w-20 h-12 rounded-lg flex items-center justify-center text-xs font-bold">4.8★</div>
            </div>
            <p className="text-xs mt-4">Paid to users since 2024</p>
          </div>

          {/* Column 4 - Final CTA */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white">Ready to Earn?</h3>
            <p className="text-sm leading-relaxed">
              Join thousands of User earning daily just by reading articles!
            </p>
            <button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-2xl hover:shadow-green-500/50 transition transform hover:scale-105">
              <a href="/login">Start Earning Now</a>
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-700 text-center text-sm">
          <p>© 2025 All Rights Reserved • Made with <span className="text-red-500">♥</span> India</p>
          <div className="flex justify-center gap-6 mt-4">
            <span className="hover:text-white transition cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white transition cursor-pointer">Terms of Service</span>
            <span className="hover:text-white transition cursor-pointer">Refund Policy</span>
          </div>
        </div>
      </footer>



    </>
  );
};

export default AdPage;


/////////////


// import { useEffect, useState } from "react";
// import { Clock, ChevronDown, ChevronRight, Loader2 } from "lucide-react";

// const AdPage = ({
//   page,
//   pageCount,
//   totalPages,
//   earningPerPage = 0.05,
//   onNext,
//   timer = 5,
// }) => {
//   const [countdown, setCountdown] = useState(timer);
//   const [stepOneCompleted, setStepOneCompleted] = useState(false);
//   const [loadingAds, setLoadingAds] = useState(true);

//   const adSlots = [
//     "ad_top",
//     "ad_left",
//     "ad_right",
//     "ad_middle",
//     "ad_under_title",
//     "ad_bottom",
//     "ad_footer",
//     "ad_footer2",
//   ];

//   // Reset on page change
//   useEffect(() => {
//     setCountdown(timer);
//     setStepOneCompleted(false);
//     loadTimer();
//     injectAds();
//   }, [page?._id]);

//   const loadTimer = () => {
//     let interval = setInterval(() => {
//       setCountdown((prev) => {
//         if (prev <= 1) {
//           clearInterval(interval);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
//   };

//   const injectAds = () => {
//     adSlots.forEach((slotId) => {
//       const el = document.getElementById(slotId);
//       if (el) {
//         el.innerHTML = `
//           <div style="
//             width: 100%;
//             min-height: 120px;
//             background: #e9e9e9;
//             border-radius: 10px;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             color: #666;
//             font-size: 13px;
//           ">Loading Ads...</div>
//         `;
//       }
//     });

//     setTimeout(() => setLoadingAds(false), 1200);
//   };

//   const progress = (pageCount / totalPages) * 100;
//   const earned = (pageCount * earningPerPage).toFixed(2);

//   return (
//     <>
//       {/* ---------- TOP FIXED BAR ---------- */}
//       <div className="bg-white shadow sticky top-0 z-50 border-b">
//         <div className="max-w-4xl mx-auto p-3 sm:p-4">
//           <div className="flex justify-between text-xs sm:text-sm mb-2">
//             <span className="font-semibold text-gray-800">
//               Page {pageCount}/{totalPages}
//             </span>

//             <div className="flex items-center gap-2">
//               <span className="text-green-700 font-semibold">
//                 Earned: ₹{}
//               </span>

//               {countdown > 0 && (
//                 <span className="bg-orange-100 px-2 py-1 rounded-full text-orange-700 flex items-center gap-1">
//                   <Clock className="w-3 h-3" /> {countdown}s
//                 </span>
//               )}
//             </div>
//           </div>

//           <div className="w-full bg-gray-200 h-2 rounded-full">
//             <div
//               style={{ width: `${progress}%` }}
//               className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all"
//             ></div>
//           </div>
//         </div>
//       </div>

//       {/* ---------- PAGE CONTENT ---------- */}
//       <div className="max-w-4xl mx-auto p-3 sm:p-5 space-y-6">

//         {/* TOP AD */}
//         <div id="ad_top" className="min-h-[90px]"></div>

//         {/* TITLE + IMAGE + META */}
//         <div className="bg-white shadow-sm rounded-xl p-4 sm:p-6 space-y-4">

//           {/* TITLE */}
//           <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-snug">
//             {page.title}
//           </h1>

//           {/* CATEGORY + TAGS */}
//           <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
//             <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full">
//               {page.category}
//             </span>

//             {page.tags &&
//               page.tags.split(",").map((tag, i) => (
//                 <span
//                   key={i}
//                   className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full"
//                 >
//                   #{tag.trim()}
//                 </span>
//               ))}
//           </div>

//           {/* IMAGE */}
//           {page.imageUrl && (
//             <img
//               src={page.imageUrl}
//               alt="Page banner"
//               className="rounded-xl shadow-sm w-full object-cover max-h-[320px]"
//             />
//           )}

//           {/* META DESCRIPTION */}
//           {page.metaDescription && (
//             <p className="text-gray-600 text-sm leading-relaxed">
//               {page.metaDescription}
//             </p>
//           )}

//           {/* SEO KEYWORDS */}
//           {page.seoKeywords && (
//             <p className="text-gray-500 text-xs">
//               <strong>Keywords:</strong> {page.seoKeywords}
//             </p>
//           )}
//         </div>

//         {/* STEP 1 CLICK TIMER BUTTON */}
//         {!stepOneCompleted ? (
//           <div className="text-center py-8">
//             <button
//               disabled={countdown > 0}
//               onClick={() => setStepOneCompleted(true)}
//               className={`px-10 py-4 text-lg font-bold rounded-xl shadow-md transition-all ${
//                 countdown > 0
//                   ? "bg-gray-300 text-gray-500"
//                   : "bg-indigo-600 text-white hover:bg-indigo-700"
//               }`}
//             >
//               Continue (₹{earningPerPage})
//             </button>

//             {countdown > 0 && (
//               <p className="text-gray-500 text-sm mt-2">
//                 Please wait {countdown}s…
//               </p>
//             )}
//           </div>
//         ) : (
//           <div className="flex flex-col items-center py-4 text-gray-500 animate-bounce">
//             <ChevronDown className="h-8 w-8" />
//             <p className="font-medium">Scroll down to continue…</p>
//           </div>
//         )}

//         {/* MID AD */}
//         <div id="ad_middle" className="min-h-[200px]"></div>

//         {/* MAIN ARTICLE */}
//         <article
//           className="prose prose-sm sm:prose lg:prose-lg max-w-none bg-white p-5 rounded-xl shadow"
//           dangerouslySetInnerHTML={{ __html: page.content }}
//         ></article>

//         {/* BOTTOM ADS */}
//         <div id="ad_bottom" className="min-h-[200px]"></div>
//         <div id="ad_footer" className="min-h-[120px]"></div>
//         <div id="ad_footer2" className="min-h-[80px]"></div>

//         {/* NEXT BUTTON */}
//         <div className="text-center pt-6 pb-10">
//           <button
//             disabled={!stepOneCompleted}
//             onClick={stepOneCompleted ? onNext : undefined}
//             className={`px-12 py-4 text-lg font-bold rounded-2xl shadow-lg flex items-center gap-3 mx-auto ${
//               stepOneCompleted
//                 ? "bg-green-600 text-white hover:bg-green-700"
//                 : "bg-gray-300 text-gray-500 cursor-not-allowed"
//             }`}
//           >
//             {pageCount >= totalPages ? "Go to final site" : "Next Page"}
//             <ChevronRight />
//           </button>
//         </div>
//       </div>

//       {/* ADS LOADING OVERLAY */}
//       {loadingAds && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center">
//           <div className="bg-white p-6 rounded-xl shadow-xl text-center">
//             <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mx-auto mb-4" />
//             <p className="font-semibold text-gray-700">Loading Ads…</p>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default AdPage;
