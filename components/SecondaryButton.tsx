import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

type Props = {
  onPress: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
};

export default function SecondaryButton({ onPress, children, style, textStyle, disabled }: Props) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const active = hovered || pressed;

  return (
    <TouchableOpacity
      onPress={onPress}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={disabled}
      style={[styles.button, active && styles.buttonActive, style]}
      activeOpacity={1}
    >
      <Text style={[styles.text, active && styles.textActive, textStyle]}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  buttonActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  text: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  textActive: {
    color: '#ffffff',
  },
});
