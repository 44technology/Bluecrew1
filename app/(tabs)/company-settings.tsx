import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  Image as RNImage,
} from 'react-native';
import BackButton from '@/components/BackButton';
import HamburgerMenu from '@/components/HamburgerMenu';
import ColorPickerModal from '@/components/ColorPickerModal';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { PLATFORM_NAME } from '@/types';
import { CompanyService } from '@/services/companyService';
import { AuthService } from '@/services/authService';
import { Building2, Image as ImageIcon } from 'lucide-react-native';
import { ColorPaletteId } from '@/types';
import { COLOR_PALETTES } from '@/constants/theme';
import { RADIUS, SHADOW, SPACING } from '@/constants/design';

export default function CompanySettingsScreen() {
  const { user, userRole, refreshUser } = useAuth();
  const { company, theme, paletteId, setPaletteId, refreshCompany } = useTheme();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [colorPickerKey, setColorPickerKey] = useState<'primary' | 'accent' | 'background'>('primary');

  const companyId = (user as any)?.company_id;
  const isAdmin = userRole === 'admin';

  useEffect(() => {
    if (company) {
      setName(company.name || '');
      setState(company.state || '');
      setCity(company.city || '');
      setAddress(company.address || '');
    }
  }, [company]);

  const handleCreateCompany = async () => {
    if (!name.trim()) {
      Alert.alert(t('error'), t('companyNameRequired'));
      return;
    }
    if (!user?.id || !isAdmin) return;
    setSaving(true);
    try {
      const id = await CompanyService.createCompany({
        name: name.trim(),
        state: state.trim() || undefined,
        city: city.trim() || undefined,
        address: address.trim() || undefined,
        color_palette: 1,
      });
      await AuthService.updateUserProfile(user.id, { company_id: id });
      await refreshUser();
      await refreshCompany();
      Alert.alert(t('success'), t('companyCreated'));
    } catch (e: any) {
      Alert.alert(t('error'), e?.message || t('companyCreateError'));
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t('error'), t('companyNameRequired'));
      return;
    }
    if (!companyId || !isAdmin) return;
    setSaving(true);
    try {
      await CompanyService.updateCompany(companyId, {
        name: name.trim(),
        state: state.trim() || undefined,
        city: city.trim() || undefined,
        address: address.trim() || undefined,
      });
      await refreshCompany();
      Alert.alert(t('success'), t('infoSaved'));
    } catch (e: any) {
      Alert.alert(t('error'), e?.message || t('saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveColor = async (hex: string) => {
    if (!companyId || !isAdmin) return;
    try {
      const updates: Record<string, string> = {};
      if (colorPickerKey === 'primary') updates.custom_primary = hex;
      else if (colorPickerKey === 'accent') updates.custom_accent = hex;
      else if (colorPickerKey === 'background') updates.custom_background = hex;
      await CompanyService.updateCompany(companyId, updates);
      await refreshCompany();
    } catch (e: any) {
      Alert.alert(t('error'), e?.message || t('saveFailed'));
    }
  };

  const handleLogoPick = async () => {
    if (!companyId || !isAdmin) return;
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.files?.[0]) {
          setUploadingLogo(true);
          try {
            await CompanyService.uploadLogo(companyId, target.files[0], target.files[0].name);
            await refreshCompany();
          } catch (err: any) {
            Alert.alert(t('error'), err?.message || t('logoUploadFailed'));
          } finally {
            setUploadingLogo(false);
          }
        }
      };
      input.click();
    } else {
      Alert.alert(t('info'), t('logoUploadMobile'));
    }
  };

  return (
    <>
      <HamburgerMenu />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.primaryDark }]}>
          <BackButton color="#000000" backgroundColor="rgba(0,0,0,0.06)" />
          <Text style={styles.headerTitle}>{t('companySettings')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.card, { borderRadius: RADIUS.xl, padding: SPACING.lg, ...SHADOW.card }]}>
            <View style={styles.platformBadge}>
              <Text style={styles.platformLabel}>{PLATFORM_NAME}</Text>
            </View>
            <Text style={styles.platformSub}>{t('companySettingsSubtitle')}</Text>

            {!companyId && isAdmin && (
              <>
                <Text style={styles.sectionLabel}>{t('createCompany')}</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder={`${t('companyName')} *`}
                  placeholderTextColor="#000000"
                />
                <TextInput
                  style={styles.input}
                  value={state}
                  onChangeText={setState}
                  placeholder={t('stateProvince')}
                  placeholderTextColor="#000000"
                />
                <TextInput
                  style={styles.input}
                  value={city}
                  onChangeText={setCity}
                  placeholder={t('city')}
                  placeholderTextColor="#000000"
                />
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  value={address}
                  onChangeText={setAddress}
                  placeholder={t('address')}
                  placeholderTextColor="#000000"
                  multiline
                />
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: theme.primary }]}
                  onPress={handleCreateCompany}
                  disabled={saving}
                >
                  {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{t('createCompanyButton')}</Text>}
                </TouchableOpacity>
              </>
            )}

            {companyId && (
              <>
                {/* Logo */}
                <Text style={styles.sectionLabel}>{t('logo')}</Text>
                <TouchableOpacity onPress={handleLogoPick} style={styles.logoBox} disabled={!isAdmin || uploadingLogo}>
                  {company?.logo_url ? (
                    <RNImage source={{ uri: company.logo_url }} style={styles.logoImage} />
                  ) : (
                    <ImageIcon size={48} color="#000000" />
                  )}
                  {uploadingLogo && (
                    <View style={styles.logoOverlay}>
                      <ActivityIndicator color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>

                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder={`${t('companyName')} *`}
                  placeholderTextColor="#000000"
                  editable={isAdmin}
                />
                <TextInput
                  style={styles.input}
                  value={state}
                  onChangeText={setState}
                  placeholder={t('stateProvince')}
                  placeholderTextColor="#000000"
                  editable={isAdmin}
                />
                <TextInput
                  style={styles.input}
                  value={city}
                  onChangeText={setCity}
                  placeholder={t('city')}
                  placeholderTextColor="#000000"
                  editable={isAdmin}
                />
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  value={address}
                  onChangeText={setAddress}
                  placeholder={t('address')}
                  placeholderTextColor="#000000"
                  multiline
                  editable={isAdmin}
                />

                <Text style={styles.sectionLabel}>{t('colorPalette')}</Text>
                <View style={styles.paletteRow}>
                  {([1, 2, 3, 4] as ColorPaletteId[]).map((id) => {
                    const p = COLOR_PALETTES[id];
                    const isActive = paletteId === id;
                    const showColors = isActive ? theme : p;
                    return (
                      <TouchableOpacity
                        key={id}
                        style={[
                          styles.paletteBtn,
                          { borderRadius: RADIUS.lg, backgroundColor: '#f8fafc', borderColor: isActive ? theme.primary : '#e2e8f0' },
                          isActive && styles.paletteBtnActive,
                        ]}
                        onPress={() => isAdmin && setPaletteId(id)}
                        disabled={!isAdmin}
                        activeOpacity={0.85}
                      >
                        <View style={styles.paletteSwatches}>
                          {(['primary', 'accent', 'background'] as const).map((key) => (
                            isAdmin && isActive ? (
                              <TouchableOpacity
                                key={key}
                                style={[styles.paletteSwatch, { backgroundColor: showColors[key] }]}
                                onPress={() => {
                                  setColorPickerKey(key);
                                  setColorPickerVisible(true);
                                }}
                                activeOpacity={0.8}
                              />
                            ) : (
                              <View key={key} style={[styles.paletteSwatch, { backgroundColor: showColors[key] }]} />
                            )
                          ))}
                        </View>
                        <Text style={styles.paletteLabel}>{t(`palette${id}Name` as 'palette1Name' | 'palette2Name' | 'palette3Name' | 'palette4Name')}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <ColorPickerModal
                  visible={colorPickerVisible}
                  initialHex={colorPickerKey === 'primary' ? theme.primary : colorPickerKey === 'accent' ? theme.accent : theme.background}
                  title={`${t('chooseColor')} – ${colorPickerKey === 'primary' ? t('colorPrimary') : colorPickerKey === 'accent' ? t('colorAccent') : t('colorBackground')}`}
                  onSave={handleSaveColor}
                  onClose={() => setColorPickerVisible(false)}
                />

                {isAdmin && (
                  <TouchableOpacity
                    style={[styles.saveBtn, { backgroundColor: theme.primary }]}
                    onPress={handleSave}
                    disabled={saving}
                  >
                    {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{t('save')}</Text>}
                  </TouchableOpacity>
                )}
              </>
            )}

            {!companyId && !isAdmin && (
              <Text style={styles.mutedText}>{t('companyAdminOnly')}</Text>
            )}
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#b0b0b0',
  },
  platformBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  platformLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 0.2,
  },
  platformSub: {
    fontSize: 14,
    color: '#000000',
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000000',
    marginBottom: 12,
    backgroundColor: '#f8fafc',
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  logoBox: {
    width: 120,
    height: 120,
    borderRadius: RADIUS.lg,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paletteRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  paletteBtn: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    minHeight: 88,
  },
  paletteBtnActive: {
    borderWidth: 3,
  },
  paletteSwatches: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  paletteSwatch: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  paletteLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  saveBtn: {
    paddingVertical: 16,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  saveBtnText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  mutedText: {
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
    marginTop: 16,
  },
});
