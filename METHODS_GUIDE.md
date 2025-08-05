# React Native DroidDex - Complete Methods Guide

This guide provides comprehensive documentation for all methods available in react-native-droid-dex, including their parameters, default values, return types, and usage examples.

## Table of Contents

- [Configuration & Setup Methods](#configuration--setup-methods)
- [Performance Analysis Methods](#performance-analysis-methods)
- [Monitoring Methods](#monitoring-methods)
- [Listener Methods](#listener-methods)
- [Utility Methods](#utility-methods)
- [Default Values & Behaviors](#default-values--behaviors)
- [Production Disable Feature](#production-disable-feature)
- [Cross-Platform Behavior](#cross-platform-behavior)

---

## Configuration & Setup Methods

### `initialize(config?: DroidDexConfig): Promise<InitResult>`

Initialize the DroidDex performance monitoring system.

**Parameters:**
- `config` (optional): Configuration object
  - `debug?: boolean` - Enable debug logging (default: `false`)
  - `monitoringInterval?: number` - Default monitoring interval in milliseconds (default: `5000`)
  - `autoMonitoring?: boolean` - Enable automatic monitoring (default: `false`)

**Returns:** Promise resolving to:
```typescript
{
  success: boolean;           // Initialization success
  fullFunctionality: boolean; // All features available
  missingPermissions: string[]; // Required permissions missing
  missingOptionalPermissions: string[]; // Optional permissions missing
  apiLevel: number;           // Android API level
  networkMonitoringSupported: boolean; // Network monitoring available
  batteryStatsSupported: boolean; // Battery stats available
  disabled?: boolean;         // True if production disabled
}
```

**Usage Example:**
```typescript
import { initialize } from 'react-native-droid-dex';

// Basic initialization
const result = await initialize();

// With configuration
const result = await initialize({
  debug: true,
  monitoringInterval: 3000,
  autoMonitoring: false
});

console.log('Initialized:', result.success);
console.log('Full functionality:', result.fullFunctionality);
if (result.missingPermissions.length > 0) {
  console.warn('Missing permissions:', result.missingPermissions);
}
```

**Default Behavior:**
- **Android**: Full initialization with droid-dex library
- **iOS**: Returns success with `fullFunctionality: false`
- **Production Disabled**: Returns disabled state info

---

### `disableForProduction(disabled: boolean = true): void`

Disable DroidDex for production use to prevent errors in production builds.

**Parameters:**
- `disabled` (optional): Whether to disable DroidDex (default: `true`)

**Returns:** `void`

**Usage Example:**
```typescript
import { disableForProduction } from 'react-native-droid-dex';

// Disable in production
if (__DEV__ === false) {
  disableForProduction(true);
}

// Re-enable (for debugging)
disableForProduction(false);
```

---

### `isDisabledForProduction(): boolean`

Check if DroidDex is currently disabled for production.

**Parameters:** None

**Returns:** `boolean` - True if disabled for production

**Usage Example:**
```typescript
import { isDisabledForProduction } from 'react-native-droid-dex';

if (isDisabledForProduction()) {
  console.log('DroidDex is disabled for production');
}
```

---

## Performance Analysis Methods

### `getPerformanceLevel(...performanceClasses: PerformanceClass[]): Promise<PerformanceResult>`

Get current performance level for specified performance classes.

**Parameters:**
- `...performanceClasses`: Variable number of performance classes to analyze
  - `PerformanceClass.CPU` - CPU performance
  - `PerformanceClass.MEMORY` - Memory performance
  - `PerformanceClass.NETWORK` - Network performance
  - `PerformanceClass.STORAGE` - Storage performance
  - `PerformanceClass.BATTERY` - Battery performance

**Returns:** Promise resolving to:
```typescript
{
  level: PerformanceLevel;     // EXCELLENT, HIGH, AVERAGE, LOW
  metrics: DeviceMetrics;      // Detailed metrics object
  timestamp: number;           // Unix timestamp in milliseconds
  supportedClasses?: string[]; // Classes supported on this device
  unsupportedClasses?: string[]; // Classes not supported
}
```

**Usage Examples:**
```typescript
import { getPerformanceLevel, PerformanceClass } from 'react-native-droid-dex';

// Single performance class
const result = await getPerformanceLevel(PerformanceClass.MEMORY);

// Multiple performance classes
const result = await getPerformanceLevel(
  PerformanceClass.CPU,
  PerformanceClass.MEMORY,
  PerformanceClass.BATTERY
);

// Handle result
switch (result.level) {
  case 'EXCELLENT':
    enableHighQualityFeatures();
    break;
  case 'HIGH':
    enableGoodQualityFeatures();
    break;
  case 'AVERAGE':
    enableStandardFeatures();
    break;
  case 'LOW':
    enableBasicFeatures();
    break;
}
```

**Default Behavior:**
- **Android**: Real performance analysis with droid-dex
- **iOS**: Returns `HIGH` performance level with empty metrics
- **Production Disabled**: Returns `HIGH` performance level with empty metrics

---

### `getWeightedPerformanceLevel(weightedClasses: WeightedPerformanceClass[]): Promise<PerformanceResult>`

Get performance level with weighted analysis for multiple parameters.

**Parameters:**
- `weightedClasses`: Array of weighted performance classes
```typescript
{
  performanceClass: PerformanceClass;
  weight: number; // Multiplier for this class (default: 1.0)
}[]
```

**Returns:** Same as `getPerformanceLevel`

**Usage Example:**
```typescript
import { getWeightedPerformanceLevel, PerformanceClass } from 'react-native-droid-dex';

// Memory is twice as important as CPU, network has standard weight
const result = await getWeightedPerformanceLevel([
  { performanceClass: PerformanceClass.MEMORY, weight: 2.0 },
  { performanceClass: PerformanceClass.CPU, weight: 1.5 },
  { performanceClass: PerformanceClass.NETWORK, weight: 1.0 },
]);

// Optimize based on weighted performance
if (result.level === 'EXCELLENT' || result.level === 'HIGH') {
  setImageQuality('high');
  enableRealTimeSync();
} else {
  setImageQuality('medium');
  reduceBackgroundTasks();
}
```

---

## Monitoring Methods

### `startMonitoring(performanceClasses: PerformanceClass[], intervalMs: number = 5000): Promise<string>`

Start continuous performance monitoring with specified interval.

**Parameters:**
- `performanceClasses`: Array of performance classes to monitor
- `intervalMs` (optional): Monitoring interval in milliseconds (default: `5000`)

**Returns:** Promise resolving to monitoring ID string

**Usage Example:**
```typescript
import { startMonitoring, PerformanceClass } from 'react-native-droid-dex';

// Start monitoring with default 5-second interval
const monitoringId = await startMonitoring([
  PerformanceClass.CPU,
  PerformanceClass.MEMORY,
  PerformanceClass.BATTERY
]);

// Start monitoring with custom 3-second interval
const monitoringId = await startMonitoring([
  PerformanceClass.MEMORY
], 3000);

console.log('Monitoring started with ID:', monitoringId);
```

**Default Behavior:**
- **Android**: Real continuous monitoring
- **iOS**: Returns fake monitoring ID, no actual monitoring
- **Production Disabled**: Returns fake monitoring ID

---

### `startWeightedMonitoring(weightedClasses: WeightedPerformanceClass[], intervalMs: number = 5000): Promise<string>`

Start continuous weighted performance monitoring.

**Parameters:**
- `weightedClasses`: Array of weighted performance classes
- `intervalMs` (optional): Monitoring interval in milliseconds (default: `5000`)

**Returns:** Promise resolving to monitoring ID string

**Usage Example:**
```typescript
import { startWeightedMonitoring, PerformanceClass } from 'react-native-droid-dex';

const monitoringId = await startWeightedMonitoring([
  { performanceClass: PerformanceClass.MEMORY, weight: 2.0 },
  { performanceClass: PerformanceClass.CPU, weight: 1.0 }
], 2000); // Check every 2 seconds
```

---

### `stopMonitoring(monitoringId: string): Promise<boolean>`

Stop specific performance monitoring session.

**Parameters:**
- `monitoringId`: The monitoring ID returned by start monitoring methods

**Returns:** Promise resolving to `boolean` (success/failure)

**Usage Example:**
```typescript
import { stopMonitoring } from 'react-native-droid-dex';

const success = await stopMonitoring(monitoringId);
if (success) {
  console.log('Monitoring stopped successfully');
}
```

---

### `stopAllMonitoring(): Promise<boolean>`

Stop all active performance monitoring sessions.

**Parameters:** None

**Returns:** Promise resolving to `boolean` (success/failure)

**Usage Example:**
```typescript
import { stopAllMonitoring } from 'react-native-droid-dex';

// Stop all monitoring (useful for cleanup)
await stopAllMonitoring();
```

---

## Listener Methods

### `addPerformanceListener(monitoringId: string, listener: PerformanceListener): void`

Add a listener for performance updates from continuous monitoring.

**Parameters:**
- `monitoringId`: The monitoring ID from start monitoring methods
- `listener`: Callback function receiving performance results
```typescript
(result: PerformanceResult) => void
```

**Returns:** `void`

**Usage Example:**
```typescript
import { addPerformanceListener } from 'react-native-droid-dex';

addPerformanceListener(monitoringId, (result) => {
  console.log('Performance update:', result.level);
  console.log('Timestamp:', new Date(result.timestamp));
  
  // React to performance changes
  if (result.level === 'LOW') {
    // Reduce app functionality
    disableAnimations();
    reduceDataUsage();
  } else if (result.level === 'EXCELLENT') {
    // Enable premium features
    enableHDContent();
    increaseRefreshRate();
  }
});
```

---

### `removePerformanceListener(monitoringId: string): void`

Remove performance listener for specific monitoring session.

**Parameters:**
- `monitoringId`: The monitoring ID

**Returns:** `void`

**Usage Example:**
```typescript
import { removePerformanceListener } from 'react-native-droid-dex';

// Clean up listener when component unmounts
removePerformanceListener(monitoringId);
```

---

### `addErrorListener(monitoringId: string, listener: ErrorListener): void`

Add a listener for errors during monitoring.

**Parameters:**
- `monitoringId`: The monitoring ID
- `listener`: Error callback function
```typescript
(error: Error) => void
```

**Returns:** `void`

**Usage Example:**
```typescript
import { addErrorListener } from 'react-native-droid-dex';

addErrorListener(monitoringId, (error) => {
  console.error('Monitoring error:', error.message);
  // Handle error - maybe switch to fallback mode
  enableFallbackMode();
});
```

---

### `removeErrorListener(monitoringId: string): void`

Remove error listener for specific monitoring session.

**Parameters:**
- `monitoringId`: The monitoring ID

**Returns:** `void`

---

## Utility Methods

### `isSupported(): boolean`

Check if DroidDex is supported on the current platform.

**Parameters:** None

**Returns:** `boolean` - True if supported (Android only)

**Usage Example:**
```typescript
import { isSupported } from 'react-native-droid-dex';

if (isSupported()) {
  // Initialize and use DroidDex
  await initialize();
} else {
  // Use alternative performance detection or default behavior
  console.log('DroidDex not supported on this platform');
}
```

---

### `getPlatformInfo(): Promise<PlatformInfo>`

Get detailed information about the current platform and DroidDex capabilities.

**Parameters:** None

**Returns:** Promise resolving to:
```typescript
{
  platform: string;        // 'android' or 'ios'
  version: string | number; // Platform version
  supported: boolean;       // DroidDex support status
  disabled?: boolean;       // True if production disabled
  // Android-specific fields:
  device?: string;          // Device model
  model?: string;           // Device model name
  manufacturer?: string;    // Device manufacturer
  droidDexInitialized?: boolean; // DroidDex library status
}
```

**Usage Example:**
```typescript
import { getPlatformInfo } from 'react-native-droid-dex';

const info = await getPlatformInfo();
console.log('Platform:', info.platform);
console.log('Version:', info.version);
console.log('Supported:', info.supported);

if (info.device) {
  console.log('Device:', info.device);
  console.log('Manufacturer:', info.manufacturer);
}
```

---

## Default Values & Behaviors

### Method Defaults

| Method | Parameter | Default Value | Description |
|--------|-----------|---------------|-------------|
| `initialize` | `config.debug` | `false` | Debug logging disabled |
| `initialize` | `config.monitoringInterval` | `5000` | 5-second intervals |
| `initialize` | `config.autoMonitoring` | `false` | Manual monitoring |
| `startMonitoring` | `intervalMs` | `5000` | 5-second intervals |
| `startWeightedMonitoring` | `intervalMs` | `5000` | 5-second intervals |
| `disableForProduction` | `disabled` | `true` | Disable by default |

### Performance Level Defaults

| Platform/State | Default Performance Level | Reason |
|----------------|---------------------------|---------|
| iOS | `HIGH` | iOS devices generally have good performance |
| Android (fallback) | Calculated | Based on RAM, CPU cores, Android version |
| Production Disabled | `HIGH` | Safe default for production apps |
| Network Unavailable | Current calculation | Excludes network metrics |
| Permissions Missing | Limited functionality | Excludes restricted metrics |

### Monitoring Defaults

| Scenario | Monitoring Behavior | Default Response |
|----------|-------------------|------------------|
| iOS | No actual monitoring | Returns fake monitoring ID |
| Production Disabled | No monitoring | Returns fake monitoring ID |
| Android (normal) | Real monitoring | Returns real monitoring ID |
| Permissions Missing | Limited monitoring | Monitors available metrics only |

---

## Production Disable Feature

The production disable feature allows you to safely disable DroidDex in production builds to prevent any potential crashes or performance issues.

### When to Use

```typescript
// In your app initialization
if (!__DEV__) {
  // Disable in production builds
  disableForProduction(true);
}

// Or conditionally based on app configuration
if (AppConfig.DISABLE_PERFORMANCE_MONITORING) {
  disableForProduction(true);
}
```

### Behavior When Disabled

When disabled, all methods return safe default values:

1. **`initialize()`** - Returns success with disabled flag
2. **`getPerformanceLevel()`** - Returns `HIGH` performance level
3. **`getWeightedPerformanceLevel()`** - Returns `HIGH` performance level
4. **`startMonitoring()`** - Returns fake monitoring ID
5. **`stopMonitoring()`** - Returns `true`
6. **Listeners** - Stored but no events emitted

### Error Handling Pattern

```typescript
try {
  await initialize();
  const result = await getPerformanceLevel(PerformanceClass.MEMORY);
  // Use result normally
} catch (error) {
  // If errors occur in production, disable DroidDex
  console.warn('DroidDex error, disabling:', error);
  disableForProduction(true);
  
  // Continue with default behavior
  const fallbackResult = await getPerformanceLevel(PerformanceClass.MEMORY);
  // Will now return default HIGH performance level
}
```

---

## Cross-Platform Behavior

### Android (Primary Platform)

- Full functionality with droid-dex library
- Real performance monitoring and analysis
- Hardware-based metrics collection
- Permission-based feature availability

### iOS (Compatibility Mode)

- Returns sensible defaults for all methods
- No actual performance monitoring
- `HIGH` performance level as default
- Fake monitoring IDs for API compatibility

### React Native Web / Other Platforms

- Same behavior as iOS
- Graceful degradation
- No errors thrown
- Safe defaults returned

---

## Complete Usage Example

```typescript
import React, { useEffect, useState } from 'react';
import {
  initialize,
  getPerformanceLevel,
  startMonitoring,
  addPerformanceListener,
  removePerformanceListener,
  stopMonitoring,
  disableForProduction,
  isSupported,
  PerformanceClass,
  PerformanceLevel,
} from 'react-native-droid-dex';

const PerformanceManager = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [performanceLevel, setPerformanceLevel] = useState<PerformanceLevel | null>(null);
  const [monitoringId, setMonitoringId] = useState<string | null>(null);

  useEffect(() => {
    const setupDroidDex = async () => {
      try {
        // Disable in production if needed
        if (!__DEV__ && AppConfig.DISABLE_PERFORMANCE_MONITORING) {
          disableForProduction(true);
        }

        // Check support
        if (!isSupported()) {
          console.log('DroidDex not supported on this platform');
          return;
        }

        // Initialize
        const result = await initialize({
          debug: __DEV__,
          monitoringInterval: 3000,
        });

        if (result.success) {
          setIsInitialized(true);
          
          // Get initial performance level
          const perf = await getPerformanceLevel(
            PerformanceClass.CPU,
            PerformanceClass.MEMORY,
            PerformanceClass.BATTERY
          );
          setPerformanceLevel(perf.level);

          // Start continuous monitoring
          const id = await startMonitoring([
            PerformanceClass.MEMORY,
            PerformanceClass.BATTERY,
          ], 5000);
          
          setMonitoringId(id);

          // Add listener for updates
          addPerformanceListener(id, (perfResult) => {
            setPerformanceLevel(perfResult.level);
            
            // Adjust app behavior based on performance
            adjustAppBehavior(perfResult.level);
          });
        }
      } catch (error) {
        console.error('DroidDex setup failed:', error);
        // Gracefully handle errors
        disableForProduction(true);
      }
    };

    setupDroidDex();

    // Cleanup
    return () => {
      if (monitoringId) {
        removePerformanceListener(monitoringId);
        stopMonitoring(monitoringId);
      }
    };
  }, []);

  const adjustAppBehavior = (level: PerformanceLevel) => {
    switch (level) {
      case PerformanceLevel.EXCELLENT:
        // Enable all features
        break;
      case PerformanceLevel.HIGH:
        // Enable most features
        break;
      case PerformanceLevel.AVERAGE:
        // Enable standard features
        break;
      case PerformanceLevel.LOW:
        // Enable only essential features
        break;
    }
  };

  return (
    // Your component JSX
  );
};
```

This comprehensive guide covers all methods, their defaults, and usage patterns for the react-native-droid-dex library. The production disable feature ensures your app remains stable even if performance monitoring encounters issues.