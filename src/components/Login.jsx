import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  sendRegisterOTP,
  verifyRegisterOTP,
  sendLoginOTP,
  verifyLoginOTP,
  passwordLogin,
  clearError,
  resetOTPScreen,
} from "../store/slices/userSlice";

import {
  Mail,
  Lock,
  User,
  Smartphone,
  ArrowLeft,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";

import toast, { Toaster } from "react-hot-toast";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, token, isLoading, error, otpSent } = useSelector(
    (state) => state.user
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    otp: "",
    referralCode: "", // ← YEH AB FORM MEIN HAI
    isRegistering: false,
    showPassword: false,
  });

  const [timer, setTimer] = useState(0);

  // AUTO APPLY REFERRAL CODE FROM URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get("ref");

    if (ref) {
  const cleanRef = ref.trim().toUpperCase();
  setFormData((prev) => ({
    ...prev,
    referralCode: cleanRef,
    isRegistering: true,
  }));
  toast.success(`Referral code applied: ${cleanRef}`, { icon: "Checkmark" });
}
  }, [location.search]);

  // INPUT HANDLER
  const handleChange = (e) => {
    dispatch(clearError());
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // PASSWORD TOGGLE
  const togglePassword = () => {
    setFormData((prev) => ({ ...prev, showPassword: !prev.showPassword }));
  };

  // TOGGLE LOGIN / REGISTER
  const toggleMode = () => {
    dispatch(clearError());
    dispatch(resetOTPScreen());
    setFormData({
      name: "",
      email: "",
      password: "",
      otp: "",
      referralCode: formData.referralCode, // ← Referral code preserve rahega
      isRegistering: !formData.isRegistering,
      showPassword: false,
    });
    setTimer(0);
  };

  // SEND OTP
  const handleSendOTP = async () => {
  if (!formData.email) return toast.error("Email required");
  if (formData.isRegistering && !formData.name) return toast.error("Name required");

  setTimer(50);

  if (formData.isRegistering) {
    dispatch(
      sendRegisterOTP({
        email: formData.email.trim(),
        name: formData.name.trim(),
        referralCode: formData.referralCode?.trim() ? formData.referralCode.trim().toUpperCase() : null,
      })
    )
      .unwrap()
      .then((res) => {
        toast.success("OTP sent successfully!");
    
        // ye line se screen me login popup me otp show hoti hai

        // if (res?.otp) toast(`Dev OTP: ${res.otp}`, { icon: "Lock" });


        //  /////////////
      })
      .catch((err) => {
        toast.error(err.message || "Failed to send OTP");
        setTimer(0);
      });
  } else {
    // login OTP
    dispatch(sendLoginOTP({ email: formData.email.trim() }))
      .unwrap()
      .then((res) => {
        toast.success("OTP sent successfully!");

        // ye line se screen me popup me otp dikhti hai


        // if (res?.otp) toast(`Dev OTP: ${res.otp}`, { icon: "Lock" });

        // //////////////////
      })
      .catch((err) => {
        toast.error(err.message || "Failed to send OTP");
        setTimer(0);
      });
  }
};

  // TIMER
  useEffect(() => {
    if (timer <= 0) return;
    const t = setInterval(() => setTimer((v) => v - 1), 1000);
    return () => clearInterval(t);
  }, [timer]);

  // VERIFY OTP
  const handleVerifyOTP = () => {
    if (formData.otp.length !== 6) return toast.error("Enter 6-digit OTP");

    const payload = formData.isRegistering
  ? {
      email: formData.email,
      name: formData.name,
      password: formData.password,
      otp: formData.otp,
      // referralCode: formData.referralCode || null,
    }
  : {
      email: formData.email,
      otp: formData.otp,
    };

const action = formData.isRegistering ? verifyRegisterOTP : verifyLoginOTP;

dispatch(action(payload))
  .unwrap()
  .then((res) => {
    toast.success("Welcome to LinkEarn!");
    navigate(res.user.role === "admin" ? "/admin" : "/user");
  })
  .catch((err) => toast.error(err.message || "Invalid OTP"));
  };

  // PASSWORD LOGIN
  const handlePasswordLogin = (e) => {
    e.preventDefault();
    dispatch(passwordLogin({ email: formData.email, password: formData.password }))
      .unwrap()
      .then((res) => {
        toast.success("Login successful!");
        navigate(res.user.role === "admin" ? "/admin" : "/user");
      })
      .catch((err) => toast.error(err?.message || "Login failed"));
  };

  // AUTO REDIRECT IF ALREADY LOGGED IN
  useEffect(() => {
    if (user && token) {
      navigate(user.role === "admin" ? "/admin" : "/user");
    }
  }, [user, token]);

  return (
    <>
      <Toaster position="top-right" />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
    <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">

      {/* HEADER */}
      <div className="text-center">
        <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-lg">L</span>
        </div>

        <h2 className="mt-6 text-3xl font-bold text-gray-900">
          {otpSent
            ? "Verify OTP"
            : formData.isRegistering
            ? "Create Account"
            : "Welcome Back"}
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          {otpSent
            ? "Enter the OTP sent to your email"
            : formData.isRegistering
            ? "Join LinkEarn today"
            : "Sign in to continue"}
        </p>

        {/* REFERRAL APPLIED MESSAGE */}
        {formData.referralCode && (
          <p className="mt-3 text-green-600 font-medium">
            Referral Applied: <b>{formData.referralCode}</b>
          </p>
        )}

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {/* OTP SCREEN */}
      {otpSent ? (
        <>
          <button
            type="button"
            onClick={() => {
              dispatch(resetOTPScreen());
              setFormData({ ...formData, otp: "" });
              setTimer(0);
            }}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </button>

          <div className="relative mb-4">
            <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              name="otp"
              maxLength="6"
              value={formData.otp}
              onChange={handleChange}
              className="pl-10 w-full px-3 py-3 border text-center border-gray-300 rounded-lg text-lg font-mono tracking-widest"
              placeholder="000000"
            />
          </div>

          {timer > 0 ? (
            <p className="text-center text-gray-500 text-sm">
              Resend OTP in <b>{timer}</b>s
            </p>
          ) : (
            <button
              type="button"
              onClick={handleSendOTP}
              className="text-indigo-600 underline text-center w-full text-sm"
            >
              Resend OTP
            </button>
          )}

          <button
            type="button"
            onClick={handleVerifyOTP}
            disabled={isLoading}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-70"
          >
            {isLoading ? <RefreshCw className="h-5 w-5 animate-spin mx-auto" /> : "Verify OTP"}
          </button>
        </>
      ) : (
        <form className="space-y-6" onSubmit={handlePasswordLogin}>
          {/* NAME FIELD */}
          {formData.isRegistering && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Full Name"
              />
            </div>
          )}

          {/* REFERRAL CODE FIELD */}
          {formData.isRegistering && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                name="referralCode"
                value={formData.referralCode || ""}
                onChange={handleChange}
                readOnly={!!formData.referralCode}
                className={`pl-10 w-full px-3 py-3 border rounded-lg font-mono text-sm ${
                  formData.referralCode
                    ? "bg-green-50 border-green-400 text-green-700"
                    : "border-gray-300"
                }`}
                placeholder="Referral Code (optional)"
              />
              {formData.referralCode && (
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 font-bold text-sm">
                  Applied
                </span>
              )}
            </div>
          )}

          {/* EMAIL */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Email Address"
            />
          </div>

          {/* PASSWORD */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              name="password"
              type={formData.showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              required
              className="pr-12 pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder={formData.isRegistering ? "Create Password" : "Password"}
            />
            <button
              type="button"
              onClick={togglePassword}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              {formData.showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {/* BUTTONS */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleSendOTP}
              disabled={!formData.email || (formData.isRegistering && !formData.name)}
              className="w-full py-3 border border-indigo-600 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 disabled:opacity-50"
            >
              Send OTP
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-70"
            >
              {formData.isRegistering ? "Create Account" : "Sign In"}
            </button>
          </div>
        </form>
      )}

      {/* TOGGLE MODE */}
      {!otpSent && (
        <p className="text-center text-sm text-gray-600">
          {formData.isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={toggleMode}
            className="text-indigo-600 font-bold hover:underline"
          >
            {formData.isRegistering ? "Sign In" : "Sign Up"}
          </button>
        </p>
      )}
    </div>
  </div>
</>
  );
};

export default Login;

// //////////////////////////////////////////

// import React, { useState, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useSearchParams } from "react-router-dom";
// import {
//   sendRegisterOTP,
//   verifyRegisterOTP,
//   sendLoginOTP,
//   verifyLoginOTP,
//   passwordLogin,
//   clearError,
//   resetOTPScreen,
// } from "../store/slices/userSlice";

// import { useNavigate, useLocation } from "react-router-dom";
// import {
//   Mail,
//   Lock,
//   User,
//   Smartphone,
//   ArrowLeft,
//   RefreshCw,
//   Eye,
//   EyeOff,
// } from "lucide-react";

// import toast, { Toaster } from "react-hot-toast";

// const Login = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const location = useLocation(); // ⭐ for reading referral

//   const { user, token, isLoading, error, otpSent } = useSelector(
//     (state) => state.user
//   );

//   // ⭐ REFERRAL STATE
//   // const [referralCode, setReferralCode] = useState(null);

//   // 1. Yeh useEffect replace kar de (purana wala hata de)
// useEffect(() => {
//   const params = new URLSearchParams(location.search);
//   const ref = params.get("ref");

//   if (ref) {
//     const cleanRef = ref.trim().toUpperCase();
    
//     setFormData(prev => ({
//       ...prev,
//       referralCode: cleanRef,
//       isRegistering: true
//     }));
    
//     toast.success(`Referral code applied: ${cleanRef}`);
//   }
// }, [location.search]);


//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     otp: "",
//     isRegistering: false,
//     showPassword: false,
//   });

//   const [timer, setTimer] = useState(0);

//   // INPUT HANDLER
//   const handleChange = (e) => {
//     dispatch(clearError());
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   // PASSWORD TOGGLE
//   const togglePassword = () => {
//     setFormData((prev) => ({ ...prev, showPassword: !prev.showPassword }));
//   };

//   const [searchParams] = useSearchParams();

// // useEffect(() => {
// //   const ref = searchParams.get("ref");
// //   if (ref) {
// //     setFormData((prev) => ({
// //       ...prev,
// //       referralCode: ref,
// //       isRegistering: true, // Auto open signup mode
// //     }));
// //   }
// // }, []);


//   // LOGIN <-> REGISTER MODE
//   const toggleMode = () => {
//     dispatch(clearError());
//     dispatch(resetOTPScreen());

//     setFormData({
//       name: "",
//       email: "",
//       password: "",
//       otp: "",
//       isRegistering: !formData.isRegistering,
//       showPassword: false,
//     });

//     setTimer(0);
//   };

//   // SEND OTP
//   const handleSendOTP = async () => {
//     if (!formData.email) return toast.error("Email required");

//     setTimer(50);

//     if (formData.isRegistering) {
//       if (!formData.name) return toast.error("Name required");

//       dispatch(
//         sendRegisterOTP({
//           email: formData.email,
//           name: formData.name,
//           referralCode: formData.referralCode || null,
//         })
//       )
//         .unwrap()
//         .then((res) => {
//           toast.success("OTP sent!");
//           if (res?.otp) toast("Dev OTP: " + res.otp, { icon: "🔒" });
//         })
//         .catch((err) => {
//           toast.error(err.message || "Failed");
//           setTimer(0);
//         });
//     } else {
//       dispatch(sendLoginOTP({ email: formData.email }))
//         .unwrap()
//         .then((res) => {
//           toast.success("OTP sent!");
//           if (res?.otp) toast("Dev OTP: " + res.otp, { icon: "🔒" });
//         })
//         .catch((err) => {
//           toast.error(err.message || "Failed");
//           setTimer(0);
//         });
//     }
//   };

//   // TIMER
//   useEffect(() => {
//     if (timer <= 0) return;
//     const t = setInterval(() => setTimer((v) => v - 1), 1000);
//     return () => clearInterval(t);
//   }, [timer]);

//   // VERIFY OTP
//   const handleVerifyOTP = () => {
//     if (formData.otp.length !== 6) return toast.error("Enter 6-digit OTP");

//     const payload = formData.isRegistering
//       ? {
//           email: formData.email,
//           name: formData.name,
//           password: formData.password,
//           otp: formData.otp,
//           referralCode: formData.referralCode || null,
//         }
//       : {
//           email: formData.email,
//           otp: formData.otp,
//         };

//     const action = formData.isRegistering
//       ? verifyRegisterOTP(payload)
//       : verifyLoginOTP(payload);

//     dispatch(action)
//       .unwrap()
//       .then((res) => {
//         toast.success("Success!");
//         navigate(res.user.role === "admin" ? "/admin" : "/user");
//       })
//       .catch((err) => toast.error(err.message || "Failed"));
//   };

//   // PASSWORD LOGIN
//   const handlePasswordLogin = (e) => {
//     e.preventDefault();

//     dispatch(
//       passwordLogin({
//         email: formData.email,
//         password: formData.password,
//       })
//     )
//       .unwrap()
//       .then((res) => {
//         toast.success("Login successful!");
//         navigate(res.user.role === "admin" ? "/admin" : "/user");
//       })
//       .catch((err) => toast.error(err?.message || "Login failed"));
//   };

//   // AUTO-REDIRECT IF LOGGED IN
//   useEffect(() => {
//     if (user && token) {
//       navigate(user.role === "admin" ? "/admin" : "/user");
//     }
//   }, [user, token]);

//   return (
//     <>
//       <Toaster position="top-right" />

//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
//         <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">

//           {/* HEADER */}
//           <div className="text-center">
//             <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center">
//               <span className="text-white font-bold text-lg">L</span>
//             </div>

//             <h2 className="mt-6 text-3xl font-bold text-gray-900">
//               {otpSent
//                 ? "Verify OTP"
//                 : formData.isRegistering
//                 ? "Create Account"
//                 : "Welcome Back"}
//             </h2>

//             <p className="mt-2 text-sm text-gray-600">
//               {otpSent
//                 ? "Enter the OTP sent to your email"
//                 : formData.isRegistering
//                 ? "Join LinkEarn today"
//                 : "Sign in to continue"}
//             </p>

//             {/* ⭐ SHOW REFERRAL MESSAGE */}
//             {referralCode && (
//               <p className="mt-2 text-green-600 text-sm">
//                 Referral Applied: <b>{referralCode}</b>
//               </p>
//             )}

//             {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
//           </div>

//           {/* OTP SCREEN */}
//           {otpSent ? (
//             <>
//               <button
//                 type="button"
//                 onClick={() => {
//                   dispatch(resetOTPScreen());
//                   setFormData({ ...formData, otp: "" });
//                   setTimer(0);
//                 }}
//                 className="flex items-center text-sm text-gray-600 hover:text-gray-900"
//               >
//                 <ArrowLeft className="h-4 w-4 mr-1" />
//                 Back
//               </button>

              

//               <div className="relative mb-4">
//                 <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
//                 <input
//                   name="otp"
//                   maxLength="6"
//                   value={formData.otp}
//                   onChange={handleChange}
//                   className="pl-10 w-full px-3 py-3 border text-center border-gray-300 rounded-lg text-lg"
//                   placeholder="000000"
//                 />
//               </div>

//               {timer > 0 ? (
//                 <p className="text-center text-gray-500 text-sm">
//                   Resend OTP in <b>{timer}</b> sec
//                 </p>
//               ) : (
//                 <button
//                   type="button"
//                   onClick={handleSendOTP}
//                   className="text-indigo-600 underline text-center w-full"
//                 >
//                   Resend OTP
//                 </button>
//               )}

//               <button
//                 type="button"
//                 onClick={handleVerifyOTP}
//                 disabled={isLoading}
//                 className="w-full py-3 bg-indigo-600 text-white rounded-lg"
//               >
//                 {isLoading ? (
//                   <RefreshCw className="h-4 w-4 animate-spin mx-auto" />
//                 ) : (
//                   "Verify OTP"
//                 )}
//               </button>
//             </>
//           ) : (
//             <form className="space-y-6" onSubmit={handlePasswordLogin}>
//               {formData.isRegistering && (
//                 <div className="relative">
//                   <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
//                   <input
//                     name="name"
//                     value={formData.name}
//                     onChange={handleChange}
//                     className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg"
//                     placeholder="Full Name"
//                   />
//                 </div>
//               )}

//               {formData.isRegistering && (
//   <div className="relative">
//     <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
//     <input
//       name="referralCode"
//       value={formData.referralCode || ""}
//       onChange={handleChange}
//       readOnly={!!referralCode} // Agar ref se aaya toh edit na kare
//       className={`pl-10 w-full px-3 py-3 border rounded-lg ${
//         referralCode ? "bg-green-50 border-green-300" : "border-gray-300"
//       }`}
//       placeholder="Referral Code (optional)"
//     />
//     {referralCode && (
//       <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 font-bold text-sm">
//         Applied
//       </span>
//     )}
//   </div>
// )}


//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
//                 <input
//                   name="email"
//                   type="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg"
//                   placeholder="Email Address"
//                 />
//               </div>

//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
//                 <input
//                   name="password"
//                   type={formData.showPassword ? "text" : "password"}
//                   value={formData.password}
//                   onChange={handleChange}
//                   className="pr-12 pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg"
//                   placeholder={
//                     formData.isRegistering ? "Create Password" : "Password"
//                   }
//                 />
//                 <button
//                   type="button"
//                   onClick={togglePassword}
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2"
//                 >
//                   {formData.showPassword ? <EyeOff /> : <Eye />}
//                 </button>
//               </div>

//               <div className="space-y-3">
//                 <button
//                   type="button"
//                   onClick={handleSendOTP}
//                   disabled={!formData.email || (formData.isRegistering && !formData.name)}
//                   className="w-full py-3 border border-indigo-600 text-indigo-600 rounded-lg"
//                 >
//                   Send OTP
//                 </button>

//                 <button
//                   type="submit"
//                   disabled={isLoading}
//                   className="w-full py-3 bg-indigo-600 text-white rounded-lg"
//                 >
//                   {formData.isRegistering ? "Create Account" : "Sign In"}
//                 </button>
//               </div>
//             </form>
//           )}

//           {!otpSent && (
//             <p className="text-center text-sm text-gray-600">
//               {formData.isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
//               <button
//                 type="button"
//                 onClick={toggleMode}
//                 className="text-indigo-600 font-medium"
//               >
//                 {formData.isRegistering ? "Sign In" : "Sign Up"}
//               </button>
//             </p>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default Login;
