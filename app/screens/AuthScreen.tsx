import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { LoginScreen } from './LoginScreen';
import { SignupScreen } from './SignupScreen';

export const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <View style={styles.container}>
      {isLogin ? (
        <LoginScreen onSwitchToSignup={() => setIsLogin(false)} />
      ) : (
        <SignupScreen onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
