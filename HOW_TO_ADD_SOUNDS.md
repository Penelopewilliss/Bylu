# 🎵 Adding Custom Notification Sounds - Complete Guide

## Quick Start (5 Steps)

1. **Download Sound Files** - Get `.wav` files from free resources
2. **Add to Project** - Place in `/assets/sounds/` folder
3. **Update Config** - Uncomment lines in `/app/config/sounds.ts`
4. **Rebuild App** - Run `eas build --profile preview --platform android`
5. **Test** - Install and hear your custom sounds!

---

## Detailed Instructions

### Step 1: Get Your Sound Files

#### Free Sound Resources:
- **Freesound.org** - Largest community sound library
- **Zapsplat.com** - High-quality free sounds
- **NotificationSounds.com** - Mobile-optimized sounds
- **Pixabay.com/sounds** - Royalty-free audio
- **Mixkit.co/free-sound-effects** - Free sound effects

#### Sound Requirements:
- **Format**: `.wav` (recommended) or `.mp3`
- **Length**: 2-5 seconds for notifications
- **Size**: Under 100KB per file
- **Quality**: 44.1 kHz, 16-bit

---

### Step 2: Add Files to Project

1. Download your chosen sound files
2. Rename them to match the exact names in `/assets/sounds/README.md`
3. Place them in: `/workspaces/Bylu/assets/sounds/`

Example:
```
/workspaces/Bylu/assets/sounds/
├── cosmic_awakening.wav
├── gentle_chimes.wav
├── ocean_sunrise.wav
└── ... (add more)
```

---

### Step 3: Update Configuration

Open `/app/config/sounds.ts` and uncomment the sound imports:

**Before:**
```typescript
export const SOUND_FILES: { [key: string]: any } = {
  // [NOTIFICATION_SOUNDS.COSMIC_AWAKENING]: require('../../assets/sounds/cosmic_awakening.wav'),
};
```

**After (uncomment for each sound you added):**
```typescript
export const SOUND_FILES: { [key: string]: any } = {
  [NOTIFICATION_SOUNDS.COSMIC_AWAKENING]: require('../../assets/sounds/cosmic_awakening.wav'),
  [NOTIFICATION_SOUNDS.GENTLE_CHIMES]: require('../../assets/sounds/gentle_chimes.wav'),
  [NOTIFICATION_SOUNDS.OCEAN_SUNRISE]: require('../../assets/sounds/ocean_sunrise.wav'),
  // Add more sounds as you add files...
};
```

---

### Step 4: Configure Android Resources (Optional but Recommended)

For better notification sound support on Android, add to `app.json`:

```json
{
  "expo": {
    "android": {
      "package": "com.penelope11.glowgetterapp",
      "permissions": ["NOTIFICATIONS", "WAKE_LOCK"],
      "resources": [
        "assets/sounds/cosmic_awakening.wav",
        "assets/sounds/gentle_chimes.wav"
      ]
    }
  }
}
```

---

### Step 5: Rebuild Your App

Custom sounds require a new build (they don't work in Expo Go):

```bash
# For Android APK (what you can install directly)
eas build --profile preview --platform android

# For iOS (requires Apple Developer account)
eas build --profile preview --platform ios

# For both platforms
eas build --profile preview --platform all
```

Wait for the build to complete (5-15 minutes), then download and install the new APK on your phone.

---

## Testing Your Sounds

1. **Install the new build** on your phone
2. **Open the app** and go to Alarm Clock screen
3. **Select a sound** from the sound picker
4. **Tap the play button** to preview
5. **Set an alarm** and wait for it to trigger

---

## Troubleshooting

### Preview not working?
- Make sure you uncommented the require() in `sounds.ts`
- Check the filename matches exactly (case-sensitive!)
- Verify the file is in `/assets/sounds/` folder
- Rebuild the app after adding files

### Notification sound not working?
- Custom sounds only work in **development/production builds**, not Expo Go
- Check Android/iOS permissions are granted
- Try the system default sound first to verify notifications work
- Make sure the file format is supported (`.wav` is safest)

### File too large?
- Use an audio editor to reduce file size
- Lower the sample rate to 22 kHz
- Reduce to mono (single channel)
- Trim the sound to 2-3 seconds

---

## Current Status

✅ **Code Ready**: App is configured to use custom sounds  
✅ **Folder Created**: `/assets/sounds/` exists  
❌ **Sound Files**: Not added yet (add your `.wav` files!)  
❌ **Rebuild Required**: Yes, after adding files

---

## Next Steps

1. Browse free sound libraries and download 3-5 sounds to start
2. Add them to `/assets/sounds/`
3. Update `/app/config/sounds.ts`
4. Run: `eas build --profile preview --platform android`
5. Install and enjoy your custom notification sounds! 🎉

---

## Need Help?

- Check `/assets/sounds/README.md` for sound file specifications
- View `/app/config/sounds.ts` for the list of all supported sound names
- The code will automatically fall back to system sounds if files are missing
