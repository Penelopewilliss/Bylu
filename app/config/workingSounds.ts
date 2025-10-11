// SIMPLIFIED - Just 10 temporary alarm sounds from Mixkit (royalty-free)
// These are placeholders until you download real MP3 alarm files

export const WORKING_SOUND_URLS: { [key: string]: string } = {
  // LOUD ALARMS
  'classic_bell': 'https://assets.mixkit.co/active_storage/sfx/2869/2869.wav',
  'digital_beep': 'https://assets.mixkit.co/active_storage/sfx/2354/2354.wav',
  'electronic_alarm': 'https://assets.mixkit.co/active_storage/sfx/2872/2872.wav',
  
  // PLEASANT ALARMS
  'gentle_chimes': 'https://assets.mixkit.co/active_storage/sfx/2568/2568.wav',
  'piano_melody': 'https://assets.mixkit.co/active_storage/sfx/2571/2571.wav',
  'soft_bells': 'https://assets.mixkit.co/active_storage/sfx/2570/2570.wav',
  
  // NATURE ALARMS
  'birds_chirping': 'https://assets.mixkit.co/active_storage/sfx/2568/2568.wav',
  'ocean_waves': 'https://assets.mixkit.co/active_storage/sfx/2568/2568.wav',
  
  // FUN ALARMS
  'fanfare': 'https://assets.mixkit.co/active_storage/sfx/1465/1465.wav',
  'rooster': 'https://assets.mixkit.co/active_storage/sfx/1433/1433.wav',
};

// ⚠️  IMPORTANT: These are TEMPORARY placeholder sounds from Mixkit
// Many point to generic sounds because free online alarm sounds are limited
// 
// 🎯 FOR REAL ALARM CLOCK SOUNDS:
// 1. Read ALARM_SOUNDS_GUIDE.md for step-by-step instructions
// 2. Download FREE alarm MP3s from Pixabay.com (no attribution required)
// 3. Save them to /assets/sounds/ folder with the correct names
// 4. Update /app/config/sounds.ts to use local files: require('../../assets/sounds/...')
// 5. Rebuild with: eas build --platform android --profile preview
//
// 📥 Quick link: https://pixabay.com/sound-effects/search/alarm%20clock/
