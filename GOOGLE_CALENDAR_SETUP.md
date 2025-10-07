# Google Calendar Integration Setup Guide

## 🚀 Quick Setup Steps

### 1. Google Cloud Console Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create or Select Project**: 
   - Create a new project or select an existing one
   - Name it something like "Bylu Calendar App"
   - **⚠️ IMPORTANT**: Enable billing (required for API access, free tier is usually sufficient)

3. **Enable Google Calendar API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

4. **Configure OAuth Consent Screen** (Required before creating credentials):
   - Go to "APIs & Services" > "OAuth consent screen"
   - Choose "External" user type
   - Fill in required fields:
     - **App name**: Bylu
     - **User support email**: Your email
     - **Developer contact information**: Your email
   - **Add Test Users**: Add your email address to test the app during development

5. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application" as the application type
   - **Name**: Bylu Mobile App
   - Add authorized redirect URIs:
     - For development: `exp://127.0.0.1:19000/--`
     - For production: Your actual app redirect URI

### 2. Update Configuration

1. **Edit `/app/config/googleCalendar.ts`**:
   ```typescript
   export const GOOGLE_CALENDAR_CONFIG = {
     CLIENT_ID: 'your-actual-client-id.apps.googleusercontent.com',
     CLIENT_SECRET: 'your-actual-client-secret', // Only if needed
     // ... rest of config
   };
   ```

2. **For Production**: Use environment variables or secure storage

### 3. Test the Integration

1. **Run the app**: `npx expo start`
2. **Go to Settings** (🌸 tab)
3. **Open Calendar Settings**
4. **Test "Connect Google Calendar"**

## 🎯 Features Implemented

✅ **Complete OAuth Flow**
- Secure Google authentication
- Token management and refresh
- Automatic re-authentication

✅ **Bidirectional Sync**
- Import events from Google Calendar
- Export local events to Google Calendar
- Conflict resolution and updates

✅ **Smart Sync Options**
- Manual sync
- Hourly auto-sync
- Daily auto-sync
- Sync frequency preferences

✅ **Offline Support**
- Queue sync actions when offline
- Automatic sync when back online
- Visual sync status indicators

✅ **Beautiful UI**
- Pink girly theme throughout
- Sync statistics and status
- Error handling and feedback
- Settings modal integration

## 🛠️ Advanced Configuration

### Environment Variables (Production)
```bash
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Custom Scopes (if needed)
```typescript
SCOPES: [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
],
```

## 🎨 Integration Points

- **Settings Screen**: Add calendar settings button
- **Calendar Screen**: Displays synced events with visual indicators
- **Dashboard**: Shows sync status and quick actions
- **Notifications**: Sync completion alerts

## 🔒 Security Notes

- Client secrets should be stored securely in production
- Tokens are encrypted and stored locally
- OAuth flow follows Google's security best practices
- Refresh tokens handle automatic re-authentication

## 🎉 Ready to Use!

The Google Calendar sync is now fully integrated and ready for testing. Users can:

1. Connect their Google account
2. Choose sync preferences
3. Sync events automatically or manually
4. View sync status and statistics
5. Manage calendar settings easily

Your beautiful girly-themed app now has professional-grade calendar sync! 💖✨