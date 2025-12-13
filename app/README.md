# mTorq Mobile App

A React Native Expo mobile application for tracking bike expenses, built with TypeScript and NativeWind.

## Features

- 🔐 **Authentication**: Sign up and login functionality
- 📊 **Dashboard**: Overview of expenses with category breakdown
- 🏍️ **Bike Management**: Add, edit, and delete bikes
- 💰 **Expense Tracking**: Record and manage expenses with filtering and search
- ⚙️ **Settings**: User profile and account management
- 🎨 **Consistent UI**: Matches the web app design with dark theme

## Tech Stack

- **React Native** (0.81.5)
- **Expo** (~54.0)
- **TypeScript** (~5.9)
- **React Navigation** - Bottom tabs and stack navigation
- **NativeWind** - Tailwind CSS for React Native
- **AsyncStorage** - Local data persistence
- **Axios** - API requests
- **date-fns** - Date formatting
- **Lucide React Native** - Icons

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac) or Android Emulator

## Installation

1. Navigate to the app directory:
   ```bash
   cd app
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Update the backend URL in `src/services/api.ts`:
   ```typescript
   const BACKEND_URL = 'YOUR_BACKEND_URL'; // e.g., 'http://localhost:8000'
   ```

## Running the App

### Start the development server:
```bash
npm start
# or
yarn start
```

### Run on iOS:
```bash
npm run ios
# or
yarn ios
```

### Run on Android:
```bash
npm run android
# or
yarn android
```

### Run on Web:
```bash
npm run web
# or
yarn web
```

## Project Structure

```
app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── ModalDialog.tsx
│   │   ├── Picker.tsx
│   │   └── index.ts
│   ├── context/            # React Context providers
│   │   └── AuthContext.tsx
│   ├── navigation/         # Navigation setup
│   │   ├── RootNavigator.tsx
│   │   ├── MainNavigator.tsx
│   │   └── index.ts
│   ├── screens/            # App screens
│   │   ├── AuthScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── BikesScreen.tsx
│   │   ├── ExpensesScreen.tsx
│   │   ├── AddExpenseScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── index.ts
│   ├── services/           # API services
│   │   └── api.ts
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   └── utils/              # Utility functions
├── App.tsx                 # Root component
├── app.json               # Expo configuration
├── package.json           # Dependencies
├── tailwind.config.js     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── babel.config.js        # Babel configuration
```

## Key Features Implementation

### Authentication
- Uses AsyncStorage for token persistence
- JWT-based authentication with the backend
- Auto-login on app restart

### Dashboard
- Real-time stats display
- Category breakdown with visual progress bars
- Recent expenses list
- Pull-to-refresh functionality

### Bike Management
- Add new bikes with name, model, and registration
- Edit existing bike details
- Delete bikes with confirmation
- Image placeholder for bike visuals

### Expense Management
- Add expenses with bike selection, type, amount, date, odometer, and notes
- Filter expenses by type and bike
- Search expenses by notes or type
- Edit and delete expenses
- Visual type badges with color coding

### UI Consistency
- Matches web app's dark theme
- Glass morphism effects on cards
- Primary color: #ccfbf1 (cyan)
- Background: #09090b (near black)
- Consistent typography and spacing

## API Integration

The app connects to the FastAPI backend at the URL specified in `src/services/api.ts`. All API calls are handled through the `apiService` with automatic token injection.

### Available Endpoints:
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/bikes` - Get all bikes
- `POST /api/bikes` - Create bike
- `PUT /api/bikes/:id` - Update bike
- `DELETE /api/bikes/:id` - Delete bike
- `GET /api/expenses` - Get expenses (with filters)
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/dashboard/stats` - Get dashboard statistics

## Customization

### Changing the Backend URL
Update the `BACKEND_URL` constant in `src/services/api.ts`:
```typescript
const BACKEND_URL = 'YOUR_BACKEND_URL';
```

### Modifying Colors
Update the colors in `tailwind.config.js`:
```javascript
colors: {
  primary: '#ccfbf1',
  'primary-dark': '#99f6e4',
  'primary-foreground': '#115e59',
  background: '#09090b',
}
```

## Building for Production

### iOS:
```bash
eas build --platform ios
```

### Android:
```bash
eas build --platform android
```

## Troubleshooting

### Common Issues:

1. **Metro bundler errors**: Clear cache with `expo start -c`
2. **Module not found**: Ensure all dependencies are installed
3. **Network errors**: Check backend URL and ensure backend is running
4. **AsyncStorage warnings**: These are expected in development mode

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

© 2024 Bike Budget. All rights reserved.

## Support

For issues and questions, please open an issue in the repository.
