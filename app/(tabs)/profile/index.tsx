import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { useUserStore } from '@/stores/userStore';
import { Avatar } from '@/components/ui/Avatar';
import { ProfileSection } from '@/components/profile/ProfileSection';
import { StatCard } from '@/components/profile/StatCard';
import { GoalDisplay } from '@/components/profile/GoalDisplay';
import { BodyFatModal } from '@/components/profile/BodyFatModal';
import { Ionicons, MaterialCommunityIcons, SimpleLineIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Gender } from '@/types/user';
import { useNotifications } from '@/hooks/useNotifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, goals, settings, stats, isLoading, loadUser, loadStats, updateSettings, updateProfile } = useUserStore();
  const [bfModalVisible, setBfModalVisible] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const notifications = useNotifications();

  useFocusEffect(
    React.useCallback(() => {
      loadProfilePhoto();
    }, [])
  );

  const loadProfilePhoto = async () => {
    try {
      const storedPhoto = await AsyncStorage.getItem('profile_photo');
      if (storedPhoto) {
        setPhotoUri(storedPhoto);
      }
    } catch (error) {
      console.error('Error loading profile photo:', error);
    }
  };

  useEffect(() => {
    loadUser();
    loadStats();
  }, []);

  const handleToggleNotification = async (key: string, value: boolean) => {
    if (!settings) return;
    const updatedSettings = { ...settings, [key]: value };
    await updateSettings(updatedSettings);
    notifications.scheduleAll(updatedSettings);
  };


  const handleBodyFatSave = async (value: number) => {
    await updateProfile({ bodyFatPercentage: value });
    setBfModalVisible(false);
  };

  if (isLoading || !profile || !goals || !settings) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 1. Avatar + İsim */}
        <View style={styles.header}>
          <Avatar
            size={100}
            imageUrl={photoUri}
            onPress={() => router.push('/(tabs)/profile/edit')}
            style={styles.avatar}
          />
          <Text style={styles.name}>{profile.name}</Text>
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => router.push('/(tabs)/profile/edit')}
          >
            <Text style={styles.editProfileText}>Profili Düzenle</Text>
          </TouchableOpacity>
        </View>

        {/* 2. Kişisel Bilgiler */}
        <ProfileSection title="Kişisel Bilgiler">
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Cinsiyet</Text>
              <Text style={styles.infoValue}>{profile.gender === Gender.MALE ? 'Erkek' : 'Kadın'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Yaş</Text>
              <Text style={styles.infoValue}>{profile.age}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Boy</Text>
              <Text style={styles.infoValue}>{profile.height} cm</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Kilo</Text>
              <Text style={styles.infoValue}>{profile.weight} kg</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Vücut Yağı</Text>
              <View style={styles.bfRow}>
                <Text style={styles.infoValue}>{profile.bodyFatPercentage ? `%${profile.bodyFatPercentage}` : '-'}</Text>
                <TouchableOpacity onPress={() => setBfModalVisible(true)}>
                  <Text style={styles.calcLink}>Hesapla</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ProfileSection>

        {/* 3. Hedefler */}
        <ProfileSection title="Hedefler ve Hedef Değerler">
          <GoalDisplay
            goals={goals}
            onEditPress={() => router.push('/(tabs)/profile/change-goal' as any)}
          />
        </ProfileSection>

        {/* 4. İstatistikler */}
        <ProfileSection title="İstatistikler">
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <StatCard
                label="Bu ay toplam harcama"
                value={stats?.monthlySpending || 0}
                unit="₺"
                color={colors.accentDark}
              />
              <StatCard
                label="Bu ay günlük ort. kalori"
                value={stats?.monthlyAvgCalories || 0}
                unit="kcal"
                color={colors.primary}
              />
            </View>
            <View style={styles.statsRow}>
              <StatCard
                label="En çok pişirilen tarif"
                value={stats?.mostCookedRecipeName || 'Yok'}
              />
            </View>
            <View style={styles.statsRow}>
              <StatCard
                label="Toplam yakılan kalori"
                value={stats?.totalBurnedCalories || 0}
                unit="kcal"
                color={colors.secondary}
              />
              <StatCard
                label="En uzun seri"
                value={stats?.longestStreak || 0}
                unit="gün"
                color={colors.accent}
              />
            </View>
          </View>
        </ProfileSection>

        {/* 5. Malzemelerim */}
        <TouchableOpacity
          style={styles.linkCard}
          onPress={() => router.push('/recipes/my-ingredients')}
        >
          <View style={styles.linkLeft}>
            <View style={[styles.iconBox, { backgroundColor: colors.secondaryLight }]}>
              <MaterialCommunityIcons name="fridge-outline" size={24} color={colors.secondaryDark} />
            </View>
            <Text style={styles.linkText}>Malzemelerim</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textDisabled} />
        </TouchableOpacity>

        {/* 6. Ayarlar */}
        <ProfileSection title="Ayarlar">
          <View style={styles.settingsList}>
            <View style={styles.settingItem}>
              <View>
                <Text style={styles.settingLabel}>Bildirimler</Text>
                <Text style={styles.settingSubtext}>Öğün ve su hatırlatıcıları</Text>
              </View>
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={(val) => handleToggleNotification('notificationsEnabled', val)}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.settingItem} 
              onPress={() => router.push('/(tabs)/profile/meal-times')}
            >
              <View>
                <Text style={styles.settingLabel}>Öğün Zamanları</Text>
                <Text style={styles.settingSubtext}>Hatırlatıcı saatlerini ayarla</Text>
              </View>
              <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View>
                <Text style={styles.settingLabel}>Adım Hedefi</Text>
                <Text style={styles.settingSubtext}>{goals.stepGoal} Adım</Text>
              </View>
              <TouchableOpacity onPress={() => Alert.alert('Bilgi', 'Hedef değiştirme modalı eklenecek')}>
                <Text style={styles.calcLink}>Düzenle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ProfileSection>

        {/* 7. Sağlık Uygulaması */}
        <ProfileSection title="Sağlık Uygulaması">
          <View style={styles.healthCard}>
            <View style={styles.healthStatus}>
              <View style={[styles.statusIndicator, { backgroundColor: settings.healthConnected ? colors.success : colors.textDisabled }]} />
              <Text style={styles.healthStatusText}>
                {settings.healthConnected ? 'Bağlantı Aktif' : 'Bağlı Değil'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.healthButton, settings.healthConnected ? styles.healthButtonDisconnect : styles.healthButtonConnect]}
              onPress={async () => {
                if (settings.healthConnected) {
                  // Bağlantıyı kes
                  await updateSettings({ healthConnected: false });
                } else {
                  // İzin iste
                  const { requestHealthPermissions } = await import('@/services/health');
                  const granted = await requestHealthPermissions();
                  if (granted) {
                    await updateSettings({ healthConnected: true });
                  } else {
                    Alert.alert(
                      'İzin Gerekli',
                      'Sağlık uygulamasına erişim izni verilmedi. Ayarlardan izin verebilirsin.',
                      [
                        { text: 'İptal', style: 'cancel' },
                        { text: 'Ayarlara Git', onPress: () => Linking.openSettings() },
                      ]
                    );
                  }
                }
              }}
            >
              <Text style={settings.healthConnected ? styles.healthButtonTextDisconnect : styles.healthButtonTextConnect}>
                {settings.healthConnected ? 'Bağlantıyı Kes' : 'Bağlan'}
              </Text>
            </TouchableOpacity>
          </View>
        </ProfileSection>

        <View style={styles.footer}>
          <Text style={styles.version}>KaloriTabak v1.0.0</Text>
        </View>
      </ScrollView>

      <BodyFatModal
        visible={bfModalVisible}
        onClose={() => setBfModalVisible(false)}
        onSave={handleBodyFatSave}
        gender={profile.gender}
        height={profile.height}
      />
    </View>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  avatar: {
    marginBottom: 16,
    borderWidth: 4,
    borderColor: colors.surface,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  name: {
    fontSize: 24,
    fontFamily: typography.fontBold,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  editProfileButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  editProfileText: {
    fontSize: 14,
    fontFamily: typography.fontSemiBold,
    color: colors.textSecondary,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  infoItem: {
    flex: 1,
    minWidth: '45%',
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: typography.fontMedium,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontFamily: typography.fontSemiBold,
    color: colors.textPrimary,
  },
  bfRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calcLink: {
    fontSize: 12,
    fontFamily: typography.fontBold,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  statsGrid: {
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  linkText: {
    fontSize: 16,
    fontFamily: typography.fontSemiBold,
    color: colors.textPrimary,
  },
  settingsList: {
    gap: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLabel: {
    fontSize: 15,
    fontFamily: typography.fontSemiBold,
    color: colors.textPrimary,
  },
  settingSubtext: {
    fontSize: 12,
    fontFamily: typography.fontRegular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
  },
  healthCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceAlt,
    padding: 12,
    borderRadius: 12,
  },
  healthStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  healthStatusText: {
    fontSize: 14,
    fontFamily: typography.fontSemiBold,
    color: colors.textPrimary,
  },
  healthButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  healthButtonConnect: {
    backgroundColor: colors.primary,
  },
  healthButtonDisconnect: {
    borderWidth: 1,
    borderColor: colors.error,
  },
  healthButtonTextConnect: {
    color: colors.textOnPrimary,
    fontFamily: typography.fontBold,
    fontSize: 13,
  },
  healthButtonTextDisconnect: {
    color: colors.error,
    fontFamily: typography.fontBold,
    fontSize: 13,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  version: {
    fontSize: 12,
    fontFamily: typography.fontRegular,
    color: colors.textDisabled,
  },
});
