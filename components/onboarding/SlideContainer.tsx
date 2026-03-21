import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useOnboarding } from '@/app/(onboarding)/_layout';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { ArrowLeft, ArrowRight } from 'phosphor-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';


interface SlideContainerProps {
  children: React.ReactNode;
  onNext?: () => void;
  onPrev?: () => void;
  isNextDisabled?: boolean;
  nextButtonLabel?: string;
  gradientColors?: [string, string, ...string[]];
}

export const SlideContainer: React.FC<SlideContainerProps> = ({
  children,
  onNext,
  onPrev,
  isNextDisabled = false,
  nextButtonLabel = "İlerle",
  gradientColors = [colors.primaryLight, colors.background]
}) => {
  const { currentSlide, nextSlide, prevSlide } = useOnboarding();
  const router = useRouter();

  const handleNext = () => {
    if (isNextDisabled) return;

    if (onNext) {
      onNext();
      // onNext kendi navigation'ını hallediyor (slide7 gibi)
      // sadece navigation yapmıyorsa devam et
    }

    // Slide 7'de navigation onNext içinde yapılıyor
    if (currentSlide < 7) {
      router.push(`/(onboarding)/slide${currentSlide + 1}` as any)
      nextSlide()
    }
  }

  const handlePrev = () => {
    if (onPrev) onPrev();
    router.back();
    prevSlide();
  };

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header / Progress */}
        <View style={styles.header}>
          {currentSlide > 1 ? (
            <TouchableOpacity onPress={handlePrev} style={styles.backButton}>
              <ArrowLeft size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.backButtonPlaceholder} />
          )}

          <View style={styles.progressContainer}>
            {[1, 2, 3, 4, 5, 6, 7].map((step) => (
              <View
                key={step}
                style={[
                  styles.progressDot,
                  step === currentSlide && styles.progressDotActive,
                  step < currentSlide && styles.progressDotCompleted
                ]}
              />
            ))}
          </View>

          <View style={styles.backButtonPlaceholder} />
        </View>

        {/* Content */}
        <Animated.View
          key={currentSlide}
          entering={FadeIn.duration(400)}
          exiting={FadeOut.duration(300)}
          style={styles.content}
        >
          {children}
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleNext}
            disabled={isNextDisabled}
            activeOpacity={0.8}
            style={[
              styles.nextButton,
              isNextDisabled && styles.nextButtonDisabled
            ]}
          >
            <Text style={styles.nextButtonText}>{nextButtonLabel}</Text>
            {!isNextDisabled && <ArrowRight size={20} color={colors.textOnPrimary} weight="bold" style={{ marginLeft: 8 }} />}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    height: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonPlaceholder: {
    width: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  progressDotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  progressDotCompleted: {
    backgroundColor: colors.primaryLight,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  nextButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonDisabled: {
    backgroundColor: colors.textDisabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    fontFamily: typography.fontBold,
    fontSize: typography.md,
    color: colors.textOnPrimary,
  },
});
