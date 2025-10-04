// ConfettiAnimation.tsx
import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import Colors from '../constants/colors';

const { width, height } = Dimensions.get('window');

interface ConfettiPiece {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  rotation: Animated.Value;
  color: string;
}

export default function ConfettiAnimation({ onComplete }: { onComplete?: () => void }) {
  const confettiPieces = useRef<ConfettiPiece[]>([]);
  const colors = useMemo(() => [Colors.primary, Colors.success, Colors.warning, Colors.purple, Colors.blue, Colors.yellow], []);

  useEffect(() => {
    confettiPieces.current = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: new Animated.Value(Math.random() * width),
      y: new Animated.Value(-20),
      rotation: new Animated.Value(0),
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    const animations = confettiPieces.current.map((piece) =>
      Animated.parallel([
        Animated.timing(piece.y, {
          toValue: height + 20,
          duration: 2000 + Math.random() * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(piece.x, {
          toValue: Math.random() * width,
          duration: 2000 + Math.random() * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(piece.rotation, {
          toValue: Math.random() * 720,
          duration: 2000 + Math.random() * 1000,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.stagger(50, animations).start(() => {
      if (onComplete) onComplete();
    });
  }, [colors, onComplete]);

  return (
    <View style={styles.container} pointerEvents="none">
      {confettiPieces.current.map((piece) => (
        <Animated.View
          key={piece.id}
          style={[
            styles.confetti,
            {
              backgroundColor: piece.color,
              transform: [
                { translateX: piece.x },
                { translateY: piece.y },
                {
                  rotate: piece.rotation.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
  },
});
