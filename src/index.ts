import { NativeModules, Platform, NativeEventEmitter } from 'react-native';
import type {
  PerformanceClass,
  PerformanceLevel,
  PerformanceResult,
  WeightedPerformanceClass,
  DroidDexConfig,
  PerformanceListener,
  ErrorListener,
} from './types';

export * from './types';

const LINKING_ERROR =
  `The package 'react-native-droid-dex' doesn't seem to be linked. Make sure: \n\n` +
  (Platform.OS === 'android'
    ? "- You have run 'cd android && ./gradlew clean'\n" +
      "- You have included 'react-native-droid-dex' in the dependencies section of your project's build.gradle file\n" +
      "- You have added the implementation line in your MainApplication.java file"
    : Platform.OS === 'ios'
    ? "- You have run 'cd ios && pod install'\n" +
      "- You have included the iOS implementation (currently Android only)"
    : '');

const DroidDexModule = NativeModules.DroidDex
  ? NativeModules.DroidDex
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

let eventEmitter: NativeEventEmitter | null = null;
let performanceListeners: Map<string, PerformanceListener> = new Map();
let errorListeners: Map<string, ErrorListener> = new Map();
let isProductionDisabled = false;

if (Platform.OS === 'android') {
  eventEmitter = new NativeEventEmitter(DroidDexModule);
}

/**
 * Disable DroidDex for production use (useful for error handling)
 * When disabled, all methods return default/safe values
 */
export function disableForProduction(disabled: boolean = true): void {
  isProductionDisabled = disabled;
  if (disabled) {
    console.log('DroidDex: Performance monitoring disabled for production');
  }
}

/**
 * Check if DroidDex is disabled for production
 */
export function isDisabledForProduction(): boolean {
  return isProductionDisabled;
}

/**
 * Get default performance result (used when disabled or on iOS)
 */
function getDefaultPerformanceResult(requestedClasses?: PerformanceClass[]): PerformanceResult {
  return {
    level: PerformanceLevel.HIGH,
    metrics: {},
    timestamp: Date.now(),
    supportedClasses: [],
    unsupportedClasses: requestedClasses || [],
  };
}

/**
 * Initialize the DroidDex performance monitoring
 */
export function initialize(config?: DroidDexConfig): Promise<any> {
  if (isProductionDisabled) {
    return Promise.resolve({
      success: true,
      fullFunctionality: false,
      missingPermissions: [],
      missingOptionalPermissions: [],
      apiLevel: 0,
      networkMonitoringSupported: false,
      batteryStatsSupported: false,
      disabled: true,
    });
  }

  if (Platform.OS !== 'android') {
    console.warn('DroidDex is currently only supported on Android');
  }

  return DroidDexModule.initialize(config || {});
}

/**
 * Get current performance level for specified parameters
 */
export function getPerformanceLevel(
  ...performanceClasses: PerformanceClass[]
): Promise<PerformanceResult> {
  if (isProductionDisabled || Platform.OS !== 'android') {
    return Promise.resolve(getDefaultPerformanceResult(performanceClasses));
  }

  return DroidDexModule.getPerformanceLevel(performanceClasses);
}

/**
 * Get weighted performance level for multiple parameters
 */
export function getWeightedPerformanceLevel(
  weightedClasses: WeightedPerformanceClass[]
): Promise<PerformanceResult> {
  const requestedClasses = weightedClasses.map(wc => wc.performanceClass);
  
  if (isProductionDisabled || Platform.OS !== 'android') {
    return Promise.resolve(getDefaultPerformanceResult(requestedClasses));
  }

  const params = weightedClasses.map(wc => ({
    performanceClass: wc.performanceClass,
    weight: wc.weight,
  }));

  return DroidDexModule.getWeightedPerformanceLevel(params);
}

/**
 * Start continuous performance monitoring
 */
export function startMonitoring(
  performanceClasses: PerformanceClass[],
  intervalMs: number = 5000
): Promise<string> {
  if (isProductionDisabled || Platform.OS !== 'android') {
    // Return a fake monitoring ID
    return Promise.resolve(`fake-monitoring-${Date.now()}`);
  }

  return DroidDexModule.startMonitoring(performanceClasses, intervalMs);
}

