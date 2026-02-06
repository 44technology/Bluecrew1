import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { router } from 'expo-router';

const LOADING_DURATION_MS = 2500;

export default function IndexScreen() {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: LOADING_DURATION_MS,
      useNativeDriver: false,
      easing: Easing.out(Easing.ease),
    }).start();
  }, [progress]);

  useEffect(() => {
    const t = setTimeout(() => {
      router.replace('/login');
    }, LOADING_DURATION_MS);
    return () => clearTimeout(t);
  }, []);

  const widthInterpolate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Blue Crew</Text>
      <Text style={styles.subtitle}>Project Management App</Text>

      <View style={styles.loadingTrack}>
        <Animated.View style={[styles.loadingFill, { width: widthInterpolate }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFCC00',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#236ECF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#236ECF',
    marginBottom: 40,
    textAlign: 'center',
  },
  loadingTrack: {
    width: '80%',
    maxWidth: 320,
    height: 8,
    backgroundColor: '#ffffff',
    borderRadius: 4,
    overflow: 'hidden',
  },
  loadingFill: {
    height: '100%',
    backgroundColor: '#236ECF',
    borderRadius: 4,
  },
});
