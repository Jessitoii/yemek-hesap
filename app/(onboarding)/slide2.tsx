import React from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SlideContainer } from '@/components/onboarding/SlideContainer';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { ShoppingCart } from 'phosphor-react-native';

export default function Slide2Cost() {
  return (
    <SlideContainer 
      gradientColors={['#E8F5E9', '#FAFAFA']}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            <View style={styles.animationContainer}>
              <View style={styles.iconCircle}>
                <ShoppingCart size={80} color={colors.secondary} weight="duotone" />
              </View>
            </View>

            <Text style={styles.title}>Maliyet Takibi</Text>
            <Text style={styles.subtitle}>
              Sadece kalorileri değil, cebinizi de düşünüyoruz. Yemeklerinizin maliyetini otomatik hesaplayın.
            </Text>
            
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <Text style={styles.featureEmoji}>💰</Text>
                <Text style={styles.featureText}>Günlük bütçe kontrolü</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureEmoji}>📈</Text>
                <Text style={styles.featureText}>Tasarrruf ipuçları</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureEmoji}>🛒</Text>
                <Text style={styles.featureText}>Migros fiyat entegrasyonu</Text>
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
    backgroundColor: colors.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: typography.fontExtraBold,
    fontSize: typography.xxxl,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: typography.fontRegular,
    fontSize: typography.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 48,
    paddingHorizontal: 10,
  },
  featureList: {
    width: '100%',
    paddingHorizontal: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  featureEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  featureText: {
    fontFamily: typography.fontMedium,
    fontSize: typography.md,
    color: colors.textPrimary,
  }
});
