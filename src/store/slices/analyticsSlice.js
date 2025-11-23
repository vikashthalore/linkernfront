import { createSlice } from '@reduxjs/toolkit';

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    conversions: [],
    pageViews: 0,
    clickThroughRate: 0,
    earningsData: {
      daily: [],
      weekly: [],
      monthly: []
    },
    userEngagement: {
      averageTimeOnPage: 0,
      bounceRate: 0,
      pagesPerSession: 0
    }
  },
  reducers: {
    logConversion: (state, action) => {
      state.conversions.push({
        ...action.payload,
        timestamp: new Date().toISOString()
      });
    },
    incrementPageView: (state) => {
      state.pageViews += 1;
    },
    updateEarningsData: (state, action) => {
      state.earningsData = { ...state.earningsData, ...action.payload };
    },
    updateUserEngagement: (state, action) => {
      state.userEngagement = { ...state.userEngagement, ...action.payload };
    },
    calculateCTR: (state, action) => {
      const { clicks, impressions } = action.payload;
      state.clickThroughRate = impressions > 0 ? (clicks / impressions) * 100 : 0;
    }
  }
});

export const { 
  logConversion, 
  incrementPageView, 
  updateEarningsData, 
  updateUserEngagement, 
  calculateCTR 
} = analyticsSlice.actions;

export default analyticsSlice.reducer;

