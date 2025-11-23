import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api"; 

/* ------------------------------------------------------------------
    BACKEND ROUTES 
-------------------------------------------------------------------*/

// ==========================
// SEND REGISTER OTP (FIXED)
// ==========================
export const sendRegisterOTP = createAsyncThunk(
  "user/sendRegisterOTP",
  async ({ email, name, referralCode }, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/send-register-otp", {
        email,
        name,
        // 👇 FIX: 'formData' hata diya, argument wala 'referralCode' use kiya
        referralCode: referralCode ? referralCode.trim().toUpperCase() : null,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "OTP send failed" });
    }
  }
);

// ==========================
// VERIFY REGISTER OTP
// ==========================
export const verifyRegisterOTP = createAsyncThunk(
  "user/verifyRegisterOTP",
  async ({ email, name, password, otp }, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/verify-register-otp", {
        email,
        name,
        password,
        otp,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Invalid or expired OTP" });
    }
  }
);

// ==========================
// SEND LOGIN OTP
// ==========================
export const sendLoginOTP = createAsyncThunk(
  "user/sendLoginOTP",
  async ({ email }, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/send-login-otp", { email });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "OTP send failed" });
    }
  }
);

// ==========================
// VERIFY LOGIN OTP
// ==========================
export const verifyLoginOTP = createAsyncThunk(
  "user/verifyLoginOTP",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/verify-login-otp", { email, otp });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Invalid OTP" });
    }
  }
);

// ==========================
// PASSWORD LOGIN
// ==========================
export const passwordLogin = createAsyncThunk(
  "user/passwordLogin",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Invalid credentials" });
    }
  }
);

// ==========================
// FETCH CURRENT USER
// ==========================
export const fetchCurrentUser = createAsyncThunk(
  "user/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/auth/me");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Authentication failed" });
    }
  }
);


/* ===============================================================
                      USER SLICE
================================================================*/

const userSlice = createSlice({
  name: "user",

  initialState: {
    user: JSON.parse(localStorage.getItem("user")) || null,
    token: localStorage.getItem("token") || null,
    isLoading: false,
    error: null,
    otpSent: false,
  },

  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      state.otpSent = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    clearError: (state) => {
      state.error = null;
    },
    resetOTPScreen: (state) => {
      state.otpSent = false;
    },
  }, // 👈 YAHAN MISSING THA (Reducers Close)

  extraReducers: (builder) => {
    builder

      /* SEND REGISTER OTP */
      .addCase(sendRegisterOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendRegisterOTP.fulfilled, (state) => {
        state.isLoading = false;
        state.otpSent = true;
      })
      .addCase(sendRegisterOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message;
      })

      /* VERIFY REGISTER OTP */
      .addCase(verifyRegisterOTP.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyRegisterOTP.fulfilled, (state, action) => {
        const { user, token } = action.payload;
        state.user = user;
        state.token = token;
        state.isLoading = false;
        state.otpSent = false;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      })
      .addCase(verifyRegisterOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message;
      })

      /* SEND LOGIN OTP */
      .addCase(sendLoginOTP.pending, (state) => {
        state.error = null;
        state.isLoading = true;
      })
      .addCase(sendLoginOTP.fulfilled, (state) => {
        state.isLoading = false;
        state.otpSent = true;
      })
      .addCase(sendLoginOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message;
      })

      /* VERIFY LOGIN OTP */
      .addCase(verifyLoginOTP.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyLoginOTP.fulfilled, (state, action) => {
        const { user, token } = action.payload;
        state.user = user;
        state.token = token;
        state.isLoading = false;
        state.otpSent = false;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      })
      .addCase(verifyLoginOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message;
      })

      /* PASSWORD LOGIN */
      .addCase(passwordLogin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(passwordLogin.fulfilled, (state, action) => {
        const { user, token } = action.payload;
        state.user = user;
        state.token = token;
        state.isLoading = false;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      })
      .addCase(passwordLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message;
      })

      /* FETCH CURRENT USER */
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
      });
  },
});

export const { logout, clearError, resetOTPScreen } = userSlice.actions;
export default userSlice.reducer;