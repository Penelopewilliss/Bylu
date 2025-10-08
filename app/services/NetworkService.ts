import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple network detection without external dependencies
class NetworkService {
  private isOnline: boolean = true;
  // In React Native / browser environments setInterval returns a numeric id
  private checkInterval: number | null = null;
  private listeners: Array<(isOnline: boolean) => void> = [];

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      // Start with online assumption
      this.isOnline = true;
      
      // Check network periodically (simple approach)
      this.checkInterval = Number(setInterval(() => {
        this.checkConnectivity();
      }, 10000)); // Check every 10 seconds
      
      console.log('🌐 Network service initialized');
    } catch (error) {
      console.warn('⚠️ Network service initialization failed:', error);
      this.isOnline = true;
    }
  }

  public getNetworkStatus(): boolean {
    return this.isOnline;
  }

  public isNetworkAvailable(): boolean {
    return this.isOnline;
  }

  public async checkConnectivity(): Promise<boolean> {
    try {
      // Simple connectivity check using fetch with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      const wasOnline = this.isOnline;
      this.isOnline = response.ok;
      
      // Notify listeners of network changes
      if (wasOnline !== this.isOnline) {
        this.notifyListeners(this.isOnline);
        
        if (this.isOnline) {
          console.log('🟢 Back online - triggering sync');
        } else {
          console.log('🔴 Gone offline - enabling offline mode');
        }
      }
      
      return this.isOnline;
    } catch (error) {
      const wasOnline = this.isOnline;
      this.isOnline = false;
      
      if (wasOnline !== this.isOnline) {
        this.notifyListeners(this.isOnline);
        console.log('🔴 Network check failed - assuming offline');
      }
      
      return false;
    }
  }

  public setOnlineStatus(status: boolean) {
    const wasOnline = this.isOnline;
    this.isOnline = status;
    
    if (wasOnline !== this.isOnline) {
      this.notifyListeners(this.isOnline);
    }
  }

  public addListener(callback: (isOnline: boolean) => void) {
    this.listeners.push(callback);
  }

  public removeListener(callback: (isOnline: boolean) => void) {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private notifyListeners(isOnline: boolean) {
    this.listeners.forEach(callback => {
      try {
        callback(isOnline);
      } catch (error) {
        console.error('Error in network listener:', error);
      }
    });
  }

  public cleanup() {
    if (this.checkInterval) {
        clearInterval(this.checkInterval as number);
      this.checkInterval = null;
    }
    this.listeners = [];
  }
}

// Singleton instance
const networkService = new NetworkService();
export default networkService;