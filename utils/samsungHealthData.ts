import { NativeModules, NativeEventEmitter, EmitterSubscription, Platform } from 'react-native';

// Web fallback için mock module
const MockSamsungHealthModule = {
  connectService: () => Promise.resolve({ success: true, message: "Mock Samsung Health connected (Web)" }),
  disconnectService: () => Promise.resolve({ success: true, message: "Mock Samsung Health disconnected" }),
  getCapabilities: () => Promise.resolve({ 
    success: true, 
    data: { ecgSupported: true, spo2Supported: true, heartRateSupported: true } 
  }),
  startEcgMeasurement: () => Promise.resolve({ success: true, message: "Mock ECG started" }),
  stopEcgMeasurement: () => Promise.resolve({ success: true, message: "Mock ECG stopped" }),
  startSpo2Measurement: () => Promise.resolve({ success: true, message: "Mock SpO2 started" }),
  stopSpo2Measurement: () => Promise.resolve({ success: true, message: "Mock SpO2 stopped" }),
  startHeartRateTracking: () => Promise.resolve({ success: true, message: "Mock Heart Rate started" }),
  stopHeartRateTracking: () => Promise.resolve({ success: true, message: "Mock Heart Rate stopped" }),
  setUserProfile: () => Promise.resolve({ success: true, message: "Mock User Profile set" }),
};

const SamsungHealthModule = Platform.OS === 'web' ? MockSamsungHealthModule : NativeModules.SamsungHealthModule;

// Samsung Health SDK Event Types
export interface SamsungHealthEcgData {
  timestamp: number;
  status: string;
  ecgData?: number[];
}

export interface SamsungHealthSpo2Data {
  timestamp: number;
  status: string;
  spo2?: number;
}

export interface SamsungHealthHeartRateData {
  timestamp: number;
  heartRate?: number;
  status: string;
  ibiList?: number[];
}

export interface SamsungHealthCapabilities {
  ecgSupported: boolean;
  spo2Supported: boolean;
  heartRateSupported: boolean;
}

export interface SamsungHealthError {
  error: string;
}

// Event Types
export type SamsungHealthEventType = 
  | 'onEcgData'
  | 'onEcgError'
  | 'onSpo2Data'
  | 'onSpo2Error'
  | 'onHeartRateData'
  | 'onHeartRateError';

// Samsung Health SDK Status Constants
export const SAMSUNG_HEALTH_CONSTANTS = {
  // Gender
  GENDER_MALE: 1,
  GENDER_FEMALE: 2,
};

export class SamsungHealthService {
  private eventEmitter: NativeEventEmitter;
  private eventListeners: Map<string, EmitterSubscription[]> = new Map();
  private isConnected = false;

  constructor() {
    this.eventEmitter = new NativeEventEmitter(SamsungHealthModule);
  }

  /**
   * Connect to Samsung Health Service
   */
  async connect(): Promise<void> {
    try {
      const result = await SamsungHealthModule.connectService();
      console.log('Samsung Health SDK connected:', result.message);
      this.isConnected = result.success;
    } catch (error) {
      console.error('Failed to connect to Samsung Health Service:', error);
      throw error;
    }
  }

  /**
   * Check device capabilities
   */
  async getCapabilities(): Promise<SamsungHealthCapabilities> {
    try {
      const result = await SamsungHealthModule.getCapabilities();
      if (result.success) {
        return result.data;
      } else {
        throw new Error('Failed to get capabilities');
      }
    } catch (error) {
      console.error('Failed to get capabilities:', error);
      throw error;
    }
  }

  /**
   * Set user profile for better accuracy
   */
  async setUserProfile(weight: number, height: number, age: number, gender: number): Promise<void> {
    try {
      const result = await SamsungHealthModule.setUserProfile(weight, height, age, gender);
      console.log('User profile result:', result.message);
    } catch (error) {
      console.error('Failed to set user profile:', error);
      throw error;
    }
  }

