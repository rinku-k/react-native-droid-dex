# Contributing to react-native-droid-dex

Thank you for your interest in contributing to react-native-droid-dex! This guide will help you get started.

## Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/your-username/react-native-droid-dex.git
cd react-native-droid-dex
```

2. **Install dependencies**
```bash
npm install
cd example && npm install
```

3. **Run the example app**
```bash
cd example
npx react-native run-android
```

## Project Structure

```
react-native-droid-dex/
├── android/                 # Android native implementation
│   ├── build.gradle        # Android build configuration
│   └── src/main/java/      # Java/Kotlin source files
├── ios/                    # iOS compatibility layer (not implemented)
├── src/                    # TypeScript source files
│   ├── index.ts           # Main module exports
│   └── types.ts           # Type definitions
├── example/               # Example React Native app
└── lib/                   # Built JavaScript files (generated)
```

## Making Changes

### Code Style

- Use TypeScript for all JavaScript code
- Follow the existing code style and formatting
- Use meaningful variable and function names
- Add comprehensive documentation for all public APIs

### Android Development

- Follow Android best practices
- Use Kotlin for new Android code
- Handle backward compatibility properly
- Test on multiple Android versions and devices
- Ensure proper permission handling

### Testing

1. **Test the example app**
```bash
cd example
npx react-native run-android
```

2. **Test on multiple devices**
   - Test on different Android versions (API 21+)
   - Test on devices with different performance levels
   - Test with and without required permissions

3. **Test error scenarios**
   - Missing permissions
   - Unsupported Android versions
   - Network connectivity issues

### Documentation

- Update README.md for new features
- Update CHANGELOG.md following semantic versioning
- Add inline code documentation
- Update TypeScript definitions

## Pull Request Process

1. **Create a feature branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**
   - Follow the coding standards
   - Add tests if applicable
   - Update documentation

3. **Test thoroughly**
   - Test the example app
   - Test on multiple Android devices
   - Verify backward compatibility

4. **Commit your changes**
```bash
git add .
git commit -m "feat: add your feature description"
```

5. **Push and create PR**
```bash
git push origin feature/your-feature-name
```

## Commit Message Format

Use conventional commits format:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test additions or changes
- `chore:` - Build process or auxiliary tool changes

Examples:
- `feat: add weighted performance monitoring`
- `fix: handle missing permissions gracefully`
- `docs: update installation instructions`

## Reporting Issues

When reporting issues, please include:

1. **Environment Information**
   - React Native version
   - Android version and API level
   - Device model and manufacturer
   - Module version

2. **Steps to Reproduce**
   - Detailed steps to reproduce the issue
   - Expected behavior
   - Actual behavior

3. **Code Examples**
   - Minimal code example that demonstrates the issue
   - Relevant configuration files

4. **Logs**
   - Error messages
   - Android logcat output
   - Debug logs if available

## Feature Requests

When requesting features, please provide:

1. **Use Case**: Describe the problem you're trying to solve
2. **Proposed Solution**: How you think it should work
3. **Alternatives**: Other ways you've considered solving this
4. **Additional Context**: Any other relevant information

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Assume good intentions

## Getting Help

- Check the README and documentation first
- Search existing issues before creating new ones
- Use clear and descriptive titles
- Provide as much context as possible

## Development Tips

### Android Debugging

1. **Enable debug logging**
```javascript
await initialize({ debug: true });
```

2. **Check Android logs**
```bash
adb logcat | grep DroidDex
```

3. **Test permissions**
```bash
adb shell dumpsys package your.package.name | grep permission
```

### Common Issues

1. **Module not found**: Ensure proper linking in MainApplication.java
2. **Permission denied**: Check AndroidManifest.xml permissions
3. **Build errors**: Clean and rebuild the project

## License

By contributing, you agree that your contributions will be licensed under the MIT License.