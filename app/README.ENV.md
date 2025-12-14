# Environment Configuration

This project uses environment variables to manage configuration across different environments (development, staging, production).

## Setup

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Update the `.env` file with your values:**
   - For **iOS Simulator**: Use `http://localhost:8000`
   - For **Android Emulator**: Use `http://10.0.2.2:8000`
   - For **Physical Device**: Use your machine's local IP (e.g., `http://192.168.1.57:8000`)
     - Find your IP: `ipconfig getifaddr en0` (macOS) or `ipconfig` (Windows)
   - For **Production**: Use your deployed API URL (e.g., `https://api.mtorq.com`)

3. **Restart Expo:**
   ```bash
   npx expo start --clear
   ```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `EXPO_PUBLIC_API_URL` | Backend API base URL | `http://192.168.1.57:8000` |

## Important Notes

- ✅ `.env` is in `.gitignore` - your secrets are safe
- ✅ `.env.example` is committed - shows required variables
- ⚠️ Always restart Expo after changing `.env` values
- ⚠️ Physical devices must be on the same WiFi network as your backend

## Troubleshooting

**"Cannot connect to server" error:**
1. Check if backend is running: `curl http://YOUR_IP:8000`
2. Verify you're on the same WiFi network
3. Check firewall settings
4. Restart Expo with `--clear` flag

**Environment variable not updating:**
1. Stop Expo server (Ctrl+C)
2. Clear cache: `npx expo start --clear`
3. Reload app in Expo Go
