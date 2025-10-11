# 🔔 Notification & Alarm Sounds

This folder contains custom audio files for notifications and alarms.

## 📁 Required Sound Files

Add `.wav` or `.mp3` files here with these exact names:

### Epic & Motivational 🌟
- `cosmic_awakening.wav` - Ethereal space sounds building to inspiration
- `champion_rise.wav` - Heroic orchestral theme for ambitious mornings
- `power_surge.wav` - Energizing electronic beats with uplifting melody

### Musical & Melodic 🎵
- `crystal_harmony.wav` - Beautiful crystal bowl harmonics
- `royal_fanfare.wav` - Majestic brass fanfare fit for royalty
- `zen_bells.wav` - Peaceful temple bells with reverb

### Nature & Ambient 🌊
- `mystic_forest.wav` - Enchanted forest with magical undertones
- `ocean_sunrise.wav` - Gentle waves with morning birds
- `mountain_breeze.wav` - Wind through trees with distant chimes

### Modern & Tech ⚡
- `future_pulse.wav` - Futuristic sci-fi awakening sequence
- `digital_dawn.wav` - Clean modern tones with building energy
- `quantum_chime.wav` - Crystalline digital harmonics

### Funny & Hilarious 😂
- `rooster_opera.wav` - Operatic rooster performance
- `alien_invasion.wav` - UFO landing sounds
- `grandmother_yelling.wav` - Classic wake-up call
- `cat_piano.wav` - Melodic meowing
- `rubber_duck.wav` - Squeaky rubber duck
- `pirate_wake_up.wav` - "ARRR! Wake up ye landlubber!"
- `baby_elephant.wav` - Adorable trumpet sounds
- `disco_chicken.wav` - Funky chicken beats
- `robot_malfunction.wav` - Beep boop error sounds
- `snoring_bear.wav` - Loud bear snores
- `chipmunk_chaos.wav` - High-pitched chatter
- `mom_voice.wav` - "Time to wake up!"
- `screaming_goat.wav` - Classic goat scream
- `dramatic_llama.wav` - Dramatic llama sounds
- `singing_frog.wav` - Melodic frog croaks

### Classic Options 🔔
- `gentle_chimes.wav` - Soft and peaceful traditional
- `soft_piano.wav` - Melodic and calming piano
- `classic_bell.wav` - Traditional alarm bell

## 🎵 Audio Specifications

### Android
- **Format**: `.wav` or `.mp3`
- **Duration**: 2-5 seconds recommended
- **Size**: Keep under 100KB per file
- **Sample Rate**: 44.1 kHz recommended

### iOS
- **Format**: `.wav`, `.aiff`, or `.caf`
- **Encoding**: Linear PCM, alaw, or μlaw
- **Duration**: Maximum 30 seconds
- **Size**: Keep under 100KB per file

## 🌐 Free Sound Resources

Where to find free sounds:
- **Freesound.org** - Community uploaded sounds (requires free account)
- **Zapsplat.com** - Free sound effects library
- **NotificationSounds.com** - Specifically for mobile notifications
- **Pixabay Audio** - Free sound effects and music
- **YouTube Audio Library** - Google's free audio collection
- **BBC Sound Effects** - Professional sound library

## 🚀 How to Add Sounds

1. Download or create your `.wav` files
2. Name them exactly as shown above (e.g., `cosmic_awakening.wav`)
3. Place them in this folder
4. Run a new build: `eas build --profile preview --platform android`
5. The sounds will automatically work in notifications!

## ⚠️ Important Notes

- **Expo Go doesn't support custom notification sounds** - you need a development or production build
- Always include a fallback sound (the app defaults to system sound if file is missing)
- Test on a real device - simulator notification sounds may not work
- Keep files small to avoid bloating your app size

## 📝 Current Status

**Sounds Configured**: ✅ Code ready  
**Audio Files Added**: ❌ Not yet (add files to this folder)  
**Build Required**: ⚠️ Yes, rebuild after adding files

Once you add the audio files, rebuild the app and custom sounds will work! 🎉
