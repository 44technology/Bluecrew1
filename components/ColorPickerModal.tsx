import React, { useState, useEffect, createElement } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';

const HEX_REG = /^#?([0-9A-Fa-f]{6})$/;

function hexNorm(hex: string): string {
  const m = hex.trim().match(HEX_REG);
  if (!m) return hex.trim().startsWith('#') ? hex.trim() : `#${hex.trim()}`;
  return `#${m[1]}`;
}

interface ColorPickerModalProps {
  visible: boolean;
  initialHex: string;
  title?: string;
  onSave: (hex: string) => void;
  onClose: () => void;
}

export default function ColorPickerModal({
  visible,
  initialHex,
  title,
  onSave,
  onClose,
}: ColorPickerModalProps) {
  const { t } = useLanguage();
  const [hex, setHex] = useState(hexNorm(initialHex || '#000000'));

  useEffect(() => {
    if (visible) setHex(hexNorm(initialHex || '#000000'));
  }, [visible, initialHex]);

  const handleSave = () => {
    const normalized = hexNorm(hex);
    if (HEX_REG.test(normalized)) {
      onSave(normalized);
      onClose();
    }
  };

  const isWeb = Platform.OS === 'web';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.box} onStartShouldSetResponder={() => true}>
          <Text style={styles.title}>{title}</Text>

          <View style={styles.previewRow}>
            <View style={[styles.preview, { backgroundColor: HEX_REG.test(hexNorm(hex)) ? hexNorm(hex) : '#888' }]} />
            {isWeb && createElement('input', {
              type: 'color',
              value: HEX_REG.test(hexNorm(hex)) ? hexNorm(hex) : '#000000',
              onChange: (e: any) => setHex(e?.target?.value ?? hex),
              style: {
                width: 48,
                height: 48,
                padding: 0,
                border: 'none',
                cursor: 'pointer',
                borderRadius: 8,
                backgroundColor: 'transparent',
              },
            })}
          </View>

          <Text style={styles.label}>#RRGGBB</Text>
          <TextInput
            style={styles.input}
            value={hex}
            onChangeText={setHex}
            placeholder="#000000"
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>{t('cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.okBtn} onPress={handleSave}>
              <Text style={styles.okText}>{t('ok')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  box: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    minWidth: 280,
    maxWidth: 340,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  preview: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#000',
    marginBottom: 20,
    backgroundColor: '#f8fafc',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
  },
  okBtn: {
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  okText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
