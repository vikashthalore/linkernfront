// utils/adManager.js (FINAL + ADS LIVE + NO DELETE)

class AdManager {
  constructor() {
    this.networks = {
      richads: { name: 'RichAds', script: 'https://ad.richads.org/richads.js', enabled: true },
      admaven: { name: 'AdMaven', script: 'https://ads.admaven.com/tags.js', enabled: true },
      clickadu: { name: 'Clickadu', script: 'https://clickadu.com/ads.js', enabled: true },
      propellerads: { name: 'PropellerAds', script: 'https://propellerads.com/ads.js', enabled: true },
      hilltopads: { name: 'HilltopAds', script: 'https://hilltopads.com/ads.js', enabled: true }
    };

    this.loadedScripts = new Set();
    this.adSlots = new Map();
    this.performance = { total: 0, loaded: 0, failed: 0 };
    this.initialized = false;
  }

  // Load ad network script
  loadAdNetwork = (network) => {
    return new Promise((resolve, reject) => {
      const config = this.networks[network];
      if (!config?.enabled) return reject(new Error(`${network} disabled`));
      if (this.loadedScripts.has(network)) return resolve(true);

      const script = document.createElement('script');
      script.src = config.script;
      script.async = true;
      script.crossOrigin = 'anonymous';

      script.onload = () => {
        this.loadedScripts.add(network);
        console.log(`${network} script loaded`);
        resolve(true);
      };

      script.onerror = () => {
        console.error(`${network} script failed`);
        reject(new Error(`${network} script failed`));
      };

      document.head.appendChild(script);
    });
  };

  // Initialize all networks
  async initializeNetworks() {
    if (this.initialized) return;

    const promises = Object.keys(this.networks)
      .filter(n => this.networks[n].enabled)
      .map(n => this.loadAdNetwork(n).catch(err => {
        console.warn(err.message);
        return false;
      }));

    const results = await Promise.allSettled(promises);
    const success = results.filter(r => r.status === 'fulfilled' && r.value).length;

    this.initialized = true;
    console.log(`Ad networks initialized: ${success}/${promises.length} loaded`);
  }

  // Create ad slot
  createAdSlot(type, containerId, network, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container ${containerId} not found`);
    }

    // Clear previous ad
    container.innerHTML = '';

    const id = `ad-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const adSlot = {
      id,
      type,
      containerId,
      network,
      options,
      isLoaded: false,
      impressions: 0,
      clicks: 0,
      createdAt: Date.now()
    };

    this.adSlots.set(id, adSlot);
    this.performance.total++;
    return adSlot;
  }

  // Render ad
  async renderAd(adSlot) {
    const container = document.getElementById(adSlot.containerId);
    if (!container) return false;

    // Clear container
    container.innerHTML = '';

    const adElement = document.createElement('div');
    adElement.id = adSlot.id;
    adElement.className = `ad-slot ad-${adSlot.network} ad-${adSlot.type}`;
    adElement.style.cssText = `
      width: 100%; min-height: ${adSlot.type === 'banner' ? '90px' : '250px'};
      background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-family: system-ui, sans-serif; color: #6c757d; font-size: 14px;
      overflow: hidden;
    `;

    adElement.innerHTML = `
      <div class="ad-loading" style="display: flex; align-items: center; gap: 8px;">
        <div style="width: 20px; height: 20px; border: 2px solid #f3f3f3; border-top: 2px solid #4361ee; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <span>Loading ${this.networks[adSlot.network].name} Ad...</span>
      </div>
      <style>
        @keyframes spin { to { transform: rotate(360deg); } }
      </style>
    `;

    container.appendChild(adElement);

    // Wait for script
    if (!this.loadedScripts.has(adSlot.network)) {
      try {
        await this.loadAdNetwork(adSlot.network);
      } catch (err) {
        throw err;
      }
    }

    // Simulate real ad load
    await new Promise(r => setTimeout(r, 800 + Math.random() * 1200));

    try {
      this.displayAd(adSlot, adElement);
      this.performance.loaded++;
    } catch (err) {
      this.performance.failed++;
      throw err;
    }

    return true;
  }

