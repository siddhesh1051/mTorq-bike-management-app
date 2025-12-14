# 📱 Mobile PWA Testing Guide

## Testing Your PWA on Mobile Devices

There are several ways to test your PWA on mobile. Here are the best methods:

---

## Method 1: Deploy and Test (Recommended for Production)

### Quick Deploy Options:

#### Option A: Vercel (Fastest)

```bash
# Install Vercel CLI
npm install -g vercel

# From frontend folder
cd frontend
vercel --prod
```

Your app will be live at a public URL with HTTPS (required for PWA).

#### Option B: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
yarn build
netlify deploy --prod --dir=build
```

#### Option C: Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and init
firebase login
firebase init hosting

# Deploy
yarn build
firebase deploy
```

Once deployed, open the URL on your mobile device and test!

---

## Method 2: Local Network Testing (Best for Development)

### Step 1: Find Your Local IP Address

**On Mac/Linux:**

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**On Windows:**

```bash
ipconfig
```

Look for your local IP (usually starts with `192.168.x.x` or `10.0.x.x`)

### Step 2: Build and Serve

```bash
# From frontend folder
cd frontend

# Build production version
yarn build

# Serve on your local network
npx serve -s build -l 3000
```

### Step 3: Access from Mobile

**Important:** Your mobile device must be on the **same WiFi network** as your computer.

Open your mobile browser and go to:

```
http://YOUR_IP_ADDRESS:3000
```

For example:

```
http://192.168.1.100:3000
```

### ⚠️ Limitation

- Without HTTPS, some PWA features won't work (installation, service worker)
- You'll see the app but can't fully test PWA functionality

---

## Method 3: Use ngrok for HTTPS (Full PWA Testing Locally)

This is the **best method** for local testing with full PWA features!

### Step 1: Install ngrok

**On Mac:**

```bash
brew install ngrok
```

**Or download from:** https://ngrok.com/download

### Step 2: Build and Serve

```bash
# From frontend folder
cd frontend
yarn build
npx serve -s build -l 3000
```

### Step 3: Create Secure Tunnel

**In a new terminal:**

```bash
ngrok http 3000
```

You'll see output like:

```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

### Step 4: Test on Mobile

Open the `https://abc123.ngrok.io` URL on your mobile device!

✅ **Full PWA features available:**

- Service worker registration
- Offline mode
- Install prompt
- Push notifications (if implemented)

---

## Method 4: Chrome DevTools Device Emulation (Quick Testing)

While not a real device, this helps for initial testing:

### On Desktop Chrome:

1. Build and serve:

   ```bash
   yarn build
   npx serve -s build
   ```

2. Open http://localhost:3000 in Chrome

3. Press `F12` (DevTools)

4. Click device toggle icon (📱) or press `Cmd+Shift+M` (Mac) / `Ctrl+Shift+M` (Windows)

5. Select a mobile device from dropdown

6. Test PWA features in Application tab

---

## Testing Checklist for Mobile

### iOS (Safari)

1. ✅ **Open app in Safari** (not Chrome!)

   - PWA features only work in Safari on iOS

2. ✅ **Check service worker**

   - Safari doesn't have DevTools on mobile
   - Service worker should register automatically

3. ✅ **Test installation**

   - Tap share button (⬆️) at bottom
   - Scroll down and tap "Add to Home Screen"
   - Customize name if desired
   - Tap "Add"

4. ✅ **Verify installation**

   - Icon appears on home screen
   - Tap icon to open app
   - Should open in standalone mode (no Safari UI)

5. ✅ **Test offline**
   - Open the app once while online
   - Enable Airplane mode
   - Close and reopen the app
   - Should still work! 🎉

### Android (Chrome)

1. ✅ **Open app in Chrome**

2. ✅ **Check for install prompt**

   - Should see banner: "Add mTorq to Home screen"
   - Or tap menu (⋮) → "Install app"

3. ✅ **Test installation**

   - Tap "Install" or "Add to Home screen"
   - App installs like native app

4. ✅ **Verify installation**

   - Icon appears in app drawer
   - Tap to open
   - Opens in standalone mode

