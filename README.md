# BursaryHub - Student Bursary Management Platform

A comprehensive React Native application for managing bursary applications, connecting students with funding opportunities, and streamlining the application process.

## 📱 Features

### Student Features
- **Dashboard**: Overview of applications, status tracking, and quick actions
- **Bursary Discovery**: Browse and filter available bursaries
- **Application Management**: Submit, track, and manage applications
- **Profile Management**: Complete profile with document uploads
- **Real-time Updates**: Track application status changes

### Provider Features
- **Bursary Management**: Create, edit, and manage bursary opportunities
- **Application Review**: Review and process student applications
- **Analytics**: Track application metrics and success rates

### Admin Features
- **User Management**: Manage students and providers
- **System Oversight**: Monitor platform activity and performance
- **Settings**: Configure system-wide settings

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- React Native development environment
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/bursaryhub.git
   cd bursaryhub
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Install iOS dependencies** (iOS only)
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

5. **Run on device/simulator**
   ```bash
   # iOS
   npm run ios
   # or
   yarn ios

   # Android
   npm run android
   # or
   yarn android
   ```

## 🔐 Demo Credentials

The app includes demo data for testing. Use these credentials to explore different user roles:

### Students
- **Email**: `student@demo.com` | **Password**: `demo123`
  - John Student - UCT Computer Science (Undergraduate)
- **Email**: `sarah@demo.com` | **Password**: `demo123`
  - Sarah Johnson - Wits Mechanical Engineering (Undergraduate)
- **Email**: `mike@demo.com` | **Password**: `demo123`
  - Michael Brown - Stellenbosch Computer Science (Postgraduate)

### Providers
- **Email**: `provider@demo.com` | **Password**: `demo123`
  - Tech Education Foundation

### Admin
- **Email**: `admin@demo.com` | **Password**: `demo123`
  - System Administrator

## 📁 Project Structure

```
bursaryhub/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── shared/         # Shared components across the app
│   ├── config/             # Configuration files
│   ├── navigation/         # Navigation setup
│   ├── screens/            # Screen components
│   │   ├── admin/          # Admin-specific screens
│   │   ├── auth/           # Authentication screens
│   │   ├── provider/       # Provider-specific screens
│   │   └── student/        # Student-specific screens
│   ├── services/           # API and business logic
│   ├── store/              # Redux store and slices
│   └── types/              # TypeScript type definitions
├── assets/                 # Images, icons, and other assets
├── App.js                  # Main app component
└── package.json            # Dependencies and scripts
```

## 🛠️ Development Guide

### Adding New Features

1. **Create new screens**
   ```bash
   # Create a new screen in the appropriate directory
   touch src/screens/student/NewFeatureScreen.tsx
   ```

2. **Add navigation**
   ```typescript
   // Update navigation types in src/types/index.ts
   export type StudentStackParamList = {
     // ... existing screens
     NewFeature: undefined;
   };
   ```

3. **Update Redux store** (if needed)
   ```typescript
   // Add new slice in src/store/slices/
   // Update store configuration in src/store/index.ts
   ```

### Code Style Guidelines

- Use TypeScript for all new code
- Follow React Native best practices
- Use functional components with hooks
- Implement proper error handling
- Add loading states for async operations
- Use consistent naming conventions

### Component Structure

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ComponentProps {
  // Define props with TypeScript
}

const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Component logic here
  
  return (
    <View style={styles.container}>
      <Text>Component content</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Styles here
  },
});

export default Component;
```

## 🔧 Configuration

### Firebase Setup (Optional)

The app includes Firebase configuration for production use. To set up Firebase:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore Database
3. Enable Authentication
4. Update `src/config/firebase.ts` with your configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### Environment Variables

Create a `.env` file in the root directory:

```env
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
```

## 📱 Platform-Specific Setup

### iOS Setup

1. **Install Xcode** (from Mac App Store)
2. **Install iOS Simulator**
3. **Install CocoaPods**
   ```bash
   sudo gem install cocoapods
   ```

### Android Setup

1. **Install Android Studio**
2. **Set up Android SDK**
3. **Configure environment variables**
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Testing Guidelines

- Write unit tests for utility functions
- Test component rendering and interactions
- Mock external dependencies
- Test error handling scenarios

## 🚀 Deployment

### Building for Production

#### Android
```bash
# Generate signed APK
cd android
./gradlew assembleRelease

# Generate App Bundle
./gradlew bundleRelease
```

#### iOS
1. Open `ios/BursaryHub.xcworkspace` in Xcode
2. Select "Generic iOS Device" or your device
3. Product → Archive
4. Follow the App Store Connect process

### App Store Deployment

1. **Prepare app for submission**
   - Update version numbers
   - Add app icons and splash screens
   - Configure app permissions

2. **Submit to stores**
   - Google Play Console (Android)
   - App Store Connect (iOS)

## 🐛 Troubleshooting

### Common Issues

#### Metro bundler issues
```bash
# Clear Metro cache
npx react-native start --reset-cache

# Clear npm cache
npm start -- --reset-cache
```

#### iOS build issues
```bash
# Clean and rebuild
cd ios
rm -rf build
pod install
cd ..
npx react-native run-ios
```

#### Android build issues
```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npx react-native run-android
```

#### Dependencies issues
```bash
# Clear node modules and reinstall
rm -rf node_modules
npm install
```

### Performance Optimization

- Use `FlatList` for large lists
- Implement lazy loading for images
- Optimize bundle size with code splitting
- Use `React.memo` for expensive components
- Implement proper state management

## 📚 Additional Resources

### Documentation
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React Navigation Documentation](https://reactnavigation.org/)
- [Expo Documentation](https://docs.expo.dev/)

### Community
- [React Native Community](https://github.com/react-native-community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)
- [Reddit r/reactnative](https://www.reddit.com/r/reactnative/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass
- Follow semantic commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Lead Developer**: [Your Name]
- **UI/UX Designer**: [Designer Name]
- **Backend Developer**: [Backend Developer Name]

## 📞 Support

For support, email support@bursaryhub.com or join our Slack channel.

## 🎯 Roadmap

### Upcoming Features
- [ ] Push notifications
- [ ] Document upload functionality
- [ ] Advanced search and filtering
- [ ] Multi-language support
- [ ] Offline mode
- [ ] Analytics dashboard
- [ ] Integration with university systems

### Version History
- **v1.0.0** - Initial release with core features
- **v1.1.0** - Enhanced UI and performance improvements
- **v1.2.0** - Added provider features
- **v2.0.0** - Complete redesign and new features

---

**Made with ❤️ for students seeking educational opportunities**"# BURSARYHUB" 
