# 🔍 How to Explore Lottie Animations

## 📋 **Quick Reference: What's in Your Lottie Files**

### 1. **Check Available Animations**
```bash
# List all Lottie files in your project
find /workspaces/Bylu/assets/lottie -name "*.json"

# Check file sizes (keep under 200KB for best performance)
ls -lh /workspaces/Bylu/assets/lottie/*.json
```

### 2. **Inspect Animation Properties**
```bash
# See basic animation info
head -20 /workspaces/Bylu/assets/lottie/simple-particle.json
```

## 🎯 **What Each Property Means**

When you open a Lottie JSON file, here's what you'll see:

```json
{
  "v": "5.7.4",        // Lottie version
  "fr": 30,            // Frame rate (30 FPS)
  "ip": 0,             // In point (start frame)
  "op": 90,            // Out point (end frame) = 3 seconds at 30fps
  "w": 200,            // Width in pixels
  "h": 200,            // Height in pixels
  "nm": "Animation Name",
  "layers": [...]      // Animation layers (circles, paths, etc.)
}
```

## 🔧 **Test Animations in Your App**

### Method 1: Replace Current Particles
Update `/app/screens/HomeScreen.tsx`:

```tsx
// Add this import at the top
import LottieView from 'lottie-react-native';

// Replace the particles section with:
{/* Lottie Animation */}
<LottieView
  source={require('../../assets/lottie/simple-particle.json')}
  autoPlay
  loop
  speed={0.6}
  style={{
    position: 'absolute',
    bottom: -50,
    left: 0,
    right: 0,
    height: 150,
    pointerEvents: 'none',
    opacity: 0.7,
  }}
  resizeMode="cover"
/>
```

### Method 2: Use the FloatingLottie Component
```tsx
// Import the component
import FloatingLottie from '../components/FloatingLottie';

// Use it in your render:
<FloatingLottie 
  localSource={require('../../assets/lottie/simple-particle.json')}
  speed={0.5}
/>
```

## 🌐 **Free Animation URLs You Can Test Right Now**

```tsx
// Gentle floating particles
<LottieView
  source={{uri: 'https://assets3.lottiefiles.com/packages/lf20_1pxqjqps.json'}}
  autoPlay loop speed={0.8}
  style={{position: 'absolute', bottom: -50, left: 0, right: 0, height: 150}}
/>

// Soft sparkles
<LottieView
  source={{uri: 'https://assets3.lottiefiles.com/packages/lf20_DMgKk1.json'}}
  autoPlay loop speed={0.5}
  style={{position: 'absolute', bottom: -30, left: 0, right: 0, height: 120}}
/>

// Floating bubbles
<LottieView
  source={{uri: 'https://assets2.lottiefiles.com/packages/lf20_8F1VhM.json'}}
  autoPlay loop speed={0.7}
  style={{position: 'absolute', bottom: -40, left: 0, right: 0, height: 140}}
/>
```

## 🎨 **Finding the Perfect Animation**

### Step-by-step process:

1. **Visit LottieFiles.com**
2. **Search for**: "particles", "floating", "ambient", "sparkles"
3. **Filter by**: 
   - ✅ Free animations
   - ✅ Small file size (< 200KB)
   - ✅ Seamless loop
4. **Preview** the animation
5. **Download** as JSON
6. **Test** in your app

### Popular searches for Bylu app:
- "productivity particles"
- "soft floating dots"
- "minimal sparkles"
- "gentle animation"
- "ambient glow"

## ⚡ **Quick Testing Commands**

```bash
# Check your current Lottie files
ls -la /workspaces/Bylu/assets/lottie/

# Start your app to test
npm start

# View in browser (good for quick testing)
# Open: http://localhost:8081
```

## 🎯 **Ready-to-Use Animations**

I've created a simple particle animation in your assets folder:
- **File**: `/assets/lottie/simple-particle.json`
- **What it does**: A gentle purple dot that floats up and down
- **Duration**: 3 seconds, loops forever
- **Size**: Very small (< 5KB)

**Test it now** by adding this to your HomeScreen! 🚀

## 🔄 **Next Steps**

1. Try the simple-particle.json I created
2. Visit LottieFiles.com and download 2-3 different animations
3. Test which one looks best for your bottom animation
4. Customize colors and speed to match your app theme

**Want me to help you implement a specific animation?** Just let me know! 🎨