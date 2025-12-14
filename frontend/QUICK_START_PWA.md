# 🚀 Quick Start - PWA Testing

## Your PWA is ready! Here's how to test it:

### 1. Build the Production Version

```bash
cd frontend
yarn build
```

### 2. Serve the Build Locally

```bash
npx serve -s build
```

This will start a local server at `http://localhost:3000`

### 3. Test in Chrome

#### Open DevTools (F12 or Cmd+Option+I)

**Application Tab:**

- ✅ Service Workers: Should show "activated and running"
- ✅ Manifest: Should show "mTorq - Expense Tracker"
- ✅ Cache Storage: Should show cached files

**Lighthouse Tab:**

- Click "Generate report"
- Select "Progressive Web App" category
- Score should be 90+ 🎉

### 4. Test Installation

#### Desktop (Chrome/Edge):

1. Look for install button (⊕) in address bar
2. Click to install
3. App opens in standalone window!

#### Mobile:

1. Open in mobile browser
2. Browser menu > "Add to Home Screen"
3. Icon appears on home screen!

### 5. Test Offline

1. With the app open, open DevTools
2. Go to Network tab
3. Check "Offline" checkbox
4. Refresh the page
5. App still works! 🎉

## What to Check

✅ Manifest loads (`/manifest.json`)
✅ Service worker registers
✅ Icons display correctly
✅ Install prompt appears
✅ Offline mode works
✅ App has standalone display

## Troubleshooting

**Service worker not registering?**

- Make sure you built for production (`yarn build`)
- Service workers don't run in development mode fully

**Install prompt not showing?**

- Wait a few seconds after page load
- Try on mobile device or use Chrome on desktop
- Check manifest is valid in DevTools

**Offline not working?**

- Visit online at least once first
- Check service worker is active in DevTools
- Verify cache is populated

## Deploy to Production

Once tested locally, deploy to your hosting provider.

**Requirements:**

- ✅ HTTPS enabled (required for PWA)
- ✅ Build artifacts from `build/` folder
- ✅ Proper server configuration for SPA

**Recommended Hosts:**

- Vercel
- Netlify
- Firebase Hosting
- AWS S3 + CloudFront

All handle PWA automatically! 🚀

---

**Questions?** Check `PWA_README.md` for detailed docs.
