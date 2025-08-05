# react-native-droid-dex

A React Native bridge for the [droid-dex](https://github.com/grofers/droid-dex) Android performance monitoring library. This module enables React Native applications to monitor and analyze Android device performance across various parameters like CPU, Memory, Network, Storage, and Battery.

## Features

🚀 **Performance Monitoring**: Monitor CPU, Memory, Network, Storage, and Battery performance in real-time  
📊 **Performance Classification**: Get performance levels (EXCELLENT, HIGH, AVERAGE, LOW) for your app optimization  
⚖️ **Weighted Analysis**: Apply different weights to performance parameters based on your app's needs  
🔄 **Continuous Monitoring**: Set up automatic performance monitoring with customizable intervals  
📱 **Android Focus**: Optimized specifically for Android devices with comprehensive backward compatibility  
🛡️ **Error Handling**: Robust error handling with fallback mechanisms for unsupported devices  

## Platform Support

- ✅ **Android**: Full support (API level 21+)
- ✅ **iOS**: Compatibility mode (returns sensible defaults, no actual monitoring)
- 🛡️ **Production Safe**: Can be disabled in production builds to prevent errors

## Installation

```bash
npm install react-native-droid-dex
```

### Android Setup

1. **Add permissions** to your `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="android.permission.BATTERY_STATS" />
```

2. **Register the module** in your `MainApplication.java`:

```java
import com.reactnativedroiddex.DroidDexPackage;

@Override
protected List<ReactPackage> getPackages() {
  @SuppressWarnings("UnnecessaryLocalVariable")
  List<ReactPackage> packages = new PackageList(this).getPackages();
  packages.add(new DroidDexPackage()); // Add this line
  return packages;
}
```

3. **Auto-linking** should handle the rest for React Native 0.60+

## Usage

### Basic Setup

```typescript
import {
  initialize,
  getPerformanceLevel,
  disableForProduction,
  PerformanceClass,
  PerformanceLevel,
  isSupported,
} from 'react-native-droid-dex';

// Optional: Disable in production builds for safety
if (!__DEV__) {
  disableForProduction(true);
}

// Check if the platform is supported
if (isSupported()) {
  // Initialize the library
  const result = await initialize({
    debug: true,
    monitoringInterval: 5000,
  });
  
  if (result.success) {
    console.log('DroidDex initialized successfully');
    if (!result.fullFunctionality) {
      console.warn('Limited functionality due to missing permissions:', result.missingPermissions);
    }
  }
}
```

### Get Performance Level

```typescript
// Get performance level for specific parameters
const result = await getPerformanceLevel(
  PerformanceClass.CPU,
  PerformanceClass.MEMORY,
  PerformanceClass.BATTERY
);

console.log('Performance Level:', result.level); // EXCELLENT, HIGH, AVERAGE, or LOW
console.log('Supported Classes:', result.supportedClasses);
console.log('Metrics:', result.metrics);

// Handle the performance level
switch (result.level) {
  case PerformanceLevel.EXCELLENT:
    // Enable high-quality features
    break;
  case PerformanceLevel.HIGH:
    // Enable good-quality features
    break;
  case PerformanceLevel.AVERAGE:
    // Enable standard features
    break;
  case PerformanceLevel.LOW:
    // Enable basic features only
    break;
}
```

### Weighted Performance Analysis

```typescript
import { getWeightedPerformanceLevel, WeightedPerformanceClass } from 'react-native-droid-dex';

// Apply different weights to performance classes
const weightedClasses: WeightedPerformanceClass[] = [
  { performanceClass: PerformanceClass.MEMORY, weight: 2.0 }, // Memory is most important
  { performanceClass: PerformanceClass.CPU, weight: 1.5 },   // CPU is moderately important
  { performanceClass: PerformanceClass.NETWORK, weight: 1.0 }, // Network has standard weight
];

const result = await getWeightedPerformanceLevel(weightedClasses);
console.log('Weighted Performance Level:', result.level);
```

### Continuous Monitoring

```typescript
import {
  startMonitoring,
  stopMonitoring,
  addPerformanceListener,
  removePerformanceListener,
} from 'react-native-droid-dex';

// Start monitoring with 5-second intervals
const monitoringId = await startMonitoring([
  PerformanceClass.CPU,
  PerformanceClass.MEMORY,
  PerformanceClass.BATTERY,
], 5000);

// Add listener for performance updates
addPerformanceListener(monitoringId, (result) => {
  console.log('Performance Update:', result.level);
  
  // Adjust app behavior based on performance
  if (result.level === PerformanceLevel.LOW) {
    // Reduce app functionality to preserve performance
    disableHeavyFeatures();
  }
});

// Stop monitoring when done
await stopMonitoring(monitoringId);
removePerformanceListener(monitoringId);
```

### Production Safety

For production apps, you can disable DroidDex to prevent any potential issues:

```typescript
import { disableForProduction, isDisabledForProduction } from 'react-native-droid-dex';

// Disable in production builds
if (!__DEV__ || AppConfig.DISABLE_PERFORMANCE_MONITORING) {
  disableForProduction(true);
}

// Check if disabled
if (isDisabledForProduction()) {
  console.log('DroidDex is disabled for production');
}

// When disabled, all methods return safe defaults:
// - getPerformanceLevel() returns 'HIGH' performance level
// - startMonitoring() returns fake monitoring IDs
// - No actual monitoring occurs
```

## API Reference

📖 **For complete method documentation with parameters, defaults, and examples, see [METHODS_GUIDE.md](./METHODS_GUIDE.md)**

### Types

#### PerformanceClass
```typescript
enum PerformanceClass {
  CPU = 'CPU',
  MEMORY = 'MEMORY',
  NETWORK = 'NETWORK',
  STORAGE = 'STORAGE',
  BATTERY = 'BATTERY',
}
```

#### PerformanceLevel
```typescript
enum PerformanceLevel {
  EXCELLENT = 'EXCELLENT',
  HIGH = 'HIGH',
  AVERAGE = 'AVERAGE',
  LOW = 'LOW',
}
```

#### PerformanceResult
```typescript
interface PerformanceResult {
  level: PerformanceLevel;
  metrics: DeviceMetrics;
  timestamp: number;
  supportedClasses?: string[];
  unsupportedClasses?: string[];
}
```

### Methods

#### `initialize(config?: DroidDexConfig): Promise<InitResult>`
Initialize the DroidDex library.

**Parameters:**
- `config` (optional): Configuration object
  - `debug?: boolean` - Enable debug logging
  - `monitoringInterval?: number` - Default monitoring interval in milliseconds
  - `autoMonitoring?: boolean` - Enable automatic monitoring

**Returns:** Promise resolving to initialization result with success status and capability information.

#### `getPerformanceLevel(...classes: PerformanceClass[]): Promise<PerformanceResult>`
Get current performance level for specified parameters.

#### `getWeightedPerformanceLevel(weightedClasses: WeightedPerformanceClass[]): Promise<PerformanceResult>`
Get performance level with weighted analysis.

#### `startMonitoring(classes: PerformanceClass[], intervalMs?: number): Promise<string>`
Start continuous performance monitoring. Returns monitoring ID.

#### `stopMonitoring(monitoringId: string): Promise<boolean>`
Stop specific performance monitoring.

#### `isSupported(): boolean`
Check if DroidDex is supported on current platform.

#### `getPlatformInfo(): Promise<PlatformInfo>`
Get detailed platform information.

## Use Cases

### 1. Adaptive Image Quality

```typescript
// Adjust image quality based on device performance
const result = await getWeightedPerformanceLevel([
  { performanceClass: PerformanceClass.MEMORY, weight: 2.0 },
  { performanceClass: PerformanceClass.NETWORK, weight: 1.5 },
]);

let imageQuality;
switch (result.level) {
  case PerformanceLevel.EXCELLENT:
    imageQuality = 'high';
    break;
  case PerformanceLevel.HIGH:
    imageQuality = 'medium';
    break;
  default:
    imageQuality = 'low';
}
```

### 2. Battery-Aware Background Tasks

```typescript
// Adjust background task frequency based on battery performance
const result = await getPerformanceLevel(PerformanceClass.BATTERY);

let pollingInterval;
switch (result.level) {
  case PerformanceLevel.LOW:
    pollingInterval = 60000; // Poll every minute when battery is low
    break;
  case PerformanceLevel.AVERAGE:
    pollingInterval = 30000; // Poll every 30 seconds
    break;
  default:
    pollingInterval = 10000; // Poll every 10 seconds when battery is good
}
```

### 3. Dynamic Feature Toggle

```typescript
// Enable/disable features based on overall device performance
const result = await getPerformanceLevel(
  PerformanceClass.CPU,
  PerformanceClass.MEMORY
);

const enableAdvancedFeatures = result.level === PerformanceLevel.EXCELLENT || 
                               result.level === PerformanceLevel.HIGH;

if (enableAdvancedFeatures) {
  enableAnimations();
  enableRealTimeUpdates();
} else {
  disableAnimations();
  reducedUIMode();
}
```

## Backward Compatibility

The module handles backward compatibility across Android versions:

- **API Level 21+**: Full functionality
- **API Level 23+**: Enhanced network monitoring
- **Missing Permissions**: Graceful degradation with limited functionality
- **Unsupported Features**: Automatic fallback to basic performance assessment

## Error Handling

The module provides comprehensive error handling:

```typescript
try {
  const result = await getPerformanceLevel(PerformanceClass.CPU);
} catch (error) {
  if (error.code === 'UNSUPPORTED_VERSION') {
    // Handle unsupported Android version
  } else if (error.code === 'NO_SUPPORTED_CLASSES') {
    // Handle case where no requested classes are supported
  } else {
    // Handle other errors
  }
}
```

## Permissions

### Required Permissions
- `ACCESS_NETWORK_STATE`: For network performance monitoring
- `ACCESS_WIFI_STATE`: For WiFi-related network metrics

### Optional Permissions
- `BATTERY_STATS`: For detailed battery performance metrics

The module will continue to work with limited functionality if optional permissions are not granted.

## Cross-Platform Behavior

### Android (Primary Platform)
- Full performance monitoring with droid-dex library
- Real hardware metrics and performance analysis
- Supports all performance classes and monitoring features

### iOS (Compatibility Mode)
- Returns sensible default values for all methods
- `initialize()` returns success with `fullFunctionality: false`
- `getPerformanceLevel()` returns `'HIGH'` performance level by default
- `startMonitoring()` returns fake monitoring IDs (no actual monitoring)
- No errors thrown - allows cross-platform apps to use the same code

### Production Disabled Mode
- All platforms return safe default values when disabled
- Prevents any potential crashes in production builds
- Easy to enable/disable based on build environment or app configuration

## Performance Considerations

- **Lightweight**: Minimal impact on app performance
- **Efficient**: Uses native Android APIs for optimal performance
- **Configurable**: Adjustable monitoring intervals to balance accuracy vs. resource usage
- **Fallback**: Built-in fallback mechanisms for unsupported devices

## Troubleshooting

### Common Issues

1. **Module not linking properly**
   - Ensure you've added the package to your `MainApplication.java`
   - Clean and rebuild your project

2. **Permissions not working**
   - Check that permissions are added to `AndroidManifest.xml`
   - The module will work with limited functionality without optional permissions

3. **Performance monitoring not updating**
   - Ensure you've called `initialize()` before starting monitoring
   - Check that monitoring ID is valid and monitoring is active

4. **iOS compatibility**
   - iOS now returns default values instead of errors
   - If you see iOS errors, ensure you're using the latest version

5. **Production crashes or errors**
   - Use `disableForProduction(true)` to disable DroidDex in production
   - This prevents any native module issues in production builds

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to the main repository.

## License

MIT

## Credits

This module is built on top of the excellent [droid-dex](https://github.com/grofers/droid-dex) library by Grofers/Blinkit team.

---

## Example App

Check out the `/example` folder for a complete React Native app demonstrating all features of the library.

```bash
cd example
npm install
npx react-native run-android
```