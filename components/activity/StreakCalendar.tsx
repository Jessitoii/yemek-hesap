import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isAfter, 
  isToday 
} from 'date-fns';
import { tr } from 'date-fns/locale';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StreakDay } from '@/types/activity';

interface StreakCalendarProps {
  streakHistory: StreakDay[];
}

export const StreakCalendar: React.FC<StreakCalendarProps> = ({
  streakHistory,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysHeader = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const getDayStatus = (date: Date) => {
    if (isAfter(date, new Date()) && !isToday(date)) return 'future';
    
    // Normalize date to compare
    const dayRecord = streakHistory.find(d => {
        const recordDate = new Date(d.date);
        return isSameDay(recordDate, date);
    });
    
    if (dayRecord) {
      return dayRecord.completed ? 'completed' : 'missed';
    }
    
    if (!isToday(date) && !isAfter(date, new Date())) {
        // Only mark past days as missed if they were within tracking period
        // For mock, let's just show some randomness or just return none
       return 'none';
    }

    return isToday(date) ? 'today' : 'none';
  };

  const renderDay = (date: Date) => {
    const isCurrentMonth = isSameMonth(date, monthStart);
    const status = getDayStatus(date);
    const dayIsToday = isToday(date);

    let circleStyle: any = [styles.dayCircle];
    let textStyle: any = [styles.dayText];

    if (status === 'completed') {
      circleStyle.push({ backgroundColor: colors.success });
      textStyle.push({ color: colors.surface });
    } else if (status === 'missed') {
      circleStyle.push({ backgroundColor: colors.error });
      textStyle.push({ color: colors.surface });
    } else if (dayIsToday) {
      circleStyle.push({ borderColor: colors.primary, borderWidth: 2 });
    }

    if (!isCurrentMonth) {
      textStyle.push({ color: colors.textDisabled });
    }

    return (
      <View key={date.toString()} style={styles.dayCell}>
        <View style={circleStyle}>
          <Text style={textStyle}>{format(date, 'd')}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={prevMonth} style={styles.navButton}>
          <MaterialCommunityIcons name="chevron-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {format(currentMonth, 'MMMM yyyy', { locale: tr })}
        </Text>
        <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekDays}>
        {daysHeader.map(day => (
          <Text key={day} style={styles.weekDayText}>{day}</Text>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {calendarDays.map(date => renderDay(date))}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendCircle, { backgroundColor: colors.success }]} />
          <Text style={styles.legendText}>Hedef Tamam</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendCircle, { backgroundColor: colors.error }]} />
          <Text style={styles.legendText}>Kaçırıldı</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendCircle, { borderColor: colors.primary, borderWidth: 1 }]} />
          <Text style={styles.legendText}>Bugün</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthTitle: {
    fontFamily: typography.fontBold,
    fontSize: typography.base,
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  navButton: {
    padding: 4,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekDayText: {
    fontFamily: typography.fontMedium,
    fontSize: typography.xs,
    color: colors.textSecondary,
    width: 32,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dayCell: {
    width: '14%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontFamily: typography.fontMedium,
    fontSize: typography.sm,
    color: colors.textPrimary,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontFamily: typography.fontRegular,
    fontSize: typography.xs,
    color: colors.textSecondary,
  },
});
