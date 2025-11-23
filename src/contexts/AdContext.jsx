// contexts/AdContext.jsx (FINAL + ADS LIVE)

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import adManager from '../utils/adManager';

const AdContext = createContext();

export const AdProvider = ({ children }) => {
  const [adsInitialized, setAdsInitialized] = useState(false);
  const [adPerformance, setAdPerformance] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const performanceIntervalRef = useRef(null);

  const initializeAds = useCallback(async () => {
    try {
      setIsLoading(true);
      await adManager.initializeNetworks();
      setAdsInitialized(true);
      console.log('Ad networks initialized');
    } catch (error) {
      console.error('Ad init failed:', error);
      setAdsInitialized(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startPerformanceMonitoring = useCallback(() => {
    if (performanceIntervalRef.current) return;

    performanceIntervalRef.current = setInterval(() => {
      const perf = adManager.getAdPerformance();
      setAdPerformance(perf);
    }, 3000);
  }, []);

  const cleanup = useCallback(() => {
    if (performanceIntervalRef.current) {
      clearInterval(performanceIntervalRef.current);
    }
    adManager.clearAds();
  }, []);

  useEffect(() => {
    initializeAds();
  }, []); // Only once

  useEffect(() => {
    if (adsInitialized) {
      startPerformanceMonitoring();
    }
    return cleanup;
  }, [adsInitialized, startPerformanceMonitoring, cleanup]);

  const value = {
    adsInitialized,
    isLoading,
    adPerformance,
    adManager,
    refreshAds: () => adManager.clearAds(),
    getPerformance: () => adManager.getAdPerformance()
  };

  return (
    <AdContext.Provider value={value}>
      {children}
    </AdContext.Provider>
  );
};

export const useAd = () => {
  const context = useContext(AdContext);
  if (!context) throw new Error('useAd must be used within AdProvider');
  return context;
};