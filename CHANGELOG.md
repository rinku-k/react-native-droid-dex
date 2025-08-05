# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-XX

### Added
- Initial release of react-native-droid-dex
- Full Android support for performance monitoring
- Support for CPU, Memory, Network, Storage, and Battery performance classes
- Weighted performance analysis
- Continuous performance monitoring with customizable intervals
- Backward compatibility for Android API 21+
- Comprehensive error handling and fallback mechanisms
- TypeScript definitions
- Example React Native app demonstrating all features
- Automatic permission checking and graceful degradation
- Real-time performance listeners
- Platform information utilities

### Features
- **Performance Classes**: Monitor CPU, Memory, Network, Storage, and Battery
- **Performance Levels**: Get EXCELLENT, HIGH, AVERAGE, or LOW classifications
- **Weighted Analysis**: Apply custom weights to different performance parameters
- **Continuous Monitoring**: Set up automatic monitoring with configurable intervals
- **Backward Compatibility**: Support for Android API 21+ with feature detection
- **Error Handling**: Robust error handling with fallback performance assessment
- **Permissions**: Automatic permission checking with graceful degradation
- **TypeScript**: Full TypeScript support with comprehensive type definitions

### Android Support
- Minimum Android API: 21 (Android 5.0)
- Target Android API: 33+
- Full backward compatibility with feature detection
- Automatic permission handling
- Fallback performance assessment for unsupported features

### iOS Support
- iOS compatibility layer (returns not supported errors)
- Allows cross-platform apps to include the module safely