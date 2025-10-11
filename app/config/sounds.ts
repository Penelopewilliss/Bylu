// Sound configuration for notifications and alarms
// Add your .wav or .mp3 files to /assets/sounds/ with these exact names

// SIMPLIFIED - Just 10 alarm sounds
export const NOTIFICATION_SOUNDS = {
  // Loud Alarms
  CLASSIC_BELL: 'classic_bell',
  DIGITAL_BEEP: 'digital_beep',
  ELECTRONIC_ALARM: 'electronic_alarm',
  
  // Pleasant Alarms
  GENTLE_CHIMES: 'gentle_chimes',
  PIANO_MELODY: 'piano_melody',
  SOFT_BELLS: 'soft_bells',
  
  // Nature Alarms
  BIRDS_CHIRPING: 'birds_chirping',
  OCEAN_WAVES: 'ocean_waves',
  
  // Fun Alarms
  FANFARE: 'fanfare',
  ROOSTER: 'rooster',
};

// Map of sound keys to their require() statements
// ✅ ACTIVATED - Using your downloaded MP3 files!
export const SOUND_FILES: { [key: string]: any } = {
  [NOTIFICATION_SOUNDS.CLASSIC_BELL]: require('../../assets/sounds/classic_bell.mp3'),
  [NOTIFICATION_SOUNDS.DIGITAL_BEEP]: require('../../assets/sounds/digital_beep.mp3'),
  [NOTIFICATION_SOUNDS.ELECTRONIC_ALARM]: require('../../assets/sounds/electronic_alarm.mp3'),
  [NOTIFICATION_SOUNDS.GENTLE_CHIMES]: require('../../assets/sounds/gentle_chimes.mp3'),
  [NOTIFICATION_SOUNDS.PIANO_MELODY]: require('../../assets/sounds/piano_melody.mp3'),
  [NOTIFICATION_SOUNDS.SOFT_BELLS]: require('../../assets/sounds/soft_bells.mp3'),
  [NOTIFICATION_SOUNDS.BIRDS_CHIRPING]: require('../../assets/sounds/birds_chirping.mp3'),
  [NOTIFICATION_SOUNDS.OCEAN_WAVES]: require('../../assets/sounds/ocean_waves.mp3'),
  [NOTIFICATION_SOUNDS.FANFARE]: require('../../assets/sounds/fanfare.mp3'),
  [NOTIFICATION_SOUNDS.ROOSTER]: require('../../assets/sounds/rooster.mp3'),
};

// Helper function to check if sound file exists
export const hasSoundFile = (soundKey: string): boolean => {
  return soundKey in SOUND_FILES;
};

// Helper function to get sound file or fallback
export const getSoundFile = (soundKey: string) => {
  return SOUND_FILES[soundKey] || null;
};
