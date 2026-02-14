# Analytics Setup Guide - mTorq App

This guide will help you set up Mixpanel analytics for comprehensive user tracking in the mTorq mobile app.

## 📊 What's Tracked

The mTorq app tracks **everything** your users do:

### 🔐 Authentication Events
- ✅ Signup (email/Google)
- ✅ Login (email/Google)
- ✅ Logout
- ✅ User identification with properties

### 🏍️ Bike Management
- ✅ Bike added (with details: brand, model, registration, image)
- ✅ Bike edited (tracking which fields changed)
- ✅ Bike deleted
- ✅ Bike detail viewed

### 💰 Expense Management
- ✅ Expense added (type, amount, fuel details, odometer)
- ✅ Expense edited (tracking which fields changed)
- ✅ Expense deleted
- ✅ Expense filtered
- ✅ Expense searched

### 📄 Document/Vault Events
- ✅ Document uploaded (type, file size)
- ✅ Document viewed
- ✅ Document downloaded
- ✅ Document deleted

### 📱 Screen Views
- ✅ Automatic tracking of all screen navigation
- ✅ Screens tracked: Auth, Dashboard, Analytics, Expenses, Bikes, Settings, BikeDetail, Vault, Add

### 🎯 User Actions
- ✅ Quick actions (add expense button)
- ✅ Profile updates (name changes)
- ✅ Password changes
- ✅ App opened/backgrounded

### 👤 User Properties
- ✅ Email
- ✅ Name
- ✅ Sign-up date
- ✅ Total bikes count
- ✅ Total expenses count
- ✅ Total documents count
- ✅ Expense breakdown by type

---

## 🚀 Setup Instructions

### Step 1: Create Mixpanel Account

