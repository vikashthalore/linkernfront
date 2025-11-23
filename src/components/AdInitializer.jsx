import React from 'react';
import { useAd } from '../contexts/AdContext';

const AdInitializer = () => {
  const { adsInitialized } = useAd();

  if (!adsInitialized) {
    return (
      <div style={{ display: 'none' }}>
        <div className="loading-spinner"></div>
        Initializing ad networks...
      </div>
    );
  }

  return null;
};

export default AdInitializer;


// import React from 'react'
// import { useAd } from '../contexts/AdContext'

// const AdInitializer = () => {
//   const { adsInitialized, adPerformance } = useAd()

//   if (!adsInitialized) {
//     return (
//       <div style={{ display: 'none' }}>
//         <div className="loading-spinner"></div>
//         Initializing ad networks...
//       </div>
//     )
//   }

//   // Hidden element to track ad performance in background
//   return (
//     <div style={{ display: 'none' }}>
//       Ad System Ready - Performance: {JSON.stringify(adPerformance)}
//     </div>
//   )
// }

// export default AdInitializer