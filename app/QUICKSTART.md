# 🚀 Quick Start Guide - mTorq Mobile App

Follow these steps to get the mobile app running in under 5 minutes!

## Step 1: Install Dependencies (2 minutes)

```bash
cd app
npm install
```

Wait for all packages to install.

## Step 2: Configure Backend URL (1 minute)

Open `src/config/api.config.ts` and update the `BACKEND_URL`:

```typescript
export const API_CONFIG = {
  BACKEND_URL: "http://localhost:8000", // ← Change this!
  // ... rest of config
};
```

**Choose the right URL:**

| Platform         | Backend URL                 |
| ---------------- | --------------------------- |
| iOS Simulator    | `http://localhost:8000`     |
| Android Emulator | `http://10.0.2.2:8000`      |
| Physical Device  | `http://YOUR_LOCAL_IP:8000` |
| Production       | `https://your-api.com`      |

**Find your local IP:**

- Mac/Linux: Open Terminal → `ifconfig | grep "inet "`
- Windows: Open CMD → `ipconfig`

## Step 3: Start Backend Server (1 minute)

Open a new terminal:

```bash
cd backend
python -m uvicorn server:app --reload --host 0.0.0.0
```

Server should start on `http://localhost:8000`

## Step 4: Start Mobile App (1 minute)

Back in the app terminal:

```bash
npm start
```

The Expo developer tools will open in your browser.

## Step 5: Run the App

### Option A: iOS Simulator (Mac only)

Press `i` in the terminal

### Option B: Android Emulator

1. Start your Android emulator first
2. Press `a` in the terminal

### Option C: Physical Device

1. Install "Expo Go" app from App Store/Play Store
2. Scan the QR code shown in terminal
3. Make sure phone and computer are on same WiFi

### Option D: Web Browser (for testing)

Press `w` in the terminal

## Step 6: Test the App!

1. **Sign Up**: Create a new account
2. **Add a Bike**: Tap Bikes → + button
3. **Add Expense**: Tap Add tab → Fill form
4. **View Dashboard**: Check your stats on Home tab

## 🎉 You're Done!

The app should be running with:

- ✅ Authentication working
- ✅ Dashboard showing stats
- ✅ All CRUD operations functional

## ⚠️ Common Issues

### "Network request failed"

- **Solution**: Check backend is running on correct URL
- For Android: Use `http://10.0.2.2:8000` NOT `localhost`
- For Device: Use your local IP, not `localhost`

### "Unable to resolve module"

```bash
# Clear cache and restart
expo start -c
```

### "Connection refused"

- **Solution**: Make sure backend is running with `--host 0.0.0.0`

```bash
python -m uvicorn server:app --reload --host 0.0.0.0
```

### App shows blank screen

- **Solution**: Check console for errors
- Make sure all dependencies installed
- Try restarting Metro bundler

## 📱 Testing Workflow

**Quick test checklist (2 minutes):**

1. ✅ Sign up → Should create account
2. ✅ Add bike → Should appear in list
3. ✅ Add expense → Should show on dashboard
4. ✅ Close app → Reopen → Should stay logged in

## 🔧 Advanced Configuration

### Change Port

Edit backend startup:

```bash
python -m uvicorn server:app --reload --host 0.0.0.0 --port 3001
```

Update `api.config.ts`:

```typescript
BACKEND_URL: 'http://localhost:3001',
```

### Use Production Backend

Update `api.config.ts`:

```typescript
BACKEND_URL: 'https://your-deployed-api.com',
```

## 📚 Next Steps

- Read [README.md](README.md) for full documentation
- Check [SETUP.md](SETUP.md) for detailed configuration
- Review [CONVERSION_SUMMARY.md](CONVERSION_SUMMARY.md) for feature details

## 💡 Tips

1. **Keep backend terminal open** - You'll see API requests in real-time
2. **Use Expo Go on device** - Easier than emulators for testing
3. **Enable reload on save** - Changes auto-refresh in Expo
4. **Check console logs** - Most errors show detailed messages
5. **Use network tab** - Expo DevTools show all API calls

## 🆘 Need Help?

1. Check console errors (they're usually descriptive)
2. Review [SETUP.md](SETUP.md) for detailed troubleshooting
3. Verify backend is running: Open `http://localhost:8000/docs` in browser
4. Try clearing Metro cache: `expo start -c`

---

**Time to get running: ~5 minutes**
**Difficulty: Easy** 🟢

Happy coding! 🚀