/**
 * Start weighted continuous performance monitoring
 */
export function startWeightedMonitoring(
  weightedClasses: WeightedPerformanceClass[],
  intervalMs: number = 5000
): Promise<string> {
  if (isProductionDisabled || Platform.OS !== 'android') {
    // Return a fake monitoring ID
    return Promise.resolve(`fake-weighted-monitoring-${Date.now()}`);
  }

  const params = weightedClasses.map(wc => ({
    performanceClass: wc.performanceClass,
    weight: wc.weight,
  }));

  return DroidDexModule.startWeightedMonitoring(params, intervalMs);
}

/**
 * Stop performance monitoring
 */
export function stopMonitoring(monitoringId: string): Promise<boolean> {
  if (isProductionDisabled || Platform.OS !== 'android') {
    return Promise.resolve(true);
  }

  return DroidDexModule.stopMonitoring(monitoringId);
}

/**
 * Stop all performance monitoring
 */
export function stopAllMonitoring(): Promise<boolean> {
  if (isProductionDisabled || Platform.OS !== 'android') {
    performanceListeners.clear();
    errorListeners.clear();
    return Promise.resolve(true);
  }

  performanceListeners.clear();
  errorListeners.clear();
  
  return DroidDexModule.stopAllMonitoring();
}

/**
 * Add performance listener
 */
export function addPerformanceListener(
  monitoringId: string,
  listener: PerformanceListener
): void {
  if (isProductionDisabled || Platform.OS !== 'android' || !eventEmitter) {
    // Store listener but don't emit events when disabled
    performanceListeners.set(monitoringId, listener);
    return;
  }

  performanceListeners.set(monitoringId, listener);

  eventEmitter.addListener(`DroidDex_Performance_${monitoringId}`, (result: PerformanceResult) => {
    const storedListener = performanceListeners.get(monitoringId);
    if (storedListener) {
      storedListener(result);
    }
  });
}

/**
 * Remove performance listener
 */
export function removePerformanceListener(monitoringId: string): void {
  performanceListeners.delete(monitoringId);
  
  if (Platform.OS !== 'android' || !eventEmitter || isProductionDisabled) {
    return;
  }

  eventEmitter.removeAllListeners(`DroidDex_Performance_${monitoringId}`);
}

/**
 * Add error listener
 */
export function addErrorListener(
  monitoringId: string,
  listener: ErrorListener
): void {
  if (isProductionDisabled || Platform.OS !== 'android' || !eventEmitter) {
    // Store listener but don't emit events when disabled
    errorListeners.set(monitoringId, listener);
    return;
  }

  errorListeners.set(monitoringId, listener);

  eventEmitter.addListener(`DroidDex_Error_${monitoringId}`, (error: { message: string }) => {
    const storedListener = errorListeners.get(monitoringId);
    if (storedListener) {
      storedListener(new Error(error.message));
    }
  });
}

/**
 * Remove error listener
 */
export function removeErrorListener(monitoringId: string): void {
  errorListeners.delete(monitoringId);
  
  if (Platform.OS !== 'android' || !eventEmitter || isProductionDisabled) {
    return;
  }

  eventEmitter.removeAllListeners(`DroidDex_Error_${monitoringId}`);
}

/**
 * Check if DroidDex is supported on current platform
 */
export function isSupported(): boolean {
  return Platform.OS === 'android';
}

/**
 * Get current platform info
 */
export function getPlatformInfo(): Promise<any> {
  if (isProductionDisabled) {
    return Promise.resolve({
      platform: Platform.OS,
      version: Platform.Version,
      supported: false,
      disabled: true,
    });
  }

  if (Platform.OS !== 'android') {
    return Promise.resolve({
      platform: Platform.OS,
      version: Platform.Version,
      supported: false,
    });
  }

  return DroidDexModule.getPlatformInfo();
}