5. ✅ **Test offline**

   - Open app while online
   - Enable Airplane mode
   - Close and reopen app
   - Should work offline! 🎉

6. ✅ **Check in Chrome flags**
   - Open `chrome://apps` in Chrome on mobile
   - Should see your app listed

---

## Debugging on Mobile

### iOS Safari (on Mac only)

1. Connect iPhone via USB
2. Enable Web Inspector on iPhone:
   - Settings → Safari → Advanced → Web Inspector
3. On Mac Safari:
   - Develop menu → [Your iPhone] → [Your webpage]
4. DevTools opens for mobile Safari!

### Android Chrome

1. Connect Android via USB
2. Enable Developer Options and USB Debugging on Android
3. Open Chrome on desktop
4. Go to `chrome://inspect`
5. Find your device and click "Inspect"
6. Full DevTools for mobile Chrome!

---

## Quick Start: Recommended Testing Flow

### For Quick Testing:

```bash
# Terminal 1: Serve the app
cd frontend
yarn build
npx serve -s build

# Terminal 2: Create secure tunnel
ngrok http 3000
```

Then:

1. Copy the ngrok HTTPS URL
2. Open on your mobile device
3. Test all PWA features!

### For Production Testing:

```bash
# Deploy to Vercel
cd frontend
vercel --prod
```

Then test on the deployed URL.

---

## Common Issues & Solutions

### "Add to Home Screen" not showing on iOS

- ✅ Must use Safari (not Chrome)
- ✅ Must be HTTPS or localhost
- ✅ Must have valid manifest.json
- ✅ Must have service worker registered

### Install prompt not showing on Android

- ✅ Must be HTTPS
- ✅ Must meet PWA criteria (manifest + service worker)
- ✅ Wait a few seconds after page load
- ✅ Try menu (⋮) → "Install app"

### Service worker not registering

- ✅ Must be production build (`yarn build`)
- ✅ Must be HTTPS (or localhost)
- ✅ Check for errors in mobile debugging

### App not working offline

- ✅ Must visit while online first
- ✅ Service worker must be fully installed
- ✅ Wait a few seconds after first visit
- ✅ Check cache is populated (use debugging)

---

## Video Recording Your Test

To share results with your team:

### iOS

- Screen recording built-in: Control Center → Screen Recording

### Android

- Built-in screen recorder: Quick settings → Screen recorder
- Or use `adb` from computer:
  ```bash
  adb shell screenrecord /sdcard/pwa-test.mp4
  ```

---

## Testing Different Scenarios

### 1. Fresh Install

```bash
# Clear all app data first
- iOS: Settings → Safari → Clear History and Website Data
- Android: Settings → Apps → Chrome → Storage → Clear data
```

### 2. Offline Mode

```bash
# Test these scenarios:
1. Online → Offline (should work)
2. Offline first visit (should show offline page)
3. Cached API calls (should show cached data)
```

### 3. Update Flow

```bash
# Make changes to your app
1. Make code changes
2. Build and deploy new version
3. Open app on mobile (old version loads)
4. Close and reopen (new version installs in background)
5. Close and reopen again (new version shows)
```

---

## Performance Testing

### Lighthouse on Mobile

Use Chrome DevTools device emulation:

1. Open site in Chrome desktop
2. DevTools → Lighthouse
3. Select "Mobile" device
4. Select "Progressive Web App" category
5. Generate report
6. Aim for 90+ score! 🎯

---

## Need Help?

- Check browser console for errors
- Use mobile debugging tools (see above)
- Test on multiple devices if possible
- Share your ngrok URL with team for testing

---

## Quick Reference

| What to Test   | iOS Safari           | Android Chrome                   |
| -------------- | -------------------- | -------------------------------- |
| Installation   | Share → Add to Home  | Menu → Install                   |
| Debugging      | Mac Safari → Develop | chrome://inspect                 |
| Offline        | Airplane mode        | Airplane mode                    |
| Service Worker | Automatic            | chrome://serviceworker-internals |
| Clear Cache    | Settings → Safari    | Settings → Chrome                |

---

**Pro Tip:** Use ngrok for the most authentic testing experience during development. It gives you HTTPS and full PWA capabilities without deploying!

Happy testing! 🚀📱
