import React, { createContext, useContext, useState, useEffect } from 'react'
import adManager from '../utils/adManager'

const AdContext = createContext()

export const AdProvider = ({ children }) => {
  const [adsInitialized, setAdsInitialized] = useState(false)
  const [adPerformance, setAdPerformance] = useState({})

  useEffect(() => {
    // Initialize ad networks when component mounts
    const initializeAds = async () => {
      try {
        await adManager.initializeNetworks()
        setAdsInitialized(true)
        console.log('Ad networks initialized successfully')
      } catch (error) {
        console.error('Failed to initialize ad networks:', error)
      }
    }

    initializeAds()

    // Set up performance monitoring interval
    const performanceInterval = setInterval(() => {
      setAdPerformance(adManager.getAdPerformance())
    }, 5000)

    return () => {
      clearInterval(performanceInterval)
      adManager.clearAds()
    }
  }, [])

  const value = {
    adsInitialized,
    adPerformance,
    adManager
  }

  return (
    <AdContext.Provider value={value}>
      {children}
    </AdContext.Provider>
  )
}

export const useAd = () => {
  const context = useContext(AdContext)
  if (!context) {
    throw new Error('useAd must be used within an AdProvider')
  }
  return context
}