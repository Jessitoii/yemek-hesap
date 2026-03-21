import React from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SlideContainer } from '@/components/onboarding/SlideContainer';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { useOnboarding } from './_layout';
import { SketchLogo } from 'phosphor-react-native';

export default function Slide3Calorie() {
  const { data } = useOnboarding();

  return (
    <SlideContainer 
      gradientColors={['#FFF3E0', '#FAFAFA']}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            <View style={styles.animationContainer}>
              <View style={styles.iconCircle}>
                <SketchLogo size={80} color={colors.accent} weight="duotone" />
              </View>
            </View>

            <Text style={styles.title}>
              <Text style={styles.highlight}>{data.name}</Text>, sağlıklı yemeyi kolaylaştırıyoruz.
            </Text>
            <Text style={styles.subtitle}>
              Makro ve mikro besin değerleriniz her zaman yanınızda olsun.
            </Text>
            
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={styles.miniCard}>
                  <Text style={styles.miniTitle}>Protein</Text>
                  <Text style={styles.miniValue}>85g</Text>
                </View>
                <View style={styles.miniCard}>
                  <Text style={styles.miniTitle}>Karbonhidrat</Text>
                  <Text style={styles.miniValue}>120g</Text>
                </View>
                <View style={styles.miniCard}>
                  <Text style={styles.miniTitle}>Yağ</Text>
                  <Text style={styles.miniValue}>45g</Text>
                </View>
              </View>
              <View style={styles.progressContainer}>
                 <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '65%', backgroundColor: colors.accent }]} />
                 </View>
                 <Text style={styles.progressText}>1750 / 2200 kcal</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SlideContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  animationContainer: {
    width: 160,
    height: 160,
    marginBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: typography.fontExtraBold,
    fontSize: typography.xxxl,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 34,
  },
  highlight: {
    color: colors.accentDark,
  },
  subtitle: {
    fontFamily: typography.fontRegular,
    fontSize: typography.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 24,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  miniCard: {
    alignItems: 'center',
  },
  miniTitle: {
    fontFamily: typography.fontMedium,
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  miniValue: {
    fontFamily: typography.fontBold,
    fontSize: typography.md,
    color: colors.textPrimary,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 12,
    backgroundColor: colors.borderLight,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressText: {
    fontFamily: typography.fontSemiBold,
    fontSize: typography.sm,
    color: colors.textSecondary,
  }
});