1. Go to [https://mixpanel.com](https://mixpanel.com)
2. Sign up for a free account (100K events/month free)
3. Create a new project called "mTorq"

### Step 2: Get Your Project Token

1. In Mixpanel, go to **Settings** → **Project Settings**
2. Copy your **Project Token** (it looks like: `abc123def456ghi789jkl`)
3. Save it for the next step

### Step 3: Configure Environment Variable

1. Open your `.env` file in the `app/` directory
2. Find the line:
   ```bash
   EXPO_PUBLIC_MIXPANEL_TOKEN=YOUR_MIXPANEL_TOKEN_HERE
   ```
3. Replace `YOUR_MIXPANEL_TOKEN_HERE` with your actual token:
   ```bash
   EXPO_PUBLIC_MIXPANEL_TOKEN=abc123def456ghi789jkl
   ```
4. Save the file

### Step 4: Restart Your App

```bash
# Stop the current Expo server (Ctrl+C)
# Then restart:
npm start

# Or for specific platforms:
npm run ios
npm run android
```

### Step 5: Verify Analytics

1. Open your app and perform some actions:
   - Sign up or log in
   - Add a bike
   - Add an expense
   - Navigate between screens

2. Go to Mixpanel dashboard → **Events** → **Live View**
3. You should see events appearing in real-time! 🎉

---

## 📈 Viewing Your Analytics

### Events Dashboard
View all tracked events in real-time:
- Go to **Events** in Mixpanel

### User Profiles
See individual user journeys:
- Go to **Users** → **Explore** → Select a user

### Insights & Reports
Create custom reports:
- Go to **Insights** to create custom reports
- **Funnels** to track conversion paths (e.g., Signup → Add Bike → Add Expense)
- **Retention** to see how often users return

### Common Reports to Create

#### 1. Signup Funnel
Track user onboarding:
1. Signup
2. Bike Added
3. Expense Added

#### 2. User Engagement
- Screen views per session
- Most used features
- Daily/weekly active users

#### 3. Feature Adoption
- Document upload rate
- Fuel tracking usage
- Average expenses per bike

---

## 🔍 Event Details

### Authentication Events

**Signup**
```javascript
{
  method: 'email' | 'google',
  email: 'user@example.com'
}
```

**Login**
```javascript
{
  method: 'email' | 'google',
  email: 'user@example.com'
}
```

### Bike Events

**Bike Added**
```javascript
{
  brand: 'Royal Enfield',
  model: 'Classic 350',
  has_registration: true,
  has_image: false
}
```

**Bike Edited**
```javascript
{
  bike_id: '123',
  fields_changed: ['brand', 'registration']
}
```

### Expense Events

**Expense Added**
```javascript
{
  type: 'Fuel',
  amount: 500,
  bike_id: '123',
  has_odometer: true,
  has_notes: false,
  is_fuel: true,
  has_fuel_details: true,
  is_full_tank: true
}
```

**Expense Edited**
```javascript
{
  expense_id: '456',
  type: 'Fuel',
  fields_changed: ['amount', 'odometer']
}
```

### Document Events

**Document Uploaded**
```javascript
{
  type: 'RC Certificate',
  bike_id: '123',
  file_type: 'pdf',
  file_size: 524288
}
```

### Screen View

**Screen View** (auto-tracked)
```javascript
{
  screen_name: 'Dashboard' | 'Bikes' | 'Expenses' | 'Analytics' | 'Settings' | 'Auth' | 'Add' | 'BikeDetail' | 'Vault'
}
```

---

## 🎯 User Properties

Mixpanel automatically tracks these user properties:

### Standard Properties
- `$email` - User's email
- `$name` - User's name
- `created_at` - Account creation date

### Custom Properties (Auto-incremented)
- `total_bikes` - Number of bikes owned
- `total_expenses` - Total expense records
- `total_documents` - Total documents uploaded
- `total_fuel_expenses` - Fuel expenses count
- `total_service_expenses` - Service expenses count
- (and so on for each expense type)

---

## 🔒 Privacy & Compliance

### What We Track
- ✅ User actions and feature usage
- ✅ Screen navigation
- ✅ Aggregated statistics
- ✅ Error events (for debugging)

### What We DON'T Track
- ❌ Sensitive personal data
- ❌ Location data (unless you add it)
- ❌ Device identifiers
- ❌ Passwords or payment info

### GDPR Compliance
To make your analytics GDPR compliant:

1. **Add consent banner** (if required by your region)
2. **Implement opt-out** in Settings screen
3. **Data deletion**: Call `analyticsService.reset()` when user requests data deletion

---

## 🛠️ Customization

### Add New Events

To track a new event, use the analytics service:

```typescript
import analyticsService from '../services/analytics';

// Track a custom event
await analyticsService.track('Custom Event Name', {
  property1: 'value1',
  property2: 123,
  property3: true,
});
```

### Add User Properties

```typescript
// Set user properties
await analyticsService.setUserProperties({
  subscription_tier: 'premium',
  bike_count: 3,
  preferred_fuel_type: 'Petrol',
});
```

### Increment Properties

```typescript
// Increment a property
await analyticsService.incrementUserProperty('total_logins', 1);
```

---

## 📊 Advanced Features

### Create Custom Funnels

1. Go to **Funnels** in Mixpanel
2. Click "Create Funnel"
3. Add steps:
   - Step 1: Signup
   - Step 2: Bike Added
   - Step 3: Expense Added
4. Analyze conversion rates

### Cohort Analysis

1. Go to **Users** → **Cohorts**
2. Create cohorts like:
   - Users who added fuel expenses
   - Users with 2+ bikes
   - Active users this week

### A/B Testing

Track different user experiences:
```typescript
await analyticsService.setUserProperties({
  ab_test_group: 'variant_A'
});
```

---

## 🐛 Troubleshooting

### Events Not Appearing?

1. **Check token**: Verify your Mixpanel token in `.env`
2. **Restart app**: Kill and restart Expo
3. **Check console**: Look for Mixpanel initialization logs
4. **Check network**: Ensure device has internet connection

### Console Logs

Look for these logs:
- ✅ `✅ Mixpanel Analytics initialized` - Success!
- ⚠️ `⚠️  Mixpanel token not configured` - Token missing
- ❌ `❌ Failed to initialize Mixpanel` - Check error details

### Testing Locally

```typescript
// Check if analytics is working
console.log('Tracking test event');
await analyticsService.track('Test Event', { test: true });
```

Then check Mixpanel Live View for the event.

---

## 📚 Resources

- [Mixpanel Documentation](https://docs.mixpanel.com/)
- [React Native SDK Guide](https://docs.mixpanel.com/docs/tracking/how-tos/react-native)
- [Event Best Practices](https://docs.mixpanel.com/docs/tracking/how-tos/events-and-properties)
- [GDPR Compliance](https://docs.mixpanel.com/docs/privacy/gdpr-compliance)

---

## 🎉 You're All Set!

Your mTorq app is now tracking comprehensive analytics. Every user action, screen view, and feature usage is being recorded to help you understand user behavior and improve your app.

**Pro Tip**: Regularly check your Mixpanel dashboard to:
- Identify most-used features
- Find friction points in user journey
- Optimize conversion funnels
- Track user retention

Happy tracking! 📊✨