  // Display ad content
  displayAd(adSlot, element) {
    // Ensure adManager is global BEFORE ad renders
    if (!window.adManager) {
      window.adManager = this;
    }

    const content = this.getAdContent(adSlot);
    element.innerHTML = content;
    element.style.background = '#ffffff';
    adSlot.isLoaded = true;
    adSlot.impressions++;
    this.trackImpression(adSlot);
  }

  // Generate ad content (demo)
  getAdContent(adSlot) {
    const templates = {
      richads: { color: '#ff6b6b', btn: 'Learn More', text: 'Premium Push Ads' },
      admaven: { color: '#4ecdc4', btn: 'Discover', text: 'High eCPM' },
      clickadu: { color: '#4361ee', btn: 'Click Here', text: 'Smart Bidding' },
      propellerads: { color: '#06d6a0', btn: 'Start Now', text: 'Push Notifications' },
      hilltopads: { color: '#f9c74f', btn: 'Explore', text: 'Native Ads' }
    };

    const t = templates[adSlot.network] || { color: '#666', btn: 'Visit', text: 'Ad' };

    return `
      <div style="padding: 16px; text-align: center; border: 2px dashed ${t.color}; border-radius: 12px; background: #fff;">
        <div style="font-weight: 700; color: ${t.color}; font-size: 15px; margin-bottom: 6px;">
          ${this.networks[adSlot.network].name}
        </div>
        <div style="font-size: 12px; color: #555; margin-bottom: 10px;">${t.text}</div>
        <button 
          onclick="window.adManager.handleAdClick('${adSlot.id}')" 
          style="background: ${t.color}; color: white; border: none; padding: 6px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; transition: 0.2s;"
          onmouseover="this.style.transform='scale(1.05)'"
          onmouseout="this.style.transform='scale(1)'">
          ${t.btn}
        </button>
      </div>
    `;
  }

  // Handle ad click
  handleAdClick(adSlotId) {
    const adSlot = this.adSlots.get(adSlotId);
    if (!adSlot) return;

    adSlot.clicks++;
    this.trackClick(adSlot);

    // Replace with real advertiser URL
    window.open('https://example.com/?ref=admanager', '_blank', 'noopener,noreferrer');
  }

  // Track impression
  trackImpression(adSlot) {
    console.log(`Impression: ${adSlot.network} - ${adSlot.id}`);
    if (window.gtag) {
      window.gtag('event', 'ad_impression', {
        ad_network: adSlot.network,
        ad_type: adSlot.type,
        ad_slot: adSlot.id,
        value: 1
      });
    }
  }

  // Track click
  trackClick(adSlot) {
    console.log(`Click: ${adSlot.network} - ${adSlot.id}`);
    if (window.gtag) {
      window.gtag('event', 'ad_click', {
        ad_network: adSlot.network,
        ad_type: adSlot.type,
        ad_slot: adSlot.id,
        value: 10
      });
    }
  }

  // Get performance stats
  getAdPerformance() {
    const stats = {};
    for (const [id, slot] of this.adSlots) {
      if (!stats[slot.network]) stats[slot.network] = { impressions: 0, clicks: 0 };
      stats[slot.network].impressions += slot.impressions;
      stats[slot.network].clicks += slot.clicks;
    }
    return { ...stats, ...this.performance, lastUpdated: new Date().toISOString() };
  }

  // Clear all ads
  clearAds() {
    for (const [id] of this.adSlots) {
      const el = document.getElementById(id);
      if (el) el.remove();
    }
    this.adSlots.clear();
  }

  // Enable/disable network
  toggleNetwork(network, enabled) {
    if (this.networks[network]) {
      this.networks[network].enabled = enabled;
      if (!enabled && this.loadedScripts.has(network)) {
        this.loadedScripts.delete(network);
      }
    }
  }
}

// Global instance
const adManager = new AdManager();
window.adManager = adManager; // SET EARLY

export default adManager;