  /**
   * Start ECG measurement
   */
  async startEcgMeasurement(): Promise<void> {
    try {
      const result = await SamsungHealthModule.startEcgMeasurement();
      console.log('ECG measurement result:', result.message);
      
      // Web'de mock data simülasyonu
      if (Platform.OS === 'web') {
        setTimeout(() => {
          const mockEcgData = {
            timestamp: Date.now(),
            status: 'MEASUREMENT_COMPLETED',
            ecgData: Array.from({ length: 100 }, (_, i) => 
              Math.round(Math.sin(i * 0.1) * 100 + Math.random() * 20)
            )
          };
          this.simulateEvent('onEcgData', mockEcgData);
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to start ECG measurement:', error);
      throw error;
    }
  }

  /**
   * Stop ECG measurement
   */
  async stopEcgMeasurement(): Promise<void> {
    try {
      const result = await SamsungHealthModule.stopEcgMeasurement();
      console.log('ECG measurement stopped:', result.message);
    } catch (error) {
      console.error('Failed to stop ECG measurement:', error);
      throw error;
    }
  }

  /**
   * Start SpO2 measurement
   */
  async startSpo2Measurement(): Promise<void> {
    try {
      const result = await SamsungHealthModule.startSpo2Measurement();
      console.log('SpO2 measurement result:', result.message);
      
      // Web'de mock data simülasyonu
      if (Platform.OS === 'web') {
        setTimeout(() => {
          const mockSpo2Data = {
            timestamp: Date.now(),
            status: 'MEASUREMENT_COMPLETED',
            spo2: 98
          };
          this.simulateEvent('onSpo2Data', mockSpo2Data);
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to start SpO2 measurement:', error);
      throw error;
    }
  }

  /**
   * Stop SpO2 measurement
   */
  async stopSpo2Measurement(): Promise<void> {
    try {
      const result = await SamsungHealthModule.stopSpo2Measurement();
      console.log('SpO2 measurement stopped:', result.message);
    } catch (error) {
      console.error('Failed to stop SpO2 measurement:', error);
      throw error;
    }
  }

  /**
   * Start heart rate tracking
   */
  async startHeartRateTracking(): Promise<void> {
    try {
      const result = await SamsungHealthModule.startHeartRateTracking();
      console.log('Heart rate tracking result:', result.message);
      
      // Web'de mock data simülasyonu
      if (Platform.OS === 'web') {
        const heartRateInterval = setInterval(() => {
          const mockHeartRateData = {
            timestamp: Date.now(),
            heartRate: Math.floor(Math.random() * 20) + 72, // 72-92 BPM
            status: 'MEASUREMENT_COMPLETED',
            ibiList: Array.from({ length: 5 }, () => Math.floor(Math.random() * 200) + 600) // 600-800ms IBI
          };
          this.simulateEvent('onHeartRateData', mockHeartRateData);
        }, 5000);
        
        // Store interval for cleanup
        (this as any).mockHeartRateInterval = heartRateInterval;
      }
    } catch (error) {
      console.error('Failed to start heart rate tracking:', error);
      throw error;
    }
  }

  /**
   * Stop heart rate tracking
   */
  async stopHeartRateTracking(): Promise<void> {
    try {
      const result = await SamsungHealthModule.stopHeartRateTracking();
      console.log('Heart rate tracking stopped:', result.message);
      
      // Web'de mock interval'ı temizle
      if (Platform.OS === 'web' && (this as any).mockHeartRateInterval) {
        clearInterval((this as any).mockHeartRateInterval);
        (this as any).mockHeartRateInterval = null;
      }
    } catch (error) {
      console.error('Failed to stop heart rate tracking:', error);
      throw error;
    }
  }

  /**
   * Simulate event for web platform
   */
  private simulateEvent(eventType: SamsungHealthEventType, data: any): void {
    if (Platform.OS === 'web') {
      // Web'de event listener'ları manuel olarak çağır
      const listeners = this.eventListeners.get(eventType) || [];
      listeners.forEach(subscription => {
        // Web'de subscription'ın listener'ını çağır
        if (subscription && typeof subscription.remove === 'function') {
          // Native event emitter'ı kullan
          this.eventEmitter.emit(eventType, data);
        }
      });
    }
  }

  /**
   * Add event listener for Samsung Health events
   */
  addListener<T>(
    eventType: SamsungHealthEventType,
    listener: (data: T) => void
  ): EmitterSubscription {
    const subscription = this.eventEmitter.addListener(eventType, listener);
    
    // Store subscription for cleanup
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(subscription);
    
    return subscription;
  }

  /**
   * Add event listener (alias for addListener)
   */
  addEventListener<T>(
    eventType: SamsungHealthEventType,
    listener: (data: T) => void
  ): EmitterSubscription {
    return this.addListener(eventType, listener);
  }

  /**
   * Remove specific event listener
   */
  removeEventListener(subscription: EmitterSubscription): void {
    subscription.remove();
    
    // Remove from stored subscriptions
    for (const [eventType, subscriptions] of this.eventListeners.entries()) {
      const index = subscriptions.indexOf(subscription);
      if (index > -1) {
        subscriptions.splice(index, 1);
        if (subscriptions.length === 0) {
          this.eventListeners.delete(eventType);
        }
        break;
      }
    }
  }

  /**
   * Remove all listeners for specific event type or all events
   */
  removeAllListeners(eventType?: SamsungHealthEventType): void {
    if (eventType) {
      // Remove listeners for specific event type
      const subscriptions = this.eventListeners.get(eventType);
      if (subscriptions) {
        subscriptions.forEach(subscription => subscription.remove());
        this.eventListeners.delete(eventType);
      }
      this.eventEmitter.removeAllListeners(eventType);
    } else {
      // Remove all listeners
      for (const subscriptions of this.eventListeners.values()) {
        subscriptions.forEach(subscription => subscription.remove());
      }
      this.eventListeners.clear();
      
      // Remove all listeners from the native event emitter
      const eventTypes: SamsungHealthEventType[] = ['onEcgData', 'onEcgError', 'onSpo2Data', 'onSpo2Error', 'onHeartRateData', 'onHeartRateError'];
      eventTypes.forEach(eventType => {
        this.eventEmitter.removeAllListeners(eventType);
      });
    }
  }

  /**
   * Disconnect from Samsung Health Service
   */
  async disconnect(): Promise<void> {
    try {
      // Remove all event listeners
      this.removeAllListeners();
      
      // Disconnect service
      const result = await SamsungHealthModule.disconnectService();
      console.log('Samsung Health SDK disconnected:', result.message);
      this.isConnected = false;
    } catch (error) {
      console.error('Failed to disconnect from Samsung Health Service:', error);
      throw error;
    }
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): { isConnected: boolean } {
    return { isConnected: this.isConnected };
  }

  /**
   * Get readable text for ECG status
   */
  getEcgStatusText(status: string): string {
    switch (status.toLowerCase()) {
      case 'no_data_flush':
        return 'No data to flush';
      case 'optimal_result':
        return 'Optimal ECG measurement';
      case 'irregular_hr':
        return 'Irregular heart rhythm detected';
      case 'finger_not_detected':
        return 'Please place finger on sensor';
      case 'unreliable_data':
        return 'Unreliable ECG data';
      default:
        return `Unknown ECG status: ${status}`;
    }
  }

  /**
   * Get readable text for SpO2 status
   */
  getSpo2StatusText(status: string): string {
    switch (status.toLowerCase()) {
      case 'no_data_flush':
        return 'No data to flush';
      case 'optimal_result':
        return 'Optimal SpO2 measurement';
      case 'finger_not_detected':
        return 'Please place finger on sensor';
      case 'unreliable_data':
        return 'Unreliable SpO2 data';
      default:
        return `Unknown SpO2 status: ${status}`;
    }
  }

  /**
   * Get readable text for heart rate status
   */
  getHeartRateStatusText(status: string): string {
    switch (status.toLowerCase()) {
      case 'no_data_flush':
        return 'No data to flush';
      case 'optimal_result':
        return 'Optimal heart rate measurement';
      case 'unreliable_data':
        return 'Unreliable heart rate data';
      default:
        return `Unknown heart rate status: ${status}`;
    }
  }
}

// Export singleton instance
export const samsungHealthService = new SamsungHealthService();
export default samsungHealthService; 