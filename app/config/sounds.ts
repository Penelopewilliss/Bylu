// Sound configuration for notifications and alarms
// Add your .wav or .mp3 files to /assets/sounds/ with these exact names

export const NOTIFICATION_SOUNDS = {
  // Epic & Motivational
  COSMIC_AWAKENING: 'cosmic_awakening',
  CHAMPION_RISE: 'champion_rise',
  POWER_SURGE: 'power_surge',
  
  // Musical & Melodic
  CRYSTAL_HARMONY: 'crystal_harmony',
  ROYAL_FANFARE: 'royal_fanfare',
  ZEN_BELLS: 'zen_bells',
  
  // Nature & Ambient
  MYSTIC_FOREST: 'mystic_forest',
  OCEAN_SUNRISE: 'ocean_sunrise',
  MOUNTAIN_BREEZE: 'mountain_breeze',
  
  // Modern & Tech
  FUTURE_PULSE: 'future_pulse',
  DIGITAL_DAWN: 'digital_dawn',
  QUANTUM_CHIME: 'quantum_chime',
  
  // Funny & Hilarious
  ROOSTER_OPERA: 'rooster_opera',
  ALIEN_INVASION: 'alien_invasion',
  GRANDMOTHER_YELLING: 'grandmother_yelling',
  CAT_PIANO: 'cat_piano',
  RUBBER_DUCK: 'rubber_duck',
  PIRATE_WAKE_UP: 'pirate_wake_up',
  BABY_ELEPHANT: 'baby_elephant',
  DISCO_CHICKEN: 'disco_chicken',
  ROBOT_MALFUNCTION: 'robot_malfunction',
  SNORING_BEAR: 'snoring_bear',
  CHIPMUNK_CHAOS: 'chipmunk_chaos',
  MOM_VOICE: 'mom_voice',
  SCREAMING_GOAT: 'screaming_goat',
  DRAMATIC_LLAMA: 'dramatic_llama',
  SINGING_FROG: 'singing_frog',
  
  // Classic Options
  GENTLE_CHIMES: 'gentle_chimes',
  SOFT_PIANO: 'soft_piano',
  CLASSIC_BELL: 'classic_bell',
};

// Map of sound keys to their require() statements
// Uncomment when you add the actual .wav files to /assets/sounds/
export const SOUND_FILES: { [key: string]: any } = {
  // When you add sound files, uncomment and update like this:
  // [NOTIFICATION_SOUNDS.COSMIC_AWAKENING]: require('../../assets/sounds/cosmic_awakening.wav'),
  // [NOTIFICATION_SOUNDS.GENTLE_CHIMES]: require('../../assets/sounds/gentle_chimes.wav'),
  // ... add all your sounds here
};

// Helper function to check if sound file exists
export const hasSoundFile = (soundKey: string): boolean => {
  return soundKey in SOUND_FILES;
};

// Helper function to get sound file or fallback
export const getSoundFile = (soundKey: string) => {
  return SOUND_FILES[soundKey] || null;
};
