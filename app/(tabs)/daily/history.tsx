import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  subDays,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import { tr } from 'date-fns/locale';
import { CaretLeft, CaretRight, ChartLineUp, Calendar as CalendarIcon, Trophy } from 'phosphor-react-native';
import { addDays } from 'date-fns'
import { getLogsInRange } from '@/db/queries/dailyLog';
import { getCurrentStreak } from '@/db/queries/streak';
import { colors } from '@/constants/colors';
import { spacing, radius } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { DailyLog } from '@/types/daily';

const { width } = Dimensions.get('window');

export default function HistoryScreen() {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
      const data = await getLogsInRange(start, end);
      setLogs(data);

      const s = await getCurrentStreak();
      setStreak(s);
    } catch (error) {
      console.error('[HistoryScreen] Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentMonth]);

  const monthLabel = format(currentMonth, 'MMMM yyyy', { locale: tr });

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const getDayStatusColor = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const log = logs.find(l => format(l.date, 'yyyy-MM-dd') === dateStr);

    if (!log || log.totalCalories === 0) return colors.borderLight;

    // Simple logic: green if < target (assume 2000 for now or fetch but simplified)
    // Actually we don't have target per day easily here without userStore
    // Let's use 2000 as placeholder or just show total
    if (log.totalCalories > 2200) return colors.error;
    if (log.totalCalories > 1800) return colors.accent;
    return colors.success;
  };

  const weeklyStats = useMemo(() => {
    // Last 7 days
    const end = new Date();
    const start = subDays(end, 6);
    // This would need a separate fetch if different month, but let's assume current view for now
    // or just use logs if they are in range
    return logs.slice(-7).map(l => ({
      day: format(l.date, 'EE', { locale: tr }),
      calories: l.totalCalories,
      cost: l.totalCost
    }));
  }, [logs]);

  const monthlySummary = useMemo(() => {
    if (logs.length === 0) return { avgCal: 0, totalCost: 0 };
    const validLogs = logs.filter(l => l.totalCalories > 0);
    const avgCal = validLogs.reduce((sum, l) => sum + l.totalCalories, 0) / (validLogs.length || 1);
    const totalCost = logs.reduce((sum, l) => sum + l.totalCost, 0);
    return { avgCal, totalCost };
  }, [logs]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <CaretLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Geçmiş</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Calendar Card */}
        <View style={styles.card}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={() => setCurrentMonth(subDays(startOfMonth(currentMonth), 1))}>
              <CaretLeft size={20} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{monthLabel}</Text>
            <TouchableOpacity onPress={() => setCurrentMonth(addDays(endOfMonth(currentMonth), 1))}>
              <CaretRight size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.calendarGrid}>
            {['Pt', 'Sa', 'Çr', 'Pr', 'Cu', 'Ct', 'Pz'].map(d => (
              <Text key={d} style={styles.dayHeader}>{d}</Text>
            ))}
            {calendarDays.map((date, idx) => {
              const isCurrMonth = isSameMonth(date, currentMonth);
              const color = getDayStatusColor(date);
              return (
                <TouchableOpacity
                  key={idx}
                  style={styles.dayCell}
                  onPress={() => {
                    // Navigate to that day
                    router.push({ pathname: '/(tabs)/daily', params: { date: format(date, 'yyyy-MM-dd') } });
                  }}
                >
                  <Text style={[
                    styles.dayText,
                    !isCurrMonth && styles.otherMonthText,
                    isToday(date) && styles.todayText
                  ]}>
                    {format(date, 'd')}
                  </Text>
                  <View style={[styles.dot, { backgroundColor: color }]} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Summary Stats */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Trophy size={24} color={colors.accent} weight="fill" />
            <Text style={styles.summaryVal}>{streak} Gün</Text>
            <Text style={styles.summaryLabel}>Seri</Text>
          </View>
          <View style={styles.summaryItem}>
            <ChartLineUp size={24} color={colors.primary} weight="fill" />
            <Text style={styles.summaryVal}>{Math.round(monthlySummary.avgCal)}</Text>
            <Text style={styles.summaryLabel}>Ort. Kcal</Text>
          </View>
          <View style={styles.summaryItem}>
            <CalendarIcon size={24} color={colors.secondary} weight="fill" />
            <Text style={styles.summaryVal}>₺{monthlySummary.totalCost.toFixed(0)}</Text>
            <Text style={styles.summaryLabel}>Toplam TL</Text>
          </View>
        </View>

        {/* Weekly Calories Chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Haftalık Kalori</Text>
          {weeklyStats.length > 0 ? (
            <View style={{ paddingVertical: 8 }}>
              {weeklyStats.map((stat, i) => (
                <View key={i} style={{ marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 11, color: colors.textSecondary, fontFamily: typography.fontMedium }}>
                      {stat.day}
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.textSecondary, fontFamily: typography.fontMedium }}>
                      {stat.calories} kcal
                    </Text>
                  </View>
                  <View style={{ height: 8, backgroundColor: colors.borderLight, borderRadius: 4 }}>
                    <View style={{
                      height: 8,
                      width: `${Math.min((stat.calories / Math.max(...weeklyStats.map(s => s.calories), 1)) * 100, 100)}%`,
                      backgroundColor: colors.primary,
                      borderRadius: 4,
                    }} />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <ActivityIndicator color={colors.primary} />
          )}
        </View>

        {/* Weekly Spending Chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Haftalık Harcama</Text>
          {weeklyStats.length > 0 ? (
            <View style={{ paddingVertical: 8 }}>
              {weeklyStats.map((stat, i) => (
                <View key={i} style={{ marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 11, color: colors.textSecondary, fontFamily: typography.fontMedium }}>
                      {stat.day}
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.textSecondary, fontFamily: typography.fontMedium }}>
                      ₺{stat.cost?.toFixed(2)}
                    </Text>
                  </View>
                  <View style={{ height: 8, backgroundColor: colors.borderLight, borderRadius: 4 }}>
                    <View style={{
                      height: 8,
                      width: `${Math.min((stat.cost / Math.max(...weeklyStats.map(s => s.cost), 1)) * 100, 100)}%`,
                      backgroundColor: colors.accent,
                      borderRadius: 4,
                    }} />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <ActivityIndicator color={colors.primary} />
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontFamily: typography.fontBold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardTitle: {
    fontFamily: typography.fontBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  monthTitle: {
    fontFamily: typography.fontBold,
    fontSize: 16,
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayHeader: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontFamily: typography.fontBold,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontFamily: typography.fontMedium,
    fontSize: 14,
    color: colors.textPrimary,
  },
  otherMonthText: {
    color: colors.textDisabled,
  },
  todayText: {
    color: colors.primary,
    fontFamily: typography.fontBold,
    textDecorationLine: 'underline',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  summaryVal: {
    fontFamily: typography.fontBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  summaryLabel: {
    fontFamily: typography.fontMedium,
    fontSize: 12,
    color: colors.textSecondary,
  },
});
