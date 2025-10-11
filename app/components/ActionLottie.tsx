import React from 'react';
import { View } from 'react-native';
import LottieView from 'lottie-react-native';

interface ActionLottieProps {
  source: any;
  size?: number;
  speed?: number;
}

export default function ActionLottie({ source, size = 36, speed = 1 }: ActionLottieProps) {
  return (
    <View style={{ 
      width: size, 
      height: size, 
      marginBottom: 10,
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <LottieView
        source={source}
        autoPlay
        loop
        speed={speed}
        style={{
          width: size,
          height: size,
        }}
        resizeMode="contain"
      />
    </View>
  );
}