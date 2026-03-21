import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, radius } from '@/constants/theme';
import { useUserStore } from '@/stores/userStore';
import { Gender } from '@/types/user';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const PHOTO_KEY = 'profile_photo';

export default function ProfileEditScreen() {
  const router = useRouter();
  const { profile, updateProfile, isLoading } = useUserStore();

  const [name, setName] = useState(profile?.name || '');
  const [gender, setGender] = useState<Gender>(profile?.gender || Gender.MALE);
  const [age, setAge] = useState(profile?.age?.toString() || '');
  const [height, setHeight] = useState(profile?.height?.toString() || '');
  const [weight, setWeight] = useState(profile?.weight?.toString() || '');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadProfilePhoto();
  }, []);

  const loadProfilePhoto = async () => {
    try {
      const storedPhoto = await AsyncStorage.getItem(PHOTO_KEY);
      if (storedPhoto) {
        setPhotoUri(storedPhoto);
      }
    } catch (error) {
      console.error('Error loading profile photo:', error);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Galeriye erişmek için izin vermeniz gerekiyor.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        const uri = result.assets[0].uri;
        setPhotoUri(uri);
        await AsyncStorage.setItem(PHOTO_KEY, uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Hata', 'Fotoğraf seçilirken bir sorun oluştu.');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Hata', 'Lütfen isminizi girin.');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        name,
        gender,
        age: parseInt(age) || 0,
        height: parseInt(height) || 0,
        weight: parseInt(weight) || 0,
      });
      router.back();
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Hata', 'Profil güncellenirken bir sorun oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profili Düzenle</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Photo Section */}
          <View style={styles.photoSection}>
            <Avatar
              size={120}
              imageUrl={photoUri}
              onPress={handlePickImage}
              style={styles.avatar}
            />
            <TouchableOpacity onPress={handlePickImage} style={styles.changePhotoBtn}>
              <Text style={styles.changePhotoText}>Fotoğrafı Değiştir</Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            <Input
              label="Ad Soyad"
              value={name}
              onChangeText={setName}
              placeholder="Adınızı girin"
            />

            <View style={styles.fieldLabel}>
              <Text style={styles.label}>Cinsiyet</Text>
            </View>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[
                  styles.genderOption,
                  gender === Gender.MALE && styles.genderOptionActive,
                  { borderTopLeftRadius: radius.md, borderBottomLeftRadius: radius.md }
                ]}
                onPress={() => setGender(Gender.MALE)}
              >
                <Ionicons 
                  name="male" 
                  size={20} 
                  color={gender === Gender.MALE ? colors.textOnPrimary : colors.textSecondary} 
                />
                <Text style={[
                  styles.genderText,
                  gender === Gender.MALE && styles.genderTextActive
                ]}>Erkek</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderOption,
                  gender === Gender.FEMALE && styles.genderOptionActive,
                  { borderTopRightRadius: radius.md, borderBottomRightRadius: radius.md }
                ]}
                onPress={() => setGender(Gender.FEMALE)}
              >
                <Ionicons 
                  name="female" 
                  size={20} 
                  color={gender === Gender.FEMALE ? colors.textOnPrimary : colors.textSecondary} 
                />
                <Text style={[
                  styles.genderText,
                  gender === Gender.FEMALE && styles.genderTextActive
                ]}>Kadın</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Yaş"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="number-pad"
                  placeholder="25"
                />
              </View>
              <View style={{ width: spacing.md }} />
              <View style={{ flex: 1 }}>
                <Input
                  label="Boy (cm)"
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="number-pad"
                  placeholder="180"
                />
              </View>
            </View>

            <Input
              label="Kilo (kg)"
              value={weight}
              onChangeText={setWeight}
              keyboardType="number-pad"
              placeholder="75"
            />
          </View>

          <View style={styles.footer}>
            <Button
              label="Kaydet"
              onPress={handleSave}
              loading={isSaving}
              fullWidth
              style={styles.saveButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: typography.fontBold,
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    borderWidth: 4,
    borderColor: colors.surface,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  changePhotoBtn: {
    marginTop: 12,
  },
  changePhotoText: {
    fontSize: 14,
    fontFamily: typography.fontSemiBold,
    color: colors.primary,
  },
  form: {
    gap: 8,
  },
  fieldLabel: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    marginLeft: 1,
  },
  label: {
    fontFamily: typography.fontMedium,
    fontSize: typography.base,
    color: colors.textSecondary,
  },
  genderContainer: {
    flexDirection: 'row',
    height: 52,
    marginBottom: spacing.sm,
  },
  genderOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  genderOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderText: {
    fontSize: 15,
    fontFamily: typography.fontSemiBold,
    color: colors.textSecondary,
  },
  genderTextActive: {
    color: colors.textOnPrimary,
  },
  row: {
    flexDirection: 'row',
  },
  saveButton: {
    marginTop: 24,
  },
  footer: {
    marginTop: 20,
  },
});
