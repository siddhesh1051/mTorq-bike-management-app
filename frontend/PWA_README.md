# PWA Support for mTorq

This React app now has full Progressive Web App (PWA) support!

## Features

### ✅ Offline Capability

- The app works offline after the first visit
- Service worker caches all static assets
- API requests are cached with a stale-while-revalidate strategy

### ✅ Installable

- Users can install the app on their devices
- Works on iOS, Android, and Desktop
- Appears like a native app once installed

### ✅ App Manifest

- Custom app name and description
- Theme colors configured
- App icons for different sizes

### ✅ Caching Strategies

- **Static Resources (CSS/JS)**: Stale-while-revalidate
- **Images**: Cache-first with 30-day expiration
- **API Calls**: Stale-while-revalidate with 5-minute expiration
- **App Shell**: Served from cache for instant loading

## Files Added

1. **public/manifest.json** - PWA manifest file
2. **src/service-worker.js** - Custom service worker with Workbox
3. **src/serviceWorkerRegistration.js** - Service worker registration logic
4. **public/favicon.svg** - App icon (SVG)
5. **public/logo192.svg** - 192x192 app icon
6. **public/logo512.svg** - 512x512 app icon

## How It Works

### Service Worker

The service worker is automatically generated during production builds using Workbox. It:

- Precaches all static assets
- Implements runtime caching strategies
- Enables offline functionality
- Handles app updates gracefully

### Development vs Production

- **Development**: Service worker is registered but with debugging enabled
- **Production**: Full PWA functionality with optimized caching

## Installation Instructions

### For Users

#### On Mobile (iOS/Android):

1. Open the app in Safari (iOS) or Chrome (Android)
2. Tap the share button (iOS) or menu (Android)
3. Select "Add to Home Screen"
4. The app will appear on your home screen like a native app

#### On Desktop (Chrome/Edge):

1. Open the app in Chrome or Edge
2. Look for the install icon in the address bar
3. Click "Install" when prompted
4. The app will open in its own window

## Development

### Running in Development

```bash
yarn start
```

Service worker is active but allows hot reloading.

### Building for Production

```bash
yarn build
```

This creates an optimized production build with the service worker fully configured.

### Testing PWA Features

1. **Build the production version:**

   ```bash
   yarn build
   ```

2. **Serve the build locally:**

   ```bash
   npx serve -s build
   ```

3. **Open Chrome DevTools:**
   - Go to Application tab
   - Check Service Workers section
   - Check Manifest section
   - Use Lighthouse to audit PWA score

## Customization

### Update App Name and Colors

Edit `public/manifest.json`:

```json
{
  "short_name": "YourAppName",
  "name": "Your App Full Name",
  "theme_color": "#your-color",
  "background_color": "#your-color"
}
```

### Update Caching Strategy

Edit `src/service-worker.js` to modify caching strategies for different resources.

### Update Icons

Replace the SVG icons in the `public` folder:

- `favicon.svg` - Browser favicon
- `logo192.svg` - Small app icon
- `logo512.svg` - Large app icon

For production, consider using PNG format:

- Use tools like https://realfavicongenerator.net/
- Generate PNG versions: logo192.png and logo512.png
- Update manifest.json to reference .png files

## Disabling PWA

To disable PWA functionality, change in `src/index.js`:

```javascript
// Change from:
serviceWorkerRegistration.register();

// To:
serviceWorkerRegistration.unregister();
```

## Browser Support

- ✅ Chrome (Desktop & Mobile)
- ✅ Edge (Desktop & Mobile)
- ✅ Safari (iOS 11.3+)
- ✅ Firefox (Desktop & Mobile)
- ✅ Samsung Internet
- ✅ Opera

## Troubleshooting

### Service Worker Not Updating

1. Close all tabs with the app
2. Clear site data in browser DevTools
3. Hard reload (Ctrl/Cmd + Shift + R)

### PWA Not Installable

1. Check manifest.json is accessible
2. Verify icons are present
3. Ensure HTTPS (required for PWA)
4. Check Console for errors

### Offline Mode Not Working

1. Visit the app at least once while online
2. Check Service Worker is registered in DevTools
3. Verify cache is populated in Application tab

## Resources

- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)

## Notes

- The service worker only runs in production mode
- HTTPS is required for PWA features (except localhost)
- First visit requires internet; subsequent visits work offline
- Cache is automatically updated when new versions are deployed
