import React from 'react';
import { TouchableOpacity, StyleSheet, View, Platform } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface BackButtonProps {
  onPress?: () => void;
  color?: string;
  backgroundColor?: string;
  size?: number;
}

export default function BackButton({ 
  onPress, 
  color = '#ffffff',
  backgroundColor = '#ffffff5d',
  size = 20
}: BackButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.push('/');
      }
    }
  };

  return (
    <TouchableOpacity 
      onPress={handlePress} 
      style={styles.backButton}
      activeOpacity={0.7}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <View style={[styles.backButtonInner, { backgroundColor }]}>
        <ArrowLeft size={size} color={color} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backButton: {
    marginRight: 12,
  },
  backButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
