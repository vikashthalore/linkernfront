import { createSlice } from '@reduxjs/toolkit';

const adsSlice = createSlice({
  name: 'ads',
  initialState: {
    adNetworks: {
      richads: { enabled: true, scriptLoaded: false, slots: [] },
      admaven: { enabled: true, scriptLoaded: false, slots: [] },
      clickadu: { enabled: true, scriptLoaded: false, slots: [] },
      propellerads: { enabled: true, scriptLoaded: false, slots: [] },
      hilltopads: { enabled: true, scriptLoaded: false, slots: [] }
    },
    activeAds: [],
    adPerformance: {}
  },
  reducers: {
    setAdNetworkStatus: (state, action) => {
      const { network, enabled } = action.payload;
      if (state.adNetworks[network]) {
        state.adNetworks[network].enabled = enabled;
      }
    },
    setScriptLoaded: (state, action) => {
      const { network, loaded } = action.payload;
      if (state.adNetworks[network]) {
        state.adNetworks[network].scriptLoaded = loaded;
      }
    },
    addActiveAd: (state, action) => {
      state.activeAds.push(action.payload);
    },
    removeActiveAd: (state, action) => {
      state.activeAds = state.activeAds.filter(ad => ad.id !== action.payload);
    },
    updateAdPerformance: (state, action) => {
      const { adId, metrics } = action.payload;
      state.adPerformance[adId] = { ...state.adPerformance[adId], ...metrics };
    }
  }
});

export const { 
  setAdNetworkStatus, 
  setScriptLoaded, 
  addActiveAd, 
  removeActiveAd, 
  updateAdPerformance 
} = adsSlice.actions;

export default adsSlice.reducer;