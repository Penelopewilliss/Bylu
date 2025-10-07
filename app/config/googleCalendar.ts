// Google Calendar Configuration
// 
// SETUP INSTRUCTIONS:
// 1. Go to Google Cloud Console (https://console.cloud.google.com/)
// 2. Create a new project or select existing one
// 3. Enable Google Calendar API
// 4. Create OAuth 2.0 credentials
// 5. Add your redirect URI: exp://127.0.0.1:19000/-- (for development)
// 6. Replace the values below with your actual credentials

export const GOOGLE_CALENDAR_CONFIG = {
  // Replace with your actual Google OAuth client ID
  CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
  
  // Replace with your actual Google OAuth client secret (only for server-side)
  CLIENT_SECRET: 'YOUR_GOOGLE_CLIENT_SECRET',
  
  // Demo mode (set to false when you have real credentials)
  DEMO_MODE: true,
  
  // OAuth scopes for calendar access
  SCOPES: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/calendar.readonly',
  ],
  
  // API endpoints
  ENDPOINTS: {
    AUTH: 'https://accounts.google.com/o/oauth2/v2/auth',
    TOKEN: 'https://oauth2.googleapis.com/token',
    REVOKE: 'https://oauth2.googleapis.com/revoke',
  },
};

// Development note: For production, store sensitive credentials securely
// Consider using environment variables or a secure key management service