import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { CaretDown, CaretUp, TrendUp, TrendDown, Minus } from 'phosphor-react-native';
import { colors } from '@/constants/colors';
import { spacing, radius } from '@/constants/theme';
import { typography } from '@/constants/typography';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface PriceRecord {
  date: string; // ISO or YYYY-MM-DD
  price: number;
}

interface PriceHistoryProps {
  history: PriceRecord[];
}

export function PriceHistory({ history }: PriceHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (history.length === 0) return null;

  // Assume history is sorted by date descending (latest first)
  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendUp size={16} color={colors.priceUp} weight="bold" />;
    if (current < previous) return <TrendDown size={16} color={colors.priceDown} weight="bold" />;
    return <Minus size={16} color={colors.priceUnchanged} weight="bold" />;
  };

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return null;
    const diff = ((current - previous) / previous) * 100;
    return diff.toFixed(1) + '%';
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.header} 
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <Text style={styles.title}>Fiyat Geçmişi</Text>
        <View style={styles.headerRight}>
          <Text style={styles.count}>{history.length} Kayıt</Text>
          {isExpanded ? (
            <CaretUp size={18} color={colors.textSecondary} weight="bold" />
          ) : (
            <CaretDown size={18} color={colors.textSecondary} weight="bold" />
          )}
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.content}>
          <View style={styles.tableHead}>
            <Text style={[styles.headCell, { flex: 2 }]}>Tarih</Text>
            <Text style={[styles.headCell, { flex: 1.5 }]}>Fiyat</Text>
            <Text style={[styles.headCell, { flex: 1, textAlign: 'right' }]}>Değişim</Text>
          </View>
          {history.map((record, index) => {
            const nextRecord = history[index + 1];
            const hasChange = nextRecord !== undefined;
            const changeVal = hasChange ? calculateChange(record.price, nextRecord.price) : null;

            return (
              <View key={index} style={styles.row}>
                <Text style={[styles.cell, { flex: 2 }]}>
                  {format(new Date(record.date), 'd MMMM yyyy', { locale: tr })}
                </Text>
                <Text style={[styles.cell, styles.priceCell, { flex: 1.5 }]}>
                  ₺{record.price.toFixed(2)}
                </Text>
                <View style={[styles.cell, styles.changeCell, { flex: 1 }]}>
                  {hasChange && (
                    <>
                      {getTrendIcon(record.price, nextRecord.price)}
                      <Text style={[
                        styles.changeText, 
                        { color: record.price > nextRecord.price ? colors.priceUp : record.price < nextRecord.price ? colors.priceDown : colors.textSecondary }
                      ]}>
                        {changeVal}
                      </Text>
                    </>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  title: {
    fontFamily: typography.fontBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  count: {
    fontFamily: typography.fontMedium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  tableHead: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8,
    marginBottom: 8,
  },
  headCell: {
    fontFamily: typography.fontBold,
    fontSize: 11,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  cell: {
    fontFamily: typography.fontRegular,
    fontSize: 13,
    color: colors.textPrimary,
  },
  priceCell: {
    fontFamily: typography.fontBold,
  },
  changeCell: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  changeText: {
    fontFamily: typography.fontSemiBold,
    fontSize: 12,
  },
});
