#!/bin/bash
# Google Calendar Setup Helper Script

echo "🔧 Bylu Google Calendar Setup Helper"
echo "======================================"
echo ""

if [ "$1" = "" ]; then
    echo "Usage: $0 <your-google-client-id>"
    echo ""
    echo "Example:"
    echo "  $0 123456789-abcdefghijklmnop.apps.googleusercontent.com"
    echo ""
    echo "To get your Client ID:"
    echo "1. Go to https://console.cloud.google.com/"
    echo "2. Create project and enable Google Calendar API"
    echo "3. Create OAuth 2.0 credentials (Web application type)"
    echo "4. Copy the Client ID and run this script with it"
    echo ""
    exit 1
fi

CLIENT_ID="$1"

echo "📝 Updating Google Calendar configuration..."
echo "Client ID: $CLIENT_ID"
echo ""

# Update the config file
sed -i "s/CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'/CLIENT_ID: '$CLIENT_ID'/g" app/config/googleCalendar.ts

echo "✅ Configuration updated!"
echo ""
echo "Next steps:"
echo "1. Make sure you added these redirect URIs in Google Cloud Console:"
echo "   - exp://127.0.0.1:19000/--/"
echo "   - http://localhost:19000/--/"
echo "2. Add your email as a test user in OAuth consent screen"
echo "3. Test the login in the app!"
echo ""
echo "🚀 Ready to test Google Calendar sync!"