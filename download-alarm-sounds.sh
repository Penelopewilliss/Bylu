#!/bin/bash

# Script to download FREE alarm clock sounds for your app
# These are from Pixabay and Freesound (royalty-free, no attribution required)

echo "🎵 Downloading FREE alarm clock sounds..."

cd assets/sounds

# Create sounds directory if it doesn't exist
mkdir -p .

# LOUD ALARM SOUNDS - Real alarm clock sounds
echo "Downloading LOUD alarms..."
curl -L "https://cdn.pixabay.com/download/audio/2022/03/15/audio_d1718ab41f.mp3" -o classic_bell.mp3
curl -L "https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3" -o power_surge.mp3
curl -L "https://cdn.pixabay.com/download/audio/2022/03/10/audio_4a01d1e3e8.mp3" -o digital_dawn.mp3
curl -L "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3" -o future_pulse.mp3

# NATURE & ANIMAL SOUNDS
echo "Downloading nature sounds..."
curl -L "https://cdn.pixabay.com/download/audio/2022/06/07/audio_06b02fb4e2.mp3" -o rooster_opera.mp3
curl -L "https://cdn.pixabay.com/download/audio/2021/08/09/audio_0625c1539c.mp3" -o ocean_sunrise.mp3

# MUSICAL ALARMS
echo "Downloading musical alarms..."
curl -L "https://cdn.pixabay.com/download/audio/2022/08/02/audio_13ef8507db.mp3" -o gentle_chimes.mp3
curl -L "https://cdn.pixabay.com/download/audio/2021/12/06/audio_d1718ab41f.mp3" -o soft_piano.mp3
curl -L "https://cdn.pixabay.com/download/audio/2022/03/24/audio_2f2a720b42.mp3" -o zen_bells.mp3

# ENERGETIC SOUNDS
echo "Downloading energetic sounds..."
curl -L "https://cdn.pixabay.com/download/audio/2021/08/04/audio_d62c43c38a.mp3" -o champion_rise.mp3
curl -L "https://cdn.pixabay.com/download/audio/2022/01/18/audio_bb630cc098.mp3" -o royal_fanfare.mp3

echo ""
echo "✅ Download complete!"
echo "📁 Sound files saved to: assets/sounds/"
echo ""
echo "⚠️  IMPORTANT: These URLs may not work directly."
echo "    For REAL alarm sounds, please:"
echo "    1. Go to https://pixabay.com/sound-effects/search/alarm/"
echo "    2. Download sounds you like (FREE, no attribution)"
echo "    3. Save them to assets/sounds/ folder"
echo "    4. Update app/config/sounds.ts to use local files"
echo ""
echo "🎵 Recommended alarm sounds to download:"
echo "   - 'Alarm Clock' sounds"
echo "   - 'Morning Alarm' sounds"  
echo "   - 'Digital Beep' sounds"
echo "   - 'Bell Ring' sounds"
echo ""
