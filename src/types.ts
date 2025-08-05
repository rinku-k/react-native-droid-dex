/**
 * Performance classes available for monitoring
 */
export enum PerformanceClass {
  CPU = 'CPU',
  MEMORY = 'MEMORY',
  NETWORK = 'NETWORK',
  STORAGE = 'STORAGE',
  BATTERY = 'BATTERY',
}

/**
 * Performance levels returned by droid-dex
 */
export enum PerformanceLevel {
  EXCELLENT = 'EXCELLENT',
  HIGH = 'HIGH',
  AVERAGE = 'AVERAGE',
  LOW = 'LOW',
}

/**
 * CPU performance metrics
 */
export interface CpuMetrics {
  totalRam: number;
  coreCount: number;
  cpuFrequency: number;
}

/**
 * Memory performance metrics
 */
export interface MemoryMetrics {
  heapLimit: number;
  heapRemaining: number;
  availableRam: number;
}

/**
 * Network performance metrics
 */
export interface NetworkMetrics {
  bandwidthStrength: string;
  downloadSpeed: number;
  signalStrength: number;
}

/**
 * Storage performance metrics
 */
export interface StorageMetrics {
  availableStorage: number;
}

/**
 * Battery performance metrics
 */
export interface BatteryMetrics {
  percentageRemaining: number;
  isCharging: boolean;
}

/**
 * Complete device performance metrics
 */
export interface DeviceMetrics {
  cpu?: CpuMetrics;
  memory?: MemoryMetrics;
  network?: NetworkMetrics;
  storage?: StorageMetrics;
  battery?: BatteryMetrics;
}

/**
 * Performance result for single or multiple parameters
 */
export interface PerformanceResult {
  level: PerformanceLevel;
  metrics: DeviceMetrics;
  timestamp: number;
}

/**
 * Weighted performance parameter
 */
export interface WeightedPerformanceClass {
  performanceClass: PerformanceClass;
  weight: number;
}

/**
 * Configuration for performance monitoring
 */
export interface DroidDexConfig {
  /** Enable debug logging */
  debug?: boolean;
  /** Monitoring interval in milliseconds */
  monitoringInterval?: number;
  /** Enable automatic monitoring */
  autoMonitoring?: boolean;
}

/**
 * Performance monitoring listener callback
 */
export type PerformanceListener = (result: PerformanceResult) => void;

/**
 * Error callback for performance monitoring
 */
export type ErrorListener = (error: Error) => void;