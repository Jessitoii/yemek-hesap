import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from "../../../constants/colors";
import { typography } from "../../../constants/typography";
import { shadow } from "../../../constants/theme";
import { StreakCalendar } from '../../../components/activity/StreakCalendar';
import { useActivityStore } from '../../../stores/activityStore';
import { getStreakHistory } from '../../../db/queries/streak';
import { StreakDay } from '@/types/activity';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, AvatarState } from '../../../components/ui/Avatar';

export default function StreakScreen() {
  const { streak } = useActivityStore();
  const [history, setHistory] = useState<StreakDay[]>([]);
  const [bestStreak, setBestStreak] = useState(0);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const data = await getStreakHistory();
    setHistory(data);

    // Simple mock for best streak: at least as much as current
    setBestStreak(Math.max(streak, 12));
  };

  const getAvatarState = (): AvatarState => {
    if (streak >= 7) return 'celebrate';
    if (streak === 0) return 'wave';
    return 'idle';
  };

  const getAvatarMessage = () => {
    if (streak >= 30) return "İnanılmaz! 1 aydır dur durak bilmedin. Sen gerçek bir şampiyonsun! 🏆";
    if (streak >= 7) return "Harika gidiyorsun! Tam 1 haftadır hedeflerine ulaşıyorsun. Devam et! 🔥";
    if (streak >= 3) return "İvme kazanıyorsun! Seriyi bozmamak için bugün de gayret et. 💪";
    return "Seriye başlamak için harika bir gün! İlk hedefini bugün tamamla. 🚀";
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Aktivite Serisi</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.badgeContainer}>
          <View style={styles.badge}>
            <MaterialCommunityIcons name="fire" size={80} color={colors.accent} />
            <Text style={styles.streakCount}>{streak} Gün</Text>
            <Text style={styles.streakLabel}>Güncel Seri</Text>
          </View>

          <View style={styles.bestStreakRow}>
            <MaterialCommunityIcons name="trophy" size={20} color={colors.warning} />
            <Text style={styles.bestStreakText}>En İyi: {bestStreak} gün</Text>
          </View>
        </View>

        <View style={styles.messageBox}>
          <Avatar
            size={60}
            state={getAvatarState()}
          />
          <View style={styles.messageContent}>
            <Text style={styles.messageText}>{getAvatarMessage()}</Text>
          </View>
        </View>

        <View style={styles.calendarSection}>
          <Text style={styles.sectionTitle}>Takvim</Text>
          <StreakCalendar streakHistory={history} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: typography.fontBold,
    fontSize: typography.xl,
    color: colors.textPrimary,
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  badge: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.md,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: colors.accentLight,
  },
  streakCount: {
    fontFamily: typography.fontBold,
    fontSize: 40,
    color: colors.textPrimary,
    marginTop: -8,
  },
  streakLabel: {
    fontFamily: typography.fontMedium,
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  bestStreakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bestStreakText: {
    fontFamily: typography.fontBold,
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    padding: 16,
    borderRadius: 16,
    marginBottom: 32,
  },
  messageContent: {
    flex: 1,
    marginLeft: 16,
  },
  messageText: {
    fontFamily: typography.fontMedium,
    fontSize: typography.base,
    color: colors.primaryDark,
    lineHeight: 20,
  },
  calendarSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontFamily: typography.fontBold,
    fontSize: typography.lg,
    color: colors.textPrimary,
    marginBottom: 12,
  },
});
