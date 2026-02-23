import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

const SPLASH_BG = '#FFCC00';
const SPLASH_TEXT = '#236ECF';

interface BlueCrewSplashProps {
  /** Show loading bar/spinner below subtitle */
  showLoader?: boolean;
}

export default function BlueCrewSplash({ showLoader = true }: BlueCrewSplashProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Blue Crew</Text>
      <Text style={styles.subtitle}>Project Management App</Text>
      {showLoader && (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={SPLASH_TEXT} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: SPLASH_BG,
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: SPLASH_TEXT,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: SPLASH_TEXT,
    marginBottom: 40,
    textAlign: 'center',
  },
  loaderWrap: {
    marginTop: 8,
  },
});

export const BLUE_CREW_SPLASH_BG = SPLASH_BG;
