// Script to help create app icon
// This is a helper script to understand what we need for the app icon

const iconRequirements = {
  // Standard app icon sizes
  ios: {
    icon_1024: '1024x1024px', // App Store
    icon_180: '180x180px',    // iPhone
    icon_167: '167x167px',    // iPad Pro
    icon_152: '152x152px',    // iPad
    icon_120: '120x120px',    // iPhone
    icon_87: '87x87px',       // iPhone notification
    icon_80: '80x80px',       // iPad spotlight
    icon_76: '76x76px',       // iPad
    icon_60: '60x60px',       // iPhone spotlight
    icon_58: '58x58px',       // iPhone/iPad settings
    icon_40: '40x40px',       // iPad spotlight
    icon_29: '29x29px',       // iPhone/iPad settings
    icon_20: '20x20px'        // iPad notification
  },
  android: {
    icon_512: '512x512px',    // Play Store
    icon_192: '192x192px',    // xxxhdpi
    icon_144: '144x144px',    // xxhdpi
    icon_96: '96x96px',       // xhdpi
    icon_72: '72x72px',       // hdpi
    icon_48: '48x48px'        // mdpi
  },
  expo: {
    icon: '1024x1024px',              // Main icon (app.json)
    adaptiveIcon: '1024x1024px',      // Android adaptive icon
    favicon: '48x48px'                // Web favicon
  }
};

console.log('App Icon Requirements:', JSON.stringify(iconRequirements, null, 2));

// Glowgetter branding colors from the app
const brandColors = {
  primary: '#F7D1DA',    // Light pink
  primaryDark: '#FFB3C6', // Darker pink
  text: '#2D2D2D',       // Dark text
  accent: '#C2185B'      // Pink accent
};

console.log('Brand Colors:', brandColors);

// Simple icon concept using text
const iconConcept = `
Icon Design Concept for Glowgetter:
- Background: Gradient from ${brandColors.primary} to ${brandColors.primaryDark}
- Text: "G" in elegant handwritten font (Great Vibes or Dancing Script)
- Color: ${brandColors.text} or white for contrast
- Style: Rounded corners, modern, chic
- Size: 1024x1024px for best quality
`;

console.log(iconConcept);