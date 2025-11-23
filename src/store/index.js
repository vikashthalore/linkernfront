import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import adsReducer from './slices/adsSlice';
import analyticsReducer from './slices/analyticsSlice';


export const store = configureStore({
  reducer: {
    user: userReducer,
    ads: adsReducer,
    analytics: analyticsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;