# mTorq - Mobile App Configuration Guide

## Quick Start

### 1. Install Dependencies
```bash
cd app
npm install
```

### 2. Configure Backend URL

Open `src/services/api.ts` and update the backend URL:

```typescript
// For local development on iOS
const BACKEND_URL = 'http://localhost:8000';

// For local development on Android emulator
const BACKEND_URL = 'http://10.0.2.2:8000';

// For physical device on same network
const BACKEND_URL = 'http://YOUR_LOCAL_IP:8000';

// For production
const BACKEND_URL = 'https://your-backend-url.com';
```

### 3. Start the App
```bash
npm start
```

Then press:
- `i` for iOS simulator
- `a` for Android emulator
- `w` for web

## Backend Setup

The mobile app connects to the same FastAPI backend located in the `backend` folder.

### Start Backend Server
```bash
cd backend
python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

### Environment Variables
Make sure your backend `.env` file has:
```
MONGO_URL=your_mongodb_connection_string
DB_NAME=mtorq
JWT_SECRET_KEY=your_secret_key
CORS_ORIGINS=*
```

## Network Configuration

### For iOS Simulator
- Use `http://localhost:8000`
- The simulator can access localhost directly

### For Android Emulator
- Use `http://10.0.2.2:8000`
- Android emulator maps `10.0.2.2` to host machine's localhost

### For Physical Device
1. Connect device and computer to same WiFi network
2. Find your computer's local IP:
   - Mac/Linux: `ifconfig | grep "inet "`
   - Windows: `ipconfig`
3. Use `http://YOUR_LOCAL_IP:8000`
4. Update backend CORS settings to allow your local IP

## App Structure

### Authentication Flow
1. User opens app → checks AsyncStorage for token
2. If token exists → validates and shows Main Navigator
3. If no token → shows Auth Screen
4. After login/signup → stores token and user data
5. Token automatically added to all API requests

### Navigation Structure
```
RootNavigator (Stack)
├── Auth Screen (if not logged in)
└── Main Navigator (if logged in)
    ├── Home (Dashboard)
    ├── Add (Add Expense)
    ├── Expenses (List/Filter)
    ├── Bikes (Manage Bikes)
    └── Settings (Profile/Logout)
```

### Data Flow
```
Screen → API Service → Backend
         ↓
    AsyncStorage (Token)
```

## Styling Configuration

### Tailwind Classes
The app uses NativeWind (Tailwind for React Native). Common classes:
- `bg-background` - Dark background (#09090b)
- `text-white` - White text
- `text-zinc-400` - Gray text
- `text-primary` - Cyan accent (#ccfbf1)
- `border-white/10` - Subtle borders
- `rounded-lg` - Rounded corners

### Theme Colors
```javascript
primary: '#ccfbf1'        // Cyan accent
primary-dark: '#99f6e4'   // Darker cyan
primary-foreground: '#115e59' // Dark teal
background: '#09090b'     // Near black
```

## Common Operations

### Adding a New Screen
1. Create screen in `src/screens/NewScreen.tsx`
2. Export from `src/screens/index.ts`
3. Add to navigator in `src/navigation/MainNavigator.tsx`

### Adding a New API Endpoint
1. Add TypeScript types in `src/types/index.ts`
2. Add method in `src/services/api.ts`
3. Use in screen with try-catch error handling

### Creating a New Component
1. Create component in `src/components/NewComponent.tsx`
2. Export from `src/components/index.ts`
3. Import and use in screens

## Debugging

### View Logs
```bash
# iOS
npx react-native log-ios

# Android
npx react-native log-android

# Expo
# Logs appear in terminal where you ran 'npm start'
```

### Common Issues

**1. "Network request failed"**
- Check backend is running
- Verify correct backend URL
- Check network connectivity
- For Android, ensure using `10.0.2.2` instead of `localhost`

**2. "Unable to resolve module"**
- Clear Metro cache: `expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`

**3. Authentication not persisting**
- Check AsyncStorage permissions
- Verify token is being stored
- Check console for errors

**4. UI not updating**
- Check state management
- Verify API calls completing
- Add refresh functionality

## Testing

### Manual Testing Checklist
- [ ] User can sign up with new account
- [ ] User can login with existing account
- [ ] Dashboard shows correct stats
- [ ] User can add a bike
- [ ] User can edit/delete bike
- [ ] User can add expense
- [ ] User can filter/search expenses
- [ ] User can edit/delete expense
- [ ] User can logout
- [ ] App persists login after restart

## Building for Production

### iOS
1. Install EAS CLI: `npm install -g eas-cli`
2. Configure: `eas build:configure`
3. Build: `eas build --platform ios`

### Android
1. Configure: `eas build:configure`
2. Build: `eas build --platform android`

## Deployment

### Backend
Deploy backend to:
- Railway
- Render
- DigitalOcean
- AWS/GCP/Azure

Update `BACKEND_URL` in app to production URL.

### Mobile App
Publish to:
- Apple App Store (iOS)
- Google Play Store (Android)

## Performance Tips

1. **Image Optimization**: Use optimized images and proper sizes
2. **List Rendering**: Use FlatList for long lists instead of ScrollView
3. **Memoization**: Use React.memo for expensive components
4. **API Calls**: Implement debouncing for search
5. **AsyncStorage**: Don't store large amounts of data

## Security Best Practices

1. Never commit sensitive data
2. Use environment variables for API URLs
3. Implement proper token refresh
4. Add request timeouts
5. Validate all user inputs
6. Use HTTPS in production

## Support

For issues:
1. Check console logs
2. Review error messages
3. Check backend logs
4. Verify network requests in debugger
5. Open issue on GitHub

## Version History

- **v1.0.0** - Initial release with full feature parity with web app
