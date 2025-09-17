# RecipeMa - AI-Powered Recipe Generator

RecipeMa is a complete production-ready cross-platform mobile app that uses AI to generate personalized recipes from user-provided ingredients. Built with Expo React Native and includes subscription monetization.

## Features

- 🤖 AI-powered recipe generation using DeepSeek API
- 📷 OCR ingredient scanning from photos
- 🎙️ Voice input for ingredients
- ⏱️ Step-by-step cooking with timers and TTS
- 💎 Premium subscription ($2/month, $19/year)
- ❤️ Save favorite recipes
- 🔄 Smart caching and offline support
- 🍽️ Dietary filters and preferences
- 📱 Cross-platform (iOS & Android)

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development)
- Android Studio & Android SDK (for Android development)

### Installation

1. Clone the repository
```bash
git clone [repository-url]
cd recipema
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```
Edit `.env` with your API keys and configuration.

4. Start the development server
```bash
npm run dev
```

5. Open in simulator/device
- iOS: Press `i` in terminal
- Android: Press `a` in terminal
- Web: Press `w` in terminal

## Environment Variables

Create a `.env` file in the root directory:

```bash
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_DEEPSEEK_API_KEY=your_deepseek_api_key

# RevenueCat (Subscriptions)
EXPO_PUBLIC_REVENUECAT_IOS_KEY=your_ios_key
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=your_android_key

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/recipema
REDIS_URL=redis://localhost:6379

# Apple App Store
APPLE_SHARED_SECRET=your_apple_shared_secret

# Google Play Store
GOOGLE_SERVICE_ACCOUNT_JSON=path/to/service-account.json

# Security
JWT_SECRET=your_jwt_secret_key
```

## Architecture

### Frontend (Expo React Native)
- **Navigation**: Expo Router with tabs
- **State Management**: React hooks + AsyncStorage
- **Subscriptions**: RevenueCat
- **UI Components**: React Native Paper + custom components
- **Voice/OCR**: Expo Speech, Camera, ImagePicker

### Backend (Node.js)
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis
- **AI Integration**: DeepSeek API
- **Authentication**: JWT
- **Receipt Validation**: Apple/Google APIs

## Subscription Setup

### App Store Connect

1. Create a new app with bundle ID: `com.recipema.app`
2. Go to "In-App Purchases" section
3. Create Subscription Group: "RecipeMa Premium"
4. Add products:
   - **Monthly**: Product ID `com.recipema.subscription.monthly`, $1.99
   - **Annual**: Product ID `com.recipema.subscription.annual`, $19.99

### Google Play Console

1. Create app with package name: `com.recipema.app`
2. Go to "Subscriptions" in Monetization
3. Create base plan subscriptions:
   - **Monthly**: Product ID `com.recipema.subscription.monthly`, $1.99
   - **Annual**: Product ID `com.recipema.subscription.annual`, $19.99

### RevenueCat Setup

1. Create RevenueCat project
2. Add iOS and Android apps
3. Configure products and entitlements
4. Set up webhooks for subscription events

## Deployment

### Backend Deployment (Railway/Render/Heroku)

1. Set up production database
2. Configure environment variables
3. Deploy backend:
```bash
# Railway
railway login
railway link
railway up

# Heroku
heroku create recipema-backend
git push heroku main
```

### Mobile App Deployment

1. Build for app stores:
```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production
```

2. Submit to stores:
```bash
eas submit --platform ios
eas submit --platform android
```

## Testing

### Unit Tests
```bash
npm run test
```

### E2E Testing
```bash
# iOS Simulator
npm run test:ios

# Android Emulator  
npm run test:android
```

### Subscription Testing
- iOS: Use Sandbox Apple ID
- Android: Use Internal Testing track

## Security & Privacy

### Data Handling
- Images processed locally (OCR) unless user consents
- Minimal data storage (ingredients only, not photos)
- 30-day cache retention policy
- GDPR/CCPA compliant

### API Security
- Rate limiting per user/IP
- Input sanitization
- Secure JWT implementation
- HTTPS everywhere

## Troubleshooting

### Common Issues

1. **DeepSeek API returning invalid JSON**
   - Check API key validity
   - Verify prompt templates
   - Check rate limits

2. **OCR not working**
   - Verify camera permissions
   - Check image quality/lighting
   - Test with different image formats

3. **Subscription purchase fails**
   - Verify product IDs match store configuration
   - Check RevenueCat dashboard
   - Test with sandbox accounts

4. **Voice input not working**
   - Check microphone permissions
   - Test device audio settings
   - Verify Speech API setup

### Support

For technical support:
- Check GitHub Issues
- Email: support@recipema.com
- Documentation: [docs.recipema.com](https://docs.recipema.com)

## License

Private - All Rights Reserved

## Contributing

This is a proprietary application. Internal contributors should follow the development guidelines in `/docs/CONTRIBUTING.md`.