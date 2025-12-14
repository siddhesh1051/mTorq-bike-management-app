# mTorq - Bike Expense Tracker

A comprehensive bike expense management system with web and mobile applications.

## 🎯 Features

- 🔐 User authentication (signup/login)
- 📊 Interactive dashboard with expense analytics
- 🏍️ Multi-bike management
- 💰 Expense tracking by category (Fuel, Service, Insurance, Other)
- 📱 Cross-platform: Web + Mobile (iOS & Android)
- 🎨 Modern dark UI with consistent design
- 📈 Real-time statistics and insights
- 🔍 Advanced filtering and search

## 📁 Project Structure

```
mTorq/
├── backend/              # FastAPI backend server
│   ├── server.py        # Main API server
│   └── requirements.txt # Python dependencies
├── frontend/            # React web application
│   ├── src/
│   │   ├── pages/      # Page components
│   │   ├── components/ # Reusable components
│   │   └── lib/        # Utilities
│   └── package.json
├── app/                 # React Native Expo mobile app
│   ├── src/
│   │   ├── screens/    # Mobile screens
│   │   ├── components/ # Mobile components
│   │   ├── navigation/ # Navigation setup
│   │   ├── context/    # State management
│   │   └── services/   # API integration
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16+)
- Python (3.8+)
- MongoDB
- Expo CLI (for mobile)

### Backend Setup

1. Navigate to backend directory:

   ```bash
   cd backend
   ```

2. Install Python dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Create `.env` file:

   ```env
   MONGO_URL=your_mongodb_connection_string
   DB_NAME=mtorq
   JWT_SECRET_KEY=your_secret_key
   CORS_ORIGINS=*
   ```

4. Start the server:
   ```bash
   python -m uvicorn server:app --reload
   ```
   Server runs on `http://localhost:8000`

### Web Frontend Setup

1. Navigate to frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   yarn install
   # or
   npm install
   ```

3. Create `.env` file:

   ```env
   REACT_APP_BACKEND_URL=http://localhost:8000
   ```

4. Start the development server:
   ```bash
   yarn start
   # or
   npm start
   ```
   App runs on `http://localhost:3000`

### Mobile App Setup

1. Navigate to app directory:

   ```bash
   cd app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Update backend URL in `src/services/api.ts`:

   ```typescript
   const BACKEND_URL = "http://localhost:8000"; // or your backend URL
   ```

4. Start Expo:

   ```bash
   npm start
   ```

5. Run on desired platform:
   - Press `i` for iOS
   - Press `a` for Android
   - Press `w` for web

For detailed mobile setup, see [app/SETUP.md](app/SETUP.md)

## 🛠️ Tech Stack

### Backend

- **FastAPI** - Modern Python web framework
- **MongoDB** - NoSQL database
- **Motor** - Async MongoDB driver
- **PyJWT** - JWT authentication
- **Passlib** - Password hashing

### Web Frontend

- **React 19** - UI library
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Radix UI** - Accessible components
- **Lucide React** - Icons
- **date-fns** - Date utilities

### Mobile App

- **React Native** - Mobile framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **React Navigation** - Mobile navigation
- **NativeWind** - Tailwind for RN
- **AsyncStorage** - Local storage
- **Lucide React Native** - Icons

## 📱 Mobile App Features

The mobile app provides full feature parity with the web application:

- ✅ Native authentication with token persistence
- ✅ Dashboard with real-time stats and charts
- ✅ Bike management (CRUD operations)
- ✅ Expense tracking with filtering and search
- ✅ Bottom tab navigation
- ✅ Dark theme matching web design
- ✅ Pull-to-refresh functionality
- ✅ Offline token storage
- ✅ Responsive layouts for all screen sizes

## 🎨 Design System

### Colors

- **Primary**: `#ccfbf1` (Cyan)
- **Primary Dark**: `#99f6e4`
- **Primary Foreground**: `#115e59` (Dark Teal)
- **Background**: `#09090b` (Near Black)
- **Card Background**: `rgba(9, 9, 11, 0.7)` (Glass effect)

### Typography

- **Heading**: Manrope
- **Body**: IBM Plex Sans
- **Monospace**: JetBrains Mono

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - User login

### Bikes

- `GET /api/bikes` - List all bikes
- `POST /api/bikes` - Create bike
- `PUT /api/bikes/:id` - Update bike
- `DELETE /api/bikes/:id` - Delete bike

### Expenses

- `GET /api/expenses` - List expenses (with filters)
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Dashboard

- `GET /api/dashboard/stats` - Get statistics

## 📊 Database Schema

### Users Collection

```json
{
  "id": "uuid",
  "email": "string",
  "password_hash": "string",
  "name": "string",
  "created_at": "datetime"
}
```

### Bikes Collection

```json
{
  "id": "uuid",
  "user_id": "string",
  "name": "string",
  "model": "string",
  "registration": "string",
  "created_at": "datetime"
}
```

### Expenses Collection

```json
{
  "id": "uuid",
  "user_id": "string",
  "bike_id": "string",
  "type": "Fuel|Service|Insurance|Other",
  "amount": "number",
  "date": "string",
  "odometer": "number?",
  "notes": "string?",
  "created_at": "datetime"
}
```

## 🧪 Testing

### Backend

```bash
cd backend
pytest
```

### Frontend

```bash
cd frontend
npm test
```

## 📦 Building for Production

### Web Frontend

```bash
cd frontend
npm run build
```

### Mobile App

**iOS:**

```bash
cd app
eas build --platform ios
```

**Android:**

```bash
cd app
eas build --platform android
```

## 🚢 Deployment

### Backend

Deploy to:

- Railway
- Render
- DigitalOcean
- AWS/GCP/Azure

### Web Frontend

Deploy to:

- Vercel
- Netlify
- AWS S3 + CloudFront

### Mobile App

Publish to:

- Apple App Store
- Google Play Store

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Environment variables for secrets
- Token expiration (7 days)
- Secure password requirements

## 📝 License

© 2024 Bike Budget. All rights reserved.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📧 Support

For issues and questions:

- Open an issue on GitHub
- Check documentation in each folder
- Review setup guides

## 🗺️ Roadmap

- [ ] Push notifications for expense reminders
- [ ] Expense analytics and insights
- [ ] Export data to CSV/PDF
- [ ] Multi-currency support
- [ ] Expense categories customization
- [ ] Dark/Light theme toggle
- [ ] Social features (share bikes/expenses)
- [ ] Integration with fuel price APIs

## 📸 Screenshots

### Web Application

- Modern dashboard with expense breakdown
- Responsive design for mobile and desktop
- Dark theme with glass morphism effects

### Mobile Application

- Native iOS and Android experience
- Bottom tab navigation
- Pull-to-refresh functionality
- Consistent UI with web app

---

Built with ❤️ for bike enthusiasts
