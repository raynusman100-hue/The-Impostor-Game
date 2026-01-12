// Web stub for AdManager - ads not supported on web

class AdManager {
    static instance = null;

    static getInstance() {
        if (!AdManager.instance) {
            AdManager.instance = new AdManager();
        }
        return AdManager.instance;
    }

    loadInterstitial() {
        console.log('AdManager: Not supported on web');
    }

    showInterstitial(onAdClosed) {
        console.log('AdManager: Not supported on web');
        onAdClosed?.();
    }
}

export default AdManager.getInstance();
