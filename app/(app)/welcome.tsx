import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Platform.OS === 'web' ? 'transparent' : '#f0f0f0', // Прозрачный для web
  },
  text: {
    fontSize: 20,
  },
});
