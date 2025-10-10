import React from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

interface FloatingLottieProps {
  animationUrl?: string;
  localSource?: any;
  style?: any;
  speed?: number;
  loop?: boolean;
  autoPlay?: boolean;
}

export default function FloatingLottie({
  animationUrl,
  localSource,
  style,
  speed = 0.8,
  loop = true,
  autoPlay = true,
}: FloatingLottieProps) {
  const source = localSource || { uri: animationUrl };

  return (
    <View style={[styles.container, style]}>
      <LottieView
        source={source}
        autoPlay={autoPlay}
        loop={loop}
        speed={speed}
        style={styles.lottie}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: -50,
    left: 0,
    right: 0,
    height: 150,
    pointerEvents: 'none',
  },
  lottie: {
    flex: 1,
    opacity: 0.7,
  },
});

// Usage examples:
/*
// With URL from LottieFiles
<FloatingLottie 
  animationUrl="https://assets3.lottiefiles.com/packages/lf20_1pxqjqps.json"
  speed={0.5}
/>

// With local file
<FloatingLottie 
  localSource={require('../../assets/lottie/floating-particles.json')}
  speed={0.6}
/>

// Custom positioning
<FloatingLottie 
  animationUrl="https://assets3.lottiefiles.com/packages/lf20_8F1VhM.json"
  style={{
    bottom: -30,
    height: 120,
    opacity: 0.5,
  }}
/>
*/