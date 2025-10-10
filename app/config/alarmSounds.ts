// Custom Alarm Sounds Configuration
export interface AlarmSound {
  key: string;
  name: string;
  description: string;
  category: 'epic' | 'musical' | 'nature' | 'tech' | 'classic';
  duration: number;
  localAsset?: any; // Will be set when we add actual audio files
  fallbackUrl?: string;
}

export const ALARM_SOUNDS: AlarmSound[] = [
  // Epic & Motivational 🌟
  {
    key: 'cosmic_awakening',
    name: '🌌 Cosmic Awakening',
    description: 'Ethereal space sounds building to inspiration',
    category: 'epic',
    duration: 4000,
    fallbackUrl: 'https://www.soundjay.com/misc/sounds/magic-chime-02.wav'
  },
  {
    key: 'champion_rise',
    name: '🏆 Champion Rise', 
    description: 'Heroic orchestral theme for ambitious mornings',
    category: 'epic',
    duration: 3500,
    fallbackUrl: 'https://www.soundjay.com/misc/sounds/fanfare-1.wav'
  },
  {
    key: 'power_surge',
    name: '⚡ Power Surge',
    description: 'Energizing electronic beats with uplifting melody',
    category: 'epic', 
    duration: 3000,
    fallbackUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
  },
  
  // Musical & Melodic 🎵
  {
    key: 'crystal_harmony',
    name: '💎 Crystal Harmony',
    description: 'Beautiful crystal bowl harmonics',
    category: 'musical',
    duration: 4000,
    fallbackUrl: 'https://www.soundjay.com/misc/sounds/crystal-chimes-02.wav'
  },
  {
    key: 'royal_fanfare',
    name: '👑 Royal Fanfare',
    description: 'Majestic brass fanfare fit for royalty',
    category: 'musical',
    duration: 3000,
    fallbackUrl: 'https://www.soundjay.com/misc/sounds/trumpet-fanfare-01.wav'
  },
  {
    key: 'zen_bells',
    name: '🧘 Zen Bells',
    description: 'Peaceful temple bells with reverb',
    category: 'musical',
    duration: 3500,
    fallbackUrl: 'https://www.soundjay.com/misc/sounds/tibetan-bells-01.wav'
  },
  
  // Nature & Ambient 🌊
  {
    key: 'mystic_forest',
    name: '🧚 Mystic Forest',
    description: 'Enchanted forest with magical undertones', 
    category: 'nature',
    duration: 4000,
    fallbackUrl: 'https://www.soundjay.com/nature/sounds/forest-with-creek.wav'
  },
  {
    key: 'ocean_sunrise',
    name: '🌅 Ocean Sunrise',
    description: 'Gentle waves with morning birds',
    category: 'nature',
    duration: 3500,
    fallbackUrl: 'https://www.soundjay.com/nature/sounds/ocean-waves-02.wav'
  },
  {
    key: 'mountain_breeze',
    name: '🏔️ Mountain Breeze',
    description: 'Wind through trees with distant chimes',
    category: 'nature',
    duration: 3000,
    fallbackUrl: 'https://www.soundjay.com/nature/sounds/wind-chimes-01.wav'
  },
  
  // Modern & Tech ⚡
  {
    key: 'future_pulse',
    name: '🚀 Future Pulse',
    description: 'Futuristic sci-fi awakening sequence',
    category: 'tech',
    duration: 3000,
    fallbackUrl: 'https://www.soundjay.com/misc/sounds/futuristic-chime.wav'
  },
  {
    key: 'digital_dawn',
    name: '🌐 Digital Dawn',
    description: 'Clean modern tones with building energy',
    category: 'tech',
    duration: 3500,
    fallbackUrl: 'https://www.soundjay.com/misc/sounds/digital-beep-01.wav'
  },
  {
    key: 'quantum_chime',
    name: '⚛️ Quantum Chime',
    description: 'Crystalline digital harmonics',
    category: 'tech',
    duration: 2500,
    fallbackUrl: 'https://www.soundjay.com/misc/sounds/crystal-chime-clean.wav'
  },
  
  // Classic Options 🔔
  {
    key: 'gentle_chimes',
    name: '🎐 Gentle Chimes',
    description: 'Soft and peaceful traditional',
    category: 'classic',
    duration: 3000,
    fallbackUrl: 'https://www2.cs.uic.edu/~i101/SoundFiles/tada.wav'
  },
  {
    key: 'soft_piano',
    name: '🎹 Soft Piano',
    description: 'Melodic and calming piano',
    category: 'classic',
    duration: 3000,
    fallbackUrl: 'https://www2.cs.uic.edu/~i101/SoundFiles/StarWars3.wav'
  },
  {
    key: 'classic_bell',
    name: '🔔 Classic Bell',
    description: 'Traditional alarm bell',
    category: 'classic',
    duration: 2000,
    fallbackUrl: 'https://www2.cs.uic.edu/~i101/SoundFiles/CantinaBand60.wav'
  }
];

// Helper functions
export const getSoundByKey = (key: string): AlarmSound | undefined => {
  return ALARM_SOUNDS.find(sound => sound.key === key);
};

export const getSoundsByCategory = (category: AlarmSound['category']): AlarmSound[] => {
  return ALARM_SOUNDS.filter(sound => sound.category === category);
};

export const getAllSoundKeys = (): string[] => {
  return ALARM_SOUNDS.map(sound => sound.key);
};