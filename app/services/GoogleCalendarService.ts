import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { GOOGLE_CALENDAR_CONFIG } from '../config/googleCalendar';

// Complete the auth session with web browser
WebBrowser.maybeCompleteAuthSession();

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  colorId?: string;
  status: string;
  created: string;
  updated: string;
}

interface CalendarSyncConfig {
  enabled: boolean;
  defaultCalendarId: string;
  syncFrequency: 'manual' | 'hourly' | 'daily';
  lastSyncTime: string | null;
}

class GoogleCalendarService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private calendar: any = null;
  private syncConfig: CalendarSyncConfig = {
    enabled: false,
    defaultCalendarId: 'primary',
    syncFrequency: 'manual',
    lastSyncTime: null,
  };

  // OAuth configuration - Using config file
  private readonly CLIENT_ID = GOOGLE_CALENDAR_CONFIG.CLIENT_ID;
  private readonly CLIENT_SECRET = GOOGLE_CALENDAR_CONFIG.CLIENT_SECRET;
  private readonly REDIRECT_URI = AuthSession.makeRedirectUri({
    scheme: 'exp',
  });

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      // Load stored tokens
      const storedAccessToken = await AsyncStorage.getItem('google_access_token');
      const storedRefreshToken = await AsyncStorage.getItem('google_refresh_token');
      const storedConfig = await AsyncStorage.getItem('calendar_sync_config');

      if (storedAccessToken) {
        this.accessToken = storedAccessToken;
      }

      if (storedRefreshToken) {
        this.refreshToken = storedRefreshToken;
      }

      if (storedConfig) {
        this.syncConfig = { ...this.syncConfig, ...JSON.parse(storedConfig) };
      }

      // Initialize Google Calendar client if we have access token
      if (this.accessToken) {
        await this.initializeCalendarClient();
      }

      console.log('📅 Google Calendar service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Google Calendar auth:', error);
    }
  }

  private async initializeCalendarClient() {
    try {
      // We'll use direct HTTP calls instead of googleapis library
      // The access token is sufficient for API calls
      console.log('📅 Calendar client ready for HTTP calls');
    } catch (error) {
      console.error('❌ Failed to initialize calendar client:', error);
    }
  }

  public async authenticate(): Promise<boolean> {
    try {
      const request = new AuthSession.AuthRequest({
        clientId: this.CLIENT_ID,
        scopes: GOOGLE_CALENDAR_CONFIG.SCOPES,
        redirectUri: this.REDIRECT_URI,
        responseType: AuthSession.ResponseType.Code,
        extraParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      });

      const result = await request.promptAsync({
        authorizationEndpoint: GOOGLE_CALENDAR_CONFIG.ENDPOINTS.AUTH,
      });

      if (result.type === 'success' && result.params.code) {
        // Exchange code for tokens
        const tokenResponse = await fetch(GOOGLE_CALENDAR_CONFIG.ENDPOINTS.TOKEN, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: this.CLIENT_ID,
            client_secret: this.CLIENT_SECRET,
            code: result.params.code,
            grant_type: 'authorization_code',
            redirect_uri: this.REDIRECT_URI,
          }).toString(),
        });

        const tokens = await tokenResponse.json();

        if (tokens.access_token) {
          this.accessToken = tokens.access_token;
          this.refreshToken = tokens.refresh_token;

          // Store tokens securely
          if (this.accessToken) {
            await AsyncStorage.setItem('google_access_token', this.accessToken);
          }
          if (this.refreshToken) {
            await AsyncStorage.setItem('google_refresh_token', this.refreshToken);
          }

          // Initialize calendar client
          await this.initializeCalendarClient();

          // Enable sync by default after successful auth
          this.syncConfig.enabled = true;
          await this.saveSyncConfig();

          console.log('✅ Google Calendar authentication successful');
          return true;
        }
      }

      console.log('❌ Google Calendar authentication failed');
      return false;
    } catch (error) {
      console.error('❌ Error during Google Calendar authentication:', error);
      return false;
    }
  }

  public async refreshAccessToken(): Promise<boolean> {
    try {
      if (!this.refreshToken) {
        console.log('❌ No refresh token available');
        return false;
      }

      const response = await fetch(GOOGLE_CALENDAR_CONFIG.ENDPOINTS.TOKEN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.CLIENT_ID,
          client_secret: this.CLIENT_SECRET,
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token',
        }).toString(),
      });

      const tokens = await response.json();

      if (tokens.access_token) {
        this.accessToken = tokens.access_token;
        if (this.accessToken) {
          await AsyncStorage.setItem('google_access_token', this.accessToken);
        }
        
        // Reinitialize calendar client with new token
        await this.initializeCalendarClient();
        
        console.log('✅ Google Calendar access token refreshed');
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Error refreshing Google Calendar token:', error);
      return false;
    }
  }

  public async getCalendars(): Promise<any[]> {
    try {
      if (!this.accessToken) {
        console.log('❌ No access token available');
        return [];
      }

      const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('❌ Error fetching calendars:', error);
      
      // Try refreshing token if unauthorized
      if (error instanceof Error && 'status' in error && (error as any).status === 401) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          return this.getCalendars(); // Retry
        }
      }
      
      return [];
    }
  }

  public async syncEvents(localEvents: any[]): Promise<{
    imported: number;
    exported: number;
    updated: number;
    errors: string[];
  }> {
    try {
      if (!this.accessToken || !this.syncConfig.enabled) {
        return { imported: 0, exported: 0, updated: 0, errors: ['Calendar not initialized or sync disabled'] };
      }

      const result = {
        imported: 0,
        exported: 0,
        updated: 0,
        errors: [] as string[],
      };

      // Get events from Google Calendar
      const now = new Date();
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const eventsUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(this.syncConfig.defaultCalendarId)}/events`;
      const params = new URLSearchParams({
        timeMin: oneMonthAgo.toISOString(),
        timeMax: oneMonthLater.toISOString(),
        singleEvents: 'true',
        orderBy: 'startTime',
      });

      const response = await fetch(`${eventsUrl}?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const googleEventsData = await response.json();

      // Import Google events to local storage
      const googleEventsList = googleEventsData.items || [];
      for (const googleEvent of googleEventsList) {
        try {
          // Convert Google event to local format
          const localEvent = this.convertGoogleEventToLocal(googleEvent);
          
          // Check if event already exists locally
          const existingLocal = localEvents.find(e => e.googleId === googleEvent.id);
          
          if (!existingLocal) {
            // Import new event
            // You'll need to implement saving to your local storage
            result.imported++;
          } else if (new Date(googleEvent.updated) > new Date(existingLocal.lastSyncTime || 0)) {
            // Update existing event
            result.updated++;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          result.errors.push(`Failed to import event ${googleEvent.summary}: ${errorMessage}`);
        }
      }

      // Export local events to Google Calendar
      for (const localEvent of localEvents) {
        try {
          if (!localEvent.googleId && !localEvent.localOnly) {
            // Export new event to Google
            const googleEvent = this.convertLocalEventToGoogle(localEvent);
            
            const createEventUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(this.syncConfig.defaultCalendarId)}/events`;
            const response = await fetch(createEventUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(googleEvent),
            });

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();
            
            if (responseData.id) {
              // Update local event with Google ID
              localEvent.googleId = responseData.id;
              result.exported++;
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          result.errors.push(`Failed to export event ${localEvent.title}: ${errorMessage}`);
        }
      }

      // Update last sync time
      this.syncConfig.lastSyncTime = new Date().toISOString();
      await this.saveSyncConfig();

      console.log(`📅 Calendar sync completed: ${result.imported} imported, ${result.exported} exported, ${result.updated} updated`);
      return result;
    } catch (error) {
      console.error('❌ Error during calendar sync:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { imported: 0, exported: 0, updated: 0, errors: [errorMessage] };
    }
  }

  private convertGoogleEventToLocal(googleEvent: GoogleCalendarEvent): any {
    return {
      id: `google-${googleEvent.id}`,
      googleId: googleEvent.id,
      title: googleEvent.summary || 'Untitled Event',
      description: googleEvent.description || '',
      startTime: googleEvent.start.dateTime || googleEvent.start.date,
      endTime: googleEvent.end.dateTime || googleEvent.end.date,
      category: 'personal', // Default category
      color: this.getColorFromGoogleColorId(googleEvent.colorId),
      isAllDay: !googleEvent.start.dateTime,
      lastSyncTime: new Date().toISOString(),
      source: 'google',
    };
  }

  private convertLocalEventToGoogle(localEvent: any): any {
    return {
      summary: localEvent.title,
      description: localEvent.description || '',
      start: {
        dateTime: localEvent.isAllDay ? undefined : localEvent.startTime,
        date: localEvent.isAllDay ? localEvent.startTime.split('T')[0] : undefined,
        timeZone: 'UTC',
      },
      end: {
        dateTime: localEvent.isAllDay ? undefined : localEvent.endTime,
        date: localEvent.isAllDay ? localEvent.endTime.split('T')[0] : undefined,
        timeZone: 'UTC',
      },
      colorId: this.getGoogleColorIdFromColor(localEvent.color),
    };
  }

  private getColorFromGoogleColorId(colorId?: string): string {
    const colorMap: { [key: string]: string } = {
      '1': '#a4bdfc', // Lavender
      '2': '#7ae7bf', // Sage
      '3': '#dbadff', // Grape
      '4': '#ff887c', // Flamingo
      '5': '#fbd75b', // Banana
      '6': '#ffb878', // Tangerine
      '7': '#46d6db', // Peacock
      '8': '#9fc6e7', // Graphite
      '9': '#9fe1e7', // Blueberry
      '10': '#9fc6e7', // Basil
      '11': '#cdbfe3', // Tomato
    };
    return colorMap[colorId || '1'] || '#FF69B4'; // Default to pink
  }

  private getGoogleColorIdFromColor(color: string): string {
    const reverseColorMap: { [key: string]: string } = {
      '#a4bdfc': '1',
      '#7ae7bf': '2',
      '#dbadff': '3',
      '#ff887c': '4',
      '#fbd75b': '5',
      '#ffb878': '6',
      '#46d6db': '7',
      '#9fc6e7': '8',
      '#9fe1e7': '9',
      '#cdbfe3': '11',
    };
    return reverseColorMap[color] || '1'; // Default to lavender
  }

  public async getSyncConfig(): Promise<CalendarSyncConfig> {
    return this.syncConfig;
  }

  public async updateSyncConfig(config: Partial<CalendarSyncConfig>): Promise<void> {
    this.syncConfig = { ...this.syncConfig, ...config };
    await this.saveSyncConfig();
    console.log('📅 Calendar sync config updated');
  }

  private async saveSyncConfig(): Promise<void> {
    try {
      await AsyncStorage.setItem('calendar_sync_config', JSON.stringify(this.syncConfig));
    } catch (error) {
      console.error('❌ Failed to save calendar sync config:', error);
    }
  }

  public async disconnect(): Promise<void> {
    try {
      // Clear stored tokens
      await AsyncStorage.removeItem('google_access_token');
      await AsyncStorage.removeItem('google_refresh_token');
      
      // Reset service state
      this.accessToken = null;
      this.refreshToken = null;
      this.calendar = null;
      this.syncConfig.enabled = false;
      
      await this.saveSyncConfig();
      
      console.log('📅 Google Calendar disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting Google Calendar:', error);
    }
  }

  public isConnected(): boolean {
    return !!this.accessToken;
  }

  public getLastSyncTime(): string | null {
    return this.syncConfig.lastSyncTime;
  }
}

// Singleton instance
const googleCalendarService = new GoogleCalendarService();
export default googleCalendarService;