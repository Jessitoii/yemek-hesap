import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SlideContainer } from '@/components/onboarding/SlideContainer';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { useOnboarding } from './_layout';
// import LottieView from 'lottie-react-native';

export default function Slide1Welcome() {
  const { data, updateData, nextSlide } = useOnboarding();
  const [name, setName] = useState(data.name);

  const handleNext = () => {
    updateData({ name: name.trim() });
  };

  const isNextDisabled = name.trim().length < 2;

  return (
    <SlideContainer
      onNext={handleNext}
      isNextDisabled={isNextDisabled}
      gradientColors={['#E3F2FD', '#FAFAFA']}
    >
      <View style={styles.container}>
        <View style={styles.animationContainer}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarEmoji}>👋</Text>
          </View>
        </View>

        <Text style={styles.title}>Hoş Geldiniz!</Text>
        <Text style={styles.subtitle}>
          Size nasıl hitap etmemizi istersiniz?
        </Text>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="İsminizi yazın"
            placeholderTextColor={colors.textDisabled}
            value={name}
            onChangeText={setName}
            autoFocus
            maxLength={20}
            returnKeyType="next"
          />
          <View style={[styles.inputUnderline, !isNextDisabled && styles.inputUnderlineActive]} />
        </View>

        {isNextDisabled && name.length > 0 && (
          <Text style={styles.errorText}>Lütfen en az 2 karakter giriniz.</Text>
        )}
      </View>
    </SlideContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  animationContainer: {
    width: 140,
    height: 140,
    marginBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  avatarEmoji: {
    fontSize: 50,
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
    paddingHorizontal: 20,
  },
  inputWrapper: {
    width: '100%',
    maxWidth: 260,
  },
  input: {
    fontFamily: typography.fontSemiBold,
    fontSize: 28,
    color: colors.textPrimary,
    textAlign: 'center',
    paddingVertical: 12,
  },
  inputUnderline: {
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 2,
  },
  inputUnderlineActive: {
    backgroundColor: colors.primary,
  },
  errorText: {
    marginTop: 12,
    color: colors.error,
    fontSize: typography.sm,
    fontFamily: typography.fontMedium,
  }
});
